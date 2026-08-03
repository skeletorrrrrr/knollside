import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import { stripe } from "@/lib/stripe";

// Permanently deletes the business, all its data, uploaded photos, any Stripe
// subscription, and the auth user. Requires the caller to type their exact
// business name as confirmation. Irreversible.
export async function POST(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);
  const body = await request.json().catch(() => ({}));

  // Friction: the typed confirmation must match the business name exactly.
  if ((body.confirmName || "").trim() !== (business.name || "").trim()) {
    return NextResponse.json({ error: "The name you typed doesn't match your business name." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 1. Cancel any Stripe subscription immediately so billing stops.
  if (business.stripe_subscription_id) {
    try { await stripe.subscriptions.cancel(business.stripe_subscription_id); } catch (_) {}
  }

  // 2. Delete uploaded photos from storage (items + logo live under the
  //    business's item ids and a logos/ prefix).
  try {
    const { data: files } = await admin.storage.from("item-photos").list("", { limit: 1000 });
    // Best-effort: list is shallow; we also remove per-item folders below.
    const { data: items } = await admin.from("items").select("id").eq("business_id", business.id);
    const paths = [];
    for (const it of items || []) {
      const { data: sub } = await admin.storage.from("item-photos").list(it.id, { limit: 100 });
      (sub || []).forEach((f) => paths.push(`${it.id}/${f.name}`));
    }
    if (paths.length) await admin.storage.from("item-photos").remove(paths);
  } catch (_) { /* storage cleanup is best-effort */ }

  // 3. Delete DB rows. Child tables cascade from businesses via FK, but we
  //    delete explicitly to be safe and order-independent.
  await admin.from("leads").delete().eq("business_id", business.id);
  await admin.from("items").delete().eq("business_id", business.id);
  await admin.from("options").delete().eq("business_id", business.id);
  await admin.from("addons").delete().eq("business_id", business.id);
  await admin.from("businesses").delete().eq("id", business.id);

  // 4. Delete the auth user itself (requires service role).
  try { await admin.auth.admin.deleteUser(user.id); } catch (_) {}

  // 5. Sign out the current session.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
