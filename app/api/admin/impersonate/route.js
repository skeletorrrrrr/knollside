import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";

// Owner-only: mint a one-time login link for a customer's account so the owner
// can see and fix what the customer sees.
//
// This is the most dangerous endpoint in the app — a successful call hands over
// a full session as another user. It's gated exactly like the admin GET/DELETE
// (strict ADMIN_EMAIL match on the *server-verified* session, never on anything
// the client sends), and every call is written to admin_impersonations before
// the link is handed back.
//
// The admin's own account is excluded: there's no reason to impersonate
// yourself, and allowing it only adds a confusing path through the code.
export async function POST(request) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const businessId = body.businessId;
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: business } = await admin
    .from("businesses")
    .select("id, name, owner_email")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!business.owner_email) {
    return NextResponse.json(
      { error: "That business has no owner email on file, so there's no account to open." },
      { status: 400 }
    );
  }
  if (business.owner_email.toLowerCase() === adminEmail) {
    return NextResponse.json({ error: "That's your own account." }, { status: 400 });
  }

  // Record the access attempt BEFORE issuing the link, so a link that gets
  // generated is always accompanied by a log row even if the response is lost.
  await admin.from("admin_impersonations").insert({
    admin_email: adminEmail,
    business_id: business.id,
    business_name: business.name,
    owner_email: business.owner_email,
  });

  const origin = new URL(request.url).origin;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: business.owner_email,
    options: { redirectTo: `${origin}/dashboard` },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const url = data?.properties?.action_link;
  if (!url) {
    return NextResponse.json({ error: "Couldn't generate a login link." }, { status: 500 });
  }

  return NextResponse.json({ url, businessName: business.name, ownerEmail: business.owner_email });
}
