import { getPublicConfig } from "@/lib/publicConfig";
import EmbedWidget from "@/components/EmbedWidget";

// Always render fresh — a business's pricing changes must reach their live
// widget immediately, so this page can never be statically cached.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmbedPage({ params }) {
  const config = await getPublicConfig(params.slug);

  if (config.error === "not_found") {
    return <Centered>This estimator doesn't exist.</Centered>;
  }
  if (config.error === "unavailable") {
    return <Centered>This estimator is temporarily unavailable. Please call us for a quote.</Centered>;
  }

  return (
    <div className="bg-stone min-h-screen">
      <EmbedWidget
        business={config.business}
        items={config.items}
        options={config.options}
        addons={config.addons}
      />
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-6">
      <p className="text-sm text-[#8A836F] text-center">{children}</p>
    </div>
  );
}
