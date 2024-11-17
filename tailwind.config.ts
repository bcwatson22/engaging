import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        rotate: "rotate 10s linear infinite",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      screens: {
        xs: "480px",
      },
      aspectRatio: {
        logo: "320 / 111",
      },
      colors: {
        "theme-1-a": "#f7b633",
        "theme-1-b": "#90a4ae",
        "theme-1-c": "#607d8b",
        "theme-1-d": "#37474f",
        "theme-2-a": "#ececeb",
        "theme-2-b": "#f9a828",
        "theme-2-c": "#07617d",
        "theme-2-d": "#2e383f",
        // "brand-yellow": "#edce2d",
        "brand-yellow": "#f9a828",
        "brand-green": "#458c25",
        "brand-blue": "#245385",
        "brand-red": "#740a01",
      },
      top: {
        1.5: "0.375rem",
        2.5: "0.625rem",
        "1/6": "16.67%",
        "5/6": "83.33%",
      },
      left: {
        "1/6": "16.67%",
        "5/6": "83.33%",
      },
      right: {
        "1/6": "16.67%",
        "5/6": "83.33%",
      },
      bottom: {
        "1/6": "16.67%",
        "5/6": "83.33%",
      },
      textIndent: {
        full: "-99999rem",
      },
      borderWidth: {
        3: "3px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
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
