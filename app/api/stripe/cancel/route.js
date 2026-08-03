import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import { stripe } from "@/lib/stripe";

// Cancels the business's active subscription at period end (they keep access
// until the paid period runs out, standard SaaS behavior). Keeps the account
// and all data — this is "stop paying," not "delete me."
export async function POST() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  if (!business.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
  }

  try {
    await stripe.subscriptions.update(business.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  // Reflect immediately in our DB; the webhook will also confirm.
  await supabase
    .from("businesses")
    .update({ subscription_status: "canceling" })
    .eq("id", business.id);

  return NextResponse.json({ ok: true });
}
