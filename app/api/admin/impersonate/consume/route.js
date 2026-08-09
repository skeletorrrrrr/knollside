import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Consumes a single-use support token and establishes a real cookie session.
//
// This is the piece that makes admin support access actually work. The Supabase
// hosted verify endpoint hands the session back in a URL hash, which the server
// never sees — so it can't set cookies, and this app is cookie-authenticated.
// Verifying the token here instead means the session lands in cookies exactly
// like a normal login.
//
// No ADMIN_EMAIL check on this route, on purpose: whoever holds the token is
// already holding a credential (same as an emailed magic link). The gate lives
// on the route that ISSUES tokens. The token is single-use and short-lived.
export async function GET(request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");

  if (!tokenHash) {
    return NextResponse.redirect(new URL("/login?error=missing_token", url.origin));
  }

  const supabase = supabaseServer();

  const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (error) {
    // Most common cause: the link was already used, or it expired.
    return NextResponse.redirect(new URL("/login?error=support_link_used", url.origin));
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
