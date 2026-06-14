"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  changeEmailSchema,
  changePasswordSchema,
  type ChangeEmailFormData,
  type ChangePasswordFormData,
} from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AccountSettingsFormProps {
  currentEmail: string;
}

async function patchAccount(payload: Record<string, string>) {
  const response = await fetch("/api/admin/account", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong");
  }
  return data as { email: string };
}

export function AccountSettingsForm({ currentEmail }: AccountSettingsFormProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: currentEmail, currentPassword: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleReauth = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(t("toast.credentialsUpdated"));
    router.push("/admin/login");
    router.refresh();
  };

  const onSubmitEmail = async (data: ChangeEmailFormData) => {
    if (data.email === currentEmail) {
      toast.error(t("toast.emailUnchanged"));
      return;
    }

    setEmailLoading(true);
    try {
      await patchAccount({
        currentPassword: data.currentPassword,
        email: data.email,
      });
      await handleReauth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.genericError"));
    } finally {
      setEmailLoading(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      await patchAccount({
        currentPassword: data.currentPassword,
        password: data.newPassword,
      });
      await handleReauth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.genericError"));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("loginEmail")}</CardTitle>
          <CardDescription>{t("currentEmailIs", { email: currentEmail })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="new-email">{t("fields.newEmail")}</Label>
              <Input
                id="new-email"
                type="email"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email-current-password">
                {t("fields.currentPassword")}
              </Label>
              <Input
                id="email-current-password"
                type="password"
                {...emailForm.register("currentPassword")}
              />
              {emailForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive mt-1">
                  {emailForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={emailLoading} className="w-full sm:w-auto">
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("changeEmail")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
          <CardDescription>{t("changePasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="password-current-password">
                {t("fields.currentPassword")}
              </Label>
              <Input
                id="password-current-password"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="new-password">{t("fields.newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm-password">{t("fields.confirmPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={passwordLoading} className="w-full sm:w-auto">
              {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
