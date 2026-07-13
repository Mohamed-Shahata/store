import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/server";

// 5 days, same as Firebase's max session cookie lifetime.
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000;

/**
 * Called right after a successful `signInWithEmailAndPassword` on the
 * client. The client sends its Firebase ID token here; we verify it and
 * mint a long-lived, httpOnly session cookie that server components /
 * middleware can read (client-side Firebase Auth state alone can't be
 * read from the server).
 */
export async function POST(request: Request) {
  const { idToken } = (await request.json().catch(() => ({}))) as {
    idToken?: string;
  };

  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    // Reject tokens older than 5 minutes to limit replay risk.
    await getAdminAuth().verifyIdToken(idToken, true);

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ error: "Invalid idToken" }, { status: 401 });
  }
}
