"use client";
import { useState, useEffect } from "react";

// Tracks its own text state rather than being directly controlled by the
// numeric value — otherwise clearing the field to type a new number causes
// a flash back to "0" and new digits land in the wrong place. Calls
// onCommit only on blur, so we're not firing a network request on every
// keystroke.
export default function NumberInput({ value, onCommit, prefix, suffix, className = "" }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e) {
    const raw = e.target.value;
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) setText(raw);
  }

  function handleBlur() {
    if (text === "") return;
    const n = Number.isNaN(Number(text)) ? 0 : Number(text);
    setText(String(n));
    if (n !== value) onCommit(n);
  }

  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A39C8A]">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-3 py-2 rounded-md border border-line text-sm font-mono focus:outline-none focus:ring-2"
        style={{ paddingLeft: prefix ? "1.5rem" : undefined, paddingRight: suffix ? "3rem" : undefined }}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A39C8A]">
          {suffix}
        </span>
      )}
    </div>
  );
}
