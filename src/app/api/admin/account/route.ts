import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/firebase/server";
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

/**
 * The Admin SDK can't verify a password (that's client-only), so we
 * re-authenticate via the Identity Toolkit REST API using the same
 * public Web API key already exposed to the browser.
 */
async function verifyPassword(email: string, password: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  );
  return res.ok;
}

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

  const currentUser = await getCurrentUser();
  if (!currentUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const passwordOk = await verifyPassword(currentUser.email, currentPassword);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  const updatePayload: { email?: string; password?: string; emailVerified?: boolean } = {};

  if (email && email !== currentUser.email) {
    updatePayload.email = email;
    updatePayload.emailVerified = true;
  }
  if (password) {
    updatePayload.password = password;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const adminAuth = getAdminAuth();
  let updatedEmail = currentUser.email;
  try {
    const updated = await adminAuth.updateUser(currentUser.uid, updatePayload);
    updatedEmail = updated.email ?? updatedEmail;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }

  if (updatePayload.email) {
    await getAdminDb()
      .collection("admins")
      .doc(currentUser.uid)
      .update({ email: updatePayload.email });
  }

  return NextResponse.json({ email: updatedEmail });
}
