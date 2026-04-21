import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { uploadPublicObject } from "@/lib/supabase-storage-upload";
import { getFormRepository, getQuestionRepository } from "@/infrastructure/database/repositories";
import type { FileUploadRules } from "@/types/file-upload-rules";
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

function normalizeRules(raw: unknown): FileUploadRules | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.maxFileBytes !== "number" ||
    typeof o.maxFiles !== "number" ||
    !Array.isArray(o.allowedExtensions) ||
    typeof o.required !== "boolean"
  ) {
    return null;
  }
  const allowedExtensions = o.allowedExtensions.filter((x): x is string => typeof x === "string");
  return {
    maxFileBytes: o.maxFileBytes,
    maxFiles: o.maxFiles,
    allowedExtensions,
    required: o.required,
  };
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return apiHandler(async () => {
    const formId = context.params.id;
    const formRepo = getFormRepository();
    const questionRepo = getQuestionRepository();
    const form = await formRepo.findById(formId);
    if (!form || form.status !== "active") {
      throw new Error("Form not available");
    }
    const globalMax = getGlobalMaxUploadBytes();
    const mimeAllow = getGlobalMimeAllowlist();

    const data = await req.formData();
    const file = data.get("file");
    const questionId = data.get("questionId");
    if (!(file instanceof Blob)) {
      throw new Error("file is required");
    }
    if (typeof questionId !== "string" || !questionId) {
      throw new Error("questionId is required");
    }
    const questions = await questionRepo.findByFormId(formId);
    const q = questions.find((x) => x.id === questionId);
    if (!q || q.type !== "file_upload") {
      throw new Error("Invalid question");
    }
    const rules = normalizeRules(q.fileUploadRules);
    if (!rules) {
      throw new Error("Upload rules missing");
    }
    const cap = Math.min(rules.maxFileBytes, globalMax);
    if (file.size > cap) {
      throw new Error("File too large for this question");
    }
    const rawName = file instanceof File ? file.name : "upload.bin";
    const safeName = sanitizeFilenameForStorage(rawName);
    const ext = extFromName(safeName);
    const allowed = rules.allowedExtensions.map((e) => e.replace(/^\./, "").toLowerCase());
    if (ext && !allowed.includes(ext)) {
      throw new Error("File type not allowed");
    }
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
    if (sniffed && declared && declared !== "application/octet-stream" && sniffed.split("/")[0] !== declared.split("/")[0]) {
      throw new Error("File content does not match declared type");
    }
    const path = `responses/${formId}/${questionId}/${crypto.randomUUID()}-${ext || "bin"}`;
    const { publicUrl, path: storedPath } = await uploadPublicObject(BUCKET, path, buf, effectiveMime);
    return {
      url: publicUrl,
      publicUrl,
      storagePath: storedPath,
      sizeBytes: buf.length,
      mimeType: effectiveMime,
      originalFilename: safeName,
    };
  });
}
