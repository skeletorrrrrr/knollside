"use client";
import { useEffect, useState } from "react";
import { TIERS } from "@/lib/pricing";

export default function BillingPage() {
  const [business, setBusiness] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setBusiness(d.business));
  }, []);

  async function subscribe(tier) {
    setLoadingTier(tier.id);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: tier.id }),
    });
    const data = await res.json();
    setLoadingTier(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Something went wrong starting checkout.");
  }

  if (!business) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">Billing</h1>
      <p className="text-sm text-[#8A836F] mb-6">
        Current plan: <span className="font-medium capitalize">{business.subscription_tier}</span>{" "}
        <span className="text-xs">({business.subscription_status})</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <div key={tier.id} className="border border-line rounded-xl p-5 bg-white flex flex-col">
            <div className="font-display text-lg font-semibold">{tier.name}</div>
            <div className="text-2xl font-semibold my-1 font-mono">
              ${tier.price}
              <span className="text-sm font-normal text-[#8A836F]">/mo</span>
            </div>
            <p className="text-sm text-[#8A836F] flex-1 mb-4">{tier.blurb}</p>
            <button
              onClick={() => subscribe(tier)}
              disabled={loadingTier === tier.id || business.subscription_tier === tier.id}
              className="text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
            >
              {business.subscription_tier === tier.id
                ? "Current plan"
                : loadingTier === tier.id
                ? "Redirecting…"
                : "Choose plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
