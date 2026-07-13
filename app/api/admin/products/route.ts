import { NextResponse } from "next/server";
import {
  checkRateLimit,
  createServiceClient,
  getClientIp,
  rateLimitResponse,
  requireAdminAuth,
  safeJson,
} from "@/lib/api-security";

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`product-delete:${ip}`, 20, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await safeJson<{ id?: string }>(request);
  if (!body?.id) {
    return NextResponse.json(
      { error: "Product id is required" },
      { status: 400 },
    );
  }

  const db = createServiceClient();
  const ref = db.collection("products").doc(body.id);
  const snap = await ref.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await ref.delete();

  return NextResponse.json({ success: true });
}
