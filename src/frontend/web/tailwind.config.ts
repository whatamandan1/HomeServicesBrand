import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gardens: {
          primary: "#2d6a4f",
          accent: "#95d5b2",
          dark: "#1b4332",
        },
      },
    },
  },
  plugins: [],
};

export default config;
