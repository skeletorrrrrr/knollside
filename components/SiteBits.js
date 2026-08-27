import Link from "next/link";

export function Eyebrow({ children }) {
  if (!children) return null;
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.14em] mb-2"
      style={{ color: "#8F6E32" }}
    >
      {children}
    </p>
  );
}

export function Cards({ cards }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {cards.map((c, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-6">
          <h3 className="font-display text-lg font-semibold">{c.title}</h3>
          {c.body && (
            <p className="text-sm text-[#6B6558] leading-relaxed mt-2">{c.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }) {
  return (
    <div className="mb-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl leading-[1.15]">
        {title}
      </h1>
      {intro && (
        <p className="text-[#6B6558] mt-4 max-w-2xl leading-relaxed">{intro}</p>
      )}
    </div>
  );
}

export function Section({ children, first }) {
  return (
    <section
      className={
        "max-w-5xl mx-auto px-5 py-14" + (first ? "" : " border-t border-line")
      }
    >
      {children}
    </section>
  );
}

export function CtaButton({ href, children, light }) {
  return (
    <Link
      href={href}
      className="inline-block text-sm font-medium px-5 py-3 rounded-md"
      style={
        light
          ? { background: "#F7F3EA", color: "#211F1B" }
          : { background: "linear-gradient(135deg, #C39A55, #8F6E32)", color: "#fff" }
      }
    >
      {children}
    </Link>
  );
}

export function NotFoundBody({ message }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone px-6">
      <p className="text-sm text-[#8A836F] text-center">
        {message || "Nothing here."}
      </p>
    </main>
  );
}
