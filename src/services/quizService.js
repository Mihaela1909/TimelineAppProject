import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

export async function getAllQuizzes() {
  const res = await tablesDB.listRows({ databaseId: DB_ID, tableId: TABLES.QUIZZES })
  return res.rows
}

export async function getPublishedQuizzes() {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.QUIZZES,
    queries: [Query.equal('published', true)],
  })
  return res.rows
}

export async function getQuizById(id) {
  return tablesDB.getRow({ databaseId: DB_ID, tableId: TABLES.QUIZZES, rowId: id })
}

export async function getQuizForCourse(courseId, { publishedOnly = false } = {}) {
  const queries = [Query.equal('courseId', courseId)]
  if (publishedOnly) queries.push(Query.equal('published', true))
  const res = await tablesDB.listRows({ databaseId: DB_ID, tableId: TABLES.QUIZZES, queries })
  return res.rows[0] || null
}

export async function createQuiz(data) {
  return tablesDB.createRow({ databaseId: DB_ID, tableId: TABLES.QUIZZES, rowId: 'unique()', data })
}

export async function updateQuiz(id, data) {
  return tablesDB.updateRow({ databaseId: DB_ID, tableId: TABLES.QUIZZES, rowId: id, data })
}

export async function deleteQuiz(id) {
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.QUIZZES, rowId: id })
}