import { ref } from 'vue'
import * as profileService from '../services/profileService'

// APPLICATION LOGIC for the admin Users page. Each "user" here is a
// `profiles` row — the client SDK can't list Appwrite Auth accounts, so
// name/email/role/active status all come from that table.
export function useAdminUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      users.value = await profileService.listProfiles()
    } catch (err) {
      error.value = 'Could not load users. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Shared by role changes and (de)activation — updates Appwrite, then
  // patches the local row so the table updates without a refetch.
  async function update(user, data) {
    try {
      const updated = await profileService.updateProfile(user.$id, data)
      users.value = users.value.map((u) => (u.$id === user.$id ? updated : u))
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const setRole = (user, role) => update(user, { role })
  const setActive = (user, active) => update(user, { active })

  return { users, loading, error, fetchAll, setRole, setActive }
}
