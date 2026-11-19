import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";

export type UploadFolder = "product-images" | "store-assets" | "products" | "store";

const FOLDER_SUBDIR_MAP: Record<UploadFolder, string> = {
  "product-images": "products",
  products: "products",
  "store-assets": "store",
  store: "store",
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export interface LocalUploadResult {
  url: string;
  relativePath: string;
}

const CHUNK_SIZE = 500 * 1024; // 500KB per chunk in base64

/**
 * Saves an uploaded file buffer to:
 * 1) Local disk (if filesystem is writable, e.g. localhost)
 * 2) Firestore `uploads` collection (guarantees persistence on Vercel Serverless)
 */
export async function saveUploadedFile(
  buffer: Buffer,
  folder: UploadFolder = "product-images",
  mimeType: string = "image/webp"
): Promise<LocalUploadResult> {
  const subDir = FOLDER_SUBDIR_MAP[folder] || "products";
  const ext = MIME_EXTENSION_MAP[mimeType] || ".webp";
  const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const fileName = `${subDir === "products" ? "prod" : "asset"}-${uniqueId}${ext}`;
  const relativeUrl = `/uploads/${subDir}/${fileName}`;

  // 1. Try writing to disk (works on localhost / writable servers)
  try {
    const uploadsRoot = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    const targetDir = path.join(/*turbopackIgnore: true*/ uploadsRoot, subDir);
    await fs.promises.mkdir(targetDir, { recursive: true });
    const targetPath = path.resolve(targetDir, fileName);
    await fs.promises.writeFile(targetPath, buffer);
  } catch (err) {
    // Read-only filesystem on Vercel — ignore error, Firestore handles it
    console.warn("Disk write skipped (read-only or Vercel environment):", (err as Error)?.message);
  }

  // 2. Persist in Firestore `uploads` collection for Vercel Serverless
  const db = getAdminDb();
  const base64 = buffer.toString("base64");
  const chunks: string[] = [];
  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    chunks.push(base64.substring(i, i + CHUNK_SIZE));
  }

  const docRef = db.collection("uploads").doc(fileName);

  if (chunks.length <= 1) {
    await docRef.set({
      fileName,
      folder: subDir,
      mimeType,
      size: buffer.length,
      chunkCount: 1,
      data: chunks[0] || "",
      createdAt: new Date().toISOString(),
    });
  } else {
    await docRef.set({
      fileName,
      folder: subDir,
      mimeType,
      size: buffer.length,
      chunkCount: chunks.length,
      createdAt: new Date().toISOString(),
    });
    const batch = db.batch();
    for (let i = 0; i < chunks.length; i++) {
      const chunkRef = docRef.collection("chunks").doc(String(i));
      batch.set(chunkRef, { index: i, data: chunks[i] });
    }
    await batch.commit();
  }

  return {
    url: relativeUrl,
    relativePath: relativeUrl,
  };
}

/**
 * Deletes an uploaded file from disk and Firestore `uploads` collection.
 */
export async function deleteUploadedFile(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath || !urlOrPath.startsWith("/uploads/")) {
    return false;
  }

  let deleted = false;
  const cleanRelative = urlOrPath.replace(/^\/+uploads\//, "");
  const fileName = path.basename(cleanRelative);

  // 1. Try disk delete
  try {
    const uploadsRoot = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    const targetPath = path.join(/*turbopackIgnore: true*/ uploadsRoot, cleanRelative);
    if (targetPath.startsWith(uploadsRoot) && fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      deleted = true;
    }
  } catch {}

  // 2. Firestore delete
  try {
    const db = getAdminDb();
    const docRef = db.collection("uploads").doc(fileName);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      if (data?.chunkCount > 1) {
        const chunksSnap = await docRef.collection("chunks").get();
        const batch = db.batch();
        chunksSnap.docs.forEach((d) => batch.delete(d.ref));
        batch.delete(docRef);
        await batch.commit();
      } else {
        await docRef.delete();
      }
      deleted = true;
    }
  } catch {}

  return deleted;
}
