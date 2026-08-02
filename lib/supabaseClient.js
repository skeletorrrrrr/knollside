"use client";
import { createBrowserClient } from "@supabase/ssr";

// Browser-side client for use inside "use client" components
// (login/signup forms, dashboard pages that call our own API routes).
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
