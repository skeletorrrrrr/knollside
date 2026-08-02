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
