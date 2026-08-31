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

// "2 hrs ago" is the useful form here. Whether a prospect opened their demo
// twenty minutes after the email or four days later is the whole signal.
function ago(s) {
  if (!s) return "";
  const mins = Math.round((Date.now() - new Date(s).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + " hr" + (hrs === 1 ? "" : "s") + " ago";
  const days = Math.round(hrs / 24);
  return days + " day" + (days === 1 ? "" : "s") + " ago";
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(null); // "asc" | "desc" | null (null = default order)
  const [logos, setLogos] = useState({});
  const [confirmOpenId, setConfirmOpenId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [supportLink, setSupportLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [viewLogo, setViewLogo] = useState(null);

  function handleSort(col) {
    if (sortCol !== col) {
      setSortCol(col);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortCol(null);
      setSortDir(null);
    }
  }

  function sortValue(r, col) {
    switch (col) {
      case "name": return (r.name || "").toLowerCase();
      case "industry": return (r.industry || "").toLowerCase();
      case "tier": return r.tier ? r.tier.toLowerCase() : "no plan";
      case "leadCount": return r.leadCount;
      case "lastLead": return r.lastLead ? new Date(r.lastLead).getTime() : -1;
      case "created_at": return new Date(r.created_at).getTime();
      case "health": return (HEALTH[r.health]?.label || r.health || "").toLowerCase();
      // -1 rather than 0 so real businesses sort below a demo nobody opened,
      // instead of tying with it.
      case "claimViews": return r.claimViews === null ? -1 : r.claimViews;
      default: return 0;
    }
  }

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

  // Logos come from a separate endpoint so the main admin route didn't need
  // changing. A failure here is cosmetic — the table falls back to initials.
  useEffect(() => {
    fetch("/api/admin/logos")
      .then((r) => (r.ok ? r.json() : { logos: {} }))
      .then((d) => setLogos(d.logos || {}))
      .catch(() => {});
  }, []);

  // Opening a customer's account. The link is single-use and following it in
  // this browser replaces the admin session, so it's surfaced as an explicit
  // link to open in a private window rather than an automatic redirect.
  async function openAccount(id) {
    setOpeningId(id);
    setSupportLink(null);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id }),
    });
    setOpeningId(null);
    setConfirmOpenId(null);
    const d = await res.json().catch(() => ({}));
    if (res.ok) setSupportLink(d);
    else alert(d.error || "Could not open that account.");
  }

  // Escape closes the logo viewer — expected for anything full-screen.
  useEffect(() => {
    if (!viewLogo) return;
    const onKey = (e) => { if (e.key === "Escape") setViewLogo(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewLogo]);

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

  const { rows: rawRows, summary } = data;
  const rows = sortCol && sortDir
    ? [...rawRows].sort((a, b) => {
        const av = sortValue(a, sortCol);
        const bv = sortValue(b, sortCol);
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : rawRows;

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

      {supportLink && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{ borderColor: "#DCB97A", background: "#FBF3E1" }}
        >
          <div className="text-sm font-semibold mb-1">
            Support access for {supportLink.businessName}
          </div>
          <p className="text-xs text-[#6B6558] mb-1">
            One-time login link for {supportLink.ownerEmail}. This access has been
            logged, and anything you change will look like the customer did it.
          </p>
          <p className="text-xs font-semibold mb-3" style={{ color: "#8F6E32" }}>
            Copy it, then paste it into a private/incognito window. The link works
            exactly once — opening it in this window burns it and signs you out of
            your own account.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(supportLink.url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                } catch {
                  alert(supportLink.url);
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-md text-white"
              style={{ background: "#B08A44" }}
            >
              {copied ? "Copied ✓" : "Copy login link"}
            </button>
            <button
              onClick={() => setSupportLink(null)}
              className="text-xs font-medium px-2 py-1.5 rounded-md text-[#8A836F]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-line rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8A836F] border-b border-line">
              <SortHeader label="Business" col="name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Industry" col="industry" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Plan" col="tier" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Leads" col="leadCount" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Last lead" col="lastLead" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Joined" col="created_at" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Demo views" col="claimViews" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Health" col="health" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const h = HEALTH[r.health] || HEALTH.active;
              return (
                <tr
                  key={r.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-[#FAF7F0]"
                  style={r.isAdmin ? { background: "#FBF3E1" } : undefined}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Logo src={logos[r.id]} name={r.name} onOpen={setViewLogo} />
                      <div className="min-w-0">
                        <div className="font-medium flex items-center gap-2">
                          <span className="truncate" style={{ maxWidth: 190 }} title={r.name}>{r.name}</span>
                          {r.isAdmin && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                              style={{ background: "#B08A44" }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#A39C8A] truncate" style={{ maxWidth: 210 }} title={r.owner_email}>
                          {r.owner_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 capitalize text-[#8A836F] whitespace-nowrap">{(r.industry || "").replace("_", " ")}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.tier ? (
                      <span className="block">
                        <span className="capitalize font-medium">{r.tier}</span>
                        <span className="block text-xs text-[#A39C8A] capitalize">{r.status}</span>
                      </span>
                    ) : (
                      <span className="block">
                        <span className="block text-[#A39C8A]">No plan</span>
                        <span className="block text-xs text-[#A39C8A] capitalize">{r.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-right tabular-nums">{r.leadCount}</td>
                  <td className="px-3 py-3 text-[#8A836F] whitespace-nowrap">{fmtDate(r.lastLead)}</td>
                  <td className="px-3 py-3 text-[#8A836F] whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.claimViews === null ? (
                      <span className="text-xs text-[#A39C8A]">&mdash;</span>
                    ) : r.claimViews === 0 ? (
                      <span className="text-xs text-[#A39C8A]">Not opened</span>
                    ) : (
                      <span className="block">
                        <span className="font-mono tabular-nums font-medium" style={{ color: "#4B6A52" }}>
                          {r.claimViews}
                        </span>
                        <span className="block text-xs text-[#A39C8A]">{ago(r.claimLastViewed)}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: h.color }}>
                      <span className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: h.color }} />
                      {h.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
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
                    ) : confirmOpenId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openAccount(r.id)}
                          disabled={openingId === r.id}
                          className="text-xs font-medium px-2 py-1 rounded-md text-white disabled:opacity-50"
                          style={{ background: "#B08A44" }}
                        >
                          {openingId === r.id ? "Opening…" : "Get link"}
                        </button>
                        <button
                          onClick={() => setConfirmOpenId(null)}
                          className="text-xs px-2 py-1 rounded-md text-[#8A836F]"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => { setConfirmOpenId(r.id); setConfirmId(null); }}
                          className="text-xs font-medium px-2 py-1 rounded-md hover:underline"
                          style={{ color: "#8F6E32" }}
                          title="Open this customer's account for support"
                        >
                          Open
                        </button>
                        <span style={{ color: "#EDE6D6" }}>|</span>
                        <button
                          onClick={() => { setConfirmId(r.id); setConfirmOpenId(null); }}
                          className="text-xs font-medium px-2 py-1 rounded-md text-clay hover:underline"
                          title="Delete this business"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-6 text-center text-[#A39C8A]">No businesses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewLogo && (
        <div
          onClick={() => setViewLogo(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: "rgba(33,31,27,0.82)" }}
        >
          <img
            src={viewLogo.src}
            alt={`${viewLogo.name} logo`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg bg-white"
            style={{ maxWidth: "90vw", maxHeight: "78vh", objectFit: "contain", padding: 12 }}
          />
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-white">{viewLogo.name}</div>
            <button
              onClick={() => setViewLogo(null)}
              className="mt-2 text-xs px-3 py-1.5 rounded-md"
              style={{ background: "rgba(255,255,255,0.15)", color: "#F7F3EA" }}
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-[#A39C8A] mt-4">
        "Health" is a rough signal: <strong>Not set up</strong> = signed up but no items configured ·
        <strong> No leads yet</strong> = configured but no estimates submitted ·
        <strong> Going quiet</strong> = no leads in 30+ days ·
        <strong> Canceled</strong> = subscription ended.
      </p>
    </div>
  );
}

function SortHeader({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <th className="px-3 py-2.5 whitespace-nowrap">
      <button
        onClick={() => onSort(col)}
        className="flex items-center gap-1 font-medium uppercase transition-colors"
        style={{ color: active ? "#211F1B" : "#8A836F", fontSize: "11px", letterSpacing: "0.06em" }}
      >
        {label}
        <span style={{ opacity: active ? 1 : 0.35, fontSize: "10px" }}>
          {active && sortDir === "asc" ? "▲" : active && sortDir === "desc" ? "▼" : "↕"}
        </span>
      </button>
    </th>
  );
}

function Logo({ src, name, onOpen }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (src && !failed) {
    return (
      <button
        type="button"
        onClick={() => onOpen({ src, name })}
        className="flex-shrink-0 rounded-md border bg-white overflow-hidden hover:opacity-80"
        style={{ width: 30, height: 30, borderColor: "#EDE6D6" }}
        title={`View ${name} logo`}
      >
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      </button>
    );
  }
  // No logo uploaded — initials aren't worth a lightbox, so this stays inert.
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center rounded-md text-xs font-semibold"
      style={{ width: 30, height: 30, background: "#EDE6D6", color: "#8A836F" }}
    >
      {initial}
    </span>
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
