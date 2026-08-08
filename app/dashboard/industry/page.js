"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRY_LIST, getIndustry } from "@/lib/industries";

export default function IndustryPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(null);
  const [picked, setPicked] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.business) {
          setCurrent(d.business.industry);
          setPicked(d.business.industry);
        }
      })
      .catch(() => setError("Couldn't load your business. Reload the page."));
  }, []);

  const changed = picked && current && picked !== current;
  const target = picked ? getIndustry(picked) : null;

  async function handleSwitch() {
    setSaving(true);
    setError("");
    setDone("");
    try {
      const res = await fetch("/api/settings/industry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: picked }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't switch industry. Try again.");
        setSaving(false);
        return;
      }
      setCurrent(data.business.industry);
      setConfirming(false);
      setSaving(false);
      setDone(`Switched to ${getIndustry(data.business.industry).label}.`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setSaving(false);
    }
  }

  if (!current) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-sm text-[#8A836F]">Loading…</p>
        {error && <p className="text-sm text-clay mt-2">{error}</p>}
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">Industry</h1>
      <p className="text-sm text-[#8A836F] mb-8">
        Picked the wrong trade when you signed up? Change it here instead of
        starting a new account.
      </p>

      <div className="border border-line rounded-xl p-5 bg-white">
        <div className="text-xs font-semibold tracking-widest uppercase text-brass-deep mb-1">
          Currently
        </div>
        <div className="font-display text-lg font-semibold mb-5">
          {getIndustry(current).label}
        </div>

        <label className="block text-xs font-medium mb-1.5 text-[#8A836F]">
          Switch to
        </label>
        <select
          value={picked}
          onChange={(e) => {
            setPicked(e.target.value);
            setConfirming(false);
            setDone("");
            setError("");
          }}
          className="w-full text-sm px-3 py-2.5 rounded-md border border-line bg-white"
        >
          {INDUSTRY_LIST.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>

        {changed && target && (
          <div
            className="mt-5 rounded-lg p-4"
            style={{ background: "#FBF3F1", border: "1px solid #E6C9C2" }}
          >
            <div className="text-sm font-semibold mb-2" style={{ color: "#C0483B" }}>
              This replaces your pricing
            </div>
            <p className="text-sm text-[#6B6558] mb-3">
              Every {getIndustry(current).terms.item}, {getIndustry(current).terms.option},
              and add-on you have now will be deleted and replaced with the
              starter set for {target.label}. Your estimator will measure in{" "}
              <span className="font-mono text-xs">{target.terms.quantityUnit || "no units"}</span>{" "}
              instead. This can&rsquo;t be undone.
            </p>
            <p className="text-sm text-[#6B6558] mb-4">
              Your leads are safe — they keep a record of what was quoted at the
              time, so nothing you&rsquo;ve already captured is lost.
            </p>

            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-sm font-medium px-4 py-2 rounded-md text-white"
                style={{ background: "#C0483B" }}
              >
                Switch to {target.label}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#211F1B]">
                  Sure? Your current pricing is deleted.
                </span>
                <button
                  type="button"
                  onClick={handleSwitch}
                  disabled={saving}
                  className="text-sm font-medium px-4 py-2 rounded-md text-white"
                  style={{ background: "#C0483B" }}
                >
                  {saving ? "Switching…" : "Yes, replace it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-sm font-medium px-3 py-2 rounded-md text-[#8A836F]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-clay mt-4">{error}</p>}
        {done && (
          <p className="text-sm mt-4" style={{ color: "#4B6A52" }}>
            {done} Head to Setup to edit your new pricing.
          </p>
        )}
      </div>
    </main>
  );
}
