"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  addAdminSchema,
  type AddAdminFormData,
} from "@/lib/validations/schemas";
import { toast } from "sonner";
import type { AdminUser } from "@/lib/data/admins";

interface AdminsManagerProps {
  admins: AdminUser[];
  currentAdminId: string;
}

export function AdminsManager({
  admins: initial,
  currentAdminId,
}: AdminsManagerProps) {
  const [admins, setAdmins] = useState(initial);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("admin");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
  });

  const openCreate = () => {
    reset({ email: "", password: "" });
    setOpen(true);
  };

  const onSubmit = async (data: AddAdminFormData) => {
    const response = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error ?? t("toast.genericError"));
      return;
    }

    setAdmins([...admins, result.admin]);
    toast.success(t("toast.adminCreated"));
    setOpen(false);
  };

  const deleteAdmin = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? t("toast.genericError"));
        return;
      }

      setAdmins(admins.filter((a) => a.id !== id));
      toast.success(t("toast.adminDeleted"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-md">
          {t("manageAdminsDescription")}
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addAdmin")}
        </Button>
      </div>

      <div className="space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium break-all">{admin.email}</p>
                  {admin.id === currentAdminId && (
                    <Badge variant="secondary">{t("you")}</Badge>
                  )}
                  {admin.is_super_admin && (
                    <Badge variant="sale">{t("superAdmin")}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("addedOn")}{" "}
                  {format(new Date(admin.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            {admin.id !== currentAdminId &&
              !admin.is_super_admin &&
              admins.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      disabled={deletingId === admin.id}
                    >
                      {deletingId === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("removeAdmin")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("removeAdminDescription", { email: admin.email })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAdmin(admin.id)}
                        disabled={deletingId === admin.id}
                      >
                        {deletingId === admin.id && (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        )}
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addAdmin")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">{t("fields.email")}</Label>
              <Input id="admin-email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-password">{t("fields.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {t("addAdmin")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
