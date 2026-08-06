"use client";
import { useEffect, useState } from "react";

const HEALTH = {
  active:      { label: "Active",       color: "#4B6A52" },
  no_leads:    { label: "No leads yet",  color: "#B08A44" },
  not_set_up:  { label: "Not set up",    color: "#B5806B" },
  going_quiet: { label: "Going quiet",   color: "#C0483B" },
  canceled:    { label: "Canceled",      color: "#8A836F" },
};

function fmtDate(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString();
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    fetch("/api/admin")
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || "Not allowed");
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(e.message));
  }

  useEffect(() => { load(); }, []);

  async function deleteBusiness(id) {
    setDeletingId(id);
    const res = await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id }),
    });
    setDeletingId(null);
    setConfirmId(null);
    if (res.ok) {
      setData((d) => ({
        ...d,
        rows: d.rows.filter((r) => r.id !== id),
        summary: { ...d.summary, totalBusinesses: d.summary.totalBusinesses - 1 },
      }));
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Could not delete.");
    }
  }

  if (err) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <h1 className="font-display text-xl font-semibold mb-2">Admin</h1>
        <p className="text-sm text-clay">{err}</p>
        <p className="text-xs text-[#A39C8A] mt-2">This page is restricted to the Knollside owner.</p>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-[#8A836F] p-8">Loading…</p>;

  const { rows, summary } = data;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Knollside — Owner Dashboard</h1>
      <p className="text-sm text-[#8A836F] mb-6">Every business on the platform, at a glance.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Businesses" value={summary.totalBusinesses} />
        <Stat label="Paying / trialing" value={summary.paying} />
        <Stat label="Total leads" value={summary.totalLeads} />
        <Stat label="Never set up" value={summary.notSetUp} />
      </div>

      <div className="overflow-x-auto border border-line rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8A836F] border-b border-line">
              <th className="px-3 py-2">Business</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Leads</th>
              <th className="px-3 py-2">Last lead</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Health</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const h = HEALTH[r.health] || HEALTH.active;
              return (
                <tr
                  key={r.id}
                  className="border-b border-line last:border-0"
                  style={r.isAdmin ? { background: "#FBF3E1" } : undefined}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium flex items-center gap-2">
                      {r.name}
                      {r.isAdmin && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: "#B08A44" }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#A39C8A]">{r.owner_email}</div>
                  </td>
                  <td className="px-3 py-2 capitalize text-[#8A836F]">{(r.industry || "").replace("_", " ")}</td>
                  <td className="px-3 py-2">
                    {r.tier ? (
                      <span className="capitalize">{r.tier} <span className="text-xs text-[#A39C8A]">({r.status})</span></span>
                    ) : (
                      <span className="text-xs text-[#A39C8A]">no plan ({r.status})</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.leadCount}</td>
                  <td className="px-3 py-2 text-[#8A836F]">{fmtDate(r.lastLead)}</td>
                  <td className="px-3 py-2 text-[#8A836F]">{fmtDate(r.created_at)}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: h.color }}>
                      {h.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.isAdmin ? (
                      <span className="text-xs text-[#A39C8A]">—</span>
                    ) : confirmId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => deleteBusiness(r.id)}
                          disabled={deletingId === r.id}
                          className="text-xs font-medium px-2 py-1 rounded-md text-white disabled:opacity-50"
                          style={{ background: "#C0483B" }}
                        >
                          {deletingId === r.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs px-2 py-1 rounded-md text-[#8A836F]"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className="text-xs font-medium px-2 py-1 rounded-md text-clay hover:underline"
                        title="Delete this business"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-[#A39C8A]">No businesses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#A39C8A] mt-4">
        "Health" is a rough signal: <strong>Not set up</strong> = signed up but no items configured ·
        <strong> No leads yet</strong> = configured but no estimates submitted ·
        <strong> Going quiet</strong> = no leads in 30+ days ·
        <strong> Canceled</strong> = subscription ended.
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-line rounded-xl bg-white p-4">
      <div className="text-2xl font-semibold font-mono">{value}</div>
      <div className="text-xs text-[#8A836F]">{label}</div>
    </div>
  );
}
