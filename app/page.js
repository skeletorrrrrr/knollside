import Link from "next/link";
import Footer from "@/components/Footer";
import PricingToggle from "@/components/PricingToggle";
import DemoSwitcher from "@/components/DemoSwitcher";
import RoiCalculator from "@/components/RoiCalculator";

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

        <DemoSwitcher />
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
          Whoever answers first gets the job.
        </h2>
        <p className="text-lg text-[#6B6558] mb-10 max-w-2xl">
          When someone asks what a job costs, they&rsquo;re asking two or three
          other shops the same day. The one who answers is the one they end up
          talking to. Researchers tested exactly that &mdash; they filled in the
          contact form at 1,000 companies and waited to see what came back.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              635<span className="text-2xl"> of 1,000</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              Never answered at all. The message just sat there.
            </p>
          </div>

          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              4<span className="text-2xl"> in 5</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              Didn&rsquo;t get back to them inside an hour.
            </p>
          </div>

          <div className="rounded-xl p-6 bg-white border border-line">
            <div className="font-display text-4xl font-semibold tracking-tight">
              29<span className="text-2xl"> hrs</span>
            </div>
            <p className="text-sm text-[#6B6558] mt-2">
              Average wait &mdash; and that&rsquo;s counting only the ones who
              bothered to reply.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#8A836F] font-mono mb-10 max-w-2xl leading-relaxed">
          Source: RevenueHero, &ldquo;We Tested Lead Response Times Of 1000 B2B
          Sales Teams,&rdquo; March 2024. The companies tested were software
          firms rather than trades &mdash; it&rsquo;s cited here because it&rsquo;s
          the most recent measurement of how long people are left waiting.
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
          <Link
            href="/signup"
            className="inline-block mt-6 text-sm font-medium px-5 py-2.5 rounded-md"
            style={{ background: "#F7F3EA", color: "#211F1B" }}
          >
            Set yours up free &rarr;
          </Link>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mb-24">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#8F6E32" }}
        >
          How it works
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-3 mb-10 max-w-2xl leading-[1.15]">
          Set your prices once. It quotes for you after that.
        </h2>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <li className="border-t pt-5" style={{ borderColor: "#DED6C4" }}>
            <div className="font-mono text-xs mb-3" style={{ color: "#B08A44" }}>
              STEP 1
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Set up your pricing
            </h3>
            <p className="text-sm text-[#6B6558] leading-relaxed">
              Pick your trade and Knollside starts you with a working estimator
              &mdash; materials, options, add-ons, labor rate. Rename, reprice,
              add or remove anything until it matches how you actually quote.
            </p>
          </li>

          <li className="border-t pt-5" style={{ borderColor: "#DED6C4" }}>
            <div className="font-mono text-xs mb-3" style={{ color: "#B08A44" }}>
              STEP 2
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Put it where customers are
            </h3>
            <p className="text-sm text-[#6B6558] leading-relaxed">
              Paste one line of code on your website. No website, or can&rsquo;t
              edit it? Share your Knollside link instead &mdash; in your
              Instagram bio, Google profile, email signature, or a text.
            </p>
          </li>

          <li className="border-t pt-5" style={{ borderColor: "#DED6C4" }}>
            <div className="font-mono text-xs mb-3" style={{ color: "#B08A44" }}>
              STEP 3
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Get the lead
            </h3>
            <p className="text-sm text-[#6B6558] leading-relaxed">
              Customers get a real price in seconds, then send it to you to
              confirm. Their name, email, phone and job details land in your
              dashboard while they&rsquo;re still interested.
            </p>
          </li>
        </ol>

        <p className="text-sm text-[#8A836F] mt-8">
          Change a price later and it updates everywhere instantly &mdash; no
          re-embedding, no touching your website again.
        </p>
      </section>

      {/* ---------- TWO WAYS TO GET STARTED ---------- */}
      <section className="mb-24">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#8F6E32" }}
        >
          Two ways to use it
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-3 mb-4 max-w-2xl leading-[1.15]">
          You don&rsquo;t need a website to use Knollside.
        </h2>
        <p className="text-lg text-[#6B6558] mb-10 max-w-2xl">
          Most people do one of these. Some do both.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Option 1 — embed */}
          <div className="rounded-2xl p-6 sm:p-7 bg-white border border-line flex flex-col">
            <div className="font-mono text-xs mb-3" style={{ color: "#B08A44" }}>
              OPTION 1
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Put it on your website
            </h3>
            <p className="text-sm text-[#6B6558] leading-relaxed mb-5">
              Paste one line where you want the estimator to show up. Anywhere
              you can add HTML works &mdash; most site builders can. Change your
              prices later and the page updates itself.
            </p>

            <div
              className="rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto"
              style={{ background: "#211F1B", color: "#BDB49F" }}
            >
              <span style={{ color: "#8A836F" }}>&lt;iframe</span>{" "}
              src=<span style={{ color: "#C39A55" }}>
                &quot;knollside.com/embed/your-name&quot;
              </span>{" "}
              style=<span style={{ color: "#C39A55" }}>
                &quot;width:100%;height:800px;border:0&quot;
              </span>
              <span style={{ color: "#8A836F" }}>&gt;&lt;/iframe&gt;</span>
            </div>

            <p className="text-xs text-[#8A836F] mt-3">
              Copy it from your dashboard &mdash; it comes filled in with your
              own address.
            </p>
          </div>

          {/* Option 2 — hosted link */}
          <div className="rounded-2xl p-6 sm:p-7 bg-white border border-line flex flex-col">
            <div className="font-mono text-xs mb-3" style={{ color: "#B08A44" }}>
              OPTION 2
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Just share your link
            </h3>
            <p className="text-sm text-[#6B6558] leading-relaxed mb-5">
              No website, or you can&rsquo;t edit the one you have? Every account
              gets its own estimator page. Nothing to install &mdash; send the
              link and it works.
            </p>

            <div
              className="rounded-lg p-4 font-mono text-sm"
              style={{ background: "#F2EDE0", color: "#211F1B" }}
            >
              knollside.com/embed/<span style={{ color: "#8F6E32" }}>your-name</span>
            </div>

            <ul className="mt-4 space-y-1.5 text-sm text-[#6B6558]">
              <li>&middot; Instagram or Facebook bio</li>
              <li>&middot; Your Google Business Profile</li>
              <li>&middot; Email signature</li>
              <li>&middot; Text it to anyone who asks for a price</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- ROI CALCULATOR ---------- */}
      <section className="mb-24">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#8F6E32" }}
        >
          Worth it?
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-3 mb-4 max-w-2xl leading-[1.15]">
          Run your own numbers.
        </h2>
        <p className="text-lg text-[#6B6558] mb-8 max-w-2xl">
          We&rsquo;re not going to tell you how many jobs this wins you &mdash; we
          don&rsquo;t know your shop. Put in what a job is worth and what you
          think an instant quote would pick up, and see the arithmetic for
          yourself.
        </p>
        <RoiCalculator starterPrice={39} />
      </section>

      {/* ---------- PRICING ---------- */}
      <PricingToggle />

      <Footer />
    </main>
  );
}
