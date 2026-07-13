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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SingleImageUpload,
  ImageUpload,
} from "@/components/admin/image-upload";
import {
  storeSettingsSchema,
  type StoreSettingsFormData,
} from "@/lib/validations/schemas";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { revalidateStoreCache } from "@/lib/actions/revalidate";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { toast } from "sonner";
import type { StoreSettings } from "@/types/firestore";

interface StoreSettingsFormProps {
  settings: StoreSettings;
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(settings.logo);
  const [banners, setBanners] = useState<string[]>(
    Array.isArray(settings.bannerImages)
      ? (settings.bannerImages as string[])
      : [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      store_name: settings.storeName,
      store_description: settings.storeDescription ?? "",
      whatsapp_number: settings.whatsappNumber,
      facebook_url: settings.facebookUrl ?? "",
      instagram_url: settings.instagramUrl ?? "",
      tiktok_url: settings.tiktokUrl ?? "",
      seo_title: settings.seoTitle ?? "",
      seo_description: settings.seoDescription ?? "",
      seo_keywords: settings.seoKeywords ?? "",
    },
  });

  const onSubmit = async (data: StoreSettingsFormData) => {
    setLoading(true);

    try {
      await updateDoc(doc(getFirebaseDb(), "storeSettings", "main"), {
        storeName: data.store_name,
        storeDescription: data.store_description,
        whatsappNumber: data.whatsapp_number,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        seoKeywords: data.seo_keywords,
        logo,
        bannerImages: banners,
        facebookUrl: data.facebook_url || null,
        instagramUrl: data.instagram_url || null,
        tiktokUrl: data.tiktok_url || null,
        updatedAt: new Date().toISOString(),
      });

      toast.success(t("toast.settingsSaved"));
      await revalidateStoreCache([CACHE_TAGS.settings]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("storeInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="store_name">{t("fields.storeName")}</Label>
            <Input id="store_name" {...register("store_name")} />
            {errors.store_name && (
              <p className="text-sm text-destructive mt-1">
                {errors.store_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="store_description">
              {t("fields.storeDescription")}
            </Label>
            <Textarea
              id="store_description"
              rows={3}
              {...register("store_description")}
            />
          </div>
          <div>
            <Label>{t("storeLogo")}</Label>
            <SingleImageUpload value={logo} onChange={setLogo} />
          </div>
          <div>
            <Label htmlFor="whatsapp_number">
              {t("fields.whatsappNumber")}
            </Label>
            <Input id="whatsapp_number" {...register("whatsapp_number")} />
            {errors.whatsapp_number && (
              <p className="text-sm text-destructive mt-1">
                {errors.whatsapp_number.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("socialLinks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" {...register("facebook_url")} />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" {...register("instagram_url")} />
          </div>
          <div>
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input id="tiktok_url" {...register("tiktok_url")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bannerImages")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={banners}
            onChange={setBanners}
            maxImages={4}
            bucket="store-assets"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("seoSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_title">{t("fields.seoTitle")}</Label>
            <Input id="seo_title" {...register("seo_title")} />
          </div>
          <div>
            <Label htmlFor="seo_description">
              {t("fields.seoDescription")}
            </Label>
            <Textarea
              id="seo_description"
              rows={2}
              {...register("seo_description")}
            />
          </div>
          <div>
            <Label htmlFor="seo_keywords">{t("fields.seoKeywords")}</Label>
            <Input id="seo_keywords" {...register("seo_keywords")} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("saveSettings")}
      </Button>
    </form>
  );
}
