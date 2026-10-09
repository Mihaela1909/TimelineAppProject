// DATA ACCESS LAYER for the third-party Wikipedia "On this day" REST API.
// Free, no API key, CORS-enabled — so it's called straight from the browser.
// Docs: https://en.wikipedia.org/api/rest_v1/#/Feed/onThisDay

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday/events'

// Returns this date's historical events as { year, text, url }.
// Links from the API are shown as <a href>: only accept real Wikipedia https URLs.
const wikipediaUrl = (url) => (/^https:\/\/[a-z-]+\.wikipedia\.org\//.test(url || '') ? url : null)

export async function getEventsOnThisDay(month, day) {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const res = await fetch(`${BASE_URL}/${mm}/${dd}`, {
    // Wikimedia asks API users to identify themselves; browsers can't set
    // User-Agent, so this is their documented alternative header.
    headers: { 'Api-User-Agent': 'Timeline history app (student project)' },
  })
  if (!res.ok) throw new Error(`Wikipedia responded with ${res.status}`)

  const data = await res.json()
  return (data.events || []).map((event) => ({
    year: event.year,
    text: event.text,
    url: wikipediaUrl(event.pages?.[0]?.content_urls?.desktop?.page),
  }))
}

// Events AND births for a date (one request) — for the Event of the Day page.
export async function getOnThisDay(month, day) {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`, {
    headers: { 'Api-User-Agent': 'Timeline history app (student project)' },
  })
  if (!res.ok) throw new Error(`Wikipedia responded with ${res.status}`)

  const data = await res.json()
  const toItem = (kind) => (entry) => ({
    year: entry.year,
    text: entry.text,
    kind,
    url: wikipediaUrl(entry.pages?.[0]?.content_urls?.desktop?.page),
  })
  return {
    events: (data.events || []).map(toItem('event')),
    births: (data.births || []).map(toItem('birth')),
  }
}
