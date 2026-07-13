/**
 * Seed script — creates (or promotes) a Firebase Auth admin account and
 * writes the matching `admins/{uid}` document in Firestore so it can log
 * into /admin/login.
 *
 * USAGE
 *   1. Put this file in your project root under `scripts/seed-admin.mjs`
 *      (or wherever you like — it only needs your .env.local to be found).
 *   2. Run it with Node 20+ (it uses the built-in --env-file flag):
 *
 *        node --env-file=.env.local scripts/seed-admin.mjs admin@example.com "StrongPassword123!" --super
 *
 *      Args:
 *        1) email      (required)
 *        2) password   (required, min 6 chars — Firebase Auth rule)
 *        3) --super    (optional flag) -> isSuperAdmin: true, otherwise false
 *
 *   If you're on an older Node version, install dotenv (`npm i -D dotenv`)
 *   and add `import "dotenv/config";` as the first line instead of using
 *   --env-file.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [, , emailArg, passwordArg, ...rest] = process.argv;
const isSuperAdmin = rest.includes("--super");

if (!emailArg || !passwordArg) {
  console.error(
    "Usage: node --env-file=.env.local scripts/seed-admin.mjs <email> <password> [--super]",
  );
  process.exit(1);
}

if (passwordArg.length < 6) {
  console.error(
    "Password must be at least 6 characters (Firebase Auth requirement).",
  );
  process.exit(1);
}

function getAdminApp() {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.\n" +
        "Make sure you're loading .env.local (see the --env-file flag in the usage comment above).",
    );
    process.exit(1);
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function main() {
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 1) Create the Firebase Auth user, or reuse it if it already exists.
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(emailArg);
    console.log(
      `ℹ️  User already exists in Firebase Auth (uid: ${userRecord.uid}) — updating password.`,
    );
    userRecord = await auth.updateUser(userRecord.uid, {
      password: passwordArg,
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      userRecord = await auth.createUser({
        email: emailArg,
        password: passwordArg,
        emailVerified: true,
      });
      console.log(
        `✅ Created new Firebase Auth user (uid: ${userRecord.uid}).`,
      );
    } else {
      throw err;
    }
  }

  // 2) Write/merge the admins/{uid} Firestore doc so /admin/login accepts them.
  await db.collection("admins").doc(userRecord.uid).set(
    {
      email: emailArg,
      isSuperAdmin,
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );

  console.log(
    `✅ admins/${userRecord.uid} written in Firestore (isSuperAdmin: ${isSuperAdmin}).`,
  );
  console.log("\nYou can now log in at /admin/login with:");
  console.log(`  email:    ${emailArg}`);
  console.log(`  password: ${passwordArg}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
