"use client";
import { useState } from "react";

const DEMOS = [
  { slug: "demo", label: "Countertops", blurb: "Pick a material, drag the slider, get a price." },
  { slug: "demo-autoglass", label: "Auto glass", blurb: "Pick a service and vehicle size, get a price." },
  { slug: "demo-roofing", label: "Roofing", blurb: "Pick a material and roof size, get a price." },
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
          Live demo &mdash; try it yourself
        </span>
      </div>

      <p className="text-sm text-[#8A836F] mb-3">
        Not a screenshot. {active.blurb}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {DEMOS.map((d) => {
          const on = d.slug === active.slug;
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => setActive(d)}
              aria-pressed={on}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                background: on ? "#211F1B" : "transparent",
                color: on ? "#F7F3EA" : "#6B6558",
                borderColor: on ? "#211F1B" : "#DED6C4",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

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
