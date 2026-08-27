import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteBySlug, itemSlug } from "@/lib/siteContent";
import { getIndustry } from "@/lib/industries";
import { Section, PageHeader, NotFoundBody } from "@/components/SiteBits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return { title: "Not found" };
  const industry = getIndustry(site.business.industry);
  const word = (industry.terms && industry.terms.items) || "services";
  const area = (site.content.areas.places || [])[0];
  return {
    title: `${word.replace(/^./, (c) => c.toUpperCase())}${
      area ? ` in ${area}` : ""
    } \u2014 ${site.business.name}`,
  };
}

export default async function MaterialsIndex({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return <NotFoundBody />;

  const { business, content: c, items } = site;
  if (items.length === 0) notFound();

  const base = `/site/${business.slug}`;

  return (
    <Section first>
      <PageHeader
        eyebrow={c.services.eyebrow}
        title={c.services.headline}
        intro={c.services.intro}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`${base}/materials/${itemSlug(it.name)}`}
            className="rounded-xl border border-[var(--site-line)] bg-[var(--site-surface)] overflow-hidden hover:border-[var(--site-accent)] transition-colors"
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
              <h2 className="font-display text-lg font-semibold">{it.name}</h2>
              {it.base_price ? (
                <p className="text-sm text-[color:var(--site-muted)] mt-1 font-mono">
                  From ${it.base_price}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
