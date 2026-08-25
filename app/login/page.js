"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

const INPUT = "w-full text-sm px-3 py-2.5 rounded-md border border-line";

// Show/hide toggle. Typing a password blind on a phone is where most failed
// logins actually come from, and the people using this are often on a job site.
function PasswordField({ value, onChange, placeholder, autoFocus, minLength }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        type={shown ? "text" : "password"}
        required
        minLength={minLength}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={INPUT + " pr-16"}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        // tabIndex -1 so tabbing from the password field goes to the submit
        // button, not to this toggle.
        tabIndex={-1}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded text-[#8A836F] hover:text-ink"
      >
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | request | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function go(next) {
    setError("");
    setNotice("");
    setMode(next);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleRequestCode(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    // Deliberately the same response whether or not the address has an
    // account. Saying "no account with that email" would let anyone check
    // which of their competitors is a customer.
    if (error && !/rate|limit|seconds/i.test(error.message)) {
      setNotice("If there's an account for that email, a code is on its way.");
      go("reset");
      return;
    }
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("If there's an account for that email, a code is on its way.");
    go("reset");
  }

  async function handleSetPassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = supabaseBrowser();
    // A typed code rather than a link: mail scanners follow links in incoming
    // email to check them, which silently consumes a single-use reset link
    // before the real person ever clicks it. Same reason signup uses a code.
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });
    if (otpError) {
      setLoading(false);
      setError("That code didn't work. Check it and try again, or request a new one.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (mode === "request") {
    return (
      <main className="max-w-sm mx-auto px-5 py-20">
        <h1 className="font-display text-2xl font-semibold mb-3">Reset your password</h1>
        <p className="text-sm text-[#8A836F] mb-6">
          Enter your email and we'll send you a code.
        </p>
        <form onSubmit={handleRequestCode} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
            style={{ background: "#211F1B" }}
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
        <p className="text-sm text-[#8A836F] mt-4">
          <button type="button" onClick={() => go("login")} className="underline">
            Back to log in
          </button>
        </p>
      </main>
    );
  }

  if (mode === "reset") {
    return (
      <main className="max-w-sm mx-auto px-5 py-20">
        <h1 className="font-display text-2xl font-semibold mb-3">Enter your code</h1>
        {notice && <p className="text-sm text-[#8A836F] mb-6">{notice}</p>}
        <form onSubmit={handleSetPassword} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            required
            autoFocus
            placeholder="Code from your email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={INPUT + " tracking-widest"}
          />
          <PasswordField
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            minLength={6}
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
            style={{ background: "#211F1B" }}
          >
            {loading ? "Saving…" : "Set new password"}
          </button>
        </form>
        <p className="text-sm text-[#8A836F] mt-4">
          Didn't get it?{" "}
          <button type="button" onClick={() => go("request")} className="underline">
            Send another
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-20">
      <h1 className="font-display text-2xl font-semibold mb-6">Log in</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
        />
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-medium px-4 py-2.5 rounded-md text-white"
          style={{ background: "#211F1B" }}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-[#8A836F] mt-4">
        <button type="button" onClick={() => go("request")} className="underline">
          Forgot your password?
        </button>
      </p>
      <p className="text-sm text-[#8A836F] mt-1">
        No account yet? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
