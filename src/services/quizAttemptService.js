import { ID, Query, Permission, Role } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows } from './rowHelpers'

// This table has Row Level Security enabled in Appwrite, so every row we
// create must be given its own permissions — otherwise it would be
// unreadable by anyone, including the person who just took the quiz.
// Granting read/update/delete to Role.user(userId) here is what actually
// enforces "you can only see your own attempts," not just the table-level
// rule (which only controls who's allowed to CREATE a row at all).
export async function createAttempt({ userId, quizId, score, totalQuestions }) {
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.QUIZ_ATTEMPTS,
    rowId: ID.unique(),
    data: { userId, quizId, score, totalQuestions },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  })
}

export async function getAllAttemptsForUser(userId) {
  return listAllRows(TABLES.QUIZ_ATTEMPTS, [Query.equal('userId', userId), Query.orderDesc('$createdAt')])
}

export async function getAttemptsForUserAndQuiz(userId, quizId) {
  return listAllRows(TABLES.QUIZ_ATTEMPTS, [
    Query.equal('userId', userId),
    Query.equal('quizId', quizId),
    Query.orderDesc('$createdAt'),
  ])
}