import Link from "next/link";
import { TIERS } from "@/lib/pricing";

export default function LandingPage() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-16">
      <style>{`
        .knollside-demo-frame { width: 100%; border: 0; display: block; height: 700px; }
        @media (max-width: 767px) {
          .knollside-demo-frame { height: 1150px; }
        }
      `}</style>
      <span className="text-xs font-semibold tracking-widest uppercase text-brass-deep">
        Knollside
      </span>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2 mb-4">
        Stop losing customers to a phone call.
      </h1>
      <p className="text-lg text-[#6B6558] mb-8 max-w-xl">
        Give customers an instant price the moment they land on your site.
        Whatever you sell — countertops, repairs, cleaning, lawn care — set up
        your pricing once and the widget does the math for every visitor.
      </p>
      <div className="flex flex-wrap gap-3 mb-20">
        <Link
          href="/signup"
          className="px-5 py-3 rounded-md text-sm font-medium text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          Start free trial
        </Link>
        <a
          href="#live-demo"
          className="px-5 py-3 rounded-md text-sm font-medium border border-line"
        >
          See live demo ↓
        </a>
        <Link
          href="/login"
          className="px-5 py-3 rounded-md text-sm font-medium text-[#6B6558]"
        >
          Log in
        </Link>
      </div>

      <div id="live-demo" className="mb-20 scroll-mt-8">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: 7, height: 7, background: "#4B6A52" }}
          />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8F6E32" }}>
            Live demo — try it yourself
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold mb-1">This is a real, working estimator.</h2>
        <p className="text-sm text-[#8A836F] mb-5 max-w-xl">
          Not a screenshot — pick a material, drag the slider, check a box. Every
          business on Knollside gets one of these, customized to what they sell.
        </p>
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "#EDE6D6", boxShadow: "0 12px 40px rgba(33,31,27,0.08)" }}
        >
          <iframe
            src="/embed/demo"
            className="knollside-demo-frame"
            title="Live Knollside demo estimator"
            loading="lazy"
          />
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold mb-4">Pricing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <div key={tier.id} className="border border-line rounded-xl p-5 bg-white">
            <div className="font-display text-lg font-semibold">{tier.name}</div>
            <div className="text-2xl font-semibold my-1 font-mono">${tier.price}<span className="text-sm font-normal text-[#8A836F]">/mo</span></div>
            <p className="text-sm text-[#8A836F]">{tier.blurb}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
