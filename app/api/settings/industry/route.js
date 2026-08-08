import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import { INDUSTRIES } from "@/lib/industries";

// Switching industry after signup.
//
// At signup, a database trigger seeds items/options/addons from the chosen
// industry's template. There's no trigger for *changing* industry later, so
// this route does the same job in application code: clear the three child
// tables, then re-seed them from the new industry's starter set, and move the
// business row's industry / quantity_type / labor_rate over with it.
//
// This is deliberately destructive on pricing — the whole point is that
// someone who picked the wrong trade at signup can fix it without deleting
// their account and starting over. Leads are untouched: they store a snapshot
// of what was quoted, not foreign keys into items/options, so old leads stay
// readable after the switch.
export async function POST(request) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const nextIndustry = body.industry;
  const template = INDUSTRIES[nextIndustry];
  if (!template) {
    return NextResponse.json({ error: "That isn't an industry we support." }, { status: 400 });
  }

  // Nothing to do — don't wipe someone's pricing because they re-picked
  // the industry they were already on.
  if (nextIndustry === business.industry) {
    return NextResponse.json({ business, changed: false });
  }

  const starter = template.starter || {};

  // Clear the old template's rows first. Sequential rather than parallel so a
  // failure leaves a predictable state instead of a half-cleared account.
  for (const table of ["items", "options", "addons"]) {
    const { error } = await supabase.from(table).delete().eq("business_id", business.id);
    if (error) {
      return NextResponse.json(
        { error: `Couldn't clear your existing ${table}. Nothing was changed.` },
        { status: 400 }
      );
    }
  }

  const rows = {
    items: (starter.items || []).map((it, i) => ({
      business_id: business.id,
      name: it.name,
      base_price: it.base_price ?? 0,
      sort_order: i,
    })),
    options: (starter.options || []).map((o, i) => ({
      business_id: business.id,
      name: o.name,
      upcharge: o.upcharge ?? 0,
      sort_order: i,
    })),
    addons: (starter.addons || []).map((a, i) => ({
      business_id: business.id,
      name: a.name,
      price: a.price ?? 0,
      billing_type: a.billing_type === "unit" ? "unit" : "flat",
      unit_label: a.unit_label || "",
      sort_order: i,
    })),
  };

  // "Other" with a blank start has no starter rows at all — that's valid,
  // the business builds their own list from an empty dashboard.
  for (const [table, payload] of Object.entries(rows)) {
    if (!payload.length) continue;
    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      return NextResponse.json(
        { error: `Switched, but couldn't add the starter ${table}: ${error.message}` },
        { status: 400 }
      );
    }
  }

  const update = {
    industry: nextIndustry,
    quantity_type: template.quantity_type,
  };
  // Each template carries the labor rate that matches its units — a $12/sq ft
  // countertop rate is nonsense as a $12/hour shop rate.
  if (starter.labor_rate !== undefined) update.labor_rate = starter.labor_rate;

  const { data, error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", business.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ business: data, changed: true });
}
