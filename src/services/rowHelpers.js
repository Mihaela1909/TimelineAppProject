import { Query } from 'appwrite'
import { tablesDB, DB_ID } from './appwrite'

// Shared helpers for the other services.
//
// Appwrite's listRows returns only 25 rows unless told otherwise, so any
// "get all X" call must page through results — otherwise the 26th course,
// post or progress row silently never shows up.

const PAGE_SIZE = 500
const MAX_PAGES = 20 // hard stop so a huge table can't hang the page

export async function listAllRows(tableId, queries = []) {
  const rows = []
  let cursor = null
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId,
      queries: [...queries, Query.limit(PAGE_SIZE), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    })
    rows.push(...res.rows)
    if (res.rows.length < PAGE_SIZE) break
    cursor = res.rows[res.rows.length - 1].$id
  }
  return rows
}

// Deletes every row matching `queries` — used to clean up child rows
// (lessons, questions, progress, attempts) before deleting their parent.
export async function deleteAllRows(tableId, queries) {
  const rows = await listAllRows(tableId, queries)
  await Promise.all(rows.map((row) => tablesDB.deleteRow({ databaseId: DB_ID, tableId, rowId: row.$id })))
  return rows.length
}
