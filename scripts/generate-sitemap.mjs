// Build step: writes public/sitemap.xml with the static pages plus every PUBLISHED
// course, lesson, quiz and blog post, read from Appwrite's public REST API as a
// guest (the same read access any visitor has — no API key).
// It never fails the build: if Appwrite can't be reached, the sitemap just lists
// the static pages.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const SITE_URL = 'https://timeline.appwrite.network'
const STATIC_PAGES = ['/', '/courses', '/quizzes', '/blog', '/event-of-the-day']

// Appwrite Sites passes the VITE_* variables as real environment variables;
// locally they live in .env.
function loadEnv() {
  const env = { ...process.env }
  if (existsSync('.env')) {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return env
}

const env = loadEnv()

async function listPublished(tableId) {
  if (!tableId) return []
  const rows = []
  let cursor = null
  for (let page = 0; page < 20; page++) {
    const queries = [
      JSON.stringify({ method: 'equal', attribute: 'published', values: [true] }),
      JSON.stringify({ method: 'limit', values: [500] }),
      ...(cursor ? [JSON.stringify({ method: 'cursorAfter', values: [cursor] })] : []),
    ]
    const qs = queries.map((q, i) => `queries[${i}]=${encodeURIComponent(q)}`).join('&')
    const url = `${env.VITE_APPWRITE_ENDPOINT}/tablesdb/${env.VITE_APPWRITE_DATABASE_ID}/tables/${tableId}/rows?${qs}`
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID } })
    if (!res.ok) throw new Error(`${tableId}: HTTP ${res.status}`)
    const data = await res.json()
    rows.push(...data.rows)
    if (data.rows.length < 500) break
    cursor = data.rows[data.rows.length - 1].$id
  }
  return rows
}

const entry = (path, lastmod) =>
  `  <url>\n    <loc>${SITE_URL}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}\n  </url>`

const urls = STATIC_PAGES.map((path) => entry(path))

try {
  const [courses, lessons, quizzes, posts] = await Promise.all([
    listPublished(env.VITE_APPWRITE_COURSES_TABLE_ID),
    listPublished(env.VITE_APPWRITE_LESSONS_TABLE_ID),
    listPublished(env.VITE_APPWRITE_QUIZZES_TABLE_ID),
    listPublished(env.VITE_APPWRITE_BLOG_POSTS_TABLE_ID),
  ])
  const courseIds = new Set(courses.map((c) => c.$id))
  for (const c of courses) urls.push(entry(`/courses/${c.$id}`, c.$updatedAt))
  // Only lessons of published courses (a draft course's lessons aren't reachable).
  for (const l of lessons) if (courseIds.has(l.courseId)) urls.push(entry(`/courses/${l.courseId}/lessons/${l.$id}`, l.$updatedAt))
  for (const q of quizzes) urls.push(entry(`/quizzes/${q.$id}`, q.$updatedAt))
  for (const p of posts) urls.push(entry(`/blog/${p.$id}`, p.$updatedAt))
  console.log(`sitemap: ${urls.length} URLs`)
} catch (err) {
  console.warn(`sitemap: Appwrite not reachable (${err.message}), writing static pages only`)
}

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
)
