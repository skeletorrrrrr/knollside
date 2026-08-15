"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/dashboard", label: "Setup" },
  { href: "/dashboard/industry", label: "Industry" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardNav({ businessName, slug, logoUrl }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newLeads, setNewLeads] = useState(0);
  // Log out is a one-click action with a real cost — it used to sit right next
  // to the nav links in the same neutral grey, so a curious click signed you
  // straight out. Now it's visually separated and asks first.
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Count leads still in "new" status so the badge reflects unactioned ones.
  // Recounts on navigation, when the tab regains focus, and every 60s — so a
  // new lead arriving (or one being actioned) shows up without a manual reload.
  useEffect(() => {
    let active = true;
    function refreshCount() {
      fetch("/api/leads")
        .then((r) => r.json())
        .then((d) => {
          if (!active) return;
          const count = (d.leads || []).filter((l) => !l.seen).length;
          setNewLeads(count);
        })
        .catch(() => {});
    }
    refreshCount();
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(refreshCount, 60000);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [pathname]);

  // Navigating away cancels a pending confirmation, so you don't come back to
  // a different page with a half-armed log out button waiting.
  useEffect(() => {
    setConfirmLogout(false);
  }, [pathname]);

  async function logout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="border-b border-line bg-white">
      <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl && (
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-auto max-w-[140px] object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="font-display font-semibold truncate">{businessName}</div>
            <div className="text-xs text-[#A39C8A] font-mono truncate">/{slug}</div>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const isLeads = l.href === "/dashboard/leads";
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-sm font-medium px-3 py-1.5 rounded-md"
                style={{
                  background: pathname === l.href ? "#EDE6D6" : "transparent",
                  color: "#211F1B",
                }}
              >
                {l.label}
                {isLeads && newLeads > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-white font-semibold"
                    style={{ background: "#C0483B", fontSize: "10px", lineHeight: 1 }}
                  >
                    {newLeads > 99 ? "99+" : newLeads}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider makes it clear this button isn't another nav tab. */}
          <span className="mx-2 h-5 w-px" style={{ background: "#EDE6D6" }} />

          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="text-sm font-medium px-3 py-1.5 rounded-md border"
              style={{ color: "#B5806B", borderColor: "#E6D3CB" }}
            >
              Log out
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#6B6558] hidden sm:inline">
                Log out?
              </span>
              <button
                onClick={logout}
                className="text-sm font-semibold px-3 py-1.5 rounded-md text-white"
                style={{ background: "#C0483B" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="text-sm font-medium px-3 py-1.5 rounded-md text-[#8A836F]"
              >
                Cancel
              </button>
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
