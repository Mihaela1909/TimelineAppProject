import { ref } from 'vue'
import * as quizService from '../services/quizService'

// APPLICATION LOGIC for the public quiz list (published quizzes only).
export function useQuizzes() {
  const quizzes = ref([])
  // Starts true: these pages fetch on mount, and starting false would
  // flash the "nothing here" empty state for a frame first.
  const loading = ref(true)
  const error = ref(null)

  async function fetchPublished() {
    loading.value = true
    error.value = null
    try {
      quizzes.value = await quizService.getPublishedQuizzes()
    } catch (err) {
      error.value = 'Could not load quizzes.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { quizzes, loading, error, fetchPublished }
}
