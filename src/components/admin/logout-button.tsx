"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AdminLogoutButton() {
  const router = useRouter();
  const t = useTranslations("admin");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(t("toast.loggedOut"));
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {t("logout")}
    </Button>
  );
}
