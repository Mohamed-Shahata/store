import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export type AdminUser = Database["public"]["Tables"]["admins"]["Row"];

export async function getAllAdmins(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
