import { supabase } from "@/infrastructure/database/supabase";

export async function uploadPublicObject(
  bucket: string,
  path: string,
  bytes: Buffer,
  contentType: string
): Promise<{ path: string; publicUrl: string }> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { path: data.path, publicUrl: pub.publicUrl };
}
