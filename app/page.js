import Link from "next/link";
import Footer from "@/components/Footer";
import PricingToggle from "@/components/PricingToggle";

export default function LandingPage() {
  return (
    <main className="max-w-6xl mx-auto px-5 py-10 sm:py-14">
      <style>{`
        .knollside-demo-frame { width: 100%; border: 0; display: block; height: 900px; }
        @media (max-width: 1023px) {
          .knollside-demo-frame { height: 1150px; }
        }
      `}</style>

      {/* ---------- HERO ---------- */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-start mb-24">
        {/* Left: the pitch */}
        <div className="lg:pt-10">
          <img
            src="/knollside-logo.png"
            alt="Knollside"
            className="h-8 w-auto mb-7"
          />

          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-5">
            Your customers are ready to buy. Don&rsquo;t make them wait.
          </h1>

          <p className="text-lg text-[#6B6558] mb-7 max-w-xl">
            Knollside quotes them instantly and captures the lead &mdash; so you
            stop losing jobs to a callback.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="px-5 py-3 rounded-md text-sm font-medium text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
            >
              Start free &mdash; no card required
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 rounded-md text-sm font-medium text-[#6B6558]"
            >
              Log in
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#8A836F]">
            Free for a month. Then from $390/year &mdash; one job pays for it.
          </p>
        </div>

        {/* Right: the proof — live, working estimator */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{ width: 7, height: 7, background: "#4B6A52" }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#8F6E32" }}
            >
              Live demo &mdash; try it yourself
            </span>
          </div>
          <p className="text-sm text-[#8A836F] mb-4">
            Not a screenshot. Pick a material, drag the slider, get a price.
          </p>
          <div
            id="live-demo"
            className="rounded-2xl overflow-hidden border scroll-mt-8"
            style={{
              borderColor: "#EDE6D6",
              boxShadow: "0 12px 40px rgba(33,31,27,0.08)",
            }}
          >
            <iframe
              src="/embed/demo"
              className="knollside-demo-frame"
              title="Live Knollside demo estimator"
            />
          </div>
        </div>
      </section>

      {/* ---------- THE WINDOW (pain / stats) ---------- */}
      <section className="mb-24">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#8F6E32" }}
        >
          The window
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-3 mb-4 max-w-2xl leading-[1.15]">
          Most jobs are lost before you ever call back.
        </h2>
        <p className="text-lg text-[#6B6558] mb-10 max-w-2xl">
          When someone asks what a job costs, they&rsquo;re usually asking two
          or three other people the same day. Whoever answers first is the one
          they talk to. Harvard Business Review audited 2,241 companies to see
          how fast they actually respond:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              42<span className="text-2xl"> hrs</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              Average time a business took to respond to an online inquiry.
            </p>
          </div>

          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              23<span className="text-2xl">%</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              Never responded at all. The lead just sat there.
            </p>
          </div>

          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              7<span className="text-2xl">&times;</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              More likely to qualify the lead when you answer within the hour
              instead of an hour later.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#8A836F] font-mono mb-10">
          Source: Oldroyd, McElheran &amp; Elkington, &ldquo;The Short Life of
          Online Sales Leads,&rdquo; Harvard Business Review, 2011.
        </p>

        <div
          className="rounded-xl p-6 sm:p-7 border"
          style={{ background: "#211F1B", borderColor: "#211F1B" }}
        >
          <p
            className="font-display text-xl sm:text-2xl leading-snug max-w-3xl"
            style={{ color: "#F7F3EA" }}
          >
            Knollside answers in seconds &mdash; at midnight, on a Sunday, while
            you&rsquo;re under a sink.
          </p>
          <p className="text-sm mt-3 max-w-2xl" style={{ color: "#BDB49F" }}>
            The customer gets a real number from your pricing while they&rsquo;re
            still interested, and you get their name, number and job details
            waiting in your dashboard.
          </p>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <PricingToggle />

      <Footer />
    </main>
  );
}
