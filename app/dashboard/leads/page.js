"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["new", "contacted", "won", "lost"];
const STATUS_COLOR = {
  new: "#56707A",
  contacted: "#B08A44",
  won: "#4B6A52",
  lost: "#B5806B",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "value", label: "Biggest job" },
  { id: "name", label: "Name A\u2013Z" },
];

function money(n) {
  return "$" + Math.round(n || 0).toLocaleString();
}

function whenText(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [openId, setOpenId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [savingNote, setSavingNote] = useState(null);
  // Deleting is the one thing here that can't be undone, so it takes two taps.
  // Armed per-lead rather than globally, and cleared when the card closes.
  const [confirmDelete, setConfirmDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }, []);

  async function patchLead(id, body, optimistic) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...optimistic } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  function updateStatus(id, status) {
    patchLead(id, { status }, { status, seen: status !== "new" });
  }

  // Opening a lead is the same thing as reading it, so the red flag clears
  // itself. Making someone tap a separate "mark as read" is the kind of admin
  // nobody does, and then every lead looks new forever.
  function toggleOpen(lead) {
    const next = openId === lead.id ? null : lead.id;
    setOpenId(next);
    setConfirmDelete(null);
    if (next && !lead.seen) {
      patchLead(lead.id, { seen: true }, { seen: true });
    }
  }

  // Autosave on blur rather than a Save button. This is a scratchpad — "quoted,
  // waiting on callback" — and a form that needs submitting won't get used.
  async function saveNote(id) {
    const value = noteDrafts[id];
    if (value === undefined) return;
    const current = leads.find((l) => l.id === id);
    if (current && (current.notes || "") === value) return;
    setSavingNote(id);
    await patchLead(id, { notes: value }, { notes: value });
    setSavingNote(null);
  }

  async function deleteLead(id) {
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setOpenId(null);
    setConfirmDelete(null);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.refresh();
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

  const counts = useMemo(() => {
    const c = { all: 0, new: 0, contacted: 0, won: 0, lost: 0 };
    (leads || []).forEach((l) => {
      c.all += 1;
      if (c[l.status] !== undefined) c[l.status] += 1;
    });
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    let out = [...(leads || [])];
    if (filter !== "all") out = out.filter((l) => l.status === filter);
    out.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "value") return (b.estimate_high || 0) - (a.estimate_high || 0);
      if (sort === "name")
        return String(a.customer_name || "").localeCompare(String(b.customer_name || ""));
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return out;
  }, [leads, filter, sort]);

  if (leads === null) return <p className="text-sm text-[#8A836F]">Loading…</p>;

  const unseenCount = leads.filter((l) => !l.seen).length;

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-display text-xl font-semibold">Leads</h1>
        {unseenCount > 0 && (
          <button
            onClick={markAllSeen}
            className="text-xs font-medium px-3 py-2 rounded-md bg-stone-dim text-[#211F1B]"
          >
            Mark all seen ({unseenCount})
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <p className="text-sm p-4 rounded-xl border border-dashed border-line text-[#A39C8A]">
          No estimates requested yet. Once your estimator is live on your site,
          they land here.
        </p>
      ) : (
        <>
          {/* Filters scroll sideways rather than wrapping — on a phone a
              wrapped row of chips pushes the actual leads off the screen. */}
          <div className="-mx-5 px-5 overflow-x-auto mb-3">
            <div className="flex gap-2 w-max">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="text-sm font-medium px-3.5 py-2 rounded-full whitespace-nowrap border"
                  style={{
                    background: filter === f.id ? "#211F1B" : "white",
                    color: filter === f.id ? "#F7F3EA" : "#6B6558",
                    borderColor: filter === f.id ? "#211F1B" : "#DDD3BF",
                  }}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-60">{counts[f.id]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mb-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm px-3 py-2 rounded-md border border-line bg-white"
              aria-label="Sort leads"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm p-4 rounded-xl border border-dashed border-line text-[#A39C8A]">
              Nothing in {FILTERS.find((f) => f.id === filter).label.toLowerCase()}.
            </p>
          ) : (
            <div className="space-y-2.5">
              {visible.map((l) => {
                const open = openId === l.id;
                const draft = noteDrafts[l.id] !== undefined ? noteDrafts[l.id] : l.notes || "";
                return (
                  <div
                    key={l.id}
                    className="rounded-xl border bg-white overflow-hidden"
                    style={{
                      borderColor: l.seen ? "#DDD3BF" : "#C0483B",
                      borderLeftWidth: l.seen ? "1px" : "4px",
                    }}
                  >
                    {/* Whole row is the tap target, not a small chevron. */}
                    <button
                      onClick={() => toggleOpen(l)}
                      className="w-full text-left p-4 flex items-start justify-between gap-3"
                      aria-expanded={open}
                    >
                      <div className="min-w-0">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
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
                        <div className="text-sm text-[#8A836F] mt-0.5 truncate">
                          {l.item_name}
                          {l.quantity ? `, ${l.quantity}` : ""}
                        </div>
                        <div className="text-xs text-[#A39C8A] mt-1">
                          {whenText(l.created_at)}
                          {l.status && l.status !== "new" ? (
                            <>
                              {" · "}
                              <span style={{ color: STATUS_COLOR[l.status] }}>
                                {l.status}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-semibold text-slab">
                          {money(l.estimate_low)}–{money(l.estimate_high)}
                        </div>
                        <div className="text-xs text-[#A39C8A] mt-1">
                          {open ? "Close" : "Open"}
                        </div>
                      </div>
                    </button>

                    {open && (
                      <div className="px-4 pb-4 border-t border-line pt-4 space-y-4">
                        {/* Calling and texting are the two things they will
                            actually do, so they get real buttons rather than a
                            phone number to copy out on a dusty screen. */}
                        <div className="flex flex-wrap gap-2">
                          {l.customer_phone && (
                            <>
                              <a
                                href={`tel:${String(l.customer_phone).replace(/[^0-9+]/g, "")}`}
                                className="flex-1 min-w-[120px] text-center text-sm font-semibold px-4 py-3 rounded-md text-white"
                                style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
                              >
                                Call {l.customer_phone}
                              </a>
                              <a
                                href={`sms:${String(l.customer_phone).replace(/[^0-9+]/g, "")}`}
                                className="text-sm font-medium px-4 py-3 rounded-md border border-line"
                              >
                                Text
                              </a>
                            </>
                          )}
                          {l.customer_email && (
                            <a
                              href={`mailto:${l.customer_email}`}
                              className="text-sm font-medium px-4 py-3 rounded-md border border-line break-all"
                            >
                              Email
                            </a>
                          )}
                        </div>

                        <dl className="text-sm space-y-1.5">
                          {l.customer_email && (
                            <div className="flex gap-2">
                              <dt className="text-[#A39C8A] w-20 shrink-0">Email</dt>
                              <dd className="break-all">{l.customer_email}</dd>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <dt className="text-[#A39C8A] w-20 shrink-0">Wants</dt>
                            <dd>
                              {l.item_name}
                              {l.quantity ? `, ${l.quantity}` : ""}
                              {l.option_name ? ` · ${l.option_name}` : ""}
                            </dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-[#A39C8A] w-20 shrink-0">Quoted</dt>
                            <dd className="font-mono">
                              {money(l.estimate_low)}–{money(l.estimate_high)}
                            </dd>
                          </div>
                        </dl>

                        {l.comments && (
                          <div className="text-sm text-[#211F1B] italic border-l-2 border-line pl-3">
                            &ldquo;{l.comments}&rdquo;
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-[#8A836F]">
                            Your notes
                            {savingNote === l.id && (
                              <span className="ml-2 text-[#A39C8A]">saving…</span>
                            )}
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Quoted, waiting on callback…"
                            value={draft}
                            onChange={(e) =>
                              setNoteDrafts((d) => ({ ...d, [l.id]: e.target.value }))
                            }
                            onBlur={() => saveNote(l.id)}
                            className="w-full text-sm px-3 py-2.5 rounded-lg border border-line bg-white outline-none focus:ring-2 focus:ring-[#B08A44]/30 focus:border-[#B08A44]"
                          />
                        </div>

                        <div>
                          <div className="text-xs font-medium mb-1.5 text-[#8A836F]">
                            Where it got to
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(l.id, s)}
                                className="text-sm py-2.5 rounded-md font-medium capitalize"
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

                        {/* Spam and duplicates happen, and a list you can never
                            tidy stops being worth opening. Set apart from the
                            status buttons so a stray thumb doesn't find it. */}
                        <div className="pt-3 border-t border-line">
                          {confirmDelete === l.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-[#6B6558]">
                                Delete this lead for good?
                              </span>
                              <button
                                onClick={() => deleteLead(l.id)}
                                className="text-sm font-semibold px-4 py-2 rounded-md text-white"
                                style={{ background: "#C0483B" }}
                              >
                                Yes, delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-sm font-medium px-4 py-2 rounded-md text-[#8A836F]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(l.id)}
                              className="text-sm font-medium"
                              style={{ color: "#B5806B" }}
                            >
                              Delete this lead
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
