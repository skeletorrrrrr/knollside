import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH(request, { params }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const update = {};

  if (body.status !== undefined) {
    if (!["new", "contacted", "won", "lost"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
    // Setting a lead back to "New" re-flags it as unseen (the pill/badge come
    // back); acting on it with any other status marks it seen.
    update.seen = body.status !== "new";
  }

  if (body.seen !== undefined) {
    update.seen = !!body.seen;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
