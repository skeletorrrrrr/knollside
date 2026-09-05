"use client";
import { useState } from "react";

const DEMOS = [
  { slug: "demo", label: "Countertops", blurb: "Pick a material, drag the slider, get a price." },
  { slug: "demo-autoglass", label: "Auto glass", blurb: "Pick a service and vehicle size, get a price." },
  { slug: "demo-roofing", label: "Roofing", blurb: "Pick a material and roof size, get a price." },
  { slug: "demo-plumbing", label: "Plumbing", blurb: "Pick a job and how urgent it is, get a price." },
  { slug: "demo-hvac", label: "HVAC", blurb: "Pick a service and system, get a price." },
  { slug: "demo-electrical", label: "Electrical", blurb: "Pick a job and how long it takes, get a price." },
];

export default function DemoSwitcher() {
  const [active, setActive] = useState(DEMOS[0]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block rounded-full flex-shrink-0"
          style={{ width: 7, height: 7, background: "#4B6A52" }} />
        <span className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#8F6E32" }}>
          Live demo, try it yourself
        </span>
      </div>

      <p className="text-sm text-[#8A836F] mb-3">
        Not a screenshot. {active.blurb}
      </p>

      <label className="flex flex-col gap-1.5 mb-4 max-w-xs">
        <span className="text-xs font-medium text-[#6B6558]">
          See the demo for your trade
        </span>
        <div className="relative">
          <select
            value={active.slug}
            onChange={(e) =>
              setActive(DEMOS.find((d) => d.slug === e.target.value) || DEMOS[0])
            }
            className="w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-9 text-sm font-medium cursor-pointer"
            style={{ borderColor: "#DED6C4", color: "#211F1B" }}
          >
            {DEMOS.map((d) => (
              <option key={d.slug} value={d.slug}>{d.label}</option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A836F]"
          >
            &#9662;
          </span>
        </div>
      </label>

      <div id="live-demo"
        className="rounded-2xl overflow-hidden border scroll-mt-8"
        style={{ borderColor: "#EDE6D6", boxShadow: "0 12px 40px rgba(33,31,27,0.08)" }}>
        <iframe
          key={active.slug}
          src={`/embed/${active.slug}`}
          className="knollside-demo-frame"
          title={`Live Knollside ${active.label} demo`}
        />
      </div>
    </div>
  );
}
