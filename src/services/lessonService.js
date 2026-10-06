import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows, deleteAllRows } from './rowHelpers'

// DATA ACCESS LAYER for lessons. Lessons always belong to exactly one
// course, so every read here is scoped by courseId.

export async function getLessonsForCourse(courseId, { publishedOnly = false } = {}) {
  const queries = [Query.equal('courseId', courseId), Query.orderAsc('order')]
  if (publishedOnly) queries.push(Query.equal('published', true))

  return listAllRows(TABLES.LESSONS, queries)
}

// All published lessons across every course — used to count lessons per course.
export async function getAllPublishedLessons() {
  return listAllRows(TABLES.LESSONS, [Query.equal('published', true)])
}

export async function getLessonById(id) {
  return tablesDB.getRow({ databaseId: DB_ID, tableId: TABLES.LESSONS, rowId: id })
}

export async function createLesson(data) {
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.LESSONS,
    rowId: 'unique()',
    data,
  })
}

export async function updateLesson(id, data) {
  return tablesDB.updateRow({ databaseId: DB_ID, tableId: TABLES.LESSONS, rowId: id, data })
}

// Progress rows for this lesson go too, so completion counts stay accurate.
export async function deleteLesson(id) {
  await deleteAllRows(TABLES.PROGRESS, [Query.equal('lessonId', id)])
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.LESSONS, rowId: id })
}