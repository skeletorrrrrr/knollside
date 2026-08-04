import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import { stripe } from "@/lib/stripe";

// Undo a pending cancellation: turn cancel_at_period_end back off so the
// subscription continues normally. Only meaningful while status is "canceling"
// (i.e. they cancelled but the period hasn't ended yet).
export async function POST() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  if (!business.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription to reactivate." }, { status: 400 });
  }

  try {
    const sub = await stripe.subscriptions.update(business.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    // Reflect the restored status locally; webhook will also confirm.
    await supabase
      .from("businesses")
      .update({ subscription_status: sub.status }) // "active" or "trialing"
      .eq("id", business.id);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
