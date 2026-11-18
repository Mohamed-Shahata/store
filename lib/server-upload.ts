import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

/**
 * Saves an uploaded file buffer directly to the local server disk
 * inside `public/uploads/products/` or `public/uploads/store/`.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  folder: UploadFolder = "product-images",
  mimeType: string = "image/webp"
): Promise<LocalUploadResult> {
  const subDir = FOLDER_SUBDIR_MAP[folder] || "products";
  const uploadsRoot = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
  const targetDir = path.join(/*turbopackIgnore: true*/ uploadsRoot, subDir);

  // Ensure target directory exists
  await fs.promises.mkdir(targetDir, { recursive: true });

  const ext = MIME_EXTENSION_MAP[mimeType] || ".webp";
  const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const fileName = `${subDir === "products" ? "prod" : "asset"}-${uniqueId}${ext}`;
  const targetPath = path.resolve(targetDir, fileName);

  await fs.promises.writeFile(targetPath, buffer);

  const relativeUrl = `/uploads/${subDir}/${fileName}`;
  return {
    url: relativeUrl,
    relativePath: relativeUrl,
  };
}

/**
 * Deletes an uploaded file from disk if it resides within `public/uploads/`.
 */
export async function deleteUploadedFile(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath || !urlOrPath.startsWith("/uploads/")) {
    return false;
  }

  const uploadsRoot = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
  const cleanRelative = urlOrPath.replace(/^\/+uploads\//, "");
  const targetPath = path.join(/*turbopackIgnore: true*/ uploadsRoot, cleanRelative);

  // Directory traversal defense
  if (!targetPath.startsWith(uploadsRoot)) {
    throw new Error("Invalid file path");
  }

  if (fs.existsSync(targetPath)) {
    await fs.promises.unlink(targetPath);
    return true;
  }

  return false;
}
