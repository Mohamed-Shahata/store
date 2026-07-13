import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { LocaleHtmlAttributes } from "@/components/providers/locale-html-attributes";
import { getStoreSettingsCached } from "@/lib/data/store-cache";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettingsCached();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.seoTitle ?? settings?.storeName ?? "Premium Store",
      template: `%s | ${settings?.storeName ?? "Premium Store"}`,
    },
    description:
      settings?.seoDescription ??
      settings?.storeDescription ??
      "Premium online store with the best products.",
    keywords: settings?.seoKeywords?.split(",").map((k) => k.trim()),
    openGraph: {
      type: "website",
      locale: "en_EG",
      alternateLocale: ["ar_EG"],
      url: siteUrl,
      siteName: settings?.storeName ?? "Premium Store",
      title: settings?.seoTitle ?? settings?.storeName ?? "Premium Store",
      description:
        settings?.seoDescription ??
        settings?.storeDescription ??
        "Premium online store",
      images: settings?.logo ? [{ url: settings.logo }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seoTitle ?? settings?.storeName ?? "Premium Store",
      description:
        settings?.seoDescription ??
        settings?.storeDescription ??
        "Premium online store",
      images: settings?.logo ? [settings.logo] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans">
        <NextTopLoader color="hsl(42 65% 52%)" height={3} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LocaleHtmlAttributes />
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
