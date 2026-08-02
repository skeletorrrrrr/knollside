import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabasePublic";
import { calculateEstimate } from "@/lib/pricing";

export async function POST(request, { params }) {
  const supabase = supabasePublic();
  const body = await request.json();

  if (!body.customer_name || !body.customer_email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const { data: business, error: bErr } = await supabase
    .from("businesses")
    .select("id, quantity_type, labor_rate, min_price, spread_pct")
    .eq("slug", params.slug)
    .maybeSingle();

  if (bErr || !business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Recompute the estimate server-side from the submitted selections rather
  // than trusting client-supplied totals. quantity is 1 for "none" industries.
  const quantity = business.quantity_type === "none" ? 1 : Number(body.quantity) || 0;

  const { low, high } = calculateEstimate({
    item: { base_price: body.item_price_snapshot },
    laborRate: business.labor_rate,
    option: { upcharge: body.option_upcharge_snapshot || 0 },
    quantity,
    selectedAddons: body.addons_selected || [],
    minPrice: business.min_price,
    spreadPct: business.spread_pct,
  });

  const { error } = await supabase.from("leads").insert({
    business_id: business.id,
    customer_name: body.customer_name,
    customer_email: body.customer_email,
    customer_phone: body.customer_phone || null,
    item_name: body.item_name,
    item_price_snapshot: body.item_price_snapshot,
    quantity,
    option_name: body.option_name,
    option_upcharge_snapshot: body.option_upcharge_snapshot || 0,
    addons_selected: body.addons_selected || [],
    estimate_low: low,
    estimate_high: high,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, low, high });
}
