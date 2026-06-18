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

  const serviceClient = createServiceClient();
  const { data: deleted, error } = await serviceClient
    .from("products")
    .delete()
    .eq("id", body.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
