import Link from "next/link";
import { getSiteBySlug } from "@/lib/siteContent";
import EmbedWidget from "@/components/EmbedWidget";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return { title: "Not found" };
  return {
    title: site.business.name,
    description: site.content.hero.sub,
  };
}

function Eyebrow({ children }) {
  if (!children) return null;
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.14em] mb-2"
      style={{ color: "#8F6E32" }}
    >
      {children}
    </p>
  );
}

function Cards({ cards }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {cards.map((c, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-6">
          <h3 className="font-display text-lg font-semibold">{c.title}</h3>
          {c.body && (
            <p className="text-sm text-[#6B6558] leading-relaxed mt-2">{c.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function SitePage({ params }) {
  const site = await getSiteBySlug(params.slug);

  if (site.error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone px-6">
        <p className="text-sm text-[#8A836F] text-center">
          {site.error === "unavailable"
            ? "This site is temporarily unavailable."
            : "Nothing here."}
        </p>
      </main>
    );
  }

  const { business, content, items, options, addons } = site;
  const c = content;

  return (
    <main className="bg-stone">
      {/* ---- nav ---- */}
      <header className="border-b border-line bg-stone/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
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
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {c.contact.phone && (
              <a
                href={`tel:${c.contact.phone.replace(/[^0-9+]/g, "")}`}
                className="text-sm font-medium hidden sm:inline"
                style={{ color: "#8F6E32" }}
              >
                {c.contact.phone}
              </a>
            )}
            <a
              href="#estimate"
              className="text-sm font-medium px-4 py-2 rounded-md text-white"
              style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
            >
              Get a price
            </a>
          </div>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <Eyebrow>{c.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] max-w-3xl">
          {c.hero.headline}
        </h1>
        <p className="text-lg text-[#6B6558] mt-5 max-w-2xl leading-relaxed">
          {c.hero.sub}
        </p>
        <a
          href="#estimate"
          className="inline-block mt-8 text-sm font-medium px-5 py-3 rounded-md text-white"
          style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
        >
          {c.hero.cta} &rarr;
        </a>
      </section>

      {/* ---- services ---- */}
      {c.services.on && (
        <section className="max-w-5xl mx-auto px-5 py-14 border-t border-line">
          <Eyebrow>{c.services.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.services.headline}
          </h2>
          {c.services.intro && (
            <p className="text-[#6B6558] mt-4 max-w-2xl leading-relaxed">
              {c.services.intro}
            </p>
          )}
          <Cards cards={c.services.cards} />
        </section>
      )}

      {/* ---- process ---- */}
      {c.process.on && (
        <section className="max-w-5xl mx-auto px-5 py-14 border-t border-line">
          <Eyebrow>{c.process.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.process.headline}
          </h2>
          {c.process.intro && (
            <p className="text-[#6B6558] mt-4 max-w-2xl leading-relaxed">
              {c.process.intro}
            </p>
          )}
          <Cards cards={c.process.cards} />
        </section>
      )}

      {/* ---- gallery ---- */}
      {c.gallery.on && c.gallery.photos && c.gallery.photos.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-14 border-t border-line">
          <Eyebrow>{c.gallery.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15] mb-8">
            {c.gallery.headline}
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {c.gallery.photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-lg border border-line"
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- estimator ---- */}
      {c.estimator.on && (
        <section
          id="estimate"
          className="max-w-5xl mx-auto px-5 py-14 border-t border-line scroll-mt-20"
        >
          <Eyebrow>{c.estimator.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.estimator.headline}
          </h2>
          {c.estimator.intro && (
            <p className="text-[#6B6558] mt-4 mb-8 max-w-2xl leading-relaxed">
              {c.estimator.intro}
            </p>
          )}
          {/* Rendered directly rather than in an iframe. Same app, same data —
              so there is no embed snippet, no postMessage height dance, and no
              nested scrolling on a phone. */}
          <div className="rounded-xl border border-line bg-white p-4 sm:p-6">
            <EmbedWidget
              business={business}
              items={items}
              options={options}
              addons={addons}
            />
          </div>
        </section>
      )}

      {/* ---- contact ---- */}
      {c.contact.on && (
        <section className="max-w-5xl mx-auto px-5 py-14 border-t border-line">
          <Eyebrow>{c.contact.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.contact.headline}
          </h2>
          {c.contact.intro && (
            <p className="text-[#6B6558] mt-4 max-w-2xl leading-relaxed">
              {c.contact.intro}
            </p>
          )}
          <dl className="grid gap-6 sm:grid-cols-2 mt-8 max-w-2xl">
            {c.contact.phone && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#A39C8A] mb-1">Phone</dt>
                <dd>
                  <a
                    href={`tel:${c.contact.phone.replace(/[^0-9+]/g, "")}`}
                    className="font-medium"
                    style={{ color: "#8F6E32" }}
                  >
                    {c.contact.phone}
                  </a>
                </dd>
              </div>
            )}
            {c.contact.email && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#A39C8A] mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${c.contact.email}`} className="font-medium" style={{ color: "#8F6E32" }}>
                    {c.contact.email}
                  </a>
                </dd>
              </div>
            )}
            {c.contact.address && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#A39C8A] mb-1">Where we are</dt>
                <dd className="text-sm text-[#6B6558] whitespace-pre-line">{c.contact.address}</dd>
              </div>
            )}
            {c.contact.hours && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#A39C8A] mb-1">Hours</dt>
                <dd className="text-sm text-[#6B6558] whitespace-pre-line">{c.contact.hours}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* ---- footer ---- */}
      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#8A836F]">
            &copy; {new Date().getFullYear()} {business.name}
          </p>
          {!business.hide_branding && (
            <Link
              href="https://www.knollside.com"
              target="_blank"
              rel="noopener"
              className="font-mono text-[11px] uppercase tracking-[0.06em]"
              style={{ color: "#211F1B", opacity: 0.35 }}
            >
              Powered by Knollside
            </Link>
          )}
        </div>
      </footer>
    </main>
  );
}
