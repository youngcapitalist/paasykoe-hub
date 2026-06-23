/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Virallinen yliopistohaku-paletti (kuvasta)
        navy: {
          DEFAULT: "#0A2540", // tummansininen yläpalkki & otsikot
          dark: "#06182B",
          light: "#13345C",
        },
        gold: {
          DEFAULT: "#FFC600", // kirkas keltainen tehoste
          dark: "#F0B400",
        },
        mist: "#F2F3F5", // vaalea harmaa osiotausta
        line: "#E3E6EA",
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
