import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  requireAdminAuth,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  safeJson,
} from "@/lib/api-security";
import { addAdminSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = await import("@/lib/supabase/server").then((m) =>
    m.createClient(),
  );
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    admins: data,
    currentAdminId: auth.userId,
    isSuperAdmin: auth.isSuperAdmin,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`admin-create:${ip}`, 10, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const body = await safeJson<unknown>(request);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = addAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const serviceClient = createServiceClient();

  const { data: created, error: createError } =
    await serviceClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create admin account" },
      { status: 400 },
    );
  }

  const { error: insertError } = await serviceClient.from("admins").insert({
    id: created.user.id,
    email: email.trim().toLowerCase(),
  });

  if (insertError) {
    await serviceClient.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    admin: {
      id: created.user.id,
      email: email.trim().toLowerCase(),
      is_super_admin: false,
      created_at: created.user.created_at,
    },
  });
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`admin-delete:${ip}`, 10, 60_000);
  if (!allowed) return rateLimitResponse();

  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  if (!auth.isSuperAdmin) {
    return NextResponse.json(
      { error: "Only the owner admin can remove admin accounts" },
      { status: 403 },
    );
  }

  const body = await safeJson<{ id?: string }>(request);
  if (!body?.id) {
    return NextResponse.json(
      { error: "Admin id is required" },
      { status: 400 },
    );
  }

  const { id } = body;

  if (id === auth.userId) {
    return NextResponse.json(
      { error: "You cannot remove your own account" },
      { status: 400 },
    );
  }

  const serviceClient = createServiceClient();

  const { data: target } = await serviceClient
    .from("admins")
    .select("is_super_admin")
    .eq("id", id)
    .single();

  if (target?.is_super_admin) {
    return NextResponse.json(
      { error: "The super admin account cannot be removed" },
      { status: 400 },
    );
  }

  const { count } = await serviceClient
    .from("admins")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) <= 1) {
    return NextResponse.json(
      { error: "At least one admin account must remain" },
      { status: 400 },
    );
  }

  const { error: deleteRowError } = await serviceClient
    .from("admins")
    .delete()
    .eq("id", id);

  if (deleteRowError) {
    return NextResponse.json(
      { error: deleteRowError.message },
      { status: 500 },
    );
  }

  await serviceClient.auth.admin.deleteUser(id);

  return NextResponse.json({ success: true });
}
