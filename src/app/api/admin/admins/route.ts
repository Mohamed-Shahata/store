import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
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

  const snap = await getAdminDb()
    .collection("admins")
    .orderBy("createdAt", "asc")
    .get();

  const admins = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({
    admins,
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
  const email_ = email.trim().toLowerCase();
  const auth_ = getAdminAuth();
  const db = getAdminDb();

  let uid: string;
  try {
    const created = await auth_.createUser({
      email: email_,
      password,
      emailVerified: true,
    });
    uid = created.uid;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create admin account",
      },
      { status: 400 },
    );
  }

  const createdAt = new Date().toISOString();
  try {
    await db.collection("admins").doc(uid).set({
      email: email_,
      isSuperAdmin: false,
      createdAt,
    });
  } catch (err) {
    await auth_.deleteUser(uid);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save admin" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    admin: { id: uid, email: email_, is_super_admin: false, created_at: createdAt },
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

  const db = getAdminDb();
  const targetSnap = await db.collection("admins").doc(id).get();
  const target = targetSnap.data() as { isSuperAdmin?: boolean } | undefined;

  if (target?.isSuperAdmin) {
    return NextResponse.json(
      { error: "The super admin account cannot be removed" },
      { status: 400 },
    );
  }

  const countSnap = await db.collection("admins").count().get();
  if (countSnap.data().count <= 1) {
    return NextResponse.json(
      { error: "At least one admin account must remain" },
      { status: 400 },
    );
  }

  await db.collection("admins").doc(id).delete();
  await getAdminAuth().deleteUser(id);

  return NextResponse.json({ success: true });
}
