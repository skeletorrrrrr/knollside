import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

// POST /api/leads with { action: "mark_all_seen" } clears the unseen badge
// for every lead belonging to this business in one call.
export async function POST(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body.action !== "mark_all_seen") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const business = await getOrCreateBusiness(supabase, user);
  const { error } = await supabase
    .from("leads")
    .update({ seen: true })
    .eq("business_id", business.id)
    .eq("seen", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
