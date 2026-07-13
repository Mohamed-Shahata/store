import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

type Bucket = "product-images" | "store-assets";

export async function uploadImage(
  file: File,
  bucket: Bucket = "product-images"
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, `${bucket}/${fileName}`);

  await uploadBytes(storageRef, file, { cacheControl: "3600" });

  return getDownloadURL(storageRef);
}

export async function deleteImage(
  url: string,
  bucket: Bucket = "product-images"
): Promise<void> {
  try {
    // Works for both `gs://` refs and the public
    // `https://firebasestorage.googleapis.com/.../o/<encodedPath>?alt=media...` URLs.
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // Fallback: derive the path manually if the URL doesn't parse directly.
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return;
    const path = decodeURIComponent(match[1]);
    if (!path.startsWith(`${bucket}/`)) return;
    const storage = getFirebaseStorage();
    await deleteObject(ref(storage, path));
  }
}
