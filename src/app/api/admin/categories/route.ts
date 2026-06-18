import { NextResponse } from "next/server";
import {
  checkRateLimit,
  createServiceClient,
  getClientIp,
  rateLimitResponse,
  requireAdminAuth,
  safeJson,
} from "@/lib/api-security";
import { categorySchema } from "@/lib/validations/schemas";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`category-create:${ip}`, 30, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await safeJson<unknown>(request);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const payload = {
    ...parsed.data,
    slug: parsed.data.slug || slugify(parsed.data.name),
  };

  const serviceClient = createServiceClient();
  const { data: category, error } = await serviceClient
    .from("categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category });
}

export async function PUT(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`category-update:${ip}`, 30, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await safeJson<unknown>(request);
  if (!body || typeof body !== "object" || !("id" in body)) {
    return NextResponse.json(
      { error: "Category id is required" },
      { status: 400 },
    );
  }

  const { id, ...input } = body as { id?: string } & Record<string, unknown>;
  if (!id) {
    return NextResponse.json(
      { error: "Category id is required" },
      { status: 400 },
    );
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const payload = {
    ...parsed.data,
    slug: parsed.data.slug || slugify(parsed.data.name),
  };

  const serviceClient = createServiceClient();
  const { data: updated, error } = await serviceClient
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ category: updated });
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`category-delete:${ip}`, 30, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await safeJson<{ id?: string }>(request);
  if (!body?.id) {
    return NextResponse.json(
      { error: "Category id is required" },
      { status: 400 },
    );
  }

  const serviceClient = createServiceClient();
  const { data: deleted, error } = await serviceClient
    .from("categories")
    .delete()
    .eq("id", body.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
