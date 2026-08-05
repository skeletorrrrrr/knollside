"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { INDUSTRY_LIST } from "@/lib/industries";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState(INDUSTRY_LIST[0].id);
  const [starterMode, setStarterMode] = useState("template");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    // For "other", starter_mode chooses blank vs a generic sample set; other
    // industries always use their template.
    const starter_mode = industry === "other" ? starterMode : "template";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { industry, starter_mode } },
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      return;
    }
    if (data.session) {
      // email confirmation is off in the Supabase project — go straight in
      router.push("/dashboard");
    } else {
      // email confirmation is on — show the code-entry step below. We use a
      // typed-in numeric code rather than a magic link: link-scanning bots
      // (Gmail and some corporate mail security gateways) auto-visit links
      // in incoming email to check them for safety, which silently burns a
      // single-use confirmation link before the real user ever clicks it.
      // A code the user types in isn't clickable, so it can't get
      // pre-consumed that way. The business row gets created on first
      // login after this, using the industry saved above (see lib/business.js).
      setCodeStep(true);
    }
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
    if (data.session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
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
          We sent a code to {email}. Enter it below to finish creating your account.
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
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="underline"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
        <p className="text-sm text-[#8A836F] mt-1">
          Wrong email?{" "}
          <button type="button" onClick={() => setCodeStep(false)} className="underline">
            Start over
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-20">
      <h1 className="font-display text-2xl font-semibold mb-6">Start your free trial</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
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
        <div>
          <label className="block text-xs font-medium mb-1.5 text-[#8A836F]">
            What kind of business is this?
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full text-sm px-3 py-2.5 rounded-md border border-line bg-white"
          >
            {INDUSTRY_LIST.map((i) => (
              <option key={i.id} value={i.id}>{i.label}</option>
            ))}
          </select>
          <p className="text-xs text-[#A39C8A] mt-1">
            Sets up your estimator with sensible starter pricing — you can edit everything later.
          </p>
        </div>
        {industry === "other" && (
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#8A836F]">
              How do you want to start?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStarterMode("template")}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-md border"
                style={{
                  borderColor: starterMode === "template" ? "#B08A44" : "#DDD3BF",
                  background: starterMode === "template" ? "#EDE6D6" : "white",
                }}
              >
                Generic sample
              </button>
              <button
                type="button"
                onClick={() => setStarterMode("blank")}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-md border"
                style={{
                  borderColor: starterMode === "blank" ? "#B08A44" : "#DDD3BF",
                  background: starterMode === "blank" ? "#EDE6D6" : "white",
                }}
              >
                Start blank
              </button>
            </div>
            <p className="text-xs text-[#A39C8A] mt-1">
              {starterMode === "template"
                ? "Fills in sample items, options, and add-ons you can rename and reprice."
                : "Starts empty — you'll add your own items, options, and add-ons."}
            </p>
          </div>
        )}
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-[#8A836F] mt-4">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}
