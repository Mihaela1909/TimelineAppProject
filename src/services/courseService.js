// DATA ACCESS LAYER for courses.
// This file's only job is fetching/writing course data. It knows nothing
// about Vue, ref(), or components — it just returns plain data (or throws).
// Composables call these functions; components never call this file directly.
import { mockCourses } from '../data/mockCourses'
// import { databases, DB_ID } from './appwrite'
// import { Query } from 'appwrite'

const SIMULATED_DELAY = 400

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getPublishedCourses({ limit } = {}) {
  await delay(SIMULATED_DELAY)
  // TODO (Appwrite):
  // const queries = [Query.equal('published', true)]
  // if (limit) queries.push(Query.limit(limit))
  // const res = await databases.listDocuments(DB_ID, 'courses', queries)
  // return res.documents
  const published = mockCourses.filter((c) => c.published)
  return limit ? published.slice(0, limit) : published
}

export async function getAllCourses() {
  // Used by the ADMIN panel — includes unpublished/draft courses.
  await delay(SIMULATED_DELAY)
  // TODO (Appwrite): return (await databases.listDocuments(DB_ID, 'courses')).documents
  return mockCourses
}

export async function getCourseById(id) {
  await delay(SIMULATED_DELAY)
  // TODO (Appwrite): return databases.getDocument(DB_ID, 'courses', id)
  const found = mockCourses.find((c) => c.$id === id)
  if (!found) throw new Error('Course not found')
  return found
}

export async function createCourse(data) {
  // TODO (Appwrite): return databases.createDocument(DB_ID, 'courses', 'unique()', data)
  throw new Error('createCourse: Appwrite not configured yet')
}

export async function updateCourse(id, data) {
  // TODO (Appwrite): return databases.updateDocument(DB_ID, 'courses', id, data)
  throw new Error('updateCourse: Appwrite not configured yet')
}

export async function deleteCourse(id) {
  // TODO (Appwrite): return databases.deleteDocument(DB_ID, 'courses', id)
  throw new Error('deleteCourse: Appwrite not configured yet')
}
