// Shared estimate math. Kept as one small pure function so the widget UI
// and the API (for validating/recording a lead) can never disagree about
// how a price was calculated.
//
// Generic across industries: `quantity` is whatever the industry measures
// (sq ft, labor hours, number of visits, or 1 when quantity_type is "none").
// item.base_price and option.upcharge are "per unit of quantity"; the labor
// rate is too. So the same formula covers countertops ($/sqft), mechanics
// ($/hour), and flat-rate shops (quantity fixed at 1).
export function calculateEstimate({
  item,            // { base_price }
  laborRate,
  option,          // { upcharge }
  quantity,        // number; pass 1 for quantity_type "none"
  selectedAddons,  // [{ price, billing_type, qty }]
  minPrice,
  spreadPct,
}) {
  const qty = Number(quantity) || 0;

  const addonsTotal = (selectedAddons || []).reduce((sum, a) => {
    const aQty = a.billing_type === "unit" ? a.qty || 1 : 1;
    return sum + a.price * aQty;
  }, 0);

  const perUnit =
    (item?.base_price || 0) + (laborRate || 0) + (option?.upcharge || 0);
  const rawBase = qty * perUnit + addonsTotal;

  const minApplied = rawBase < minPrice;
  const base = Math.max(rawBase, minPrice);
  const spread = spreadPct / 100;

  return {
          low: Math.round(base),
    high: Math.round(base * (1 + spread)),
    base,
    minApplied,
    addonsTotal,
  };
}

export function money(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

export const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    annual: 390,
    blurb: "For a shop putting a price on its site for the first time.",
    features: [
      "Up to 50 estimates a month",
      "Your logo, colours and pricing",
      "Every lead saved with name, number and job details",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 129,
    annual: 1290,
    blurb: "When the quotes start adding up.",
    features: [
      "Up to 120 estimates a month",
      "Everything in Starter",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 349,
    annual: 3490,
    blurb: "Your estimator and your website, both handled.",
    // The website is what carries this tier. Sold on its own it is $300 to set
    // up plus $150/mo, so bundling it is the reason Pro costs what it does —
    // without it Pro was only "a bigger number of estimates", which is a weak
    // thing to ask $349 for.
    highlight: "Website included",
    features: [
      "Unlimited estimates",
      "Website and hosting included — no setup fee",
      "We keep it current — text, photos, prices, hours",
      "One design refresh a year",
      '"Powered by Knollside" removed',
      "Everything in Growth",
    ],
  },
];
