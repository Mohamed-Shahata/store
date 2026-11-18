import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function getSafeFilePath(pathSegments: string[]): string | null {
  if (!pathSegments || pathSegments.length === 0) return null;

  for (const segment of pathSegments) {
    if (!segment || segment.includes("..") || segment.includes("/") || segment.includes("\\")) {
      return null;
    }
  }

  const uploadsRoot = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
  const filePath = path.join(/*turbopackIgnore: true*/ uploadsRoot, ...pathSegments);

  if (!filePath.startsWith(uploadsRoot)) {
    return null;
  }

  return filePath;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = getSafeFilePath(pathSegments);

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(/*turbopackIgnore: true*/ filePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = getSafeFilePath(pathSegments);

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const stats = await fs.promises.stat(/*turbopackIgnore: true*/ filePath);

    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
