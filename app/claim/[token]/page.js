import Link from "next/link";
import { getDemoByToken } from "@/lib/claimDemo";
import ClaimClient from "./ClaimClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Demos are unlisted by design — they carry a real business's branding and
// were built without that business asking, so they must not be indexable.
export const metadata = {
  robots: { index: false, follow: false },
};

const MESSAGES = {
  not_found: "This link isn't valid. It may have been mistyped, or the demo may have been taken down.",
  claimed: "This demo has already been claimed. If that was you, log in to pick up where you left off.",
  expired: "This demo has expired. Reply to the email that sent you here and I'll set up a fresh one.",
};

export default async function ClaimPage({ params }) {
  const result = await getDemoByToken(params.token);

  if (result.error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl font-semibold mb-3">Nothing here</h1>
          <p className="text-sm text-[#8A836F] mb-6">{MESSAGES[result.error] || MESSAGES.not_found}</p>
          <Link href="/login" className="text-sm underline">Log in</Link>
        </div>
      </main>
    );
  }

  return <ClaimClient token={params.token} config={result} />;
}
