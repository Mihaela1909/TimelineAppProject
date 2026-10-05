import { ref, computed } from 'vue'
import { getEventsOnThisDay } from '../services/wikimediaService'

// APPLICATION LOGIC for "Event of the Day": loads today's events from
// Wikipedia and picks one to feature.

// Prefer older history (the feed also has e.g. software releases), and pick
// by day-of-year so everyone sees the same event all day.
const HISTORY_BEFORE_YEAR = 1900

export function pickFeaturedEvent(events, date) {
  if (!events.length) return null
  const older = events.filter((e) => e.year < HISTORY_BEFORE_YEAR)
  const pool = older.length ? older : events
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  return pool[dayOfYear % pool.length]
}

// 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd"
export function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'
  return `${n}${suffix}`
}

export function useEventOfDay() {
  const today = new Date()
  const events = ref([])
  const loading = ref(true)
  const error = ref(null)

  const date = {
    year: today.getFullYear(),
    day: ordinal(today.getDate()),
    month: today.toLocaleDateString('en-US', { month: 'long' }),
  }

  async function fetchToday() {
    loading.value = true
    error.value = null
    try {
      events.value = await getEventsOnThisDay(today.getMonth() + 1, today.getDate())
    } catch (err) {
      console.error(err)
      error.value = "Couldn't load today's event."
    } finally {
      loading.value = false
    }
  }

  const featured = computed(() => pickFeaturedEvent(events.value, today))

  return { date, events, featured, loading, error, fetchToday }
}
