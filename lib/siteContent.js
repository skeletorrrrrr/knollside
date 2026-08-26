import { supabasePublic } from "@/lib/supabasePublic";
import { getIndustry } from "@/lib/industries";

// A customer's site is data, not a file. Everything below is a default that
// renders something sensible on day one; the dashboard overwrites any piece of
// it. Nothing here is industry-locked — the wording leans on lib/industries.js
// so a plumber's site doesn't talk about slabs.

export const SECTION_IDS = ["why", "services", "process", "gallery", "reviews", "estimator", "areas", "contact"];

export function defaultContent(business) {
  const industry = getIndustry(business.industry);
  const t = industry.terms || {};
  const name = business.name || "Our shop";
  const items = t.items || "services";
  const saved = business.site_content || {};
  const area = (saved.areas && saved.areas.places && saved.areas.places[0]) || "";

  return {
    hero: {
      // The business name is already in the nav and the tab title. Spending the
      // biggest text on the page repeating it wastes the one line a visitor
      // definitely reads, so the default headline makes an offer instead.
      //
      // Where a service area is set it goes in the H1. For a local trade that
      // one word is most of the on-page SEO — "countertops in Vista" is what
      // people actually search, and it is the difference between ranking for
      // your town and ranking for nothing.
      eyebrow: name,
      headline: area
        ? `${industry.label || "Quality work"} in ${area} — see what your job costs before you call.`
        : "See what your job costs before you call.",
      sub: "Straight answers, fair pricing, and work that lasts. Get a real price range in under a minute — no waiting on a callback.",
      cta: "Get an instant estimate",
    },
    why: {
      on: true,
      eyebrow: "Why us",
      headline: "Why people call us back.",
      intro: "",
      cards: [
        { title: "Straight pricing", body: "You see a real range up front instead of waiting on a callback to find out." },
        { title: "We do the work ourselves", body: "No subcontracting the job out to whoever is free that week." },
        { title: "Turn up when we say", body: "Scheduled properly, and we tell you if anything changes." },
      ],
    },
    services: {
      // Off by default. A heading with no cards under it reads as broken, and
      // we have nothing worth putting there until they write it — the seeded
      // cards below come from their own catalogue, so this flips on by itself
      // once the estimator is set up.
      on: (business.__items || []).length > 0,
      eyebrow: "What we do",
      headline: `The ${items} we take on.`,
      intro: "",
      cards: (business.__items || []).slice(0, 6).map((it) => ({
        title: it.name,
        body: "",
      })),
    },
    process: {
      on: true,
      eyebrow: "How a job runs",
      headline: "What to expect, start to finish.",
      intro: "",
      cards: [
        { title: "Get a number", body: "Use the estimator below to see a real price range in under a minute." },
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
    reviews: {
      // Deliberately empty and off. Seeding example testimonials would put
      // invented praise on a live business site, and the ones nobody
      // remembers to replace are exactly the ones that stay up. These get
      // filled in from the customer's real reviews or not at all.
      on: false,
      eyebrow: "What people say",
      headline: "In their words.",
      quotes: [],
    },
    areas: {
      on: false,
      eyebrow: "Where we work",
      headline: "Areas we cover.",
      intro: "",
      places: [],
    },
    estimator: {
      on: true,
      eyebrow: "Instant estimate",
      headline: "Get your estimate.",
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
export function mergeContent(business, itemRows) {
  const base = defaultContent({ ...business, __items: itemRows || [] });
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
    content: mergeContent(business, items || []),
    items: items || [],
    options: options || [],
    addons: addons || [],
  };
}
