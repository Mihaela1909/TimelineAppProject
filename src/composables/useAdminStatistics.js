import { ref } from 'vue'
import { getStatisticsData } from '../services/statsService'
import { ROLES } from '../constants/roles'
import { scorePercent, passingScoreOf } from '../utils/quizScore'

// APPLICATION LOGIC for the admin Statistics page: turns raw rows into
// the numbers each tile/chart shows. Pure computation lives in
// buildStatistics() so it's easy to reason about separately from loading.

const MONTHS_SHOWN = 6
const ACTIVE_WINDOW_DAYS = 30
const average = (values) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0)
const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`

// New accounts per month for the last MONTHS_SHOWN months (for the bar chart).
function signupsByMonth(profiles) {
  const now = new Date()
  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - i), 1)
    return {
      key: monthKey(d),
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      fullLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: 0,
    }
  })
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]))
  profiles.forEach((p) => {
    const month = byKey[monthKey(new Date(p.$createdAt))]
    if (month) month.value++
  })
  return months
}

// Per course: how many people started it and how many finished every lesson.
function courseEngagement(courses, lessons, progress) {
  const lessonCount = {}
  const publishedLessonIds = new Set()
  lessons.forEach((l) => {
    lessonCount[l.courseId] = (lessonCount[l.courseId] || 0) + 1
    publishedLessonIds.add(l.$id)
  })

  // courseId -> userId -> Set of completed (published) lessonIds
  const perCourse = {}
  progress.forEach((row) => {
    if (!publishedLessonIds.has(row.lessonId)) return
    perCourse[row.courseId] ??= {}
    perCourse[row.courseId][row.userId] ??= new Set()
    perCourse[row.courseId][row.userId].add(row.lessonId)
  })

  return courses
    .map((course) => {
      const learners = Object.values(perCourse[course.$id] || {})
      const total = lessonCount[course.$id] || 0
      return {
        id: course.$id,
        title: course.title,
        learners: learners.length,
        completed: total ? learners.filter((set) => set.size >= total).length : 0,
      }
    })
    .sort((a, b) => b.learners - a.learners)
}

// Per quiz: number of attempts, average score and pass rate.
function quizPerformance(quizzes, attempts) {
  const byQuiz = {}
  attempts.forEach((a) => (byQuiz[a.quizId] ??= []).push(a))

  return quizzes
    .map((quiz) => {
      const rows = byQuiz[quiz.$id] || []
      const passing = passingScoreOf(quiz)
      return {
        id: quiz.$id,
        title: quiz.title,
        attempts: rows.length,
        avgScore: Math.round(average(rows.map(scorePercent))),
        passRate: rows.length ? Math.round((rows.filter((a) => scorePercent(a) >= passing).length / rows.length) * 100) : 0,
      }
    })
    .sort((a, b) => b.attempts - a.attempts)
}

// Turns the raw rows into every number on the statistics page (no loading here).
export function buildStatistics({ profiles, courses, lessons, quizzes, progress, attempts }) {
  const months = signupsByMonth(profiles)
  const since = Date.now() - ACTIVE_WINDOW_DAYS * 86400000
  const activeLearners = new Set(
    [...progress, ...attempts].filter((r) => new Date(r.$createdAt) >= since).map((r) => r.userId)
  ).size

  const roleCount = (role) => profiles.filter((p) => (p.role || ROLES.USER) === role).length
  const inactive = profiles.filter((p) => p.active === false).length

  return {
    tiles: {
      newThisMonth: months[months.length - 1].value,
      newLastMonth: months[months.length - 2].value,
      activeLearners,
      lessonsCompleted: progress.length,
      quizAttempts: attempts.length,
      avgQuizScore: Math.round(average(attempts.map(scorePercent))),
    },
    signups: months,
    courses: courseEngagement(courses, lessons, progress),
    quizzes: quizPerformance(quizzes, attempts),
    community: {
      total: profiles.length,
      roles: [
        { label: 'Users', value: roleCount(ROLES.USER) },
        { label: 'Editors', value: roleCount(ROLES.EDITOR) },
        { label: 'Admins', value: roleCount(ROLES.ADMIN) },
      ],
      active: profiles.length - inactive,
      inactive,
    },
  }
}

export function useAdminStatistics() {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Load all the data and calculate the statistics.
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      stats.value = buildStatistics(await getStatisticsData())
    } catch (err) {
      error.value = 'Could not load statistics. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchAll }
}
