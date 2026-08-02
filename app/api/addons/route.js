import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("business_id", business.id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addons: data });
}

export async function POST(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const body = await request.json();

  const { data, error } = await supabase
    .from("addons")
    .insert({
      business_id: business.id,
      name: body.name || "New add-on",
      price: Number(body.price) || 0,
      billing_type: body.billing_type === "unit" ? "unit" : "flat",
      unit_label: body.unit_label || "",
      sort_order: body.sort_order || 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addon: data });
}
