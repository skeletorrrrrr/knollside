/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211F1B",
        stone: "#F7F3EA",
        "stone-dim": "#EDE6D6",
        line: "#DDD3BF",
        slab: "#56707A",
        brass: "#B08A44",
        "brass-deep": "#8F6E32",
        good: "#4B6A52",
        clay: "#B5806B",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
