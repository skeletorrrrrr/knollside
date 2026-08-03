"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/dashboard", label: "Setup" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardNav({ businessName, slug }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newLeads, setNewLeads] = useState(0);

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

  async function logout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="border-b border-line bg-white">
      <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-semibold">{businessName}</div>
          <div className="text-xs text-[#A39C8A] font-mono">/{slug}</div>
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
          <button
            onClick={logout}
            className="text-sm font-medium px-3 py-1.5 rounded-md text-[#8A836F]"
          >
            Log out
          </button>
        </nav>
      </div>
    </div>
  );
}
