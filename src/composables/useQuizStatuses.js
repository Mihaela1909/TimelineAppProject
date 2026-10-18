import { ref } from 'vue'
import { getAllAttemptsForUser } from '../services/quizAttemptService'
import { useCourseStatuses } from './useCourseStatuses'
import { scorePercent, passingScoreOf } from '../utils/quizScore'

// APPLICATION LOGIC: the logged-in user's result for every quiz at once
// (best score + passed?), and which courses they've finished — for the
// status pills on the quiz list. Guests get nothing (no attempts/progress).
export function useQuizStatuses() {
  const attemptsByQuiz = ref({}) // quizId → { best: 0–100 }
  const { statusById: courseStatusById, fetchFor: fetchCourseStatuses } = useCourseStatuses()

  // Load the user's quiz results and course progress for the status pills.
  async function fetchFor(userId) {
    attemptsByQuiz.value = {}
    if (!userId) return
    try {
      const [attempts] = await Promise.all([getAllAttemptsForUser(userId), fetchCourseStatuses(userId)])
      const byQuiz = {}
      attempts.forEach((a) => {
        const pct = Math.round(scorePercent(a))
        byQuiz[a.quizId] = { best: Math.max(byQuiz[a.quizId]?.best ?? 0, pct) }
      })
      attemptsByQuiz.value = byQuiz
    } catch (err) {
      // Pills are a nice-to-have: the quiz list still works without them.
      console.error(err)
    }
  }

  // One of: 'passed' | 'failed' | 'course-unfinished' | 'not-attempted' (or null for guests)
  function statusFor(quiz, isLoggedIn) {
    if (!isLoggedIn) return null
    const attempt = attemptsByQuiz.value[quiz.$id]
    if (attempt) {
      return { state: attempt.best >= passingScoreOf(quiz) ? 'passed' : 'failed', score: attempt.best }
    }
    const courseDone = courseStatusById.value[quiz.courseId]?.state === 'completed'
    if (quiz.courseId && !courseDone) return { state: 'course-unfinished' }
    return { state: 'not-attempted' }
  }

  return { fetchFor, statusFor }
}
