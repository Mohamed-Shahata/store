"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/database";
import { getEffectivePrice } from "@/lib/utils";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          const quantity = item.quantity ?? 1;

          if (existing) {
            const newQty = Math.min(
              existing.quantity + quantity,
              item.stockQuantity
            );
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                finalPrice: item.finalPrice ?? getEffectivePrice(item.price, item.discountPrice),
                quantity: Math.min(quantity, item.stockQuantity),
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.id !== id) return i;
              if (quantity <= 0) return null;
              return {
                ...i,
                quantity: Math.min(quantity, i.stockQuantity),
              };
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.finalPrice * item.quantity,
          0
        );
      },
    }),
    {
      name: "store-cart",
    }
  )
);
