"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import {
  getCheckoutSchema,
  type CheckoutFormData,
} from "@/lib/validations/schemas";
import {
  formatPrice,
  generateWhatsAppUrl,
  generateOrderMessage,
} from "@/lib/utils";
import { toast } from "sonner";

interface CartPageProps {
  whatsappNumber: string;
  storeName: string;
}

export function CartPage({ whatsappNumber, storeName }: CartPageProps) {
  const t = useTranslations("cart");
  const tValidation = useTranslations("validation");
  const tWhatsapp = useTranslations("whatsapp");
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  const checkoutSchema = useMemo(
    () =>
      getCheckoutSchema({
        nameRequired: tValidation("nameRequired"),
        nameInvalid: tValidation("nameInvalid"),
        addressRequired: tValidation("addressRequired"),
        phoneRequired: tValidation("phoneRequired"),
        phoneInvalid: tValidation("phoneInvalid"),
        phone2Invalid: tValidation("phone2Invalid"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const total = getTotal();
  const hasDiscount = items.some((item) => item.finalPrice < item.price);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error(t("emptyError"));
      return;
    }

    const message = generateOrderMessage(
      items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
      })),
      total,
      data.customer_name,
      data.customer_address,
      data.customer_phone,
      data.customer_phone_2,
      {
        greeting: tWhatsapp("greeting"),
        orderIntro: tWhatsapp("orderIntro"),
        products: tWhatsapp("products"),
        quantity: tWhatsapp("quantity"),
        price: tWhatsapp("price"),
        totalPrice: tWhatsapp("totalPrice"),
        customerName: tWhatsapp("customerName"),
        customerAddress: tWhatsapp("customerAddress"),
        customerPhone: tWhatsapp("customerPhone"),
        customerPhone2: tWhatsapp("customerPhone2"),
        thankYou: tWhatsapp("thankYou"),
      },
    );

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: data.customer_name,
          customer_address: data.customer_address,
          customer_phone: data.customer_phone,
          customer_phone_2: data.customer_phone_2 || undefined,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.finalPrice,
          })),
          total_price: total,
        }),
      });
    } catch {
      // Continue to WhatsApp even if order logging fails
    }

    const url = generateWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank");
    toast.success(t("redirecting"));
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("emptyTitle")}</h1>
        <p className="text-muted-foreground mb-6">{t("emptyDescription")}</p>
        <Button asChild>
          <Link href="/products">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 rounded-xl border bg-card p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold">
                        {formatPrice(item.finalPrice)}
                      </span>
                      {item.finalPrice < item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stockQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label={t("title")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="rounded-xl border bg-card p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">{t("orderSummary")}</h2>

          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.finalPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-bold text-lg mb-6">
            <span>{t("total")}</span>
            <span>{formatPrice(total)}</span>
          </div>

          {hasDiscount && (
            <p className="text-sm text-green-600 dark:text-green-400 mb-4">
              {t("savingMessage")}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="customer_name">{t("yourName")}</Label>
              <Input
                id="customer_name"
                placeholder={t("namePlaceholder")}
                {...register("customer_name")}
              />
              {errors.customer_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customer_name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customer_address">{t("yourAddress")}</Label>
              <Input
                id="customer_address"
                placeholder={t("addressPlaceholder")}
                {...register("customer_address")}
              />
              {errors.customer_address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customer_address.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customer_phone">{t("yourPhone")}</Label>
              <Input
                id="customer_phone"
                placeholder={t("phonePlaceholder")}
                {...register("customer_phone")}
              />
              {errors.customer_phone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customer_phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customer_phone_2">
                {t("yourPhone2")}{" "}
                <span className="text-muted-foreground">({t("optional")})</span>
              </Label>
              <Input
                id="customer_phone_2"
                placeholder={t("phonePlaceholder")}
                {...register("customer_phone_2")}
              />
              {errors.customer_phone_2 && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customer_phone_2.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              <MessageCircle className="me-2 h-5 w-5" />
              {t("orderWhatsApp")}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t("whatsappHint", { storeName })}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
