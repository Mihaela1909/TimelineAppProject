import { ref, computed } from 'vue'
import { getAllCourses } from '../services/courseService'
import { getAllQuizzes } from '../services/quizService'
import { getAllPublishedLessons } from '../services/lessonService'
import { getAllAttemptsForUser } from '../services/quizAttemptService'
import { getAllProgressForUser } from '../services/progressService'
import { scorePercent } from '../utils/quizScore'

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

  // One entry per course the user has started: { course, completedCount, total, isComplete }.
  // NOTE: deliberately does NOT use course.lessonCount, since that's a
  // manually-typed field that can drift out of sync with the real lessons.
  // It counts the actual published lessons per course instead.
  function buildCourseProgress(progressRows, publishedLessons) {
    const lessonTotal = {} // courseId → number of published lessons
    publishedLessons.forEach((lesson) => {
      lessonTotal[lesson.courseId] = (lessonTotal[lesson.courseId] || 0) + 1
    })

    const doneByCourse = {} // courseId → Set of completed lesson ids
    progressRows.forEach((row) => {
      if (!doneByCourse[row.courseId]) doneByCourse[row.courseId] = new Set()
      doneByCourse[row.courseId].add(row.lessonId)
    })

    return Object.entries(doneByCourse)
      .filter(([courseId]) => courseById.value[courseId])
      .map(([courseId, done]) => {
        const completedCount = done.size
        const total = lessonTotal[courseId] || completedCount
        return { course: courseById.value[courseId], completedCount, total, isComplete: completedCount >= total }
      })
  }

  async function fetchFor(userId) {
    if (!userId) return
    loading.value = true
    error.value = null
    try {
      const [coursesData, quizzesData, attemptsData, progressData, lessonsData] = await Promise.all([
        getAllCourses(),
        getAllQuizzes(),
        getAllAttemptsForUser(userId),
        getAllProgressForUser(userId),
        getAllPublishedLessons(),
      ])
      courses.value = coursesData
      quizzes.value = quizzesData
      attempts.value = attemptsData
      courseProgress.value = buildCourseProgress(progressData, lessonsData)
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
    const totalPct = attempts.value.reduce((sum, a) => sum + scorePercent(a), 0)
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
