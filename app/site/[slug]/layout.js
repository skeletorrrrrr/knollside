import Link from "next/link";
import { getSiteBySlug, PAGES } from "@/lib/siteContent";
import { getIndustry } from "@/lib/industries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({ children, params }) {
  const site = await getSiteBySlug(params.slug);

  // The page itself renders the not-found body; the layout just gets out of
  // the way rather than drawing a nav for a site that doesn't exist.
  if (site.error) return <>{children}</>;

  const { business, content: c } = site;
  const base = `/site/${business.slug}`;
  const industry = getIndustry(business.industry);
  const itemsWord = (industry.terms && industry.terms.items) || "services";

  const links = PAGES.filter((p) => {
    if (p.always) return true;
    if (p.key === "materials") return (site.items || []).length > 0;
    const sec = c[p.section];
    return sec && sec.on;
  }).map((p) => ({
    href: p.key ? `${base}/${p.key}` : base,
    // Materials/Services takes its name from the trade rather than being
    // hardcoded — a plumber's nav shouldn't say "Materials".
    label: p.label || itemsWord.replace(/^./, (ch) => ch.toUpperCase()),
  }));

  return (
    <div className="bg-stone min-h-screen flex flex-col">
      <header className="border-b border-line bg-stone/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link href={base} className="flex items-center gap-3 min-w-0">
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt=""
                className="h-8 w-auto object-contain"
              />
            )}
            <span className="font-display font-semibold truncate">
              {business.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#6B6558] hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {c.contact.phone && (
              <a
                href={`tel:${c.contact.phone.replace(/[^0-9+]/g, "")}`}
                className="text-sm font-medium hidden lg:inline"
                style={{ color: "#8F6E32" }}
              >
                {c.contact.phone}
              </a>
            )}
            {c.estimator.on && (
              <Link
                href={`${base}/estimate`}
                className="text-sm font-medium px-4 py-2 rounded-md text-white whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
              >
                Get a price
              </Link>
            )}
          </div>
        </div>

        {/* Small screens get the nav on its own row rather than a hamburger —
            five links fit, and a menu nobody opens is worse than a row. */}
        <nav className="md:hidden border-t border-line overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5 py-2 flex gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#6B6558] whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#8A836F]">
            &copy; {new Date().getFullYear()} {business.name}
          </p>
          {!business.hide_branding && (
            <a
              href="https://www.knollside.com"
              target="_blank"
              rel="noopener"
              className="font-mono text-[11px] uppercase tracking-[0.06em]"
              style={{ color: "#211F1B", opacity: 0.35 }}
            >
              Powered by Knollside
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
