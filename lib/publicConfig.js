import { supabasePublic } from "@/lib/supabasePublic";

export async function getPublicConfig(slug) {
  const supabase = supabasePublic();

  const { data: business, error: bErr } = await supabase
    .from("businesses")
    .select("id, name, slug, logo_url, industry, quantity_type, labor_rate, min_price, spread_pct, subscription_status")
    .eq("slug", slug)
    .maybeSingle();

  if (bErr || !business) return { error: "not_found" };
  if (!["trialing", "active"].includes(business.subscription_status)) {
    return { error: "unavailable" };
  }

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
    },
    items: items || [],
    options: options || [],
    addons: addons || [],
  };
}
