import { getPublicConfig } from "@/lib/publicConfig";
import EmbedWidget from "@/components/EmbedWidget";
import EmbedAutoHeight from "@/components/EmbedAutoHeight";
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
  // No min-h-screen here. Inside an iframe 100vh resolves to the frame's own
  // height, so the page could never measure shorter than the box it's already
  // in — the auto-height would only ever grow. Height must come from content.
  return (
    <div className="bg-stone">
      <EmbedAutoHeight />
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
    <div className="flex items-center justify-center bg-stone px-6 py-24">
      <EmbedAutoHeight />
      <p className="text-sm text-[#8A836F] text-center">{children}</p>
    </div>
  );
}
