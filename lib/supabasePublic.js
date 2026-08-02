import { createClient } from "@supabase/supabase-js";

// Anon-key client for the public widget endpoints. No user session involved —
// Row Level Security (see supabase/schema.sql) is what actually enforces
// "materials/edges/addons are publicly readable, leads are publicly
// insertable but not readable." This client has no more power than that.
export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
