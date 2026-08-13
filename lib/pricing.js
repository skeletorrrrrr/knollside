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
  { id: "starter", name: "Starter", price: 39, annual: 390, blurb: "Up to 100 estimates/mo, 1 embed" },
  { id: "growth", name: "Growth", price: 129, annual: 1290, blurb: "Up to 750 estimates/mo, custom branding" },
  { id: "pro", name: "Pro", price: 349, annual: 3490, blurb: "Unlimited estimates, priority support" },
];
