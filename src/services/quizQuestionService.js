import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows } from './rowHelpers'

export async function getQuestionsForQuiz(quizId) {
  return listAllRows(TABLES.QUIZ_QUESTIONS, [Query.equal('quizId', quizId), Query.orderAsc('order')])
}

export async function getQuestionById(id) {
  return tablesDB.getRow({ databaseId: DB_ID, tableId: TABLES.QUIZ_QUESTIONS, rowId: id })
}

export async function createQuestion(data) {
  return tablesDB.createRow({ databaseId: DB_ID, tableId: TABLES.QUIZ_QUESTIONS, rowId: 'unique()', data })
}

export async function updateQuestion(id, data) {
  return tablesDB.updateRow({ databaseId: DB_ID, tableId: TABLES.QUIZ_QUESTIONS, rowId: id, data })
}

export async function deleteQuestion(id) {
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.QUIZ_QUESTIONS, rowId: id })
}