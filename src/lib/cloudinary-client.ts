type Folder = "product-images" | "store-assets";

export async function uploadImage(
  file: File,
  folder: Folder = "product-images",
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Upload failed");
  }

  const data = (await res.json()) as { url: string; publicId: string };
  return data.url;
}

export async function deleteImage(url: string): Promise<void> {
  await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {
    // Best-effort — don't block the UI if cleanup fails.
  });
}
