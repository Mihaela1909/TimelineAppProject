import { Query } from 'appwrite'
import { TABLES } from './appwrite'
import { listAllRows } from './rowHelpers'

// DATA ACCESS LAYER for the admin Statistics page. Appwrite has no
// GROUP BY / aggregate queries, so statistics are computed client-side
// from full table reads. Fine at this app's scale; if tables grow into
// the tens of thousands, move these aggregates into an Appwrite Function.

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
