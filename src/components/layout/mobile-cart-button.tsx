"use client";

import { Link } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";

export function MobileCartButton() {
  const totalItems = useCartStore((s) => s.getTotalItems());

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 end-6 z-50 md:hidden"
    >
      <Link
        href="/cart"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label={`Cart ${totalItems}`}
      >
        <ShoppingBag className="h-6 w-6" />
        <span className="absolute -top-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      </Link>
    </motion.div>
  );
}
