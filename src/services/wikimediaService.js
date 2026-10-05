// DATA ACCESS LAYER for the third-party Wikipedia "On this day" REST API.
// Free, no API key, CORS-enabled — so it's called straight from the browser.
// Docs: https://en.wikipedia.org/api/rest_v1/#/Feed/onThisDay

const BASE_URL = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday/events'

// Returns this date's historical events as { year, text, url }.
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
    url: event.pages?.[0]?.content_urls?.desktop?.page || null,
  }))
}
