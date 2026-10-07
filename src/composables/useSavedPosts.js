import { ref } from 'vue'
import { getSavedPostIds, savePost, unsavePost } from '../services/savedPostService'

// APPLICATION LOGIC for saved blog posts (the post page's Save button and the
// profile's "Saved Posts" tab). Module-scope state, like useAuth: saving on a
// post page is immediately reflected on the profile without a refetch.
const savedIds = ref([])
const loadedFor = ref(null) // which user savedIds belongs to
const loading = ref(false)
const error = ref(null)
const busy = ref(false)

export function useSavedPosts() {
  async function fetchFor(userId) {
    if (!userId) {
      savedIds.value = []
      loadedFor.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      savedIds.value = await getSavedPostIds(userId)
      loadedFor.value = userId
    } catch (err) {
      console.error(err)
      error.value = 'Could not load your saved posts.'
    } finally {
      loading.value = false
    }
  }

  const isSaved = (postId) => savedIds.value.includes(postId)

  // Save ↔ unsave. Returns the new state (true = saved), or null on failure.
  async function toggle(userId, postId) {
    if (!userId || busy.value) return null
    const wasSaved = isSaved(postId)
    busy.value = true
    try {
      if (wasSaved) {
        await unsavePost({ userId, postId })
        savedIds.value = savedIds.value.filter((id) => id !== postId)
      } else {
        await savePost({ userId, postId })
        savedIds.value = [...savedIds.value, postId]
      }
      return !wasSaved
    } catch (err) {
      console.error(err)
      return null
    } finally {
      busy.value = false
    }
  }

  return { savedIds, loadedFor, loading, error, busy, fetchFor, isSaved, toggle }
}
