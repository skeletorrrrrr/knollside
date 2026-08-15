import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import { stripe } from "@/lib/stripe";

// These are only ever read here on the server, so they don't need — and
// shouldn't have — the NEXT_PUBLIC_ prefix. Prefixed vars are inlined into the
// client bundle at BUILD time, which breaks if the value is marked Sensitive
// in Vercel or added after the build. Unprefixed vars are read at runtime.
// The NEXT_PUBLIC_ fallbacks keep older deployments working during the switch.
const env = (name) =>
  process.env[`STRIPE_PRICE_${name}`] ||
  process.env[`NEXT_PUBLIC_STRIPE_PRICE_${name}`];

const PRICE_IDS = {
  monthly: {
    starter: env("STARTER"),
    growth: env("GROWTH"),
    pro: env("PRO"),
  },
  yearly: {
    starter: env("STARTER_ANNUAL"),
    growth: env("GROWTH_ANNUAL"),
    pro: env("PRO_ANNUAL"),
  },
};

export async function POST(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const { tierId, billingPeriod } = await request.json();
  const period = billingPeriod === "yearly" ? "yearly" : "monthly";
  const priceId = PRICE_IDS[period][tierId];
  if (!priceId) {
    return NextResponse.json(
      { error: `No ${period} price configured for plan "${tierId}".` },
      { status: 400 }
    );
  }

  let customerId = business.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { business_id: business.id },
    });
    customerId = customer.id;
    await supabase.from("businesses").update({ stripe_customer_id: customerId }).eq("id", business.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard/billing?success=1`,
    cancel_url: `${siteUrl}/dashboard/billing?canceled=1`,
    metadata: { business_id: business.id },
    // No trial_period_days here: the free month is handled in-app before the
    // customer ever reaches checkout, so a Stripe trial would stack on top.
    subscription_data: {
      metadata: { business_id: business.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
