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

  // A business only has a "current plan" once they've actually subscribed.
  const hasPlan = !!business.subscription_tier;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">Billing</h1>
      {hasPlan ? (
        <p className="text-sm text-[#8A836F] mb-2">
          Current plan: <span className="font-medium capitalize">{business.subscription_tier}</span>{" "}
          <span className="text-xs">({business.subscription_status})</span>
        </p>
      ) : (
        <p className="text-sm text-[#8A836F] mb-2">
          You're on a free trial — choose a plan to keep your estimator live after it ends.
        </p>
      )}
      <p className="text-xs text-[#A39C8A] mb-6">Every plan starts with a 14-day free trial. Cancel anytime.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = business.subscription_tier === tier.id;
          return (
            <div key={tier.id} className="border border-line rounded-xl p-5 bg-white flex flex-col">
              <div className="font-display text-lg font-semibold">{tier.name}</div>
              <div className="text-2xl font-semibold my-1 font-mono">
                ${tier.price}
                <span className="text-sm font-normal text-[#8A836F]">/mo</span>
              </div>
              <p className="text-sm text-[#8A836F] flex-1 mb-4">{tier.blurb}</p>
              <button
                onClick={() => subscribe(tier)}
                disabled={loadingTier === tier.id || isCurrent}
                className="text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
              >
                {isCurrent
                  ? "Current plan"
                  : loadingTier === tier.id
                  ? "Redirecting…"
                  : "Start 14-day trial"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
