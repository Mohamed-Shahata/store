import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * Verifies the request comes from an authenticated admin.
 * Returns the authenticated user when valid, or an error response info otherwise.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 } as const;
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return { error: "Forbidden", status: 403 } as const;
  }

  return { user } as const;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ admins: data, currentAdminId: auth.user.id });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();

  const { data: created, error: createError } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create admin account" },
      { status: 400 }
    );
  }

  const { error: insertError } = await serviceClient.from("admins").insert({
    id: created.user.id,
    email,
  });

  if (insertError) {
    // Roll back the auth user so we don't end up with an orphaned account.
    await serviceClient.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    admin: {
      id: created.user.id,
      email,
      created_at: created.user.created_at,
    },
  });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "Admin id is required" }, { status: 400 });
  }

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot remove your own account" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();

  const { count } = await serviceClient
    .from("admins")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) <= 1) {
    return NextResponse.json(
      { error: "At least one admin account must remain" },
      { status: 400 }
    );
  }

  const { error: deleteRowError } = await serviceClient
    .from("admins")
    .delete()
    .eq("id", id);

  if (deleteRowError) {
    return NextResponse.json({ error: deleteRowError.message }, { status: 500 });
  }

  await serviceClient.auth.admin.deleteUser(id);

  return NextResponse.json({ success: true });
}
