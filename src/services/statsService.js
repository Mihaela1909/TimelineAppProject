import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

// DATA ACCESS LAYER for the admin Statistics page. Appwrite has no
// GROUP BY / aggregate queries, so statistics are computed client-side
// from full table reads. Fine at this app's scale; if tables grow into
// the tens of thousands, move these aggregates into an Appwrite Function.

const PAGE_SIZE = 500
const MAX_PAGES = 20 // hard stop so a huge table can't hang the page

export async function listAllRows(tableId, queries = []) {
  const rows = []
  let cursor = null
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId,
      queries: [...queries, Query.limit(PAGE_SIZE), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    })
    rows.push(...res.rows)
    if (res.rows.length < PAGE_SIZE) break
    cursor = res.rows[res.rows.length - 1].$id
  }
  return rows
}

// Admin needs table-level Read (label `admin`) on every one of these —
// progress and quiz_attempts rows are otherwise readable only by their owner.
export async function getStatisticsData() {
  const [profiles, courses, lessons, quizzes, progress, attempts] = await Promise.all([
    listAllRows(TABLES.PROFILES),
    listAllRows(TABLES.COURSES),
    listAllRows(TABLES.LESSONS, [Query.equal('published', true)]),
    listAllRows(TABLES.QUIZZES),
    listAllRows(TABLES.PROGRESS),
    listAllRows(TABLES.QUIZ_ATTEMPTS),
  ])
  return { profiles, courses, lessons, quizzes, progress, attempts }
}
