import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true });
}

export function formatPrice(price: number, currency = "EGP"): string {
  return `${price.toLocaleString("en-EG")} ${currency}`;
}

export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function getEffectivePrice(
  price: number,
  discountPrice: number | null
): number {
  if (discountPrice !== null && discountPrice < price) {
    return discountPrice;
  }
  return price;
}

export function isDiscountActive(discount: {
  active: boolean;
  start_date: string | null;
  end_date: string | null;
}): boolean {
  if (!discount.active) return false;
  const now = new Date();
  if (discount.start_date && new Date(discount.start_date) > now) return false;
  if (discount.end_date && new Date(discount.end_date) < now) return false;
  return true;
}

export function formatWhatsAppNumber(number: string): string {
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `20${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("20")) {
    return cleaned;
  }
  return cleaned;
}

export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const formatted = formatWhatsAppNumber(phoneNumber);
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

export function generateOrderMessage(
  items: Array<{
    name: string;
    quantity: number;
    finalPrice: number;
  }>,
  totalPrice: number,
  customerName: string,
  customerPhone: string,
  labels: {
    greeting: string;
    orderIntro: string;
    products: string;
    quantity: string;
    price: string;
    totalPrice: string;
    customerName: string;
    customerPhone: string;
    thankYou: string;
  }
): string {
  const productLines = items
    .map(
      (item) =>
        `• ${item.name}\n  ${labels.quantity}: ${item.quantity}\n  ${labels.price}: ${formatPrice(item.finalPrice * item.quantity)}`
    )
    .join("\n\n");

  return `${labels.greeting}

${labels.orderIntro}

${labels.products}

${productLines}

${labels.totalPrice}: ${formatPrice(totalPrice)}

${labels.customerName}
${customerName}

${labels.customerPhone}
${customerPhone}

${labels.thankYou}`;
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function applyGlobalDiscount(
  price: number,
  discountPrice: number | null,
  globalDiscounts: Array<{
    active: boolean;
    start_date: string | null;
    end_date: string | null;
    type: "percentage" | "fixed";
    value: number;
    badge_text: string | null;
  }>
): { finalPrice: number; badgeText: string | null } {
  let finalPrice = getEffectivePrice(price, discountPrice);
  let badgeText: string | null = null;

  const now = new Date();
  const activeDiscount = globalDiscounts.find((d) => {
    if (!d.active) return false;
    if (d.start_date && new Date(d.start_date) > now) return false;
    if (d.end_date && new Date(d.end_date) < now) return false;
    return true;
  });

  if (activeDiscount) {
    badgeText = activeDiscount.badge_text ?? "SALE";
    if (activeDiscount.type === "percentage") {
      const discounted = finalPrice * (1 - activeDiscount.value / 100);
      finalPrice = Math.max(0, Math.round(discounted * 100) / 100);
    } else {
      finalPrice = Math.max(0, finalPrice - activeDiscount.value);
    }
  }

  if (discountPrice !== null && discountPrice < price) {
    badgeText =
      badgeText ??
      `${Math.round(((price - discountPrice) / price) * 100)}% OFF`;
  }

  return { finalPrice, badgeText };
}
