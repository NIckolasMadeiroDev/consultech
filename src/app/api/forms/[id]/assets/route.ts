import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth-session";
import { getFormRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { prisma } from "@/infrastructure/database/prisma";
import { uploadPublicObject } from "@/lib/supabase-storage-upload";
import { sniffMimeFromBuffer } from "@/lib/file-type-sniff";
import { sanitizeFilenameForStorage } from "@/lib/sanitize-filename";
import {
  getGlobalMaxUploadBytes,
  getGlobalMimeAllowlist,
  isMimeGloballyAllowed,
} from "@/lib/upload-env";

const BUCKET = "form-assets";

function extFromName(name: string): string {
  const i = name.lastIndexOf(".");
  if (i === -1) return "";
  return name.slice(i + 1).toLowerCase();
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const formId = context.params.id;
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      throw new Error("Form not found");
    }
    if (form.createdBy !== session.id) {
      throw new Error("Forbidden");
    }
    const globalMax = getGlobalMaxUploadBytes();
    const mimeAllow = getGlobalMimeAllowlist();
    const data = await req.formData();
    const file = data.get("file");
    const labelRaw = data.get("label");
    const label = typeof labelRaw === "string" ? labelRaw.trim().slice(0, 200) : "";
    if (!(file instanceof Blob)) {
      throw new Error("file is required");
    }
    if (file.size > globalMax) {
      throw new Error("File too large");
    }
    const rawName = file instanceof File ? file.name : "upload.bin";
    const safeName = sanitizeFilenameForStorage(rawName);
    const ext = extFromName(safeName);
    const buf = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffMimeFromBuffer(buf);
    const declared = (file.type || "").toLowerCase();
    const effectiveMime = sniffed ?? (declared && declared !== "application/octet-stream" ? declared : null);
    if (!effectiveMime) {
      throw new Error("Could not determine file type");
    }
    if (!isMimeGloballyAllowed(effectiveMime, mimeAllow)) {
      throw new Error("File type not allowed by server policy");
    }
    if (
      sniffed &&
      declared &&
      declared !== "application/octet-stream" &&
      sniffed.split("/")[0] !== declared.split("/")[0]
    ) {
      throw new Error("File content does not match declared type");
    }
    const path = `forms/${formId}/static/${crypto.randomUUID()}.${ext || "bin"}`;
    const { publicUrl, path: storedPath } = await uploadPublicObject(BUCKET, path, buf, effectiveMime);
    const count = await prisma.formStaticAsset.count({ where: { formId } });
    const row = await prisma.formStaticAsset.create({
      data: {
        formId,
        storagePath: storedPath,
        publicUrl,
        mimeType: effectiveMime,
        sizeBytes: BigInt(buf.length),
        label: label || null,
        displayOrder: count,
      },
    });
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.static_asset.uploaded",
      entityType: "form",
      entityId: formId,
      userId: session.id,
      metadata: { assetId: row.id, sizeBytes: buf.length, mimeType: effectiveMime },
    });
    return {
      id: row.id,
      publicUrl: row.publicUrl,
      storagePath: row.storagePath,
      mimeType: row.mimeType,
      sizeBytes: Number(row.sizeBytes),
    };
  });
}
