import { createClient } from "@/lib/supabase/client";

export async function uploadImage(
  file: File,
  bucket: "product-images" | "store-assets" = "product-images"
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImage(
  url: string,
  bucket: "product-images" | "store-assets" = "product-images"
): Promise<void> {
  const supabase = createClient();
  const path = url.split(`/${bucket}/`)[1];
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
