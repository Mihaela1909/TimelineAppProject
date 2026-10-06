import { ID, Query, Permission, Role } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows, deleteAllRows } from './rowHelpers'

// Row Level Security is enabled on this table, same reasoning as
// quiz_attempts: each row belongs to exactly one person, so we grant
// read/update/delete to that specific user at creation time.

export async function markLessonComplete({ userId, courseId, lessonId }) {
  // Avoid creating duplicate rows if the lesson is somehow marked twice
  // (e.g. a double-click before the button disables).
  const existing = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.PROGRESS,
    queries: [Query.equal('userId', userId), Query.equal('lessonId', lessonId), Query.limit(1)],
  })
  if (existing.rows.length > 0) return existing.rows[0]

  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.PROGRESS,
    rowId: ID.unique(),
    data: { userId, courseId, lessonId },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  })
}

// Undo "Mark as Complete". Each row grants delete to its owner (set at creation),
// and the userId filter means a user can only ever remove their own progress.
export async function unmarkLessonComplete({ userId, lessonId }) {
  return deleteAllRows(TABLES.PROGRESS, [Query.equal('userId', userId), Query.equal('lessonId', lessonId)])
}

export async function getCompletedLessonIds(userId, courseId) {
  const rows = await listAllRows(TABLES.PROGRESS, [Query.equal('userId', userId), Query.equal('courseId', courseId)])
  return rows.map((row) => row.lessonId)
}

export async function getAllProgressForUser(userId) {
  return listAllRows(TABLES.PROGRESS, [Query.equal('userId', userId)])
}