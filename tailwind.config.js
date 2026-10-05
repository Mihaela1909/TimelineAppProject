// Colour helper: reads an "R G B" CSS variable from src/style.css and keeps
// Tailwind's opacity modifiers working (bg-olive/90, text-bark/60, …).
const c = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Values live in src/style.css (:root). Existing names (olive, cream,
      // bark, sand, field) now point at the brand palette, so older classes
      // pick up the new colours automatically.
      colors: {
        olive: {
          DEFAULT: c("olive"),
          light: c("olive-light"),
          dark: c("bark"), // kept for older classes (header/footer/hero); same as bark
        },
        cream: c("cream"),
        ochre: c("ochre"),
        leaf: c("leaf"),
        bark: c("bark"),
        umber: c("umber"),
        butter: c("butter"),
        wine: c("wine"),
        parchment: c("parchment"),
        taupe: { DEFAULT: c("taupe"), dark: c("taupe-dark") },
        sand: { DEFAULT: c("taupe"), dark: c("taupe-dark") }, // older name for taupe
        field: { DEFAULT: c("cream"), border: c("taupe") }, // form inputs
      },
      fontFamily: {
        voice: ["'Metamorphous'", "serif"], // headlines (h1–h3, page titles)
        button: ["'Amethysta'", "serif"], // buttons
        sans: ["'Raleway'", "sans-serif"], // body text, tags (default)
      },
    },
  },
  plugins: [],
}
