import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows } from './rowHelpers'

export async function getAllBlogPosts() {
  return listAllRows(TABLES.BLOG_POSTS, [Query.orderDesc('$createdAt')])
}

export async function getPublishedBlogPosts() {
  return listAllRows(TABLES.BLOG_POSTS, [Query.equal('published', true), Query.orderDesc('$createdAt')])
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