"use client";

import { useState } from "react";
import Link from "next/link";
import { TIERS } from "@/lib/pricing";

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Pricing</h2>
          <p className="text-sm text-[#8A836F] mt-1">
            Free for a month. No card required to start.
          </p>
        </div>

        {/* Monthly / Yearly switch */}
        <div
          className="inline-flex items-center rounded-lg p-1 self-start"
          style={{ background: "#EFE9DA" }}
          role="group"
          aria-label="Billing period"
        >
          <button
            type="button"
            onClick={() => setYearly(false)}
            aria-pressed={!yearly}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={
              !yearly
                ? { background: "#FFFFFF", color: "#211F1B", boxShadow: "0 1px 2px rgba(33,31,27,0.10)" }
                : { background: "transparent", color: "#6B6558" }
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            aria-pressed={yearly}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
            style={
              yearly
                ? { background: "#FFFFFF", color: "#211F1B", boxShadow: "0 1px 2px rgba(33,31,27,0.10)" }
                : { background: "transparent", color: "#6B6558" }
            }
          >
            Yearly
            <span
              className="text-[10px] font-semibold tracking-wide uppercase rounded px-1.5 py-0.5"
              style={{ background: "#E4EDE3", color: "#3F5C46" }}
            >
              2 months free
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const monthlyTotal = tier.price * 12;
          const saves = monthlyTotal - tier.annual;
          const pct = Math.round((saves / monthlyTotal) * 100);
          const effective = (tier.annual / 12).toFixed(2).replace(/\.00$/, "");

          return (
            <div
              key={tier.id}
              className="border border-line rounded-xl p-5 bg-white flex flex-col"
            >
              <div className="font-display text-lg font-semibold">{tier.name}</div>

              {yearly ? (
                <>
                  <div className="text-2xl font-semibold mt-1 font-mono">
                    ${tier.annual.toLocaleString()}
                    <span className="text-sm font-normal text-[#8A836F]">/yr</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
                    <span className="text-xs text-[#8A836F] font-mono">
                      ${effective}/mo effective
                    </span>
                    <span
                      className="text-[11px] font-semibold rounded px-1.5 py-0.5"
                      style={{ background: "#E4EDE3", color: "#3F5C46" }}
                    >
                      Save ${saves.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-semibold mt-1 font-mono">
                    ${tier.price}
                    <span className="text-sm font-normal text-[#8A836F]">/mo</span>
                  </div>
                  <div className="text-xs text-[#8A836F] mt-1 mb-2 font-mono">
                    ${tier.annual.toLocaleString()}/yr if paid yearly
                  </div>
                </>
              )}

              <p className="text-sm text-[#8A836F]">{tier.blurb}</p>

              {tier.id === "starter" && yearly && (
                <p className="text-xs text-[#6B6558] mt-2">
                  One job typically covers the whole year.
                </p>
              )}

              <Link
                href="/signup"
                className="mt-4 inline-block text-center px-4 py-2 rounded-md text-sm font-medium border border-line hover:border-[#B08A44] transition-colors"
              >
                Start free
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
