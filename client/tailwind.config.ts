import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#3368B2",
          bright: "#0167D6",
          darkblue: "#004282",
          dark: "#141416",
          card: "#181A1D",
          darkcard: "#131314",
          border: "#29292c",
          grayText: "#a2a2a3",
        },
      },
      boxShadow: {
        "custom-blue": "0 0 20px 4px rgba(51, 104, 178, 0.6)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
