/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Arvokas havunvihreä virastopaletti (ei keltaista). Token-nimet
        // navy/gold säilytetään, mutta arvot ovat nyt vihreitä.
        navy: {
          DEFAULT: "#064e3b", // syvä havunvihreä (emerald-900) — yläpalkki & otsikot
          dark: "#043125",
          light: "#065f46", // emerald-800 — hover
        },
        gold: {
          DEFAULT: "#6ee7b7", // vaalea tehostevihreä (emerald-300) — kontrasti tummalla
          dark: "#34d399", // emerald-400 — hover
        },
        mist: "#F1F5F3", // vaalea, hennon vihertävä osiotausta
        line: "#E2E8E4",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-opensans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "1200px",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
