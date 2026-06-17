"use client";

import Image from "next/image";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/database";

interface NavbarProps {
  settings: StoreSettings | null;
}

export function Navbar({ settings }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartStore = useCartStore();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    // Rehydrate the store from localStorage after mount
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setTotalItems(cartStore.getTotalItems());
  }, [cartStore.items]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/cart", label: t("cart") },
  ] as const;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${window.location.pathname.split("/").slice(0, 2).join("/")}/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          {settings?.logo ? (
            <Image
              src={settings.logo}
              alt={settings.store_name}
              width={36}
              height={36}
              className="rounded-md"
            />
          ) : null}
          <span className="hidden sm:inline">
            {settings?.store_name ?? t("premiumStore")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={t("search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          <LanguageSwitcher />
          <ThemeToggle />

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label={t("cart")}>
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("menu")}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
          >
            <form
              onSubmit={handleSearch}
              className="container mx-auto px-4 py-3"
            >
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
