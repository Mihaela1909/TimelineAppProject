import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

export async function getPublishedCourses({ limit } = {}) {
  const queries = [Query.equal('published', true)]
  if (limit) queries.push(Query.limit(limit))

  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    queries,
  })
  return res.rows
}

export async function getAllCourses() {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
  })
  return res.rows
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

export async function deleteCourse(id) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLES.COURSES,
    rowId: id,
  })
}