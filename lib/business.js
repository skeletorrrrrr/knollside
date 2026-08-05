// Resolves the business row for the currently authenticated user,
// creating one with sensible defaults on their very first visit
// (covers both the signup flow and Supabase projects that require
// email confirmation before a session exists at signup time).
//
// The industry (defaulting to countertops) drives which starter items the
// database trigger seeds and how the widget's quantity input behaves. It's
// read once here from user metadata set at signup; if absent, we fall back
// to the DB default.
export async function getOrCreateBusiness(supabase, user) {
  const { data: existing } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const base = (user.email || "business").split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `${base}-${user.id.slice(0, 6)}`;

  const industry = user.user_metadata?.industry || "countertops";
  const starterMode = user.user_metadata?.starter_mode || "template";

  // Upsert on owner_id rather than a plain insert. Two requests racing to
  // create the same user's business (e.g. router.push + router.refresh
  // both hitting the dashboard layout at once) is expected, not exceptional —
  // ignoreDuplicates means the loser silently does nothing instead of
  // erroring, so we don't depend on catching and re-fetching after the fact.
  const { error: upsertError } = await supabase
    .from("businesses")
    .upsert(
      { owner_id: user.id, slug, name: "My Business", industry, starter_mode: starterMode, owner_email: user.email },
      { onConflict: "owner_id", ignoreDuplicates: true }
    );

  if (upsertError) throw upsertError;

  // Whether this request created the row or lost the race to another one,
  // the row now exists — fetch it fresh so the caller gets it either way.
  const { data: created, error: selectError } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (selectError) throw selectError;
  return created;
}
