import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth-session";
import { uploadPublicObject } from "@/lib/supabase-storage-upload";

const BUCKET = "form-assets";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const session = await getSession(req);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      throw new Error("file is required");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("File too large (max 5MB)");
    }
    const type = file.type || "application/octet-stream";
    if (!ALLOWED.has(type)) {
      throw new Error("Invalid image type");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const ext =
      type === "image/jpeg"
        ? "jpg"
        : type === "image/png"
          ? "png"
          : type === "image/webp"
            ? "webp"
            : "gif";
    const scopeRaw = form.get("scope");
    const scope = scopeRaw === "branding" ? "branding" : "blocks";
    const name = `${scope}/${session.id}/${crypto.randomUUID()}.${ext}`;
    const { publicUrl } = await uploadPublicObject(BUCKET, name, buf, type);
    return { url: publicUrl };
  });
}
