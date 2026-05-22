import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        gardens: {
          primary: "#2d6a4f",
          accent: "#95d5b2",
          dark: "#1b4332",
          light: "#d8f3dc",
        },
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(27, 67, 50, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
