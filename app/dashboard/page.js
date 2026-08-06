"use client";
import { useEffect, useState } from "react";
import NumberInput from "@/components/NumberInput";
import PhotoUpload from "@/components/PhotoUpload";
import { getIndustry } from "@/lib/industries";

async function api(path, options) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

const QTY_TYPES = [
  { id: "area", label: "Area (sq ft, etc.)" },
  { id: "hours", label: "Labor hours" },
  { id: "count", label: "Count (visits, units)" },
  { id: "none", label: "Flat rate (no quantity)" },
];

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [addons, setAddons] = useState([]);
  const [business, setBusiness] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [savedFlash, setSavedFlash] = useState("");
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    (async () => {
      const [it, op, a, s] = await Promise.all([
        api("/api/items"),
        api("/api/options"),
        api("/api/addons"),
        api("/api/settings"),
      ]);
      setItems(it.items);
      setOptions(op.options);
      setAddons(a.addons);
      setBusiness(s.business);
      setLoading(false);
    })();
  }, []);

  function flash(msg) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(""), 1500);
  }

  // ---- items ----
  async function addItem() {
    const { item } = await api("/api/items", {
      method: "POST",
      body: JSON.stringify({ name: "New item", base_price: 50, sort_order: items.length }),
    });
    setItems((xs) => [...xs, item]);
  }
  async function patchItem(id, patch) {
    const { item } = await api(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setItems((xs) => xs.map((m) => (m.id === id ? item : m)));
    flash("Saved");
  }
  async function deleteItem(id) {
    await api(`/api/items/${id}`, { method: "DELETE" });
    setItems((xs) => xs.filter((m) => m.id !== id));
    setConfirmDelete(null);
  }

  // ---- options ----
  async function addOption() {
    const { option } = await api("/api/options", {
      method: "POST",
      body: JSON.stringify({ name: "New option", upcharge: 0, sort_order: options.length }),
    });
    setOptions((xs) => [...xs, option]);
  }
  async function patchOption(id, patch) {
    const { option } = await api(`/api/options/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setOptions((xs) => xs.map((e) => (e.id === id ? option : e)));
    flash("Saved");
  }
  async function deleteOption(id) {
    await api(`/api/options/${id}`, { method: "DELETE" });
    setOptions((xs) => xs.filter((e) => e.id !== id));
    setConfirmDelete(null);
  }

  // ---- addons ----
  async function addAddon() {
    const { addon } = await api("/api/addons", {
      method: "POST",
      body: JSON.stringify({ name: "New add-on", price: 25, billing_type: "flat", sort_order: addons.length }),
    });
    setAddons((as) => [...as, addon]);
  }
  async function patchAddon(id, patch) {
    const { addon } = await api(`/api/addons/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setAddons((as) => as.map((a) => (a.id === id ? addon : a)));
    flash("Saved");
  }
  async function deleteAddon(id) {
    await api(`/api/addons/${id}`, { method: "DELETE" });
    setAddons((as) => as.filter((a) => a.id !== id));
    setConfirmDelete(null);
  }

  // ---- business settings ----
  async function patchBusiness(patch) {
    try {
      const { business: updated } = await api("/api/settings", { method: "PATCH", body: JSON.stringify(patch) });
      setBusiness(updated);
      flash("Saved");
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  const industry = getIndustry(business.industry);
  const terms = industry.terms;
  const showQty = (business.quantity_type || "area") !== "none";

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${siteUrl}/embed/${business.slug}`;
  const embedSnippet = `<iframe src="${embedUrl}" style="width:100%;height:800px;border:0;" title="Get an instant estimate"></iframe>`;

  const STEPS = [
    { label: "Business" },
    { label: "Products" },
    { label: "Pricing" },
    { label: "Publish" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {savedFlash && (
        <div className="fixed top-4 right-4 text-xs font-medium px-3 py-1.5 rounded-md text-white bg-[#4B6A52] shadow-md z-50">
          {savedFlash}
        </div>
      )}

      <p className="text-sm text-[#8A836F]">
        Your estimator is set up for <span className="font-medium">{industry.label}</span>.
        Everything below is editable — rename, reprice, add, or remove anything to match how you actually quote.
      </p>

      {/* Progress bar */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < wizardStep;
          const current = i === wizardStep;
          return (
            <div key={s.label} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
              <button
                onClick={() => setWizardStep(i)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <span
                  className="flex items-center justify-center rounded-full text-xs font-bold transition-all duration-150"
                  style={{
                    width: 30,
                    height: 30,
                    background: done ? "#B08A44" : current ? "#211F1B" : "#EDE6D6",
                    color: done || current ? "#fff" : "#A39C8A",
                    boxShadow: current ? "0 0 0 4px rgba(176,138,68,0.18)" : "none",
                  }}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap hidden sm:block"
                  style={{ color: current ? "#211F1B" : "#A39C8A" }}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 mx-1.5"
                  style={{ height: 2, background: done ? "#B08A44" : "#EDE6D6", marginBottom: "18px" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Business */}
      {wizardStep === 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-1">Tell us about your business</h2>
          <p className="text-sm text-[#8A836F] mb-4">This shows up right at the top of your estimator.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <Field label="Business name">
              <input
                defaultValue={business.name}
                onBlur={(e) => e.target.value.trim() && patchBusiness({ name: e.target.value.trim() })}
                className="w-full px-3 py-2 rounded-md border border-line text-sm"
              />
            </Field>
            <Field label="Embed URL slug">
              <input
                defaultValue={business.slug}
                onBlur={(e) => e.target.value.trim() && patchBusiness({ slug: e.target.value.trim() })}
                className="w-full px-3 py-2 rounded-md border border-line text-sm font-mono"
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Logo (shown on your estimator)">
              <PhotoUpload
                pathPrefix="logos"
                photoUrl={business.logo_url}
                label="Drag logo or click to upload"
                onUploaded={(url) => patchBusiness({ logo_url: url })}
                onRemoved={() => patchBusiness({ logo_url: null })}
              />
            </Field>
          </div>
        </section>
      )}

      {/* Step 2: Products */}
      {wizardStep === 1 && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg font-semibold capitalize">{terms.items} &amp; {terms.itemPrice}</h2>
            <button onClick={addItem} className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-stone-dim capitalize">
              + Add {terms.item}
            </button>
          </div>
          <p className="text-sm text-[#8A836F] mb-4">What you offer, and what each one starts at.</p>
          <div className="space-y-2">
            {items.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl border border-line bg-white">
                <input
                  defaultValue={m.name}
                  onBlur={(e) => e.target.value.trim() && patchItem(m.id, { name: e.target.value.trim() })}
                  className="flex-1 text-sm px-2.5 py-2 rounded-md border border-line"
                  style={{ minWidth: "7rem" }}
                />
                <NumberInput
                  value={m.base_price}
                  onCommit={(v) => patchItem(m.id, { base_price: v })}
                  prefix="$"
                  className="w-28"
                />
                <PhotoUpload
                  itemId={m.id}
                  photoUrl={m.photo_url}
                  onUploaded={(url) => patchItem(m.id, { photo_url: url })}
                  onRemoved={() => patchItem(m.id, { photo_url: null })}
                />
                <DeleteButton
                  id={`item:${m.id}`}
                  confirmDelete={confirmDelete}
                  setConfirmDelete={setConfirmDelete}
                  onConfirm={() => deleteItem(m.id)}
                  disabled={items.length <= 1}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 3: Pricing (options, add-ons, estimate settings) */}
      {wizardStep === 2 && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-semibold capitalize">{terms.options}</h2>
              <button onClick={addOption} className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-stone-dim capitalize">
                + Add {terms.option}
              </button>
            </div>
            <p className="text-sm text-[#8A836F] mb-4">Optional upgrades customers can pick between.</p>
            <div className="space-y-2">
              {options.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl border border-line bg-white">
                  <input
                    defaultValue={e.name}
                    onBlur={(ev) => ev.target.value.trim() && patchOption(e.id, { name: ev.target.value.trim() })}
                    className="flex-1 text-sm px-2.5 py-2 rounded-md border border-line"
                    style={{ minWidth: "7rem" }}
                  />
                  <NumberInput
                    value={e.upcharge}
                    onCommit={(v) => patchOption(e.id, { upcharge: v })}
                    prefix="$"
                    className="w-28"
                  />
                  <DeleteButton
                    id={`option:${e.id}`}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    onConfirm={() => deleteOption(e.id)}
                    disabled={options.length <= 1}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-semibold">Add-ons</h2>
              <button onClick={addAddon} className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-stone-dim">
                + Add add-on
              </button>
            </div>
            <p className="text-sm text-[#8A836F] mb-4">Extras customers can check off — sink cutouts, demo, that kind of thing.</p>
            <div className="space-y-2">
              {addons.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl border border-line bg-white">
                  <input
                    defaultValue={a.name}
                    onBlur={(e) => e.target.value.trim() && patchAddon(a.id, { name: e.target.value.trim() })}
                    className="flex-1 text-sm px-2.5 py-2 rounded-md border border-line"
                    style={{ minWidth: "7rem" }}
                  />
                  <NumberInput value={a.price} onCommit={(v) => patchAddon(a.id, { price: v })} prefix="$" className="w-24" />
                  <div className="flex rounded-md border border-line overflow-hidden text-xs shrink-0">
                    <button
                      onClick={() => patchAddon(a.id, { billing_type: "flat" })}
                      className="px-2.5 py-2 font-medium"
                      style={{ background: a.billing_type === "flat" ? "#EDE6D6" : "white" }}
                    >
                      Flat fee
                    </button>
                    <button
                      onClick={() => patchAddon(a.id, { billing_type: "unit" })}
                      className="px-2.5 py-2 font-medium border-l border-line"
                      style={{ background: a.billing_type === "unit" ? "#EDE6D6" : "white" }}
                    >
                      Per unit
                    </button>
                  </div>
                  {a.billing_type === "unit" && (
                    <input
                      defaultValue={a.unit_label || ""}
                      placeholder="unit, e.g. each"
                      onBlur={(e) => patchAddon(a.id, { unit_label: e.target.value })}
                      className="w-28 text-xs px-2.5 py-2 rounded-md border border-line"
                    />
                  )}
                  <DeleteButton
                    id={`addon:${a.id}`}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    onConfirm={() => deleteAddon(a.id)}
                    className="ml-auto"
                  />
                </div>
              ))}
              {addons.length === 0 && (
                <p className="text-sm p-4 rounded-xl border border-dashed border-line text-[#A39C8A]">
                  No add-ons yet.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-1">How you price the job</h2>
            <p className="text-sm text-[#8A836F] mb-4">These numbers, plus your materials and options above, are the whole formula behind every quote.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mb-3">
              <Field label="What does the customer enter?">
                <select
                  value={business.quantity_type}
                  onChange={(e) => patchBusiness({ quantity_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-line text-sm bg-white"
                >
                  {QTY_TYPES.map((q) => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {showQty && (
                <Field label={terms.laborLabel}>
                  <NumberInput value={business.labor_rate} onCommit={(v) => patchBusiness({ labor_rate: v })} prefix="$" />
                </Field>
              )}
              <Field label="Minimum job">
                <NumberInput value={business.min_price} onCommit={(v) => patchBusiness({ min_price: v })} prefix="$" />
              </Field>
              <Field label="Estimate range ±">
                <NumberInput value={business.spread_pct} onCommit={(v) => patchBusiness({ spread_pct: v })} suffix="%" />
              </Field>
            </div>
            {!showQty && (
              <p className="text-xs text-[#A39C8A] mt-2">
                Flat-rate mode: the price is just your item + options + add-ons, with no quantity multiplier.
              </p>
            )}
          </section>
        </div>
      )}

      {/* Step 4: Publish (includes lead form preview) */}
      {wizardStep === 3 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-1">You're all set</h2>
          <p className="text-sm text-[#8A836F] mb-4">
            Your estimator has been live this whole time — every change you made saved instantly. Here's how to put it on your website.
          </p>
          <textarea
            readOnly
            value={embedSnippet}
            className="w-full text-xs font-mono p-3 rounded-md border border-line bg-white"
            rows={2}
            onClick={(e) => e.target.select()}
          />
          <p className="text-xs text-[#A39C8A] mt-1">
            Live page: <a className="underline" href={embedUrl} target="_blank" rel="noreferrer">{embedUrl}</a>
          </p>

          <div className="mt-8 pt-6 border-t border-line max-w-sm">
            <h3 className="text-sm font-semibold mb-1">What customers send you</h3>
            <p className="text-xs text-[#8A836F] mb-3">
              After seeing their price, this is the form they fill out to reach you. Fixed for now — custom fields are on the roadmap.
            </p>
            <div className="p-3 rounded-xl border border-line bg-white space-y-2 opacity-80">
              <input disabled placeholder="Full name" className="w-full text-xs px-2.5 py-1.5 rounded-md border border-line bg-stone-dim" />
              <input disabled placeholder="Email" className="w-full text-xs px-2.5 py-1.5 rounded-md border border-line bg-stone-dim" />
              <input disabled placeholder="Phone (optional)" className="w-full text-xs px-2.5 py-1.5 rounded-md border border-line bg-stone-dim" />
              <div className="w-full text-xs font-medium px-3 py-1.5 rounded-md text-white text-center" style={{ background: "#211F1B" }}>
                Send my estimate
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Wizard navigation */}
      <div className="flex items-center justify-between pt-2 max-w-md">
        <button
          onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
          disabled={wizardStep === 0}
          className="text-sm font-medium px-4 py-2 rounded-md disabled:opacity-0"
          style={{ color: "#8A836F" }}
        >
          ← Back
        </button>
        {wizardStep < STEPS.length - 1 ? (
          <button
            onClick={() => setWizardStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="text-sm font-medium px-5 py-2.5 rounded-md text-white"
            style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
          >
            Next →
          </button>
        ) : (
          <span className="text-sm font-medium" style={{ color: "#4B6A52" }}>✓ You're live</span>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-[#8A836F]">{label}</span>
      {children}
    </label>
  );
}

function DeleteButton({ id, confirmDelete, setConfirmDelete, onConfirm, disabled, className = "" }) {
  if (disabled) {
    return (
      <span className={`shrink-0 p-1.5 opacity-30 text-clay ${className}`} title="At least one is required">
        🗑
      </span>
    );
  }
  if (confirmDelete === id) {
    return (
      <div className={`flex items-center gap-1 shrink-0 ${className}`}>
        <button onClick={onConfirm} className="px-2 py-1.5 rounded-md text-xs text-white bg-clay">
          Confirm
        </button>
        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1.5 rounded-md text-xs text-[#8A836F]">
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirmDelete(id)} className={`shrink-0 p-1.5 rounded-md text-clay ${className}`}>
      🗑
    </button>
  );
}
