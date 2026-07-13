// scripts/add-admin.ts
import "dotenv/config";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function main() {
  const uid = " 8qZjwiB0YKY55JhcQo99OrkiScw1";

  await db.collection("admins").doc(uid).set({
    email: "mohamedmrslan@gmail.com",
    isSuperAdmin: true,
    createdAt: new Date().toISOString(),
  });

  console.log("✅ Admin added:", uid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
