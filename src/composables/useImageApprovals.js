import { ref } from 'vue'
import {
  listPendingSubmissions,
  approvePendingImage,
  rejectPendingImage,
} from '../services/profileSettingsService'
import { listProfiles } from '../services/profileService'
import { REMOVE_IMAGE } from '../constants/images'

// APPLICATION LOGIC for the admin Image Approvals page.
export function useImageApprovals() {
  const requests = ref([])
  const loading = ref(false)
  const error = ref(null)
  const busyKey = ref(null) // the request currently being approved/rejected

  // One profile_settings row can hold BOTH a pending avatar and a pending
  // header, so flatten it into one request per image the admin can act on.
  function toRequests(rows, nameByUserId) {
    return rows.flatMap((row) =>
      [
        ['avatar', row.pendingAvatarImageId],
        ['header', row.pendingHeaderImageId],
      ]
        .filter(([, fileId]) => fileId)
        .map(([kind, fileId]) => ({
          key: `${row.$id}-${kind}`,
          row,
          kind,
          fileId,
          removal: fileId === REMOVE_IMAGE, // "remove my photo" rather than a new one
          userName: nameByUserId[row.userId] || null,
        }))
    )
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [rows, profiles] = await Promise.all([listPendingSubmissions(), listProfiles()])
      const nameByUserId = Object.fromEntries(profiles.map((p) => [p.userId, p.name]))
      requests.value = toRequests(rows, nameByUserId)
    } catch (err) {
      console.error(err)
      error.value = 'Could not load pending images.'
    } finally {
      loading.value = false
    }
  }

  // Returns true/false; the caller shows the toast.
  async function decide(request, approve) {
    if (busyKey.value) return false // one decision at a time
    busyKey.value = request.key
    try {
      await (approve ? approvePendingImage : rejectPendingImage)(request.row, request.kind)
      // Remove locally rather than refetching, so the list doesn't flash.
      requests.value = requests.value.filter((r) => r.key !== request.key)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      busyKey.value = null
    }
  }

  return { requests, loading, error, busyKey, fetchAll, decide }
}
