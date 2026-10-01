import { Query, Permission, Role } from 'appwrite'
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

export async function createProfile(userId, name) {
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.PROFILES,
    rowId: 'unique()',
    // `name` is copied here because the client SDK can't look up other
    // users' names — the admin dashboard/approvals read it from this row.
    data: { userId, name, role: ROLES.USER },
    // Explicit READ-only for the owner. Without this, Appwrite's default
    // grants the creator read+update+delete, which would let a user change
    // their own role (or approved avatar) via the API.
    permissions: [Permission.read(Role.user(userId))],
  })
}
// ADMIN-only write (via the image-approval flow). Users can read their own
// profile row but never update it, which is what makes approval enforceable.
export async function setProfileImage(userId, field, fileId) {
  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error(`No profile row for user ${userId}`)
  return tablesDB.updateRow({
    databaseId: DB_ID,
    tableId: TABLES.PROFILES,
    rowId: profile.$id,
    data: { [field]: fileId },
  })
}
