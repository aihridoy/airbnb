const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#009688",
        cream: "#FAF7F2",
        surface: "#FFFFFF",
        "surface-alt": "#F5F1EA",
        ink: "#1C1A17",
        muted: "#6B6459",
        brass: "#B08D57",
        "brass-dark": "#8C6D3F",
        "brass-light": "#D9C6A0",
        hairline: "#E8E1D5",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-fraunces)", ...defaultTheme.fontFamily.serif],
      },
      boxShadow: {
        luxe: "0 30px 60px -20px rgba(28, 26, 23, 0.15)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
