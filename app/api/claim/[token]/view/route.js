import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Records that someone actually opened a prospect's demo page.
//
// Called from the browser rather than during the server render on purpose:
// mail providers and link scanners fetch URLs to check them for safety, so a
// server-side counter would show views for emails nobody opened. Only a real
// browser running JavaScript gets counted, and the client only fires once per
// session so a refresh doesn't inflate it.
export async function POST(_request, { params }) {
  const token = params.token;
  if (!token || typeof token !== "string" || token.length > 64) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: demo } = await admin
    .from("businesses")
    .select("id, claim_views, claim_first_viewed_at")
    .eq("claim_token", token)
    .eq("is_demo", true)
    .maybeSingle();

  // Unknown or already-claimed token. Answer the same either way rather than
  // saying which — this endpoint takes an unauthenticated token, and a
  // different response for a valid one turns it into a way to check whether a
  // token exists.
  if (!demo) return NextResponse.json({ ok: true });

  const now = new Date().toISOString();
  await admin
    .from("businesses")
    .update({
      claim_views: (demo.claim_views || 0) + 1,
      claim_first_viewed_at: demo.claim_first_viewed_at || now,
      claim_last_viewed_at: now,
    })
    .eq("id", demo.id);

  return NextResponse.json({ ok: true });
}
