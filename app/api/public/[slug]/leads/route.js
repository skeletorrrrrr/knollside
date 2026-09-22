import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabasePublic";
import { calculateEstimate } from "@/lib/pricing";
import { getIndustry } from "@/lib/industries";
import { sendEmail, businessLeadEmail, customerConfirmationEmail } from "@/lib/email";

// Prices are never taken from the request. The widget says WHICH item, option
// and add-ons were picked (by id, or by name for embeds loaded before ids were
// sent), and every price used below is read from this business's own
// catalogue. A tampered request can change what was picked, never what it costs.

const LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  comments: 2000,
  addons: 50,
  addonQtyMax: 10000,
  quantityMax: 100000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(value, max) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}

function bad(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Find a row in this business's catalogue. An id that is not in the list is a
// rejection, not a fallback, so another business's ids cannot be used here.
function resolve(rows, id, name) {
  if (id !== undefined && id !== null && id !== "") {
    return rows.find((r) => String(r.id) === String(id)) || null;
  }
  if (typeof name === "string" && name.trim()) {
    return rows.find((r) => r.name === name) || null;
  }
  return null;
}

export async function POST(request, { params }) {
  const supabase = supabasePublic();

  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request");
  }
  if (!body || typeof body !== "object") return bad("Invalid request");

  const customerName = clip(body.customer_name, LIMITS.name);
  const customerEmail = clip(body.customer_email, LIMITS.email);
  if (!customerName || !customerEmail) return bad("Name and email are required");
  if (!EMAIL_RE.test(customerEmail)) return bad("Please enter a valid email");

  const { data: business, error: bErr } = await supabase
    .from("businesses")
    .select("id, name, owner_email, industry, quantity_type, labor_rate, min_price, spread_pct, quantity_max")
    .eq("slug", params.slug)
    .maybeSingle();

  if (bErr || !business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [itemsRes, optionsRes, addonsRes] = await Promise.all([
    supabase.from("items").select("id, name, base_price").eq("business_id", business.id),
    supabase.from("options").select("id, name, upcharge").eq("business_id", business.id),
    supabase.from("addons").select("id, name, price, billing_type, unit_label").eq("business_id", business.id),
  ]);
  if (itemsRes.error || optionsRes.error || addonsRes.error) {
    console.error("lead catalogue load failed", itemsRes.error || optionsRes.error || addonsRes.error);
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }
  const itemRows = itemsRes.data || [];
  const optionRows = optionsRes.data || [];
  const addonRows = addonsRes.data || [];

  // Item: required.
  const item = resolve(itemRows, body.item_id, body.item_name);
  if (!item) return bad("Please choose an option from the list");

  // Option: only if one was sent. If sent, it must belong to this business.
  let option = null;
  const optionSent =
    (body.option_id !== undefined && body.option_id !== null && body.option_id !== "") ||
    (typeof body.option_name === "string" && body.option_name.trim() !== "");
  if (optionSent) {
    option = resolve(optionRows, body.option_id, body.option_name);
    if (!option) return bad("That option isn't available");
  }

  // Add-ons: each must belong to this business; price comes from the row.
  const submitted = Array.isArray(body.addons_selected) ? body.addons_selected : [];
  if (submitted.length > LIMITS.addons) return bad("Too many add-ons");
  const seen = new Set();
  const selectedAddons = [];
  for (const a of submitted) {
    if (!a || typeof a !== "object") return bad("Invalid add-on");
    const row = resolve(addonRows, a.id, a.name);
    if (!row) return bad("That add-on isn't available");
    const key = String(row.id);
    if (seen.has(key)) continue;
    seen.add(key);

    let qty = 1;
    if (row.billing_type === "unit") {
      qty = a.qty === undefined || a.qty === null || a.qty === "" ? 1 : Number(a.qty);
      if (!Number.isFinite(qty) || qty < 1 || qty > LIMITS.addonQtyMax) {
        return bad("Add-on quantity must be between 1 and 10,000");
      }
    }
    selectedAddons.push({
      id: row.id,
      name: row.name,
      price: Number(row.price) || 0,
      billing_type: row.billing_type,
      unit_label: row.unit_label,
      qty,
    });
  }

  // Quantity: 1 for flat-rate trades; otherwise positive, finite, and no
  // larger than this business's own maximum (or the industry's).
  const industry = getIndustry(business.industry);
  const qtype = business.quantity_type || industry?.quantity_type;
  let quantity = 1;
  if (qtype !== "none") {
    quantity = Number(body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return bad("Please enter a valid size");
    const configured =
      business.quantity_max !== null && business.quantity_max !== undefined
        ? Number(business.quantity_max)
        : NaN;
    let max = Number.isFinite(configured) && configured > 0
      ? configured
      : (Number(industry?.quantity?.max) || LIMITS.quantityMax);
    if (!(max > 0)) max = LIMITS.quantityMax;
    quantity = Math.min(quantity, max);
  }

  const itemPrice = Number(item.base_price) || 0;
  const optionUpcharge = option ? Number(option.upcharge) || 0 : 0;

  const { low, high } = calculateEstimate({
    item: { base_price: itemPrice },
    laborRate: Number(business.labor_rate) || 0,
    option: { upcharge: optionUpcharge },
    quantity,
    selectedAddons,
    minPrice: Number(business.min_price) || 0,
    spreadPct: Number(business.spread_pct) || 0,
  });

  const leadData = {
    business_id: business.id,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: clip(body.customer_phone, LIMITS.phone),
    comments: clip(body.comments, LIMITS.comments),
    item_name: item.name,
    item_price_snapshot: itemPrice,
    quantity,
    option_name: option ? option.name : null,
    option_upcharge_snapshot: optionUpcharge,
    addons_selected: selectedAddons,
    estimate_low: low,
    estimate_high: high,
  };

  const { error } = await supabase.from("leads").insert(leadData);
  if (error) {
    console.error("lead insert failed", error);
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }

  // Fire both emails. Failures here must NOT fail the request: the lead is
  // already safely saved, so email is best-effort.
  const businessMsg = businessLeadEmail({ businessName: business.name, lead: leadData, low, high });
  const customerMsg = customerConfirmationEmail({ businessName: business.name, lead: leadData, low, high });
  await Promise.allSettled([
    sendEmail({ to: business.owner_email, ...businessMsg }),
    sendEmail({ to: customerEmail, ...customerMsg }),
  ]);

  return NextResponse.json({ ok: true, low, high });
}