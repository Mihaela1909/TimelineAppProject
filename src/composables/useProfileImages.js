import { ref } from 'vue'
import { submitPendingImage } from '../services/profileSettingsService'
import { useAuth } from './useAuth'

// APPLICATION LOGIC for the user's own avatar / profile header. Uploads
// never change the live photo — they're stored as PENDING until an admin
// approves them (see CLAUDE.md "Avatar / profile header moderation").
const PENDING_KEY = { avatar: 'pendingAvatarImageId', header: 'pendingHeaderImageId' }

export function useProfileImages() {
  const { currentUser } = useAuth()
  const saving = ref(false)

  // kind: 'avatar' | 'header'. fileId = null withdraws the pending request.
  // Returns true/false; the caller shows the toast.
  async function submit(kind, fileId) {
    if (!currentUser.value || !PENDING_KEY[kind] || saving.value) return false
    saving.value = true
    try {
      await submitPendingImage(currentUser.value.$id, kind, fileId)
      currentUser.value[PENDING_KEY[kind]] = fileId
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      saving.value = false
    }
  }

  return { saving, submit }
}
