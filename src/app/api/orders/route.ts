import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  isAllowedOrigin,
  originDeniedResponse,
} from "@/lib/api-security";
import { z } from "zod";
import type { Database } from "@/types/database";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

const orderItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  quantity: z.number().int().positive().max(999),
  price: z.number().positive(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(200),
  customer_phone: z
    .string()
    .min(6, "Phone is required")
    .max(30)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number"),
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

  const { customer_name, customer_phone, items, total_price } = parsed.data;

  try {
    const supabase = await createClient();
    const order: OrderInsert = {
      customer_name,
      customer_phone,
      items,
      total_price,
      status: "sent",
    };

    const { error } = await supabase.from("orders").insert([order]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
