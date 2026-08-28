import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";

// Every string the customer can put on their own site passes through here, so
// this is where the shape gets enforced. The renderer trusts what it reads out
// of site_content, which means anything not validated here ends up on a live
// page — hence the whitelist rather than storing the body as-is.

const MAX_STR = 2000;
const MAX_LIST = 40;

function str(v, max = MAX_STR) {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
}

function bool(v) {
  return v === true;
}

// Sections the customer never toggled arrive as undefined. Treating that as
// false would switch off why-us, process, services, the estimator and contact
// the first time anyone pressed Save, because those default to on in the
// renderer. Absent has to mean "leave it as it was".
// A hostname, not a URL. Rejecting anything with a scheme, path or port keeps
// this out of trouble — the value is compared against a Host header, so a
// stray "https://" would simply never match and look like a broken site.
function domain(v) {
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  const d = v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  if (!d) return null;
  if (d.length > 253) return undefined;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d) ? d : undefined;
}

function boolDefault(v, dflt) {
  if (v === undefined || v === null) return dflt;
  return v === true;
}

function list(v, fn) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, MAX_LIST).map(fn).filter(Boolean);
}

// Only http(s) images. A javascript: or data: URL in an <img src> is the
// obvious way to turn "edit your own gallery" into something worse.
function imageUrl(v) {
  const s = str(v, 500).trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}

function card(v) {
  if (!v || typeof v !== "object") return null;
  const title = str(v.title, 120).trim();
  const body = str(v.body, 800).trim();
  if (!title && !body) return null;
  return { title, body };
}

function quote(v) {
  if (!v || typeof v !== "object") return null;
  const text = str(v.quote, 800).trim();
  if (!text) return null;
  return {
    quote: text,
    name: str(v.name, 80).trim(),
    source: str(v.source, 60).trim(),
  };
}

function clean(raw) {
  const c = raw && typeof raw === "object" ? raw : {};
  const sec = (k) => (c[k] && typeof c[k] === "object" ? c[k] : {});

  const out = {
    hero: {
      eyebrow: str(sec("hero").eyebrow, 120),
      headline: str(sec("hero").headline, 200),
      sub: str(sec("hero").sub, 600),
      cta: str(sec("hero").cta, 60),
    },
    why: {
      on: boolDefault(sec("why").on, true),
      eyebrow: str(sec("why").eyebrow, 120),
      headline: str(sec("why").headline, 200),
      intro: str(sec("why").intro, 800),
      cards: list(sec("why").cards, card),
    },
    services: {
      on: boolDefault(sec("services").on, true),
      eyebrow: str(sec("services").eyebrow, 120),
      headline: str(sec("services").headline, 200),
      intro: str(sec("services").intro, 800),
    },
    process: {
      on: boolDefault(sec("process").on, true),
      eyebrow: str(sec("process").eyebrow, 120),
      headline: str(sec("process").headline, 200),
      intro: str(sec("process").intro, 800),
      cards: list(sec("process").cards, card),
    },
    gallery: {
      on: boolDefault(sec("gallery").on, false),
      eyebrow: str(sec("gallery").eyebrow, 120),
      headline: str(sec("gallery").headline, 200),
      photos: list(sec("gallery").photos, imageUrl),
    },
    reviews: {
      on: boolDefault(sec("reviews").on, false),
      eyebrow: str(sec("reviews").eyebrow, 120),
      headline: str(sec("reviews").headline, 200),
      quotes: list(sec("reviews").quotes, quote),
    },
    estimator: {
      on: boolDefault(sec("estimator").on, true),
      eyebrow: str(sec("estimator").eyebrow, 120),
      headline: str(sec("estimator").headline, 200),
      intro: str(sec("estimator").intro, 800),
    },
    areas: {
      on: boolDefault(sec("areas").on, false),
      eyebrow: str(sec("areas").eyebrow, 120),
      headline: str(sec("areas").headline, 200),
      intro: str(sec("areas").intro, 800),
      places: list(sec("areas").places, (p) => str(p, 60).trim()),
    },
    contact: {
      on: boolDefault(sec("contact").on, true),
      eyebrow: str(sec("contact").eyebrow, 120),
      headline: str(sec("contact").headline, 200),
      intro: str(sec("contact").intro, 800),
      phone: str(sec("contact").phone, 40),
      email: str(sec("contact").email, 160),
      address: str(sec("contact").address, 300),
      hours: str(sec("contact").hours, 300),
    },
    // Stored as-is; lib/siteTheme.js validates every value again at render
    // time, because that is where a bad colour or font name would actually do
    // damage. Keeping both means a row edited directly in the database can't
    // put an arbitrary string into a stylesheet URL either.
    theme: {
      fontDisplay: str(sec("theme").fontDisplay, 40),
      fontBody: str(sec("theme").fontBody, 40),
      bg: str(sec("theme").bg, 7),
      surface: str(sec("theme").surface, 7),
      ink: str(sec("theme").ink, 7),
      body: str(sec("theme").body, 7),
      line: str(sec("theme").line, 7),
      accent: str(sec("theme").accent, 7),
    },
    materials: {},
  };

  const mats = sec("materials");
  for (const key of Object.keys(mats).slice(0, 60)) {
    const m = mats[key] || {};
    out.materials[str(key, 60)] = {
      title: str(m.title, 200),
      headline: str(m.headline, 200),
      body: str(m.body, 4000),
    };
  }

  return out;
}

export async function PATCH(request) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getOrCreateBusiness(supabase, user);

  // The website is a Pro thing. Checking it here rather than only hiding the
  // tab matters — the tab is just markup, this is the actual gate.
  if (business.subscription_tier !== "pro") {
    return NextResponse.json(
      { error: "A website is included with Pro. Upgrade to switch it on." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const patch = {};
  if (body.site_enabled !== undefined) patch.site_enabled = bool(body.site_enabled);
  if (body.custom_domain !== undefined) {
    const d = domain(body.custom_domain);
    if (d === undefined) {
      return NextResponse.json(
        { error: "That doesn't look like a domain. Enter it like yourshop.com — no https, no slashes." },
        { status: 400 }
      );
    }
    patch.custom_domain = d;
  }
  if (body.site_content !== undefined) patch.site_content = clean(body.site_content);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("businesses")
    .update(patch)
    .eq("id", business.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ business: data });
}
