import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  requireAdminAuth,
} from "@/lib/api-security";
import {
  saveUploadedFile,
  deleteUploadedFile,
  type UploadFolder,
} from "@/lib/server-upload";

const ALLOWED_FOLDERS: UploadFolder[] = [
  "product-images",
  "store-assets",
  "products",
  "store",
];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
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
  const folder: UploadFolder = ALLOWED_FOLDERS.includes(
    folderInput as UploadFolder,
  )
    ? (folderInput as UploadFolder)
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
      { error: "File too large. Max size is 10MB." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await saveUploadedFile(buffer, folder, file.type);
    return NextResponse.json({ url, publicId: url });
  } catch (err) {
    console.error("Local server upload error:", err);
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

  try {
    const deleted = await deleteUploadedFile(url);
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("File delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
