import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteBySlug, itemSlug } from "@/lib/siteContent";
import { getIndustry } from "@/lib/industries";
import { Eyebrow, Section, CtaButton, NotFoundBody } from "@/components/SiteBits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// One page per material, generated from the rows the customer already entered
// into their estimator. Nobody hand-builds these and nobody has to remember to
// update a price on them — the number here is the same number the estimator
// quotes from.
//
// The point is search: a page titled "Quartz Countertops in Vista" can rank for
// that phrase, where a single catch-all homepage can't. The customer writes a
// couple of paragraphs once (site_content.materials[slug]) and the rest stays
// automatic.
function findItem(items, slug) {
  const seen = new Set();
  for (const it of items) {
    let s = itemSlug(it.name);
    // Two materials that slug identically would otherwise both resolve to the
    // first one; suffix the later duplicates so every row keeps a unique URL.
    if (seen.has(s)) {
      let n = 2;
      while (seen.has(`${s}-${n}`)) n += 1;
      s = `${s}-${n}`;
    }
    seen.add(s);
    if (s === slug) return it;
  }
  return null;
}

export async function generateMetadata({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return { title: "Not found" };
  const item = findItem(site.items, params.item);
  if (!item) return { title: "Not found" };

  const industry = getIndustry(site.business.industry);
  // industry.label is the trade noun ("Countertops / Stone"); terms.items is a
  // section-heading word ("materials"). A title reading "Quartz materials in
  // Vista" is the wrong phrase — nobody searches it. Take the first half of the
  // label so we get "Quartz Countertops in Vista", which people do search.
  const trade = String(industry.label || "").split("/")[0].trim();
  const area = (site.content.areas.places || [])[0];
  const saved = (site.content.materials || {})[params.item] || {};

  return {
    title:
      saved.title ||
      `${item.name}${trade ? ` ${trade}` : ""}${area ? ` in ${area}` : ""} \u2014 ${site.business.name}`,
    description:
      saved.body ||
      `${item.name} from ${site.business.name}${area ? ` in ${area}` : ""}. See pricing and get an instant estimate.`,
  };
}

export default async function MaterialPage({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return <NotFoundBody />;

  const { business, content: c, items } = site;
  const item = findItem(items, params.item);
  if (!item) notFound();

  const base = `/site/${business.slug}`;
  const industry = getIndustry(business.industry);
  const word = (industry.terms && industry.terms.items) || "";
  const area = (c.areas.places || [])[0];
  const saved = (c.materials || {})[params.item] || {};

  const heading =
    saved.headline || `${item.name}${area ? ` in ${area}` : ""}`;

  const others = items.filter((o) => o.id !== item.id).slice(0, 5);

  return (
    <>
      <Section first>
        <Link
          href={`${base}/materials`}
          className="text-sm text-[#8A836F] hover:text-ink transition-colors"
        >
          &larr; All {word}
        </Link>

        <div className="grid gap-8 md:grid-cols-[1fr_360px] items-start mt-4">
          <div>
            <Eyebrow>{word}</Eyebrow>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">
              {heading}
            </h1>
            {saved.body ? (
              <div className="text-[#6B6558] mt-5 max-w-2xl leading-relaxed whitespace-pre-line">
                {saved.body}
              </div>
            ) : (
              <p className="text-[#6B6558] mt-5 max-w-2xl leading-relaxed">
                We work with {item.name.toLowerCase()} regularly. Use the
                estimator for a real price range on your job, or get in touch and
                we&rsquo;ll talk it through.
              </p>
            )}
          </div>

          <aside className="rounded-xl border border-line bg-white p-6">
            {item.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.photo_url}
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-lg mb-5"
              />
            )}
            {item.base_price ? (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A39C8A]">
                  Starting at
                </p>
                <p className="font-display text-3xl font-semibold tracking-tight mt-1">
                  ${item.base_price}
                  <span className="text-base font-normal text-[#8A836F]">
                    {industry.terms && industry.terms.quantityUnit
                      ? ` / ${industry.terms.quantityUnit}`
                      : ""}
                  </span>
                </p>
              </>
            ) : null}
            {c.estimator.on && (
              <div className="mt-5">
                <CtaButton href={`${base}/estimate`}>
                  Price your job &rarr;
                </CtaButton>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {others.length > 0 && (
        <Section>
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
            Other {word} we work with
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.id}>
                <Link
                  href={`${base}/materials/${itemSlug(o.name)}`}
                  className="inline-block text-sm px-3 py-1.5 rounded-full border border-line bg-white text-[#6B6558] hover:border-[#B08A44] transition-colors"
                >
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
