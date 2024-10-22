import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      "theme-1-a": "#f7b633",
      "theme-1-b": "#90a4ae",
      "theme-1-c": "#607d8b",
      "theme-1-d": "#37474f",
      "theme-2-a": "#ececeb",
      "theme-2-b": "#f9a828",
      "theme-2-c": "#07617d",
      "theme-2-d": "#2e383f",
    },
    extend: {
      borderWidth: {
        3: "3px",
      },
      textDecorationThickness: {
        3: "3px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
