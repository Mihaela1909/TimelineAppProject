import { ID, Query, Permission, Role } from 'appwrite'
import { tablesDB, DB_ID, TABLES } from './appwrite'
import { setProfileImage } from './profileService'

// Deliberately a separate table from `profiles`. `profiles` holds `role`
// and the APPROVED avatar/header IDs, none of which may be user-writable.
// This table only holds the user's PENDING submissions, so it's safe to
// let each user read/write their own row.
//
// Why the split matters: Appwrite permissions are per-row, not per-column.
// If the live avatar ID sat in a row the user can update, they could set
// it directly via the API and skip approval entirely.

// Maps an image kind to its pending column here and its live column in `profiles`.
const FIELDS = {
  avatar: { pending: 'pendingAvatarImageId', live: 'avatarImageId' },
  header: { pending: 'pendingHeaderImageId', live: 'headerImageId' },
}

export async function getSettingsByUserId(userId) {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.PROFILE_SETTINGS,
    queries: [Query.equal('userId', userId), Query.limit(1)],
  })
  return res.rows[0] || null
}

async function updateSetting(userId, field, value) {
  const existing = await getSettingsByUserId(userId)
  if (existing) {
    return tablesDB.updateRow({
      databaseId: DB_ID,
      tableId: TABLES.PROFILE_SETTINGS,
      rowId: existing.$id,
      data: { [field]: value },
    })
  }
  return tablesDB.createRow({
    databaseId: DB_ID,
    tableId: TABLES.PROFILE_SETTINGS,
    rowId: ID.unique(),
    data: { userId, [field]: value },
    permissions: [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
  })
}

// USER side — submit a new photo for review, or withdraw one (fileId = null).
export async function submitPendingImage(userId, kind, fileId) {
  return updateSetting(userId, FIELDS[kind].pending, fileId)
}

// ADMIN side — needs table-level Read + Update for the admin label on
// profile_settings, otherwise only the admin's own row is visible.
export async function listPendingSubmissions() {
  const res = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TABLES.PROFILE_SETTINGS,
    queries: [
      Query.or([Query.isNotNull('pendingAvatarImageId'), Query.isNotNull('pendingHeaderImageId')]),
      Query.limit(100),
    ],
  })
  return res.rows
}

export async function approvePendingImage(row, kind) {
  const { pending, live } = FIELDS[kind]
  // Publish first, then clear — if the second call fails the photo is
  // live and the request just shows up again, rather than being lost.
  await setProfileImage(row.userId, live, row[pending])
  return clearPending(row, kind)
}

export async function rejectPendingImage(row, kind) {
  return clearPending(row, kind)
}

function clearPending(row, kind) {
  return tablesDB.updateRow({
    databaseId: DB_ID,
    tableId: TABLES.PROFILE_SETTINGS,
    rowId: row.$id,
    data: { [FIELDS[kind].pending]: null },
  })
}
