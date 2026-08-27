import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/siteContent";
import EmbedWidget from "@/components/EmbedWidget";
import { Cards, Section, PageHeader, NotFoundBody } from "@/components/SiteBits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLES = {
  about: "About",
  gallery: "Gallery",
  contact: "Contact",
  estimate: "Get an estimate",
};

export async function generateMetadata({ params }) {
  const site = await getSiteBySlug(params.slug);
  if (site.error) return { title: "Not found" };
  const label = TITLES[params.page];
  if (!label) return { title: site.business.name };
  return { title: `${label} \u2014 ${site.business.name}` };
}

export default async function SiteSubPage({ params }) {
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

  const { business, content: c, items, options, addons } = site;
  const page = params.page;

  if (!TITLES[page]) notFound();

  if (page === "estimate") {
    if (!c.estimator.on) notFound();
    return (
      <Section first>
        <PageHeader
          eyebrow={c.estimator.eyebrow}
          title={c.estimator.headline}
          intro={c.estimator.intro}
        />
        <div className="rounded-xl border border-line bg-white p-4 sm:p-6">
          <EmbedWidget
            business={business}
            items={items}
            options={options}
            addons={addons}
          />
        </div>
      </Section>
    );
  }

  if (page === "gallery") {
    const photos = (c.gallery.photos || []).filter(Boolean);
    if (!c.gallery.on || photos.length === 0) notFound();
    return (
      <Section first>
        <PageHeader eyebrow={c.gallery.eyebrow} title={c.gallery.headline} />
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {photos.map((src, i) => (
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
      </Section>
    );
  }

  if (page === "about") {
    if (!c.why.on) notFound();
    return (
      <>
        <Section first>
          <PageHeader
            eyebrow={c.why.eyebrow}
            title={c.why.headline}
            intro={c.why.intro}
          />
          <Cards cards={c.why.cards} />
        </Section>
        {c.process.on && (
          <Section>
            <PageHeader
              eyebrow={c.process.eyebrow}
              title={c.process.headline}
              intro={c.process.intro}
            />
            <Cards cards={c.process.cards} />
          </Section>
        )}
        {c.areas.on && (c.areas.places || []).length > 0 && (
          <Section>
            <PageHeader eyebrow={c.areas.eyebrow} title={c.areas.headline} />
            <ul className="flex flex-wrap gap-2">
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
      </>
    );
  }

  // contact
  if (!c.contact.on) notFound();
  const rows = [
    ["Phone", c.contact.phone, `tel:${String(c.contact.phone || "").replace(/[^0-9+]/g, "")}`],
    ["Email", c.contact.email, `mailto:${c.contact.email}`],
    ["Where we are", c.contact.address, null],
    ["Hours", c.contact.hours, null],
  ].filter((r) => r[1]);

  return (
    <Section first>
      <PageHeader
        eyebrow={c.contact.eyebrow}
        title={c.contact.headline}
        intro={c.contact.intro}
      />
      <dl className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        {rows.map(([label, value, href]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-[#A39C8A] mb-1">
              {label}
            </dt>
            <dd>
              {href ? (
                <a href={href} className="font-medium" style={{ color: "#8F6E32" }}>
                  {value}
                </a>
              ) : (
                <span className="text-sm text-[#6B6558] whitespace-pre-line">
                  {value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
