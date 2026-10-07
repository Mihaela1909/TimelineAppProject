// Small pure text helpers (no Vue, no Appwrite).

// Course cards: "Ancient Egypt" → white band "Ancient", olive band "Egypt".
// One-word titles go entirely in the olive band.
export function splitTitle(title = '') {
  const [first, ...rest] = title.trim().split(/\s+/)
  return rest.length ? { label: first, title: rest.join(' ') } : { label: '', title: first }
}

// "1 lesson" / "6 lessons" ('' for 0 / missing)
export const lessonsText = (n) => (n ? `${n} lesson${n === 1 ? '' : 's'}` : '')
