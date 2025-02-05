import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      aspectRatio: {
        logo: "320 / 111",
      },
      colors: {
        "brand-light": "var(--brand-light)",
        "brand-grey": "var(--brand-grey)",
        "brand-dark": "var(--brand-dark)",
        "brand-yellow": "var(--brand-yellow)",
        "brand-green": "var(--brand-green)",
        "brand-blue": "var(--brand-blue)",
        "brand-red": "var(--brand-red)",
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
      transitionDelay: {
        25: "25ms",
        50: "50ms",
        75: "75ms",
        100: "100ms",
        125: "125ms",
        150: "150ms",
        175: "175ms",
        200: "200ms",
        225: "225ms",
        250: "250ms",
        275: "275ms",
        300: "300ms",
        400: "400ms",
      },
      animation: {
        "fade-in": "fadeIn .5s ease-in-out",
        "fade-out": "fadeOut .5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
