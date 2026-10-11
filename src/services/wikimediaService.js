// DATA ACCESS LAYER for the third-party Wikipedia "On this day" REST API.
// Free, no API key, CORS-enabled — so it's called straight from the browser.
// Docs: https://en.wikipedia.org/api/rest_v1/#/Feed/onThisDay
const BASE_URL = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday'

// Links from the API are shown as <a href>: only accept real Wikipedia https URLs.
const wikipediaUrl = (url) => (/^https:\/\/[a-z-]+\.wikipedia\.org\//.test(url || '') ? url : null)

// One feed ('events' or 'all') for a month/day, e.g. .../events/03/09
async function fetchFeed(type, month, day) {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const res = await fetch(`${BASE_URL}/${type}/${mm}/${dd}`, {
    // Wikimedia asks API users to identify themselves; browsers can't set
    // User-Agent, so this is their documented alternative header.
    headers: { 'Api-User-Agent': 'Timeline history app (student project)' },
  })
  if (!res.ok) throw new Error(`Wikipedia responded with ${res.status}`)
  return res.json()
}

// The API's entry → what the app uses: { year, text, kind, url }
function toItem(entry, kind) {
  return {
    year: entry.year,
    text: entry.text,
    kind,
    url: wikipediaUrl(entry.pages?.[0]?.content_urls?.desktop?.page),
  }
}

// Home page: just this date's events (the smaller 'events' feed).
export async function getEventsOnThisDay(month, day) {
  const data = await fetchFeed('events', month, day)
  return (data.events || []).map((entry) => toItem(entry, 'event'))
}

// Event of the Day page: events AND births for a date, in one request.
export async function getOnThisDay(month, day) {
  const data = await fetchFeed('all', month, day)
  return {
    events: (data.events || []).map((entry) => toItem(entry, 'event')),
    births: (data.births || []).map((entry) => toItem(entry, 'birth')),
  }
}
