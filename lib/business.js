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

  const { data: created, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, slug, name: "My Business", industry, starter_mode: starterMode, owner_email: user.email })
    .select("*")
    .single();

  if (error) {
    // 23505 = unique constraint violation. This happens when two requests
    // (e.g. middleware + page render) both try to create the business at once,
    // or a slug collides. Either way, the row now exists — fetch and return it
    // rather than crashing the page.
    if (error.code === "23505") {
      const { data: raced } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (raced) return raced;
    }
    throw error;
  }
  return created;
}
