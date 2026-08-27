"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const INPUT =
  "w-full text-sm px-3 py-2.5 rounded-lg border border-line bg-white outline-none focus:ring-2 focus:ring-[#B08A44]/30 focus:border-[#B08A44] transition-shadow";

function itemSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-[#8A836F]">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#A39C8A] mt-1 leading-relaxed">{hint}</span>}
    </label>
  );
}

const FONT_SUGGESTIONS = [
  "Fraunces", "Inter", "Playfair Display", "Manrope", "Archivo",
  "Oswald", "Roboto", "Source Sans 3", "Lora", "Poppins",
  "Work Sans", "Libre Baskerville", "DM Sans", "Bebas Neue",
];

// A datalist filters itself down to whatever is already in the box, so once a
// font was chosen the dropdown only ever offered that one font again and the
// only way out was clearing the field by hand. A real select plus an escape
// hatch keeps the full list one click away and still allows any font.
function FontPicker({ label, hint, value, fallback, onChange }) {
  const known = FONT_SUGGESTIONS.includes(value);
  const [custom, setCustom] = useState(Boolean(value) && !known);
  const chosen = value || fallback;

  return (
    <Field label={label} hint={hint}>
      <select
        value={custom ? "__custom" : value || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom") {
            setCustom(true);
            return;
          }
          setCustom(false);
          onChange(v);
        }}
        className={INPUT + " bg-white"}
      >
        <option value="">{fallback} (default)</option>
        {FONT_SUGGESTIONS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
            {f}
          </option>
        ))}
        <option value="__custom">Something else…</option>
      </select>
      {custom && (
        <input
          type="text"
          autoFocus
          placeholder="Exact name from fonts.google.com"
          value={known ? "" : value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT + " mt-2"}
        />
      )}
      {/* Browsers style <option> inconsistently, so the dropdown showing each
          name in its own font is a bonus rather than something to rely on.
          This line always renders in the chosen font. */}
      <FontPreview name={chosen} />
    </Field>
  );
}

// Loads one family on demand and shows a sample in it. Without this you are
// picking a font by name and finding out what it looks like after saving.
function FontPreview({ name }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const clean = String(name || "").trim();
    if (!clean || !/^[A-Za-z0-9 ]+$/.test(clean)) return;
    const id = "knollside-preview-" + clean.replace(/\s+/g, "-").toLowerCase();
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=" +
        encodeURIComponent(clean).replace(/%20/g, "+") +
        ":wght@400;600&display=swap";
      document.head.appendChild(link);
    }
    // document.fonts.load resolves whether or not the family exists, so a
    // mistyped name just shows the fallback rather than hanging.
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load(`600 20px "${clean}"`)
        .then(() => setReady(true))
        .catch(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [name]);

  if (!name) return null;
  return (
    <p
      className="mt-2 text-xl leading-snug truncate"
      style={{
        fontFamily: `"${name}", Georgia, serif`,
        opacity: ready ? 1 : 0.35,
        transition: "opacity .2s",
      }}
    >
      See your price before you call
    </p>
  );
}

function ColorRow({ label, hint, value, fallback, onChange }) {
  const val = /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : fallback;
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 rounded border border-line bg-white p-0.5 shrink-0"
        aria-label={label}
      />
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-[#8A836F]">{label}</span>
        {hint && <span className="block text-xs text-[#A39C8A]">{hint}</span>}
      </div>
      <input
        type="text"
        value={value || ""}
        placeholder={fallback}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 text-xs font-mono px-2 py-1.5 rounded border border-line shrink-0"
      />
    </div>
  );
}

function Card({ title, on, onToggle, children }) {
  return (
    <div className="border border-line rounded-xl bg-white p-5 mb-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {onToggle && (
          <button
            type="button"
            onClick={() => onToggle(!on)}
            aria-pressed={on}
            className="text-xs font-medium px-3 py-1.5 rounded-md border shrink-0"
            style={{
              borderColor: on ? "#B08A44" : "#DDD3BF",
              background: on ? "#EDE6D6" : "white",
              color: on ? "#211F1B" : "#8A836F",
            }}
          >
            {on ? "On your site" : "Hidden"}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function RowList({ rows, fields, onChange, addLabel }) {
  const set = (i, key, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="border border-line rounded-lg p-3 space-y-2">
          {fields.map((f) =>
            f.textarea ? (
              <textarea
                key={f.key}
                rows={3}
                placeholder={f.placeholder}
                value={row[f.key] || ""}
                onChange={(e) => set(i, f.key, e.target.value)}
                className={INPUT}
              />
            ) : (
              <input
                key={f.key}
                type="text"
                placeholder={f.placeholder}
                value={row[f.key] || ""}
                onChange={(e) => set(i, f.key, e.target.value)}
                className={INPUT}
              />
            )
          )}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="text-xs text-clay"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, {}])}
        className="text-sm font-medium px-3 py-1.5 rounded-md border border-line"
      >
        {addLabel}
      </button>
    </div>
  );
}

