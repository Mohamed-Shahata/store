import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  isAllowedOrigin,
  originDeniedResponse,
} from "@/lib/api-security";
import { z } from "zod";
import type { OrderDoc } from "@/types/firestore";

const orderItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  quantity: z.number().int().positive().max(999),
  price: z.number().positive(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(200),
  customer_address: z.string().min(1, "Address is required").max(500),
  customer_phone: z
    .string()
    .min(6, "Phone is required")
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number"),
  customer_phone_2: z
    .string()
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number")
    .optional(),
  items: z.array(orderItemSchema).min(1).max(100),
  total_price: z.number().positive(),
});

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return originDeniedResponse();

  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`orders:${ip}`, 10, 60_000);
  if (!allowed) return rateLimitResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const {
    customer_name,
    customer_address,
    customer_phone,
    customer_phone_2,
    items,
    total_price,
  } = parsed.data;

  try {
    const order: OrderDoc = {
      customerName: customer_name,
      customerAddress: customer_address,
      customerPhone: customer_phone,
      customerPhone2: customer_phone_2 ?? null,
      items,
      totalPrice: total_price,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    await getAdminDb().collection("orders").add(order);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
