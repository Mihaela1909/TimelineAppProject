import { Client, Account, TablesDB, Storage } from 'appwrite'

// This is the ONLY file that should import from 'appwrite'. Everything
// else in the app goes through services/*.js, which import from here.
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
export const BUCKETS = {
  MEDIA: import.meta.env.VITE_APPWRITE_MEDIA_BUCKET_ID,
}
export const TABLES = {
  COURSES: import.meta.env.VITE_APPWRITE_COURSES_TABLE_ID,
  PROFILES: import.meta.env.VITE_APPWRITE_PROFILES_TABLE_ID,
  LESSONS: import.meta.env.VITE_APPWRITE_LESSONS_TABLE_ID,
  QUIZZES: import.meta.env.VITE_APPWRITE_QUIZZES_TABLE_ID,
  QUIZ_QUESTIONS: import.meta.env.VITE_APPWRITE_QUIZ_QUESTIONS_TABLE_ID,
  QUIZ_ATTEMPTS: import.meta.env.VITE_APPWRITE_QUIZ_ATTEMPTS_TABLE_ID,
}