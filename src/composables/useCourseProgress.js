import { ref } from 'vue'
import { getCompletedLessonIds, markLessonComplete } from '../services/progressService'

// APPLICATION LOGIC for one user's progress through one course — shared by
// the course page (progress bar, "continue" button) and the lesson page
// ("mark complete").
export function useCourseProgress() {
  const completedLessonIds = ref([])
  const marking = ref(false)

  async function fetchCompleted(userId, courseId) {
    completedLessonIds.value = []
    if (!userId) return // guests have no progress
    try {
      completedLessonIds.value = await getCompletedLessonIds(userId, courseId)
    } catch (err) {
      // Progress is a nice-to-have on these pages; the lesson content
      // should still show if it fails, so this degrades to "none done".
      console.error(err)
    }
  }

  // Returns true when the lesson is (now) complete.
  async function markComplete({ userId, courseId, lessonId }) {
    if (!userId || marking.value) return false
    if (completedLessonIds.value.includes(lessonId)) return true

    marking.value = true
    try {
      await markLessonComplete({ userId, courseId, lessonId })
      completedLessonIds.value = [...completedLessonIds.value, lessonId]
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      marking.value = false
    }
  }

  return { completedLessonIds, marking, fetchCompleted, markComplete }
}
