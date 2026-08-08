import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";

// Logos for the admin table, keyed by business id.
//
// Kept as its own endpoint rather than adding logo_url to the main admin GET
// purely to avoid editing that route — the two can be merged later, it's one
// extra column in the existing select and one extra field in the row mapping.
export async function GET() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("businesses").select("id, logo_url");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const logos = {};
  (data || []).forEach((b) => {
    if (b.logo_url) logos[b.id] = b.logo_url;
  });

  return NextResponse.json({ logos });
}
