"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["new", "contacted", "won", "lost"];
const STATUS_COLOR = {
  new: "#56707A",
  contacted: "#B08A44",
  won: "#4B6A52",
  lost: "#B5806B",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }, []);

  async function updateStatus(id, status) {
    // Acting on a lead also marks it seen (server does this too).
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status, seen: true } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh(); // recount the nav badge
  }

  async function markAllSeen() {
    setLeads((ls) => ls.map((l) => ({ ...l, seen: true })));
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_seen" }),
    });
    router.refresh();
  }

  if (leads === null) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  const unseenCount = leads.filter((l) => !l.seen).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-semibold">Leads</h1>
        {unseenCount > 0 && (
          <button
            onClick={markAllSeen}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-stone-dim text-[#211F1B]"
          >
            Mark all as seen ({unseenCount})
          </button>
        )}
      </div>
      {leads.length === 0 ? (
        <p className="text-sm p-4 rounded-xl border border-dashed border-line text-[#A39C8A]">
          No estimates requested yet. Once your embed is live on your site, submissions land here.
        </p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <div
              key={l.id}
              className="p-3 rounded-xl border bg-white"
              style={{
                borderColor: l.seen ? "#DDD3BF" : "#C0483B",
                borderLeftWidth: l.seen ? "1px" : "3px",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {l.customer_name}
                    {!l.seen && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: "#C0483B" }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#A39C8A]">
                    {l.customer_email}{l.customer_phone ? ` · ${l.customer_phone}` : ""}
                  </div>
                  <div className="text-xs text-[#8A836F] mt-1">
                    {l.item_name}{l.quantity ? `, ${l.quantity}` : ""}{l.option_name ? ` · ${l.option_name}` : ""}
                  </div>
                  {l.comments && (
                    <div className="text-xs text-[#211F1B] mt-1.5 italic border-l-2 border-line pl-2">
                      "{l.comments}"
                    </div>
                  )}
                </div>
                <div className="text-sm font-mono font-semibold text-slab shrink-0">
                  ${Math.round(l.estimate_low).toLocaleString()}–${Math.round(l.estimate_high).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(l.id, s)}
                    className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                    style={{
                      background: l.status === s ? STATUS_COLOR[s] : "#EDE6D6",
                      color: l.status === s ? "white" : "#211F1B",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
