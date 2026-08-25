"use client";
import { useEffect } from "react";

// Reports the widget's real content height to the parent page so the embed
// snippet can resize its iframe to fit. Without this the iframe is a fixed
// box and the widget scrolls inside it — on a phone that means nested
// scrolling, where a swipe moves the wrong thing.
//
// Renders nothing. Safe to mount when not embedded: if there's no parent
// frame it does nothing at all.
export default function EmbedAutoHeight() {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    let last = 0;
    let frame = 0;

    const post = () => {
      // scrollHeight rather than a rect: the rect is the *laid out* height,
      // which the parent has just forced to whatever it set the iframe to.
      // Measuring that back would pin the height at its current value and it
      // could never shrink again.
      const h = Math.ceil(
        Math.max(
          document.documentElement.scrollHeight,
          document.body ? document.body.scrollHeight : 0
        )
      );
      // Ignore sub-pixel churn. Without this the parent's resize reflows the
      // content, which fires the observer, which resizes the parent again —
      // a loop that never settles.
      if (!h || Math.abs(h - last) < 2) return;
      last = h;
      window.parent.postMessage({ type: "knollside:height", height: h }, "*");
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(post);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    // Images load after first paint and change the height when they land.
    window.addEventListener("load", schedule);
    const t1 = setTimeout(schedule, 300);
    const t2 = setTimeout(schedule, 1200);
    schedule();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", schedule);
    };
  }, []);

  return null;
}
