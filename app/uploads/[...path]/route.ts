import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminDb } from "@/lib/firebase/admin";

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

async function getFileFromFirestore(fileName: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection("uploads").doc(fileName).get();
    if (!docSnap.exists) return null;

    const docData = docSnap.data() as {
      mimeType?: string;
      chunkCount?: number;
      data?: string;
    };

    if (docData.chunkCount && docData.chunkCount > 1) {
      const chunksSnap = await docSnap.ref.collection("chunks").orderBy("index", "asc").get();
      const base64Str = chunksSnap.docs.map((c) => c.data().data).join("");
      return {
        buffer: Buffer.from(base64Str, "base64"),
        mimeType: docData.mimeType || "image/jpeg",
      };
    }

    if (docData.data) {
      return {
        buffer: Buffer.from(docData.data, "base64"),
        mimeType: docData.mimeType || "image/jpeg",
      };
    }

    return null;
  } catch (err) {
    console.error("Firestore file lookup error:", err);
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = getSafeFilePath(pathSegments);

  // 1. Try local disk first
  if (filePath && fs.existsSync(filePath)) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_MAP[ext] || "application/octet-stream";
      const fileBuffer = await fs.promises.readFile(/*turbopackIgnore: true*/ filePath);

      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Error reading file from disk:", error);
    }
  }

  // 2. Try Firestore `uploads` collection (fallback for Vercel Serverless)
  if (pathSegments && pathSegments.length > 0) {
    const fileName = pathSegments[pathSegments.length - 1];
    const fileResult = await getFileFromFirestore(fileName);

    if (fileResult) {
      return new Response(new Uint8Array(fileResult.buffer), {
        status: 200,
        headers: {
          "Content-Type": fileResult.mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return new NextResponse("File Not Found", { status: 404 });
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = getSafeFilePath(pathSegments);

  // 1. Try disk
  if (filePath && fs.existsSync(filePath)) {
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
    } catch {}
  }

  // 2. Try Firestore
  if (pathSegments && pathSegments.length > 0) {
    const fileName = pathSegments[pathSegments.length - 1];
    const fileResult = await getFileFromFirestore(fileName);

    if (fileResult) {
      return new Response(null, {
        status: 200,
        headers: {
          "Content-Type": fileResult.mimeType,
          "Content-Length": fileResult.buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return new NextResponse("File Not Found", { status: 404 });
}
