import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows, deleteAllRows } from './rowHelpers'

export async function getAllQuizzes() {
  return listAllRows(TABLES.QUIZZES)
}

export async function getPublishedQuizzes() {
  return listAllRows(TABLES.QUIZZES, [Query.equal('published', true)])
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

// Questions and attempts go first so none are left pointing at a missing quiz.
export async function deleteQuiz(id) {
  await deleteAllRows(TABLES.QUIZ_QUESTIONS, [Query.equal('quizId', id)])
  await deleteAllRows(TABLES.QUIZ_ATTEMPTS, [Query.equal('quizId', id)])
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.QUIZZES, rowId: id })
}