// Turns a customer's saved theme into CSS variables, a Google Fonts URL and a
// scoped style block. Everything here treats the stored values as untrusted:
// the font name ends up inside a URL and the colours end up inside a <style>
// block, so both are validated rather than interpolated as-is.

const DEFAULTS = {
  fontDisplay: "Fraunces",
  fontBody: "Inter",
  bg: "#F7F3EA",
  surface: "#FFFFFF",
  ink: "#211F1B",
  body: "#6B6558",
  line: "#DDD3BF",
  accent: "#B08A44",
};

// Families that ship with the app already, so they need no extra request.
const PRELOADED = ["Fraunces", "Inter", "IBM Plex Mono"];

function hex(v, fallback) {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : fallback;
}

// Letters, numbers and single spaces only. This string is concatenated into a
// fonts.googleapis.com URL — without this, the font field is a way to point a
// stylesheet link anywhere.
function fontName(v, fallback) {
  if (typeof v !== "string") return fallback;
  const s = v.trim().replace(/\s+/g, " ");
  if (!s || s.length > 40) return fallback;
  return /^[A-Za-z0-9 ]+$/.test(s) ? s : fallback;
}

// Lighten or darken a hex colour by mixing toward white or black. Used so a
// customer picks one accent and still gets a gradient and a hover shade that
// belong together.
function shift(hexColor, amount) {
  const n = parseInt(hexColor.slice(1), 16);
  const to = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const mix = (c) => Math.round(c + (to - c) * t);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Rough relative luminance, enough to decide whether text on this colour
// should be black or white.
function isLight(hexColor) {
  const n = parseInt(hexColor.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) > 0.5;
}

export function themeStyle(raw) {
  const t = raw && typeof raw === "object" ? raw : {};

  const fontDisplay = fontName(t.fontDisplay, DEFAULTS.fontDisplay);
  const fontBody = fontName(t.fontBody, DEFAULTS.fontBody);
  const bg = hex(t.bg, DEFAULTS.bg);
  const surface = hex(t.surface, DEFAULTS.surface);
  const ink = hex(t.ink, DEFAULTS.ink);
  const body = hex(t.body, DEFAULTS.body);
  const line = hex(t.line, DEFAULTS.line);
  const accent = hex(t.accent, DEFAULTS.accent);

  const vars = {
    "--site-bg": bg,
    "--site-surface": surface,
    "--site-ink": ink,
    "--site-body": body,
    "--site-muted": shift(body, 0.18),
    "--site-faint": shift(body, 0.34),
    "--site-line": line,
    "--site-accent": accent,
    "--site-accent-deep": shift(accent, -0.22),
    "--site-accent-light": shift(accent, 0.16),
    // Text sitting on the dark call-out panels.
    "--site-on-dark-muted": isLight(ink) ? shift(ink, -0.45) : shift(ink, 0.62),
    color: body,
  };

  const families = [fontDisplay, fontBody].filter(
    (f, i, arr) => arr.indexOf(f) === i && !PRELOADED.includes(f)
  );
  const fontHref = families.length
    ? "https://fonts.googleapis.com/css2?" +
      families
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
        .join("&") +
      "&display=swap"
    : "";

  // Scoped to .site-scope so a customer's fonts never leak into the Knollside
  // dashboard or marketing pages rendered by the same app.
  const css = `
.site-scope { font-family: "${fontBody}", system-ui, sans-serif; }
.site-scope .font-display { font-family: "${fontDisplay}", Georgia, serif; }
.site-scope .font-body { font-family: "${fontBody}", system-ui, sans-serif; }
`.trim();

  return { vars, css, fontHref, resolved: { fontDisplay, fontBody, bg, surface, ink, body, line, accent } };
}

export const THEME_DEFAULTS = DEFAULTS;
