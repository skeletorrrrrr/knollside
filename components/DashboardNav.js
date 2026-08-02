"use client";
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
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium px-3 py-1.5 rounded-md"
              style={{
                background: pathname === l.href ? "#EDE6D6" : "transparent",
                color: "#211F1B",
              }}
            >
              {l.label}
            </Link>
          ))}
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
