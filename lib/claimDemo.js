import { createClient } from "@supabase/supabase-js";

// Service-role client. Unclaimed demos deliberately have owner_id NULL and
// is_demo = true, and the "public can read businesses" RLS policy excludes
// demos — so neither the anon client nor the logged-in user's client can see
// or modify them. Only this client can, which is why every function here is
// server-only. Never import this into a client component.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function isExpired(row) {
  return row.claim_expires_at && new Date(row.claim_expires_at) < new Date();
}

// Loads a demo for the public claim page. Returns the same shape as
// getPublicConfig so <EmbedWidget> can be handed it directly.
export async function getDemoByToken(token) {
  if (!token) return { error: "not_found" };

  const supabase = admin();
  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, logo_url, industry, quantity_type, labor_rate, min_price, spread_pct, is_demo, claim_expires_at, claimed_at"
    )
    .eq("claim_token", token)
    .eq("is_demo", true)
    .maybeSingle();

  if (error || !business) return { error: "not_found" };
  if (business.claimed_at) return { error: "claimed" };
  if (isExpired(business)) return { error: "expired" };

  const [{ data: items }, { data: options }, { data: addons }] = await Promise.all([
    supabase.from("items").select("id, name, base_price, photo_url").eq("business_id", business.id).order("sort_order"),
    supabase.from("options").select("id, name, upcharge").eq("business_id", business.id).order("sort_order"),
    supabase.from("addons").select("id, name, price, billing_type, unit_label").eq("business_id", business.id).order("sort_order"),
  ]);

  return {
    business: {
      name: business.name,
      slug: business.slug,
      logo_url: business.logo_url,
      industry: business.industry,
      quantity_type: business.quantity_type,
      labor_rate: business.labor_rate,
      min_price: business.min_price,
      spread_pct: business.spread_pct,
      // A demo has no subscription yet, so the badge always shows in preview.
      hide_branding: false,
    },
    items: items || [],
    options: options || [],
    addons: addons || [],
  };
}

// Called from getOrCreateBusiness on the user's first authenticated request.
//
// The token is carried in user_metadata, set at signup on the claim page,
// rather than posted from the browser after signup. That ordering matters:
// getOrCreateBusiness would otherwise create an empty business first, and
// because businesses.owner_id is UNIQUE the claim could then never land —
// the demo would be orphaned with no way back. Reading the token here means
// the claim happens inside the same function that would have created the
// empty row, so the two can't race. It also survives email confirmation,
// where the session appears minutes later in a different request.
//
// Returns the claimed business row, or null to fall through to normal
// business creation. Never throws: a failed claim should degrade to a
// regular empty account, not a broken signup.
export async function claimDemoForUser(user) {
  const token = user?.user_metadata?.claim_token;
  if (!token) return null;

  try {
    const supabase = admin();

    const { data: demo } = await supabase
      .from("businesses")
      .select("id, claimed_at, claim_expires_at")
      .eq("claim_token", token)
      .eq("is_demo", true)
      .maybeSingle();

    if (!demo || demo.claimed_at || isExpired(demo)) return null;

    // The .is("owner_id", null) guard makes this a compare-and-set: if two
    // requests for the same user arrive together, the second matches no rows
    // and returns null rather than reassigning an already-claimed demo.
    const { data: updated, error } = await supabase
      .from("businesses")
      .update({
        owner_id: user.id,
        owner_email: user.email,
        is_demo: false,
        claimed_at: new Date().toISOString(),
        claim_token: null,
      })
      .eq("id", demo.id)
      .is("owner_id", null)
      .select()
      .maybeSingle();

    if (error || !updated) return null;
    return updated;
  } catch {
    return null;
  }
}
