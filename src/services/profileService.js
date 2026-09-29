import { Query } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { ROLES } from '../constants/roles'

// DATA ACCESS LAYER for the `profiles` table, which is what actually
// stores each user's role (Appwrite's own Auth/Account has no concept
// of "role" — that's application data, not identity data).

export async function getProfileByUserId(userId) {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.PROFILES,
    queries: [Query.equal('userId', userId), Query.limit(1)],
  })
  return res.rows[0] || null
}

export async function createProfile(userId) {
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.PROFILES,
    rowId: 'unique()',
    data: { userId, role: ROLES.USER },
  })
}