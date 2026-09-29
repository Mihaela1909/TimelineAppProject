import { ref } from 'vue'
import { getPublishedCourses } from '../services/courseService'

// APPLICATION LOGIC LAYER.
// This composable owns reactive state (loading, error, courses) and calls
// the service layer to get data. It knows nothing about HOW data is
// fetched (mock array vs. Appwrite) — that's courseService.js's job.
// Components import this, never the service directly.
export function useCourses() {
  const courses = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchPopularCourses(limit = 3) {
    loading.value = true
    error.value = null
    try {
      courses.value = await getPublishedCourses({ limit })
    } catch (err) {
      error.value = 'Could not load courses. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllPublished() {
    loading.value = true
    error.value = null
    try {
      courses.value = await getPublishedCourses()
    } catch (err) {
      error.value = 'Could not load courses. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { courses, loading, error, fetchPopularCourses, fetchAllPublished }
}