import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { StoreSettings } from "@/types/database";

interface FooterProps {
  settings: StoreSettings | null;
}

export async function Footer({ settings }: FooterProps) {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-lg mb-3">
              {settings?.store_name ?? nav("premiumStore")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {settings?.store_description ?? t("defaultDescription")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  {nav("products")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground transition-colors">
                  {nav("cart")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("followUs")}</h4>
            <div className="flex gap-3">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("facebook")}
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("instagram")}
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("tiktok")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.store_name ?? nav("premiumStore")}.{" "}
          {t("rights")}
        </div>
      </div>
    </footer>
  );
}
