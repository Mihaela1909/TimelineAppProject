/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7f3dd",
        olive: {
          DEFAULT: "#5c6b3a",
          light: "#e6ecd9",
          dark: "#3d3320",
        },
        bark: "#3d3320",
        sand: {
          DEFAULT: "#c2b896",
          dark: "#9a9168", // icons on white (darker so they stay readable)
        },
        // Form fields: warm fill + tan border, from the admin form mockups.
        field: {
          DEFAULT: "#fdf6ef",
          border: "#d9c3ab",
        },
      },
      fontFamily: {
        voice: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
