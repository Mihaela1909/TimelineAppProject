import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

export async function getAllBlogPosts() {
  const res = await tablesDB.listRows({ databaseId: DB_ID, tableId: TABLES.BLOG_POSTS })
  return res.rows
}

export async function getPublishedBlogPosts() {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.BLOG_POSTS,
    queries: [Query.equal('published', true), Query.orderDesc('$createdAt')],
  })
  return res.rows
}

export async function getBlogPostById(id) {
  return tablesDB.getRow({ databaseId: DB_ID, tableId: TABLES.BLOG_POSTS, rowId: id })
}

export async function createBlogPost(data) {
  return tablesDB.createRow({ databaseId: DB_ID, tableId: TABLES.BLOG_POSTS, rowId: 'unique()', data })
}

export async function updateBlogPost(id, data) {
  return tablesDB.updateRow({ databaseId: DB_ID, tableId: TABLES.BLOG_POSTS, rowId: id, data })
}

export async function deleteBlogPost(id) {
  return tablesDB.deleteRow({ databaseId: DB_ID, tableId: TABLES.BLOG_POSTS, rowId: id })
}