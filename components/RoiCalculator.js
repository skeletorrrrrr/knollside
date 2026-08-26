"use client";
import { useState } from "react";
import Link from "next/link";

const PERIODS = [
  { id: "1", label: "1 month", months: 1 },
  { id: "6", label: "6 months", months: 6 },
  { id: "12", label: "1 year", months: 12 },
];

function money(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function RoiCalculator({ starterPrice = 39 }) {
  // Every number here comes from the visitor. Nothing is a claim about what
  // Knollside does to conversion — we have no data for that yet, and a made-up
  // uplift figure is the fastest way to lose a reader who quotes for a living.
  const [jobValue, setJobValue] = useState(3500);
  const [leads, setLeads] = useState(8);
  const [closeRate, setCloseRate] = useState(30);

  const [period, setPeriod] = useState("1");
  const months = PERIODS.find((p) => p.id === period).months;

  const jobsPerMonth = leads * (closeRate / 100);
  const monthlyRevenue = jobsPerMonth * jobValue;
  const total = monthlyRevenue * months;

  // The comparison that makes waiting the expensive option rather than the
  // safe one. Stated against their own number, not ours.
  const jobsToCoverPlan = jobValue > 0 ? starterPrice / jobValue : 0;

  return (
    <div className="rounded-xl border border-line bg-white p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-10 items-start">
        {/* ---- inputs ---- */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="roi-job-value"
              className="block text-sm font-medium mb-2"
            >
              What&rsquo;s an average job worth to you?
            </label>
            <div className="relative max-w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A836F] text-sm">
                $
              </span>
              <input
                id="roi-job-value"
                type="number"
                min="0"
                step="100"
                inputMode="numeric"
                value={jobValue}
                onChange={(e) =>
                  setJobValue(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full text-sm pl-7 pr-3 py-2.5 rounded-lg border border-line bg-white outline-none focus:ring-2 focus:ring-[#B08A44]/30 focus:border-[#B08A44] transition-shadow"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="roi-leads" className="text-sm font-medium">
                Extra quotes an instant estimator might bring in each month
              </label>
              <span className="font-mono text-sm text-[#8F6E32] tabular-nums">
                {leads}
              </span>
            </div>
            <input
              id="roi-leads"
              type="range"
              min="1"
              max="50"
              step="1"
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
              className="w-full accent-[#B08A44]"
            />
            <div className="flex justify-between text-xs text-[#A39C8A] mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="roi-close" className="text-sm font-medium">
                How many of those do you usually win?
              </label>
              <span className="font-mono text-sm text-[#8F6E32] tabular-nums">
                {closeRate}%
              </span>
            </div>
            <input
              id="roi-close"
              type="range"
              min="5"
              max="100"
              step="5"
              value={closeRate}
              onChange={(e) => setCloseRate(Number(e.target.value))}
              className="w-full accent-[#B08A44]"
            />
            <div className="flex justify-between text-xs text-[#A39C8A] mt-1">
              <span>5%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex gap-1.5 pt-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                aria-pressed={period === p.id}
                className="text-xs font-medium px-3.5 py-2 rounded-md border transition-colors"
                style={{
                  borderColor: period === p.id ? "#B08A44" : "#DDD3BF",
                  background: period === p.id ? "#EDE6D6" : "white",
                  color: period === p.id ? "#211F1B" : "#6B6558",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- result ---- */}
        <div
          className="rounded-xl p-6 md:sticky md:top-6"
          style={{ background: "#211F1B" }}
        >
          <p
            className="font-mono text-[11px] uppercase tracking-[0.14em] mb-2"
            style={{ color: "#BDB49F" }}
          >
            Over {PERIODS.find((p) => p.id === period).label}
          </p>
          <div
            className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-none tabular-nums"
            style={{ color: "#F7F3EA" }}
          >
            {money(total)}
          </div>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "#BDB49F" }}>
            {jobsPerMonth < 1
              ? "Less than one extra job a month, at the numbers you picked."
              : `That's about ${Number(jobsPerMonth.toFixed(1))} extra ${
                  jobsPerMonth < 2 ? "job" : "jobs"
                } a month at ${money(jobValue)} each.`}
          </p>
          <Link
            href="/signup"
            className="block text-center mt-5 text-sm font-medium px-4 py-2.5 rounded-md"
            style={{ background: "#F7F3EA", color: "#211F1B" }}
          >
            Set yours up free &rarr;
          </Link>
        </div>
      </div>

      {/* ---- cost of doing nothing ---- */}
      <p className="text-sm text-[#6B6558] mt-7 pt-6 border-t border-line max-w-3xl leading-relaxed">
        {jobValue >= starterPrice ? (
          <>
            Starter is <strong>${starterPrice} a month</strong>. At{" "}
            {money(jobValue)} a job, it pays for itself the first time it catches
            one you&rsquo;d otherwise have missed &mdash;{" "}
            {jobsToCoverPlan < 0.05
              ? "a rounding error against a single job."
              : `about ${(jobsToCoverPlan * 100).toFixed(0)}% of one.`}{" "}
            Every quote after that is the upside.
          </>
        ) : (
          <>
            Starter is <strong>${starterPrice} a month</strong>. Worth checking
            it against what one extra job is worth to you.
          </>
        )}
      </p>

      <p className="text-xs text-[#A39C8A] mt-3 max-w-3xl">
        Every number here is yours &mdash; we don&rsquo;t assume an instant quote
        wins you more work. Move the sliders to whatever you think is realistic
        and the maths just follows.
      </p>
    </div>
  );
}
