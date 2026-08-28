import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Hosts that are Knollside itself rather than a customer's domain. Anything
// not on this list is treated as a customer site and rewritten to its pages.
function isKnollsideHost(host) {
  if (!host) return true;
  const h = host.split(":")[0].toLowerCase();
  return (
    h === "knollside.com" ||
    h === "www.knollside.com" ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    // Vercel preview and production deployment URLs
    h.endsWith(".vercel.app")
  );
}

export async function middleware(request) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  // ---- customer domains -------------------------------------------------
  // A request to countertopsvista.com serves that business's site. The host
  // is passed through as the [slug] segment and lib/siteContent.js resolves
  // it against either slug or custom_domain — that keeps the whole lookup out
  // of middleware, which would otherwise mean a database round trip on every
  // request including images.
  if (!isKnollsideHost(host)) {
    // Already rewritten, or a path that must not be rewritten at all.
    if (
      pathname.startsWith("/site/") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/embed/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }
    const bare = host.split(":")[0].toLowerCase().replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.pathname = `/site/${bare}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---- Knollside's own pages --------------------------------------------
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Only these paths need a session. Checking on every request would mean an
  // auth round trip on public marketing and customer pages for no reason.
  if (!isDashboard && !isAdmin && !isAuthPage) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  // Wider than it needs to be for auth, because custom-domain routing has to
  // see every page request. Static assets and files with extensions are
  // excluded so this doesn't run for images and scripts.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
