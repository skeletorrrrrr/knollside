"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TIERS } from "@/lib/pricing";

export default function BillingPage() {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setBusiness(d.business));
  }, []);

  async function subscribe(tier) {
    setLoadingTier(tier.id);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: tier.id }),
    });
    const data = await res.json();
    setLoadingTier(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Something went wrong starting checkout.");
  }

  async function cancelSubscription() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of your current billing period, and your account and data stay intact.")) return;
    setCanceling(true);
    setMsg("");
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    const data = await res.json();
    setCanceling(false);
    if (res.ok) {
      setBusiness((b) => ({ ...b, subscription_status: "canceling" }));
    } else {
      alert(data.error || "Could not cancel.");
    }
  }

  async function reactivate() {
    setReactivating(true);
    const res = await fetch("/api/stripe/reactivate", { method: "POST" });
    const data = await res.json();
    setReactivating(false);
    if (res.ok) {
      setBusiness((b) => ({ ...b, subscription_status: "active" }));
    } else {
      alert(data.error || "Could not reactivate.");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmName }),
    });
    const data = await res.json();
    setDeleting(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert(data.error || "Could not delete account.");
    }
  }

  if (!business) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  const hasPlan = !!business.subscription_tier;
  const hasActiveSub = hasPlan && ["active", "trialing", "canceling"].includes(business.subscription_status);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">Billing</h1>
      {hasPlan ? (
        <p className="text-lg mb-2">
          Current plan: <span className="font-bold text-xl capitalize" style={{ color: "#8F6E32" }}>{business.subscription_tier}</span>{" "}
          <span className="text-sm text-[#8A836F]">({business.subscription_status})</span>
        </p>
      ) : (
        <p className="text-sm text-[#8A836F] mb-2">
          You're on a free trial — choose a plan to keep your estimator live after it ends.
        </p>
      )}
      <p className="text-xs text-[#A39C8A] mb-6">Every plan starts with a 14-day free trial. Cancel anytime.</p>

      {business.subscription_status === "canceling" && (
        <div
          className="mb-5 p-4 rounded-lg flex items-start justify-between gap-4"
          style={{ background: "#FBEAE7", border: "1.5px solid #C0483B" }}
        >
          <div>
            <div className="font-semibold text-sm" style={{ color: "#C0483B" }}>
              ⚠ Your subscription is set to cancel
            </div>
            <div className="text-sm mt-0.5" style={{ color: "#8A4B41" }}>
              You'll keep access until the end of your current billing period, then your estimator
              widget will stop working. Changed your mind?
            </div>
          </div>
          <button
            onClick={reactivate}
            disabled={reactivating}
            className="shrink-0 text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-50"
            style={{ background: "#C0483B" }}
          >
            {reactivating ? "Reactivating…" : "Reactivate"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = business.subscription_tier === tier.id;
          return (
            <div key={tier.id} className="border border-line rounded-xl p-5 bg-white flex flex-col">
              <div className="font-display text-lg font-semibold">{tier.name}</div>
              <div className="text-2xl font-semibold my-1 font-mono">
                ${tier.price}
                <span className="text-sm font-normal text-[#8A836F]">/mo</span>
              </div>
              <p className="text-sm text-[#8A836F] flex-1 mb-4">{tier.blurb}</p>
              <button
                onClick={() => subscribe(tier)}
                disabled={loadingTier === tier.id || isCurrent}
                className="text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
              >
                {isCurrent ? "Current plan" : loadingTier === tier.id ? "Redirecting…" : "Start 14-day trial"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Cancel subscription — low friction, keeps account */}
      {hasActiveSub && business.subscription_status !== "canceling" && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold mb-1">Cancel subscription</h2>
          <p className="text-sm text-[#8A836F] mb-3">
            Stop billing but keep your account and all your data. You'll keep access until the end of your
            current period, and you can resubscribe anytime.
          </p>
          <button
            onClick={cancelSubscription}
            disabled={canceling}
            className="text-sm font-medium px-4 py-2 rounded-md border border-line disabled:opacity-50"
          >
            {canceling ? "Canceling…" : "Cancel subscription"}
          </button>
        </div>
      )}

      {/* Danger zone — delete account */}
      <div className="mt-10 pt-6 border-t" style={{ borderColor: "#E3C9C1" }}>
        <h2 className="font-display text-lg font-semibold mb-1" style={{ color: "#C0483B" }}>Delete account</h2>
        <p className="text-sm text-[#8A836F] mb-3">
          Permanently delete your business, all your pricing setup, leads, uploaded photos, and login.
          This cancels any subscription and cannot be undone.
        </p>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-sm font-medium px-4 py-2 rounded-md text-white"
            style={{ background: "#C0483B" }}
          >
            Delete my account
          </button>
        ) : (
          <div className="p-4 rounded-xl border bg-white max-w-md" style={{ borderColor: "#E3C9C1" }}>
            <p className="text-sm mb-2">
              To confirm, type your business name <strong>{business.name}</strong> below:
            </p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={business.name}
              className="w-full text-sm px-3 py-2 rounded-md border border-line mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleting || confirmName.trim() !== business.name.trim()}
                className="text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-40"
                style={{ background: "#C0483B" }}
              >
                {deleting ? "Deleting…" : "Permanently delete everything"}
              </button>
              <button
                onClick={() => { setShowDelete(false); setConfirmName(""); }}
                className="text-sm font-medium px-4 py-2 rounded-md border border-line"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
