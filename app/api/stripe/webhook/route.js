import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Server-side only — see the note in checkout/route.js about why these are
// not NEXT_PUBLIC_. Each tier has a monthly and a yearly price; both must map
// back to the same tier or an annual subscriber lands on the wrong plan.
const env = (name) =>
  process.env[`STRIPE_PRICE_${name}`] ||
  process.env[`NEXT_PUBLIC_STRIPE_PRICE_${name}`];

function tierForPriceId(priceId) {
  const byTier = {
    starter: [env("STARTER"), env("STARTER_ANNUAL")],
    growth: [env("GROWTH"), env("GROWTH_ANNUAL")],
    pro: [env("PRO"), env("PRO_ANNUAL")],
  };
  for (const [tier, ids] of Object.entries(byTier)) {
    if (ids.filter(Boolean).includes(priceId)) return tier;
  }
  console.error("Unrecognised price ID on subscription:", priceId);
  return "starter";
}

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // Stripe does not guarantee event ordering, and each event carries a
  // SNAPSHOT of the subscription as it was when that event fired. A
  // subscription.created snapshot says "incomplete"; if it arrives after the
  // updated event, writing the snapshot would clobber "active" with stale
  // data. So we always re-fetch the live subscription and write that instead.
  async function syncSubscription(subscriptionOrId) {
    const id =
      typeof subscriptionOrId === "string" ? subscriptionOrId : subscriptionOrId.id;

    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(id);
    } catch (err) {
      console.error("Could not re-fetch subscription", id, err.message);
      // Fall back to the snapshot rather than dropping the update entirely.
      if (typeof subscriptionOrId === "string") return;
      subscription = subscriptionOrId;
    }

    const businessId = subscription.metadata?.business_id;
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = tierForPriceId(priceId);
    const status = subscription.status; // active, trialing, past_due, canceled, ...

    if (!businessId) return;
    await supabase
      .from("businesses")
      .update({
        subscription_tier: tier,
        subscription_status: status,
        stripe_subscription_id: subscription.id,
      })
      .eq("id", businessId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        await syncSubscription(session.subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      await syncSubscription(event.data.object);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const businessId = subscription.metadata?.business_id;
      if (businessId) {
        await supabase.from("businesses").update({ subscription_status: "canceled" }).eq("id", businessId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
