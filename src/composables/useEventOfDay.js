import { ref, computed } from 'vue'
import { getEventsOnThisDay, getOnThisDay } from '../services/wikimediaService'

// APPLICATION LOGIC for "Event of the Day": loads a date's events from
// Wikipedia and picks one to feature (+ a few "also on this day" items).
// The home page only uses today; the full page can browse any date.

// Prefer older history (the feed also has e.g. software releases), and pick
// by day-of-year so everyone sees the same event all day.
const HISTORY_BEFORE_YEAR = 1900

const dayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)

export function pickFeaturedEvent(events, date) {
  if (!events.length) return null
  const older = events.filter((e) => e.year < HISTORY_BEFORE_YEAR)
  const pool = older.length ? older : events
  return pool[dayOfYear(date) % pool.length]
}

// 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd"
export function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'
  return `${n}${suffix}`
}

// Rough topic label for an item (Wikipedia doesn't categorise them), by keywords.
const TOPICS = [
  ['Disaster', /\b(fire|earthquake|flood|eruption|hurricane|storm|explosion|crash|sinks?|sank|famine|plague|epidemic|tsunami|disaster)\b/i],
  ['War', /\b(war|battle|siege|invade[sd]?|invasion|army|troops|bomb\w*|attack\w*|massacre|revolt|rebellion)\b/i],
  ['Culture', /\b(novel|book|published|film|album|song|opera|painting|museum|premiere|poem|play|music|art)\b/i],
  ['Science', /\b(discover\w*|invent\w*|patent\w*|launch\w*|space|satellite|telescope|scientist|vaccine)\b/i],
  ['Politics', /\b(king|queen|emperor|president|prime minister|parliament|treaty|election|elected|crowned|independence|declar\w+|constitution|republic|government|law|revolution)\b/i],
]
// Wikipedia births read "Louis VIII of France (d. 1226)" or "Name, Canadian
// ice hockey player" — show them as "<Name> is born." like the mockup.
export function displayText(item) {
  if (item.kind !== 'birth') return item.text
  const name = item.text.split(',')[0].replace(/\s*\([^)]*\)/g, '').trim()
  return `${name} is born.`
}

export function topicOf(item) {
  if (item.kind === 'birth') return 'Birth'
  return TOPICS.find(([, re]) => re.test(item.text))?.[0] || 'Event'
}

// "Also on this day": 2 other events + 1 birth, chosen by date so they're stable.
export function pickAlsoOnThisDay({ events, births }, featured, date, count = 3) {
  const seed = dayOfYear(date)
  const otherEvents = events.filter((e) => e !== featured)
  const olderBirths = births.filter((b) => b.year < HISTORY_BEFORE_YEAR)
  births = olderBirths.length ? olderBirths : births
  const pick = (list, i) => (list.length ? list[(seed * 7 + i * 13) % list.length] : null)
  const items = [pick(otherEvents, 1), pick(otherEvents, 2), pick(births, 3)].filter(Boolean)
  return [...new Set(items)].slice(0, count)
}

export function useEventOfDay() {
  const selectedDate = ref(new Date())
  const events = ref([])
  const births = ref([])
  const loading = ref(true)
  const error = ref(null)

  const date = computed(() => ({
    year: selectedDate.value.getFullYear(),
    day: ordinal(selectedDate.value.getDate()),
    month: selectedDate.value.toLocaleDateString('en-US', { month: 'long' }),
    long: selectedDate.value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  }))

  // Home page: today's events only.
  async function fetchToday() {
    loading.value = true
    error.value = null
    try {
      const today = selectedDate.value
      events.value = await getEventsOnThisDay(today.getMonth() + 1, today.getDate())
    } catch (err) {
      console.error(err)
      error.value = "Couldn't load today's event."
    } finally {
      loading.value = false
    }
  }

  // Full page: any date, events + births.
  async function fetchFor(newDate) {
    selectedDate.value = newDate
    loading.value = true
    error.value = null
    try {
      const data = await getOnThisDay(newDate.getMonth() + 1, newDate.getDate())
      events.value = data.events
      births.value = data.births
    } catch (err) {
      console.error(err)
      error.value = "Couldn't load events for this date."
    } finally {
      loading.value = false
    }
  }

  const shiftDays = (n) => {
    const d = new Date(selectedDate.value)
    d.setDate(d.getDate() + n)
    return d
  }
  // Same year, random day — so "random" is about the day in history.
  const randomDate = () => {
    const y = selectedDate.value.getFullYear()
    return new Date(y, 0, 1 + Math.floor(Math.random() * 365))
  }

  const featured = computed(() => pickFeaturedEvent(events.value, selectedDate.value))
  const alsoOnThisDay = computed(() =>
    pickAlsoOnThisDay({ events: events.value, births: births.value }, featured.value, selectedDate.value)
  )

  return { selectedDate, date, events, featured, alsoOnThisDay, loading, error, fetchToday, fetchFor, shiftDays, randomDate }
}
