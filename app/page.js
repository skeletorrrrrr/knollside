import Link from "next/link";
import { TIERS } from "@/lib/pricing";

export default function LandingPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
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
      <div className="flex gap-3 mb-16">
        <Link
          href="/signup"
          className="px-5 py-3 rounded-md text-sm font-medium text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          Start free trial
        </Link>
        <Link
          href="/login"
          className="px-5 py-3 rounded-md text-sm font-medium border border-line"
        >
          Log in
        </Link>
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
