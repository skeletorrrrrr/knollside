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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { industry } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      // email confirmation is off in the Supabase project — go straight in
      router.push("/dashboard");
      router.refresh();
    } else {
      // email confirmation is on — the business row gets created on first
      // login instead (see lib/business.js), using the industry saved above
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <main className="max-w-sm mx-auto px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold mb-3">Check your email</h1>
        <p className="text-sm text-[#8A836F]">
          We sent a confirmation link to {email}. Click it, then log in.
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
