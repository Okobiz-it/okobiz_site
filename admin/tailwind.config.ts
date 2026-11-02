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
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "4px",
        md: "4px",
        lg: "4px",
        xl: "4px",
        "2xl": "4px",
        "3xl": "4px",
      },
      colors: {
        primary: {
          DEFAULT: "#3368B2",
          hover: "#255393",
          light: "#EBF3FC",
        },
        accent: "#0167D6",
        dark: {
          bg: "#0B0C0E",
          card: "#131417",
          border: "#202227",
          muted: "#9CA3AF"
        }
      },
    },
  },
  plugins: [],
};
export default config;
