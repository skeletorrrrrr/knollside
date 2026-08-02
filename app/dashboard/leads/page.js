"use client";
import { useEffect, useState } from "react";

const STATUSES = ["new", "contacted", "won", "lost"];
const STATUS_COLOR = {
  new: "#56707A",
  contacted: "#B08A44",
  won: "#4B6A52",
  lost: "#B5806B",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }, []);

  async function updateStatus(id, status) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  if (leads === null) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-4">Leads</h1>
      {leads.length === 0 ? (
        <p className="text-sm p-4 rounded-xl border border-dashed border-line text-[#A39C8A]">
          No estimates requested yet. Once your embed is live on your site, submissions land here.
        </p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <div key={l.id} className="p-3 rounded-xl border border-line bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{l.customer_name}</div>
                  <div className="text-xs text-[#A39C8A]">
                    {l.customer_email}{l.customer_phone ? ` · ${l.customer_phone}` : ""}
                  </div>
                  <div className="text-xs text-[#8A836F] mt-1">
                    {l.item_name}{l.quantity ? `, ${l.quantity}` : ""}{l.option_name ? ` · ${l.option_name}` : ""}
                  </div>
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
