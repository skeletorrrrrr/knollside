import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  return NextResponse.json({ business });
}

export async function PATCH(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const body = await request.json();

  const allowed = {};
  if (body.name !== undefined) allowed.name = body.name;
  if (body.slug !== undefined) allowed.slug = body.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (body.logo_url !== undefined) allowed.logo_url = body.logo_url;
  if (body.labor_rate !== undefined) allowed.labor_rate = Number(body.labor_rate);
  if (body.min_price !== undefined) allowed.min_price = Number(body.min_price);
  if (body.spread_pct !== undefined) allowed.spread_pct = Number(body.spread_pct);
  if (body.quantity_type !== undefined && ["area", "hours", "count", "none"].includes(body.quantity_type)) {
    allowed.quantity_type = body.quantity_type;
  }
  // null clears the override and falls back to the industry template, so an
  // empty field has to survive as null rather than becoming Number(null) = 0.
  const qNum = (v) => {
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  if (body.quantity_min !== undefined) {
    const v = qNum(body.quantity_min);
    if (v === undefined) return NextResponse.json({ error: "Smallest size must be a number." }, { status: 400 });
    allowed.quantity_min = v;
  }
  if (body.quantity_max !== undefined) {
    const v = qNum(body.quantity_max);
    if (v === undefined) return NextResponse.json({ error: "Largest size must be a number." }, { status: 400 });
    allowed.quantity_max = v;
  }
  // Validate against the row as it will be after this patch, not just the
  // incoming body — someone editing one field at a time can otherwise cross
  // the two values without either request looking wrong on its own.
  {
    const nextMin = allowed.quantity_min !== undefined ? allowed.quantity_min : business.quantity_min;
    const nextMax = allowed.quantity_max !== undefined ? allowed.quantity_max : business.quantity_max;
    if (nextMin !== null && nextMax !== null && nextMin !== undefined && nextMax !== undefined && !(nextMax > nextMin)) {
      return NextResponse.json({ error: "Largest size must be bigger than smallest size." }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("businesses")
    .update(allowed)
    .eq("id", business.id)
    .select("*")
    .single();

  if (error) {
    // most likely a duplicate slug — surface a clean message
    const message = error.code === "23505" ? "That URL is already taken — try another." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ business: data });
}
