import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getCurrentUser } from "@/lib/firebase/server";
import { serializeFirestoreData } from "@/lib/firebase/serialize";
import type { AdminUser } from "@/types/firestore";

export type { AdminUser };

export async function getAllAdmins(): Promise<AdminUser[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await getAdminDb()
    .collection("admins")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map(
    (d) => serializeFirestoreData({ id: d.id, ...d.data() }) as AdminUser,
  );
}

export async function getCurrentAdmin() {
  if (!isFirebaseConfigured()) return null;
  return getCurrentUser();
}
