import { supabase } from "./supabase";

export async function uploadToSupabase(base64Data: string, bucket: string, path: string) {
  const base64Str = base64Data.split(",")[1];
  const buffer = Buffer.from(base64Str, "base64");

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: "image/jpeg", upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}