"use client";
import { useState } from "react";
import { calculateEstimate, money } from "@/lib/pricing";
import { getIndustry } from "@/lib/industries";

const SWATCHES = [
  "linear-gradient(135deg,#4b4b4d,#6e6e70 45%,#3a3a3c)",
  "linear-gradient(135deg,#ece7db,#d8d2c2 50%,#c7bfa9)",
  "linear-gradient(135deg,#f2efe9,#e3ded2 45%,#cfc7b5)",
  "linear-gradient(135deg,#a97b4f,#8a5d34 50%,#6f4a29)",
  "linear-gradient(135deg,#6b7b76,#8a9a92 50%,#586862)",
  "linear-gradient(135deg,#8a8f9b,#a9adb8 50%,#6f7480)",
];

export default function EmbedWidget({ business, items, options, addons }) {
  const industry = getIndustry(business.industry);
  const terms = industry.terms;
  const qtype = business.quantity_type || industry.quantity_type;
  const showQuantity = qtype !== "none";
  const qRange = industry.quantity;
  // Step in whole units unless the whole range is small enough that half
  // steps are useful (e.g. a 1-4 hour job). Crucially, min and step must
  // agree: a 0.5 min with a step of 1 makes every notch land on a half and
  // whole numbers become unreachable, which is wrong for labor hours.
  const qSpan = (qRange?.max ?? 1) - (qRange?.min ?? 0);
  const qStep = qSpan <= 4 ? 0.5 : 1;
  const isArea = qtype === "area";

  const [itemId, setItemId] = useState(items[0]?.id);
  const [quantity, setQuantity] = useState(() => {
    // Hourly trades start at a length that suits the first service rather
    // than a one-size default that may contradict it.
    if (qtype === "hours" && items.length > 0) {
      const sorted = [...items].sort(
        (a, b) => (a.base_price || 0) - (b.base_price || 0)
      );
      const rank = sorted.findIndex((m) => m.id === items[0].id);
      const frac = sorted.length > 1 ? rank / (sorted.length - 1) : 0;
      const low = Math.max(qRange?.min ?? 1, 2);
      const high = Math.min(qRange?.max ?? 8, 8);
      return Math.round(low + frac * (high - low));
    }
    return qRange?.default ?? 1;
  });
  const [optionId, setOptionId] = useState(options[0]?.id);
  const [checkedAddons, setCheckedAddons] = useState({});
  const [addonQty, setAddonQty] = useState({});
  const [stage, setStage] = useState("form"); // form -> quote -> submitted
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomedPhoto, setZoomedPhoto] = useState(null); // {url, name} or null
  const [showDims, setShowDims] = useState(false);
  const [dimL, setDimL] = useState("");
  const [dimW, setDimW] = useState("");

  const item = items.find((m) => m.id === itemId) || items[0];
  const itemIndex = items.findIndex((m) => m.id === item?.id);
  const option = options.find((e) => e.id === optionId) || options[0];

  // On hourly trades the service and the hours are independent, so a customer
  // could leave the slider at "16 hours" and quote a 16-hour outlet install.
  // Selecting a service snaps the slider to a sensible length for that job,
  // ranked by its per-hour premium (a panel upgrade costs more per hour AND
  // takes longer than swapping an outlet). The customer can still adjust.
  function suggestedHours(nextItem) {
    if (qtype !== "hours" || items.length === 0) return null;
    const sorted = [...items].sort(
      (a, b) => (a.base_price || 0) - (b.base_price || 0)
    );
    const rank = sorted.findIndex((m) => m.id === nextItem.id);
    const frac = sorted.length > 1 ? rank / (sorted.length - 1) : 0;
    const low = Math.max(qRange?.min ?? 1, 2);
    const high = Math.min(qRange?.max ?? 8, 8);
    return Math.round(low + frac * (high - low));
  }

  function selectItem(nextItem) {
    setItemId(nextItem.id);
    const hrs = suggestedHours(nextItem);
    if (hrs !== null) setQuantity(hrs);
  }

  const effectiveQty = showQuantity ? quantity : 1;

  const selectedAddons = addons
    .filter((a) => checkedAddons[a.id])
    .map((a) => ({ ...a, qty: addonQty[a.id] ?? 1 }));

  const { low, high, minApplied } = calculateEstimate({
    item,
    laborRate: business.labor_rate,
    option,
    quantity: effectiveQty,
    selectedAddons,
    minPrice: business.min_price,
    spreadPct: business.spread_pct,
  });

  function toggleAddon(id) {
    setCheckedAddons((c) => ({ ...c, [id]: !c[id] }));
  }

  function updateDim(which, val) {
    const l = which === "l" ? val : dimL;
    const w = which === "w" ? val : dimW;
    if (which === "l") setDimL(val);
    else setDimW(val);
    const raw = (Number(l) || 0) * (Number(w) || 0);
    if (raw > 0) {
      const clamped = Math.min(Math.max(Math.round(raw), qRange.min), qRange.max);
      setQuantity(clamped);
    }
  }

  async function submitLead(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/public/${business.slug}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          comments: comments,
          item_name: item?.name,
          item_price_snapshot: item?.base_price,
          quantity: effectiveQty,
          option_name: option?.name,
          option_upcharge_snapshot: option?.upcharge,
          addons_selected: selectedAddons.map((a) => ({
            id: a.id, name: a.name, price: a.price, billing_type: a.billing_type, unit_label: a.unit_label, qty: a.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStage("submitted");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!item) {
    return <p className="text-sm text-[#8A836F] p-6">This business hasn't finished setting up their estimator yet.</p>;
  }

  if (stage === "submitted") {
    return (
      <div className="max-w-sm mx-auto text-center py-16 px-5">
        <div className="text-2xl mb-2">✓</div>
        <h3 className="font-display text-xl font-semibold mb-1">Estimate sent</h3>
        <p className="text-sm text-[#7A7364]">
          Thanks, {name.split(" ")[0] || "there"} — {business.name} has your estimate and will
          follow up to confirm the details.
        </p>
      </div>
    );
  }

  let stepCounter = 0;
  const stepMaterial = ++stepCounter;
  const stepQuantity = showQuantity ? ++stepCounter : null;
  const stepOptions = options.length > 0 ? ++stepCounter : null;
  const stepAddons = addons.length > 0 ? ++stepCounter : null;

  const isHours = industry.quantity_type === "hours";
  const scope = isHours ? jobScope(industry.id, quantity, qRange) : null;
  const zoneLabel = isArea ? sizeZone(industry.id, quantity, qRange) : null;

  // A homeowner whose AC just died has no idea whether that is a 1-hour or a
  // 6-hour job — asking them to estimate labour puts the hardest question on
  // the least-equipped person. For hourly trades we ask how big the job is
  // instead and keep the hours as a quiet secondary detail.
  const quantityTitle = isHours ? "How big is the job?" : terms.quantity;
  const quantityRight = isHours
    ? scope.label
    : `${quantity} ${terms.quantityUnit}`;

  return (
    <>
    <style>{`@keyframes knollside-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="mb-6">
        {business.logo_url ? (
          <div className="flex items-center gap-3">
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-12 w-auto max-w-[180px] object-contain"
            />
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brass-deep">
                {business.name}
              </span>
              <h1 className="font-display text-2xl font-semibold tracking-tight">Get an instant estimate</h1>
            </div>
          </div>
        ) : (
          <>
            <span className="text-xs font-semibold tracking-widest uppercase text-brass-deep">
              {business.name}
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-tight mt-1">Get an instant estimate</h1>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pb-10">
        <div className="md:col-span-3 space-y-5">
          <SectionCard step={stepMaterial} title={`Choose ${terms.item.match(/^[aeiou]/i) ? "an" : "a"} ${terms.item}`} capitalizeTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map((m, i) => {
                const selected = m.id === itemId;
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectItem(m)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectItem(m);
                      }
                    }}
                    className="rounded-xl overflow-hidden border-2 text-left transition-all duration-150 cursor-pointer"
                    style={{
                      borderColor: selected ? "#B08A44" : "#DCD5C4",
                      boxShadow: selected ? "0 6px 16px rgba(176,138,68,0.28)" : "0 1px 2px rgba(0,0,0,0.06)",
                      transform: selected ? "translateY(-2px) scale(1.02)" : "none",
                    }}
                  >
                    <div className="relative">
                      {selected && (
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            top: 6, left: 6, width: 22, height: 22, borderRadius: "50%",
                            background: "#B08A44", color: "#fff", zIndex: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      {m.photo_url ? (
                        <div className="w-full flex items-center justify-center" style={{ height: "112px", background: "#F2ECDE" }}>
                          <img src={m.photo_url} alt={m.name} className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div style={{ height: "112px", background: SWATCHES[i % SWATCHES.length] }} />
                      )}
                      {m.photo_url && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedPhoto({ url: m.photo_url, name: m.name });
                          }}
                          aria-label={`Enlarge photo of ${m.name}`}
                          className="absolute flex items-center justify-center"
                          style={{
                            top: 6,
                            right: 6,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(0,0,0,0.12)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                            cursor: "pointer",
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#211F1B" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="px-2.5 py-2 bg-white">
                      <div className="text-xs font-medium leading-snug">{m.name}</div>
                      <div className="text-xs font-mono text-[#A39C8A]">From {money(m.base_price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {showQuantity && (
            <SectionCard step={stepQuantity} title={quantityTitle} capitalizeTitle right={quantityRight}>
              <input
                type="range"
                min={qStep === 1 ? Math.max(1, Math.ceil(qRange.min)) : qRange.min}
                max={qRange.max}
                step={qStep}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#B08A44" }}
              />
              {zoneLabel && !isHours && (
                <div className="text-center text-xs mt-2" style={{ color: "#B08A44", fontWeight: 500 }}>
                  {zoneLabel}
                </div>
              )}
              {isHours && (
                <div className="text-center mt-2">
                  <div className="text-xs" style={{ color: "#B08A44", fontWeight: 500 }}>
                    {scope.detail}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#BDB49F" }}>
                    About {quantity} {quantity === 1 ? "hour" : "hours"} of work
                  </div>
                </div>
              )}
              <div className="flex justify-between text-xs mt-1.5" style={{ color: "#BDB49F" }}>
                {isHours ? (
                  <>
                    <span>Simple</span>
                    <span>Major</span>
                  </>
                ) : (
                  <>
                    <span>{qStep === 1 ? Math.max(1, Math.ceil(qRange.min)) : qRange.min} {terms.quantityUnit}</span>
                    <span>{qRange.max} {terms.quantityUnit}</span>
                  </>
                )}
              </div>
              {isArea && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDims((v) => !v)}
                    className="text-xs underline"
                    style={{ color: "#8A836F", textUnderlineOffset: "2px" }}
                  >
                    {showDims ? "Hide dimensions" : `Don't know your ${terms.quantityUnit}? Calculate it`}
                  </button>
                  {showDims && (
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "#8A836F" }}>
                      <input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        placeholder="Length"
                        value={dimL}
                        onChange={(e) => updateDim("l", e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-md border border-line"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        placeholder="Width"
                        value={dimW}
                        onChange={(e) => updateDim("w", e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-md border border-line"
                      />
                      <span className="font-mono">= {quantity} {terms.quantityUnit}</span>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {options.length > 0 && (
            <SectionCard step={stepOptions} title={terms.option} capitalizeTitle>
              <div className="flex flex-wrap gap-2">
                {options.map((e) => {
                  const selected = e.id === optionId;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setOptionId(e.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-lg border transition-all duration-150"
                      style={{
                        borderColor: selected ? "#B08A44" : "#DDD3BF",
                        background: selected ? "#FBF7EE" : "white",
                        boxShadow: selected ? "0 2px 8px rgba(176,138,68,0.15)" : "none",
                      }}
                    >
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B08A44" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {e.name}
                      {e.upcharge > 0 && <span className="text-[#A39C8A]">+${e.upcharge}</span>}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {addons.length > 0 && (
            <SectionCard step={stepAddons} title="Add-ons">
              <div className="space-y-2.5">
                {addons.map((a) => {
                  const checked = !!checkedAddons[a.id];
                  return (
                    <div key={a.id}>
                      <label
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150"
                        style={{
                          borderColor: checked ? "#B08A44" : "#DCD5C4",
                          background: checked ? "#FBF7EE" : "white",
                          boxShadow: checked ? "0 2px 8px rgba(176,138,68,0.15)" : "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: checked ? "none" : "2px solid #DCD5C4",
                              background: checked ? "#B08A44" : "transparent",
                            }}
                          >
                            {checked && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <input type="checkbox" checked={checked} onChange={() => toggleAddon(a.id)} className="sr-only" />
                          <span className="text-sm font-medium truncate">{a.name}</span>
                        </span>
                        <span className="text-xs font-mono flex-shrink-0" style={{ color: "#A39C8A" }}>
                          {a.billing_type === "unit" ? `+$${a.price}/${a.unit_label || "unit"}` : `+${money(a.price)}`}
                        </span>
                      </label>
                      {a.billing_type === "unit" && checked && (
                        <input
                          type="number"
                          min={1}
                          value={addonQty[a.id] ?? 1}
                          onChange={(e) => setAddonQty((q) => ({ ...q, [a.id]: Number(e.target.value) || 1 }))}
                          className="ml-6 mt-1.5 w-24 text-sm px-2 py-1.5 rounded-md border border-line"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="sticky top-4">
            <div className="relative rounded-2xl" style={{ filter: "drop-shadow(0 8px 24px rgba(176,138,68,0.25))" }}>
              <div className="ticket-stub rounded-2xl p-6 shadow-xl" style={{ background: "#211F1B", color: "#F7F3EA" }}>
                <span
                  className="absolute -top-2.5 -right-2.5 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-sm shadow-md"
                  style={{ background: "#B08A44", color: "#211F1B", transform: "rotate(6deg)" }}
                >
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 6, height: 6, background: "#211F1B", animation: "knollside-pulse 1.8s ease-in-out infinite" }}
                  />
                  ESTIMATE
                </span>
                <div className="flex items-center gap-2.5 mb-3">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt="" className="w-9 h-9 rounded-md object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-md" style={{ background: SWATCHES[itemIndex % SWATCHES.length] }} />
                  )}
                  <div className="text-xs uppercase tracking-wide" style={{ color: "#BDB49F" }}>
                    {item.name}{showQuantity ? ` · ${quantity} ${terms.quantityUnit}` : ""}
                  </div>
                </div>
                <div className="text-4xl font-semibold mb-4 font-mono tabular-nums tracking-tight">
                  {money(low)}–{money(high)}
                </div>
                <div className="border-t pt-3 text-xs" style={{ borderColor: "rgba(247,243,234,0.18)" }}>
                  <div className="mb-1.5 uppercase" style={{ color: "#8A836F", fontSize: "10px", letterSpacing: "0.09em" }}>
                    Included
                  </div>
                  <ul className="space-y-1" style={{ color: "#BDB49F" }}>
                    <li>{item.name}{showQuantity ? ` · ${quantity} ${terms.quantityUnit}` : ""}</li>
                    {option?.name && <li>{option.name}</li>}
                    {selectedAddons.map((a) => (
                      <li key={a.id}>{a.name}{a.billing_type === "unit" ? ` · ${a.qty} ${a.unit_label || "unit"}` : ""}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {stage === "form" ? (
              <button
                onClick={() => setStage("quote")}
                className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-3 rounded-xl text-white transition-transform duration-150"
                style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)", boxShadow: "0 6px 18px rgba(143,110,50,0.35)" }}
              >
                Get this estimate →
              </button>
            ) : (
              <form onSubmit={submitLead} className="mt-4 space-y-2.5 p-4 rounded-xl border border-line bg-white shadow-sm">
                <p className="text-xs mb-1 text-[#8A836F]">
                  Send this estimate to {business.name} to confirm the details:
                </p>
                <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm px-3 py-2 rounded-md border border-line" />
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm px-3 py-2 rounded-md border border-line" />
                <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-sm px-3 py-2 rounded-md border border-line" />
                <textarea placeholder="Anything else we should know? (optional)" value={comments} onChange={(e) => setComments(e.target.value)} rows={2} className="w-full text-sm px-3 py-2 rounded-md border border-line resize-none" />
                {errorMsg && <p className="text-xs text-clay">{errorMsg}</p>}
                <button type="submit" disabled={submitting} className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white disabled:opacity-60" style={{ background: "#211F1B" }}>
                  {submitting ? "Sending…" : "Send my estimate"}
                </button>
                <p className="text-xs text-[#A39C8A] text-center pt-1">
                  Estimate only — subject to final confirmation.
                </p>
              </form>
            )}

            {!business.hide_branding && (
              <p className="text-center pt-3" style={{ fontSize: "10.5px", letterSpacing: "0.04em", color: "#A39C8A" }}>
                Powered by{" "}
                <a
                  href="https://www.knollside.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#8F6E32", fontWeight: 500, textDecoration: "none" }}
                >
                  Knollside
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    {zoomedPhoto && (
      <div
        onClick={() => setZoomedPhoto(null)}
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "rgba(20,17,13,0.85)", zIndex: 1000, padding: "24px", cursor: "zoom-out" }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="text-center"
          style={{ maxWidth: "90%", maxHeight: "90%" }}
        >
          <img
            src={zoomedPhoto.url}
            alt={zoomedPhoto.name}
            style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}
          />
          <div className="text-white font-medium" style={{ marginTop: 16, fontSize: 18 }}>
            {zoomedPhoto.name}
          </div>
          <button
            type="button"
            onClick={() => setZoomedPhoto(null)}
            className="font-medium"
            style={{
              marginTop: 16,
              background: "white",
              color: "#211F1B",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    )}
    </>
  );
}

// Turns labour hours into something a homeowner can actually answer. The
// wording is per-trade because "a big job" means different things to a
// plumber and an HVAC tech.
// Turns labour hours into something a homeowner can actually answer. Returns
// a short label for the header and a longer detail line for under the slider.
// Wording is per-trade because "a big job" means different things to a
// plumber and an HVAC tech.
function jobScope(industryId, q, qRange) {
  const span = Math.max(1, qRange.max - qRange.min);
  const frac = (q - qRange.min) / span;

  const WORDING = {
    plumbing: [
      "a single fixture or a slow drain",
      "a typical repair or fixture swap",
      "multiple fixtures or hard-to-reach pipe",
      "a repipe, water heater, or major leak",
    ],
    hvac: [
      "a tune-up, filter and coil clean",
      "a typical diagnostic and repair",
      "a major component or ductwork",
      "a full system replacement",
    ],
    electrical: [
      "an outlet, switch, or light fixture",
      "a dedicated circuit or ceiling fan",
      "an EV charger or several circuits",
      "a panel upgrade or rewire",
    ],
    mechanics: [
      "fluids, filters, or a quick check",
      "brakes or a common repair",
      "suspension or electrical diagnosis",
      "engine or transmission work",
    ],
    moving: [
      "a studio or just a few items",
      "a one-bedroom",
      "two to three bedrooms",
      "a large home or a long carry",
    ],
  };

  const LABELS = ["Simple", "Standard", "Involved", "Major"];
  const details = WORDING[industryId] || [
    "a small job",
    "a typical job",
    "a larger job",
    "a big job",
  ];

  let i = 3;
  if (frac < 0.2) i = 0;
  else if (frac < 0.45) i = 1;
  else if (frac < 0.7) i = 2;

  return { label: LABELS[i], detail: "Something like " + details[i] };
}

function sizeZone(industryId, q, qRange) {
  if (industryId === "countertops") {
    if (q < 20) return "About a small bathroom vanity";
    if (q < 35) return "About a small kitchen";
    if (q < 55) return "About an average kitchen";
    if (q < 100) return "A large kitchen";
    return "Commercial / multi-room";
  }
  const span = Math.max(1, qRange.max - qRange.min);
  const frac = (q - qRange.min) / span;
  if (frac < 0.2) return "Compact";
  if (frac < 0.45) return "Small";
  if (frac < 0.7) return "Average";
  return "Large";
}

function SectionCard({ step, title, right, capitalizeTitle, children }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "#EDE6D6", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            className="flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ width: 24, height: 24, borderRadius: "50%", background: "#211F1B", color: "#F7F3EA" }}
          >
            {step}
          </span>
          <span className={`text-sm font-semibold ${capitalizeTitle ? "capitalize" : ""}`} style={{ color: "#211F1B" }}>
            {title}
          </span>
        </div>
        {right && (
          <span
            className="text-sm font-mono font-semibold text-right min-w-0"
            style={{ color: "#B08A44" }}
          >
            {right}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

