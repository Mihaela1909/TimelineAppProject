import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

// DATA ACCESS LAYER for lessons. Lessons always belong to exactly one
// course, so every read here is scoped by courseId.

export async function getLessonsForCourse(courseId, { publishedOnly = false } = {}) {
  const queries = [Query.equal('courseId', courseId), Query.orderAsc('order')]
  if (publishedOnly) queries.push(Query.equal('published', true))

  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.LESSONS,
    queries,
  })
  return res.rows
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

export async function deleteLesson(id) {
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.LESSONS, rowId: id })
}