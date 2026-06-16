import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileCartButton } from "@/components/layout/mobile-cart-button";
import { getStoreSettingsCached } from "@/lib/data/store-cache";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettingsCached();

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <MobileCartButton />
    </>
  );
}
