import { ID, Query, Permission, Role } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { listAllRows, deleteAllRows } from './rowHelpers'

// DATA ACCESS LAYER for `saved_posts` — one row per (user, blog post) bookmark.
// Row Security is ON: each row grants read + delete to its owner only (set at
// creation), so a user can only see and remove their own saved posts.

export async function getSavedPostIds(userId) {
  const rows = await listAllRows(TABLES.SAVED_POSTS, [Query.equal('userId', userId)])
  return rows.map((row) => row.postId)
}

export async function savePost({ userId, postId }) {
  // Avoid duplicate rows (e.g. a double-click before the button disables).
  const existing = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.SAVED_POSTS,
    queries: [Query.equal('userId', userId), Query.equal('postId', postId), Query.limit(1)],
  })
  if (existing.rows.length > 0) return existing.rows[0]

  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.SAVED_POSTS,
    rowId: ID.unique(),
    data: { userId, postId },
    permissions: [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))],
  })
}

export async function unsavePost({ userId, postId }) {
  return deleteAllRows(TABLES.SAVED_POSTS, [Query.equal('userId', userId), Query.equal('postId', postId)])
}
