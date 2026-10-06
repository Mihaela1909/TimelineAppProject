// Small pure date helpers (no Vue, no Appwrite).

// "2h ago" style labels (activity feed, quiz history).
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ]
  for (const [suffix, size] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${suffix} ago`
  }
}
