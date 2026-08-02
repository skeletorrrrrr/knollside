import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";

function tierForPriceId(priceId) {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return "pro";
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

  async function syncSubscription(subscription) {
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
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(subscription);
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
