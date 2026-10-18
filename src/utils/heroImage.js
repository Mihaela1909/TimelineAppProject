// Page heroes (courses, quizzes, blog): phones get the half-size "-sm.webp"
// version of each figure and background (~70% fewer bytes); md+ gets the full one.
// Decided once when the hero loads (768px = Tailwind's md breakpoint).
// Plain browser helper: no Vue, no Appwrite.
export function heroImage(path) {
  const isPhone = !window.matchMedia('(min-width: 768px)').matches
  return isPhone ? path.replace(/\.webp$/, '-sm.webp') : path
}
