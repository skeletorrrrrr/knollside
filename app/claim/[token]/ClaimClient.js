"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import EmbedWidget from "@/components/EmbedWidget";

export default function ClaimClient({ token, config }) {
  const router = useRouter();
  const { business } = config;

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    // claim_token rides along in user metadata. getOrCreateBusiness reads it
    // on the first authenticated request and attaches this demo to the new
    // user instead of creating an empty business. See lib/claimDemo.js.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { claim_token: token, industry: business.industry } },
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      return;
    }
    if (data.session) router.push("/dashboard");
    else setCodeStep(true);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "signup",
    });
    setLoading(false);
    if (error) {
      setError(error.message || "That code didn't work. Check it and try again.");
      return;
    }
    if (data.session) router.push("/dashboard");
    else router.push("/login");
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setResendMsg("");
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) setError(error.message || "Couldn't resend the code. Try again in a moment.");
    else setResendMsg("New code sent.");
  }

  if (codeStep) {
    return (
      <main className="max-w-sm mx-auto px-5 py-20">
        <h1 className="font-display text-2xl font-semibold mb-3">Check your email</h1>
        <p className="text-sm text-[#8A836F] mb-6">
          We sent a code to {email}. Enter it below and your estimator will be waiting.
        </p>
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            required
            autoFocus
            placeholder="Confirmation code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-sm px-3 py-2.5 rounded-md border border-line tracking-widest"
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          {resendMsg && <p className="text-sm text-[#8A836F]">{resendMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
            style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
          >
            {loading ? "Confirming…" : "Confirm"}
          </button>
        </form>
        <p className="text-sm text-[#8A836F] mt-4">
          Didn't get it?{" "}
          <button type="button" onClick={handleResend} disabled={resending} className="underline">
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone">
      <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
        <header className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clay mb-2">
            Built for {business.name}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-3">
            Here's what an instant quote would look like on your site.
          </h1>
          <p className="text-sm text-[#8A836F] leading-relaxed">
            This is a working estimator, not a picture. Try it — pick a material, change
            the size, watch the number move.
          </p>
          {/* Without this the demo argues against itself: a shop owner sees a
              price he doesn't charge and concludes we don't know his trade.
              Naming the prices as placeholders turns a wrong number from a
              mistake into the thing he's being invited to fix. */}
          <p className="text-sm mt-3 leading-relaxed rounded-lg px-4 py-3 inline-block" style={{ background: "#EDE6D6", color: "#6B6558" }}>
            <strong className="text-ink">The prices in it are made up.</strong>{" "}
            Materials, rates, edge finishes, add-ons — all of it is yours to
            change once you claim it, and it takes a couple of minutes.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="rounded-xl border border-line bg-white p-4 md:p-6 shadow-sm">
            <EmbedWidget
              business={business}
              items={config.items}
              options={config.options}
              addons={config.addons}
            />
          </div>

          {/* Sat in a plain white card it read as another panel of the
              estimator. Brass border and a tinted background make it the one
              thing on the page that is obviously a button rather than part of
              the demo. */}
          <aside
            className="rounded-xl p-6 md:sticky md:top-8"
            style={{ background: "#EDE6D6", border: "2px solid #B08A44" }}
          >
            {!showForm ? (
              <>
                <h2 className="font-display text-2xl font-semibold mb-2 leading-tight">
                  Make this yours
                </h2>
                <p className="text-sm text-[#6B6558] mb-5 leading-relaxed">
                  Your logo and your name are already on it. Claim it and you can
                  put in your own materials, photos and pricing, then drop it
                  onto your site.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full text-base font-semibold px-4 py-3.5 rounded-md text-white"
                  style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
                >
                  Make this mine
                </button>
                <p className="text-xs text-[#8A836F] mt-4 leading-relaxed">
                  Free for a month. No card to start, and you can take it down
                  whenever you like.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold mb-4">Create your account</h2>
                <form onSubmit={handleSignup} className="space-y-3">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-md border border-line"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-md border border-line"
                  />
                  {error && <p className="text-sm text-clay">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
                    style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
                  >
                    {loading ? "Creating account…" : "Claim this estimator"}
                  </button>
                </form>
                <p className="text-xs text-[#A39C8A] mt-4">
                  Already have an account?{" "}
                  <Link href="/login" className="underline">Log in</Link>
                </p>
              </>
            )}
          </aside>
        </div>

        {/* Most people will never visit knollside.com — this page is the whole
            pitch, so what the thing actually does has to be on it. */}
        <section className="mt-14 pt-10 border-t border-line">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">
            What you&rsquo;d actually get
          </h2>
          {/* Stated as an aim rather than a promise. Knollside can't guarantee
              anyone customers, and a shop owner who has been sold to before
              will hear a guarantee as a lie. */}
          <p className="text-base text-[#3F3A32] mb-3 max-w-2xl leading-relaxed">
            The whole point of this is to bring you customers worth your time
            &mdash; people who already know what they want and roughly what it
            costs, not a pile of enquiries to sort through.
          </p>
          <p className="text-sm text-[#8A836F] mb-8 max-w-2xl leading-relaxed">
            It&rsquo;s not just the calculator. Claiming it sets up the whole thing.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Better calls, not more calls",
                b: "You get their name, number, and exactly what they were pricing out — material, size, edge, add-ons. You already know what the job is before you ring back.",
              },
              {
                t: "It answers when you can’t",
                b: "Nine at night, Sunday, halfway through an install. Someone asks what a job costs and gets a straight answer instead of a form and a wait.",
              },
              {
                t: "All of it is yours to change",
                b: "Your materials, your photos, your rates, your edge finishes. Change a price in the morning and the website shows it the same minute.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-line bg-white p-5">
                <h3 className="font-display text-base font-semibold mb-2">{c.t}</h3>
                <p className="text-sm text-[#6B6558] leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>

          {/* Dark panel so the money question doesn't read as another
              paragraph. It is the thing everyone scrolls to find, and the free
              month is the part that decides whether they try it at all. */}
          <div
            className="mt-8 rounded-xl p-6 sm:p-8 max-w-2xl"
            style={{ background: "#211F1B" }}
          >
            <h3
              className="font-display text-xl font-semibold mb-4"
              style={{ color: "#F7F3EA" }}
            >
              What it costs
            </h3>

            <div className="rounded-lg px-5 py-4 mb-4" style={{ background: "#EDE6D6" }}>
              <p className="font-display text-xl font-semibold text-ink leading-snug">
                Free for the first month. No card.
              </p>
              <p className="text-sm text-[#6B6558] mt-1">
                Nothing to cancel if you decide it isn&rsquo;t for you.
              </p>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "#BDB49F" }}>
              After that, plans start at{" "}
              <strong style={{ color: "#F7F3EA" }}>$39 a month</strong> — one job
              usually covers the year.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: "#BDB49F" }}>
              Getting it onto your site is one line of code, the same way you would
              add a video. If someone else built your site, send them that line and
              it takes them two minutes.
            </p>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t border-line max-w-2xl">
          <p className="text-xs text-[#A39C8A] leading-relaxed">
            This is an unofficial mockup built by Knollside to show what an instant quote
            calculator could look like for {business.name}. Knollside is not affiliated with{" "}
            {business.name}, and the pricing shown is illustrative rather than a quote. If
            you'd rather it didn't exist, reply to the email that sent you here and it comes
            down the same day.
          </p>
          {/* Quiet, and below the disclaimer on purpose. Anyone who has read
              this far and wants to check Knollside is a real business will
              look for it; nobody needs it earlier, and putting it up top would
              only compete with the one link that matters. */}
          <p className="text-xs text-[#A39C8A] mt-4">
            Knollside is a small software business in California.{" "}
            <a
              href="https://www.knollside.com"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              knollside.com
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
