import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'

// DATA ACCESS LAYER for the admin dashboard. Read-only, and deliberately
// generic: every stat card and activity feed entry is just "count rows" or
// "latest rows" against one of the existing tables.

export async function countRows(tableId) {
  // limit(1) keeps the payload tiny — we only want `total`, which Appwrite
  // returns for the whole table regardless of the page size.
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId,
    queries: [Query.limit(1)],
  })
  return res.total
}

export async function getLatestRows(tableId, { limit = 10, orderBy = '$updatedAt' } = {}) {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId,
    queries: [Query.orderDesc(orderBy), Query.limit(limit)],
  })
  return res.rows
}

export { TABLES }
