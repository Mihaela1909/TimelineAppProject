import { ref } from 'vue'
import { getPublishedCourses } from '../services/courseService'

// APPLICATION LOGIC for the public course lists (courses page, home page,
// quizzes page). Published courses only; the admin side uses useAdminCourses.
export function useCourses() {
  const courses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // limit = only the first N (home page); no limit = all published courses.
  async function fetchPublished(limit) {
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

  return { courses, loading, error, fetchPublished }
}
