import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { currentPassword?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { currentPassword } = body;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!currentPassword) {
    return NextResponse.json(
      { error: "Current password is required" },
      { status: 400 }
    );
  }

  if (!email && !password) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (password && password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Re-verify the current password before applying any sensitive changes.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  const updatePayload: {
    email?: string;
    password?: string;
    email_confirm?: boolean;
  } = {};

  if (email && email !== user.email) {
    updatePayload.email = email;
    updatePayload.email_confirm = true;
  }

  if (password) {
    updatePayload.password = password;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { data: updated, error: updateError } =
    await serviceClient.auth.admin.updateUserById(user.id, updatePayload);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (updatePayload.email) {
    await serviceClient
      .from("admins")
      .update({ email: updatePayload.email })
      .eq("id", user.id);
  }

  return NextResponse.json({
    email: updated.user?.email ?? email ?? user.email,
  });
}
