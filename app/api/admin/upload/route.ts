import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  requireAdminAuth,
} from "@/lib/api-security";
import {
  deleteFromCloudinary,
  publicIdFromUrl,
  uploadToCloudinary,
  type CloudinaryFolder,
} from "@/lib/cloudinary";

const ALLOWED_FOLDERS: CloudinaryFolder[] = ["product-images", "store-assets"];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`image-upload:${ip}`, 30, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");
  const folderInput = formData.get("folder");
  const folder: CloudinaryFolder = ALLOWED_FOLDERS.includes(
    folderInput as CloudinaryFolder,
  )
    ? (folderInput as CloudinaryFolder)
    : "product-images";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Max size is 5MB." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadToCloudinary(buffer, folder);
    return NextResponse.json({ url, publicId });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`image-delete:${ip}`, 30, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const { url } = (await request.json().catch(() => ({}))) as {
    url?: string;
  };
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const publicId = publicIdFromUrl(url);
  if (!publicId) {
    // Not a Cloudinary URL (e.g. a leftover Firebase Storage URL) — nothing to do.
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    await deleteFromCloudinary(publicId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