export default function WebsitePage() {
  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [c, setC] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/items").then((r) => r.json()).catch(() => ({ items: [] })),
    ])
      .then(([s, it]) => {
        setBusiness(s.business || null);
        setItems(it.items || []);
        setC((s.business && s.business.site_content) || {});
      })
      .catch(() => setError("Couldn't load your site."))
      .finally(() => setLoading(false));
  }, []);

  const isPro = business && business.subscription_tier === "pro";
  const sec = (k) => c[k] || {};
  const patchSec = (k, patch) =>
    setC((prev) => ({ ...prev, [k]: { ...(prev[k] || {}), ...patch } }));

  async function send(payload) {
    const res = await fetch("/api/settings/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "That didn't save.");
    return data.business;
  }

  async function save() {
    setSaving(true);
    setError("");
    setFlash("");
    try {
      const updated = await send({ site_content: c });
      setBusiness(updated);
      setC(updated.site_content || {});
      setFlash("Saved");
      setTimeout(() => setFlash(""), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleLive(next) {
    setError("");
    try {
      const updated = await send({ site_enabled: next });
      setBusiness(updated);
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  if (!isPro) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold mb-2">Your website</h1>
        <p className="text-sm text-[#6B6558] mb-6 leading-relaxed">
          A website with hosting comes with Pro — your own page for every
          {items.length > 0 ? " material" : " service"} you offer, a gallery, and
          your estimator built into it.
        </p>
        <Link
          href="/dashboard/billing"
          className="inline-block text-sm font-medium px-4 py-2.5 rounded-md text-white"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          See Pro
        </Link>
      </div>
    );
  }

  const live = business.site_enabled;
  const url = `/site/${business.slug}`;

  return (
    <div className="max-w-3xl pb-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold">Your website</h1>
          <p className="text-sm text-[#8A836F] mt-1 truncate">
            {live ? (
              <>
                Live at{" "}
                <Link href={url} target="_blank" className="underline">
                  {url}
                </Link>
              </>
            ) : (
              "Not live yet — nobody can see it."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleLive(!live)}
          className="text-sm font-medium px-4 py-2 rounded-md border shrink-0"
          style={{
            borderColor: live ? "#DDD3BF" : "#B08A44",
            background: live ? "white" : "#EDE6D6",
          }}
        >
          {live ? "Take offline" : "Put it live"}
        </button>
      </div>

      {error && <p className="text-sm text-clay mb-4">{error}</p>}

      <Card title="Look">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FontPicker
              label="Heading font"
              hint="Pick one, or choose Something else for any font on Google Fonts."
              value={sec("theme").fontDisplay || ""}
              fallback="Fraunces"
              onChange={(v) => patchSec("theme", { fontDisplay: v })}
            />
            <FontPicker
              label="Body font"
              value={sec("theme").fontBody || ""}
              fallback="Inter"
              onChange={(v) => patchSec("theme", { fontBody: v })}
            />
          </div>

          <div className="space-y-3">
            <ColorRow
              label="Accent"
              hint="Buttons and highlights. Usually your brand colour."
              value={sec("theme").accent}
              fallback="#B08A44"
              onChange={(v) => patchSec("theme", { accent: v })}
            />
            <ColorRow
              label="Background"
              value={sec("theme").bg}
              fallback="#F7F3EA"
              onChange={(v) => patchSec("theme", { bg: v })}
            />
            <ColorRow
              label="Cards"
              value={sec("theme").surface}
              fallback="#FFFFFF"
              onChange={(v) => patchSec("theme", { surface: v })}
            />
            <ColorRow
              label="Headings"
              value={sec("theme").ink}
              fallback="#211F1B"
              onChange={(v) => patchSec("theme", { ink: v })}
            />
            <ColorRow
              label="Body text"
              value={sec("theme").body}
              fallback="#6B6558"
              onChange={(v) => patchSec("theme", { body: v })}
            />
            <ColorRow
              label="Lines and borders"
              value={sec("theme").line}
              fallback="#DDD3BF"
              onChange={(v) => patchSec("theme", { line: v })}
            />
          </div>

          <p className="text-xs text-[#A39C8A] leading-relaxed">
            Save, then open your site to see it. Worth checking your text is
            still easy to read against the background you picked &mdash; pale
            grey on white looks fine on your screen and disappears on a phone
            outdoors.
          </p>
        </div>
      </Card>

      <Card title="Front page">
        <div className="space-y-4">
          <Field
            label="Headline"
            hint="Leave this blank and we use your trade and your town — which is what people actually type into Google."
          >
            <input
              type="text"
              value={sec("hero").headline || ""}
              onChange={(e) => patchSec("hero", { headline: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Opening paragraph">
            <textarea
              rows={3}
              value={sec("hero").sub || ""}
              onChange={(e) => patchSec("hero", { sub: e.target.value })}
              className={INPUT}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Why us"
        on={sec("why").on !== false}
        onToggle={(v) => patchSec("why", { on: v })}
      >
        <div className="space-y-4">
          <Field label="Heading">
            <input
              type="text"
              value={sec("why").headline || ""}
              onChange={(e) => patchSec("why", { headline: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Points">
            <RowList
              rows={sec("why").cards || []}
              fields={[
                { key: "title", placeholder: "Short title" },
                { key: "body", placeholder: "A sentence or two", textarea: true },
              ]}
              onChange={(rows) => patchSec("why", { cards: rows })}
              addLabel="Add a point"
            />
          </Field>
        </div>
      </Card>

      <Card
        title="How a job runs"
        on={sec("process").on !== false}
        onToggle={(v) => patchSec("process", { on: v })}
      >
        <RowList
          rows={sec("process").cards || []}
          fields={[
            { key: "title", placeholder: "Step name" },
            { key: "body", placeholder: "What happens", textarea: true },
          ]}
          onChange={(rows) => patchSec("process", { cards: rows })}
          addLabel="Add a step"
        />
      </Card>

      <Card
        title="Photos"
        on={sec("gallery").on === true}
        onToggle={(v) => patchSec("gallery", { on: v })}
      >
        <Field
          label="Image links"
          hint="One web address per line, starting with https. Uploading straight from your phone is coming."
        >
          <textarea
            rows={5}
            value={(sec("gallery").photos || []).join("\n")}
            onChange={(e) =>
              patchSec("gallery", {
                photos: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            className={INPUT + " font-mono text-xs"}
          />
        </Field>
      </Card>

      <Card
        title="Reviews"
        on={sec("reviews").on === true}
        onToggle={(v) => patchSec("reviews", { on: v })}
      >
        <p className="text-xs text-[#A39C8A] mb-3 leading-relaxed">
          Real ones only — reviews a customer actually gave you. Inventing
          testimonials for a business site is against the law in the US, and it
          is the sort of thing competitors notice.
        </p>
        <RowList
          rows={sec("reviews").quotes || []}
          fields={[
            { key: "quote", placeholder: "What they said", textarea: true },
            { key: "name", placeholder: "Their name" },
            { key: "source", placeholder: "Where from — Google, Yelp…" },
          ]}
          onChange={(rows) => patchSec("reviews", { quotes: rows })}
          addLabel="Add a review"
        />
      </Card>

      <Card
        title="Areas you cover"
        on={sec("areas").on === true}
        onToggle={(v) => patchSec("areas", { on: v })}
      >
        <Field
          label="Towns"
          hint="One per line. The first one goes into your page titles — that's how someone searching your trade in their town finds you."
        >
          <textarea
            rows={4}
            value={(sec("areas").places || []).join("\n")}
            onChange={(e) =>
              patchSec("areas", {
                places: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            className={INPUT}
          />
        </Field>
      </Card>

      <Card title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input
              type="tel"
              value={sec("contact").phone || ""}
              onChange={(e) => patchSec("contact", { phone: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={sec("contact").email || ""}
              onChange={(e) => patchSec("contact", { email: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Address">
            <textarea
              rows={3}
              value={sec("contact").address || ""}
              onChange={(e) => patchSec("contact", { address: e.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label="Hours">
            <textarea
              rows={3}
              value={sec("contact").hours || ""}
              onChange={(e) => patchSec("contact", { hours: e.target.value })}
              className={INPUT}
            />
          </Field>
        </div>
      </Card>

      {items.length > 0 && (
        <Card title="Your material pages">
          <p className="text-xs text-[#A39C8A] mb-4 leading-relaxed">
            Each one already has its own page carrying your price. Write a
            paragraph on the ones you want found in search — a page with real
            words on it can rank, an empty one can&rsquo;t.
          </p>
          <div className="space-y-4">
            {items.map((it) => {
              const slug = itemSlug(it.name);
              const m = (c.materials || {})[slug] || {};
              return (
                <div key={it.id} className="border border-line rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-sm font-medium truncate">{it.name}</span>
                    {live && (
                      <Link
                        href={`${url}/materials/${slug}`}
                        target="_blank"
                        className="text-xs underline text-[#8A836F] shrink-0"
                      >
                        View
                      </Link>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder={`What's ${it.name.toLowerCase()} good for? Why do you like working with it?`}
                    value={m.body || ""}
                    onChange={(e) =>
                      setC((prev) => ({
                        ...prev,
                        materials: {
                          ...(prev.materials || {}),
                          [slug]: { ...m, body: e.target.value },
                        },
                      }))
                    }
                    className={INPUT}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Sticky rather than parked at the bottom of a long form — otherwise you
          scroll back up, lose your place, and never know whether it saved. */}
      <div className="sticky bottom-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="text-sm font-medium px-5 py-2.5 rounded-md text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {flash && <span className="text-sm text-[#6B6558]">{flash}</span>}
      </div>
    </div>
  );
}
