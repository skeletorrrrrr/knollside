"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  // At the top of the page the hero already shows the logo, so repeating it in
  // the bar is noise. Once that logo has scrolled away the bar picks it up.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Two thresholds instead of one. With a single value, a scroll that rests
    // near it flickers the logo on and off as the number wobbles by a pixel.
    // It now needs 160 to appear and has to drop below 100 to leave.
    const onScroll = () =>
      setScrolled((was) => (was ? window.scrollY > 100 : window.scrollY > 160));
    onScroll();
    // passive: this listener never calls preventDefault, and saying so lets the
    // browser keep scrolling smooth instead of waiting on it.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-30 -mx-5 px-5 mb-10 border-b border-line"
      style={{ background: "rgba(247,243,234,0.94)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between gap-4 py-3">
        {/* Fixed width so the links don't shift sideways when the logo appears.
            Overflow hidden is what makes it read as sliding up from behind the
            bar rather than just fading in. */}
        <div className="shrink-0 overflow-hidden" style={{ width: 124, height: 32 }}>
          <Link
            href="/"
            aria-label="Knollside"
            className="block"
            // aria-hidden and inert rather than visibility:hidden. Toggling
            // visibility cannot be transitioned, so scrolling back up used to
            // snap the logo away instead of sliding it. These keep it out of
            // the tab order and off screen readers while it animates out.
            aria-hidden={!scrolled}
            tabIndex={scrolled ? 0 : -1}
            style={{
              transform: scrolled ? "translateY(0)" : "translateY(120%)",
              opacity: scrolled ? 1 : 0,
              // Same easing and duration both ways, so up feels like down.
              transition: "transform .3s cubic-bezier(.4,0,.2,1), opacity .3s cubic-bezier(.4,0,.2,1)",
              pointerEvents: scrolled ? "auto" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/knollside-logo.png" alt="Knollside" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Padding and a hover fill so these read as things you press. Plain
            underlined text in a bar gets scanned past. */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium px-3 sm:px-4 py-2 rounded-md whitespace-nowrap transition-colors"
              style={{ color: "#4A443A" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EDE6D6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/login" className="text-sm text-[#8A836F] hidden sm:inline">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2 rounded-md text-white whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #C39A55, #8F6E32)" }}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
