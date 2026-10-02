import { ref, computed } from 'vue'
import { getAllCourses } from '../services/courseService'
import { getAllQuizzes } from '../services/quizService'
import { getLessonsForCourse } from '../services/lessonService'
import { getAllAttemptsForUser } from '../services/quizAttemptService'
import { getAllProgressForUser } from '../services/progressService'

// APPLICATION LOGIC for the profile page's "My Courses" and "Quiz History"
// tabs: one user's course progress and quiz results.
export function useProfileProgress() {
  const courses = ref([])
  const quizzes = ref([])
  const attempts = ref([])
  const courseProgress = ref([])
  const loading = ref(true)
  const error = ref(null)

  const courseById = computed(() => Object.fromEntries(courses.value.map((c) => [c.$id, c])))
  const quizById = computed(() => Object.fromEntries(quizzes.value.map((q) => [q.$id, q])))

  // NOTE: deliberately does NOT use course.lessonCount, since that's a
  // manually-typed field that can drift out of sync with the real lessons.
  // It counts the actual published lessons per course instead.
  async function buildCourseProgress(progressRows) {
    const map = {}
    progressRows.forEach((row) => {
      if (!map[row.courseId]) map[row.courseId] = new Set()
      map[row.courseId].add(row.lessonId)
    })

    const entries = await Promise.all(
      Object.entries(map).map(async ([courseId, lessonSet]) => {
        const course = courseById.value[courseId]
        if (!course) return null
        const realLessons = await getLessonsForCourse(courseId, { publishedOnly: true })
        const completedCount = lessonSet.size
        const total = realLessons.length || completedCount
        return { course, completedCount, total, isComplete: completedCount >= total }
      })
    )
    return entries.filter(Boolean)
  }

  async function fetchFor(userId) {
    if (!userId) return
    loading.value = true
    error.value = null
    try {
      const [coursesData, quizzesData, attemptsData, progressData] = await Promise.all([
        getAllCourses(),
        getAllQuizzes(),
        getAllAttemptsForUser(userId),
        getAllProgressForUser(userId),
      ])
      courses.value = coursesData
      quizzes.value = quizzesData
      attempts.value = attemptsData
      courseProgress.value = await buildCourseProgress(progressData)
    } catch (err) {
      error.value = 'Could not load your progress. Please refresh the page.'
      console.error(err)
    } finally {
      loading.value = false // always — otherwise a failure leaves skeletons forever
    }
  }

  const inProgressCourses = computed(() => courseProgress.value.filter((c) => !c.isComplete))
  const completedCourses = computed(() => courseProgress.value.filter((c) => c.isComplete))

  const quizStats = computed(() => {
    if (attempts.value.length === 0) return { count: 0, avg: 0 }
    const totalPct = attempts.value.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0)
    return { count: attempts.value.length, avg: Math.round(totalPct / attempts.value.length) }
  })

  return {
    attempts,
    courseProgress,
    inProgressCourses,
    completedCourses,
    quizById,
    quizStats,
    loading,
    error,
    fetchFor,
  }
}
