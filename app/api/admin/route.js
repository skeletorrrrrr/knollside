import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";

// Owner-only overview of every business. Gated to ADMIN_EMAIL. Uses the
// service-role client to read across all tenants (bypassing per-business RLS),
// which is exactly what an owner admin view needs — hence the strict email gate.
export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();

  const [{ data: businesses }, { data: leads }, { data: items }] = await Promise.all([
    admin.from("businesses").select("id, name, slug, industry, owner_email, subscription_tier, subscription_status, created_at").order("created_at", { ascending: false }),
    admin.from("leads").select("business_id, created_at, status"),
    admin.from("items").select("business_id"),
  ]);

  const leadsByBiz = {};
  const lastLeadByBiz = {};
  (leads || []).forEach((l) => {
    leadsByBiz[l.business_id] = (leadsByBiz[l.business_id] || 0) + 1;
    if (!lastLeadByBiz[l.business_id] || l.created_at > lastLeadByBiz[l.business_id]) {
      lastLeadByBiz[l.business_id] = l.created_at;
    }
  });
  const itemsByBiz = {};
  (items || []).forEach((it) => {
    itemsByBiz[it.business_id] = (itemsByBiz[it.business_id] || 0) + 1;
  });

  const now = Date.now();
  const rows = (businesses || []).map((b) => {
    const leadCount = leadsByBiz[b.id] || 0;
    const lastLead = lastLeadByBiz[b.id] || null;
    const itemCount = itemsByBiz[b.id] || 0;
    const daysSinceLead = lastLead ? Math.floor((now - new Date(lastLead).getTime()) / 86400000) : null;

    // Health heuristic — a proxy, not certainty.
    let health = "active";
    if (leadCount === 0 && itemCount === 0) health = "not_set_up";
    else if (leadCount === 0) health = "no_leads";
    else if (daysSinceLead !== null && daysSinceLead > 30) health = "going_quiet";
    if (b.subscription_status === "canceled") health = "canceled";

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      industry: b.industry,
      owner_email: b.owner_email,
      tier: b.subscription_tier,
      status: b.subscription_status,
      created_at: b.created_at,
      leadCount,
      lastLead,
      itemCount,
      health,
    };
  });

  const summary = {
    totalBusinesses: rows.length,
    paying: rows.filter((r) => r.tier && ["active", "trialing"].includes(r.status)).length,
    totalLeads: (leads || []).length,
    notSetUp: rows.filter((r) => r.health === "not_set_up").length,
  };

  return NextResponse.json({ rows, summary });
}

// Owner-only: permanently delete ANY business by id. Same ADMIN_EMAIL gate as
// the GET. Cancels the business's Stripe subscription, wipes its data and
// uploaded photos, and deletes the owner's auth user. Irreversible.
export async function DELETE(request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const businessId = body.businessId;
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: business } = await admin
    .from("businesses")
    .select("id, owner_id, stripe_subscription_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  // Cancel Stripe subscription if any.
  if (business.stripe_subscription_id) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.subscriptions.cancel(business.stripe_subscription_id);
    } catch (_) {}
  }

  // Delete uploaded photos for this business's items.
  try {
    const { data: items } = await admin.from("items").select("id").eq("business_id", businessId);
    const paths = [];
    for (const it of items || []) {
      const { data: sub } = await admin.storage.from("item-photos").list(it.id, { limit: 100 });
      (sub || []).forEach((f) => paths.push(`${it.id}/${f.name}`));
    }
    if (paths.length) await admin.storage.from("item-photos").remove(paths);
  } catch (_) {}

  // Delete data rows.
  await admin.from("leads").delete().eq("business_id", businessId);
  await admin.from("items").delete().eq("business_id", businessId);
  await admin.from("options").delete().eq("business_id", businessId);
  await admin.from("addons").delete().eq("business_id", businessId);
  await admin.from("businesses").delete().eq("id", businessId);

  // Delete the owner's auth user.
  if (business.owner_id) {
    try { await admin.auth.admin.deleteUser(business.owner_id); } catch (_) {}
  }

  return NextResponse.json({ ok: true });
}
