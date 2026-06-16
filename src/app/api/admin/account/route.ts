import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  requireAdminAuth,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  safeJson,
} from "@/lib/api-security";
import { z } from "zod";

const patchAccountSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    email: z
      .string()
      .email("Invalid email address")
      .transform((v) => v.trim().toLowerCase())
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .refine((d) => d.email || d.password, {
    message: "Provide a new email or a new password",
  });

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`account-update:${ip}`, 10, 60_000);
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

  const parsed = patchAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { currentPassword, email, password } = parsed.data;

  // Look up the current user's email to re-authenticate.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify current password before applying sensitive changes.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
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
