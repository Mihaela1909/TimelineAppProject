import { ref } from 'vue'
import { getAllProgressForUser } from '../services/progressService'
import { getAllPublishedLessons } from '../services/lessonService'

// APPLICATION LOGIC: the logged-in user's status for every course at once
// ("in-progress" / "completed" + how far), for the badges on the course list.
// Two reads total (their progress + all published lessons), not one per course.
export function useCourseStatuses() {
  const statusById = ref({})

  async function fetchFor(userId) {
    statusById.value = {}
    if (!userId) return // guests have no progress
    try {
      const [progress, lessons] = await Promise.all([getAllProgressForUser(userId), getAllPublishedLessons()])

      const totalByCourse = {}
      const publishedIds = new Set()
      lessons.forEach((l) => {
        totalByCourse[l.courseId] = (totalByCourse[l.courseId] || 0) + 1
        publishedIds.add(l.$id)
      })

      const doneByCourse = {}
      progress.forEach((row) => {
        if (!publishedIds.has(row.lessonId)) return // ignore removed/unpublished lessons
        ;(doneByCourse[row.courseId] ??= new Set()).add(row.lessonId)
      })

      statusById.value = Object.fromEntries(
        Object.entries(doneByCourse).map(([courseId, done]) => {
          const total = totalByCourse[courseId] || done.size
          const ratio = Math.min(1, done.size / total)
          return [courseId, { state: ratio >= 1 ? 'completed' : 'in-progress', ratio }]
        })
      )
    } catch (err) {
      // Badges are a nice-to-have: the course list still works without them.
      console.error(err)
    }
  }

  return { statusById, fetchFor }
}
