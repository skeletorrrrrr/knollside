import { supabasePublic } from "@/lib/supabasePublic";
import { getIndustry } from "@/lib/industries";

// A customer's site is data, not a file. Everything below is a default that
// renders something sensible on day one; the dashboard overwrites any piece of
// it. Nothing here is industry-locked — the wording leans on lib/industries.js
// so a plumber's site doesn't talk about slabs.

export const SECTION_IDS = ["services", "process", "gallery", "estimator", "contact"];

export function defaultContent(business) {
  const industry = getIndustry(business.industry);
  const t = industry.terms || {};
  const name = business.name || "Our shop";
  const items = t.items || "services";
  const item = t.item || "service";

  return {
    hero: {
      eyebrow: industry.label || "",
      headline: `${name}`,
      sub: `Straight answers, fair pricing, and work that lasts. See what your job costs before you pick up the phone.`,
      cta: "Get an instant estimate",
    },
    services: {
      on: true,
      eyebrow: "What we do",
      headline: `The ${items} we take on.`,
      intro: "",
      cards: [],
    },
    process: {
      on: true,
      eyebrow: "How a job runs",
      headline: "What to expect, start to finish.",
      intro: "",
      cards: [
        { title: "Get a number", body: `Use the estimator to see a real range for your ${item} in under a minute.` },
        { title: "We confirm the details", body: "We'll go over the specifics with you and lock in the scope." },
        { title: "We do the work", body: "Scheduled, done properly, and cleaned up after." },
      ],
    },
    gallery: {
      on: false,
      eyebrow: "Recent work",
      headline: "Straight off the job.",
      photos: [],
    },
    estimator: {
      on: true,
      eyebrow: "Instant estimate",
      headline: "See your price before you call.",
      intro: "Pick what you need below for a real price range — no waiting on a callback.",
    },
    contact: {
      on: true,
      eyebrow: "Get in touch",
      headline: "Ready to get started?",
      intro: "",
      phone: "",
      email: business.owner_email || "",
      address: "",
      hours: "",
    },
  };
}

// Shallow-merge saved content over the defaults, one section deep. A saved
// section that only sets `headline` must still get the default cards, so this
// can't be a plain object spread at the top level.
export function mergeContent(business) {
  const base = defaultContent(business);
  const saved = business.site_content || {};
  const out = {};
  for (const key of Object.keys(base)) {
    out[key] = { ...base[key], ...(saved[key] || {}) };
  }
  // Allow future sections saved by a newer dashboard than this renderer knows.
  for (const key of Object.keys(saved)) {
    if (!out[key]) out[key] = saved[key];
  }
  return out;
}

export async function getSiteBySlug(slug) {
  const supabase = supabasePublic();
  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, logo_url, industry, quantity_type, labor_rate, min_price, spread_pct, quantity_min, quantity_max, owner_email, site_enabled, site_content, subscription_status, subscription_tier"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !business) return { error: "not_found" };
  if (!business.site_enabled) return { error: "not_found" };
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
      quantity_min: business.quantity_min,
      quantity_max: business.quantity_max,
      hide_branding: ["pro"].includes(business.subscription_tier),
    },
    content: mergeContent(business),
    items: items || [],
    options: options || [],
    addons: addons || [],
  };
}
