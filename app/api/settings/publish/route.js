import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";

// Flips a business from unpublished to published.
//
// Kept as its own route rather than another field on /api/settings PATCH:
// publishing is a deliberate one-time action with a timestamp, not a field
// edit, and it shouldn't be reachable by accident from a form that autosaves.
export async function POST(request) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);

  let body = {};
  try {
    body = await request.json();
  } catch {
    // no body is fine — default is publish
  }
  const publish = body.published !== false;

  // Already in the requested state — return as-is rather than moving the
  // published_at timestamp on a double-click.
  if (Boolean(business.published) === publish) {
    return NextResponse.json({ business, changed: false });
  }

  const update = publish
    ? { published: true, published_at: business.published_at || new Date().toISOString() }
    : { published: false };

  const { data, error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", business.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ business: data, changed: true });
}
