import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, items, total_price } = body;

    if (!customer_name || !customer_phone || !items || total_price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
      { status: 500 }
    );
  }
}
