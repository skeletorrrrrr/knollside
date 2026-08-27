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
