import { getSiteBySlug, itemSlug } from "@/lib/siteContent";
import { Eyebrow, Cards, Section, CtaButton, NotFoundBody } from "@/components/SiteBits";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return { title: "Not found" };
  return {
    title: site.content.hero.headline,
    description: site.content.hero.sub,
  };
}

export default async function SiteHome({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) {
    return (
      <NotFoundBody
        message={
          site.error === "unavailable"
            ? "This site is temporarily unavailable."
            : "Nothing here."
        }
      />
    );
  }

  const { business, content: c, items } = site;
  const base = `/site/${business.slug}`;

  return (
    <>
      <Section first>
        <Eyebrow>{c.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] max-w-3xl">
          {c.hero.headline}
        </h1>
        <p className="text-lg text-[#6B6558] mt-5 max-w-2xl leading-relaxed">
          {c.hero.sub}
        </p>
        {c.estimator.on && (
          <div className="mt-8">
            <CtaButton href={`${base}/estimate`}>{c.hero.cta} &rarr;</CtaButton>
          </div>
        )}
      </Section>

      {c.why.on && (
        <Section>
          <Eyebrow>{c.why.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.why.headline}
          </h2>
          {c.why.intro && (
            <p className="text-[#6B6558] mt-4 max-w-2xl leading-relaxed">{c.why.intro}</p>
          )}
          <Cards cards={c.why.cards} />
        </Section>
      )}

      {c.services.on && items.length > 0 && (
        <Section>
          <Eyebrow>{c.services.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.services.headline}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {items.slice(0, 6).map((it) => (
              <Link
                key={it.id}
                href={`${base}/materials/${itemSlug(it.name)}`}
                className="rounded-xl border border-line bg-white overflow-hidden hover:border-[#B08A44] transition-colors"
              >
                {it.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.photo_url}
                    alt=""
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{it.name}</h3>
                  {it.base_price ? (
                    <p className="text-sm text-[#8A836F] mt-1 font-mono">
                      From ${it.base_price}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {c.process.on && (
        <Section>
          <Eyebrow>{c.process.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.process.headline}
          </h2>
          <Cards cards={c.process.cards} />
        </Section>
      )}

      {c.reviews.on && c.reviews.quotes && c.reviews.quotes.length > 0 && (
        <Section>
          <Eyebrow>{c.reviews.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15] mb-8">
            {c.reviews.headline}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.reviews.quotes.map((q, i) => (
              <figure key={i} className="rounded-xl border border-line bg-white p-6">
                <blockquote className="text-sm text-[#3F3A32] leading-relaxed">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs text-[#8A836F] mt-4">
                  {q.name}
                  {q.source ? ` \u00b7 ${q.source}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {c.areas.on && c.areas.places && c.areas.places.length > 0 && (
        <Section>
          <Eyebrow>{c.areas.eyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight max-w-2xl leading-[1.15]">
            {c.areas.headline}
          </h2>
          <ul className="flex flex-wrap gap-2 mt-6">
            {c.areas.places.map((place, i) => (
              <li
                key={i}
                className="text-sm px-3 py-1.5 rounded-full border border-line bg-white text-[#6B6558]"
              >
                {place}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {c.estimator.on && (
        <Section>
          <div
            className="rounded-xl p-7 sm:p-9"
            style={{ background: "#211F1B" }}
          >
            <h2
              className="font-display text-2xl sm:text-3xl font-semibold leading-snug max-w-2xl"
              style={{ color: "#F7F3EA" }}
            >
              {c.estimator.headline}
            </h2>
            <p className="text-sm mt-3 max-w-xl" style={{ color: "#BDB49F" }}>
              {c.estimator.intro}
            </p>
            <div className="mt-6">
              <CtaButton href={`${base}/estimate`} light>
                Get a price &rarr;
              </CtaButton>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
