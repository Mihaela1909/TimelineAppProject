import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows, deleteAllRows } from './rowHelpers'
import { deleteLesson } from './lessonService'
import { deleteQuiz } from './quizService'

// DATA ACCESS for the `courses` table. Deleting a course also deletes
// everything that belongs to it (lessons, quizzes, progress) — children first.

// Published courses for the public site; `limit` = only the first N.
export async function getPublishedCourses({ limit } = {}) {
  const queries = [Query.equal('published', true)]
  if (!limit) return listAllRows(TABLES.COURSES, queries)

  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    queries: [...queries, Query.limit(limit)],
  })
  return res.rows
}

// Every course, drafts included (admin).
export async function getAllCourses() {
  return listAllRows(TABLES.COURSES)
}

export async function getCourseById(id) {
  return tablesDB.getRow({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    rowId: id,
  })
}

export async function createCourse(data) {
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    rowId: 'unique()',
    data,
  })
}

export async function updateCourse(id, data) {
  return tablesDB.updateRow({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    rowId: id,
    data,
  })
}

// Removes everything that belongs to the course first — lessons (and
// their progress), its quizzes (and their questions/attempts), then any
// remaining progress rows — so nothing is left orphaned. Children go
// first: if a step fails, the course still exists and delete can be retried.
export async function deleteCourse(id) {
  // Children first, one at a time: if anything fails, the course itself is still
  // there, so the admin can simply try the delete again.
  const lessons = await listAllRows(TABLES.LESSONS, [Query.equal('courseId', id)])
  for (const lesson of lessons) await deleteLesson(lesson.$id)
  const quizzes = await listAllRows(TABLES.QUIZZES, [Query.equal('courseId', id)])
  for (const quiz of quizzes) await deleteQuiz(quiz.$id)
  await deleteAllRows(TABLES.PROGRESS, [Query.equal('courseId', id)])
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    rowId: id,
  })
}