import { ref, computed } from 'vue'
import { getPublishedCourses } from '../services/courseService'
import { getPublishedQuizzes } from '../services/quizService'
import { getQuestionsForQuizzes } from '../services/quizQuestionService'
import { useCourseStatuses } from './useCourseStatuses'

// APPLICATION LOGIC for the home page's "test your knowledge" quiz: a mixed quiz
// built from the existing course quizzes (QUESTIONS_PER_COURSE random questions from
// each published course), scored per course to give a level + a recommended course.
// Nothing is saved — it's a low-pressure check, open to guests.

export const QUESTIONS_PER_COURSE = 2

// Overall level from the % correct (checked from the top down).
export const LEVELS = [
  { min: 75, name: 'Historian', text: 'You really know your history.' },
  { min: 40, name: 'Explorer', text: 'A solid base, with a few gaps to fill.' },
  { min: 0, name: 'Beginner', text: 'Every historian starts somewhere — great time to dive in.' },
]

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// PURE: up to `perCourse` random questions from each published course's quiz,
// tagged with their course, in random order. Courses without a quiz/questions are skipped.
export function pickLevelQuestions(courses, quizzes, questions, perCourse = QUESTIONS_PER_COURSE) {
  const courseIds = new Set(courses.map((c) => c.$id))
  const courseByQuiz = Object.fromEntries(quizzes.filter((q) => courseIds.has(q.courseId)).map((q) => [q.$id, q.courseId]))
  const byCourse = {}
  for (const question of questions) {
    const courseId = courseByQuiz[question.quizId]
    if (courseId && question.options?.length) (byCourse[courseId] ??= []).push(question)
  }
  const picked = Object.entries(byCourse).flatMap(([courseId, list]) =>
    shuffle(list).slice(0, perCourse).map((q) => ({ ...q, courseId }))
  )
  return shuffle(picked)
}

// PURE: level + per-course scores + the recommended course.
// Recommendation = the course with the lowest score (where there's most to learn);
// ties go to courses the user hasn't completed, then hasn't started. If everything
// is right, it's the first course they haven't completed yet.
export function scoreLevelQuiz(questions, answers, courses, statusById = {}) {
  const total = questions.length
  const correct = questions.filter((q, i) => answers[i] === q.correctOptionIndex).length
  const percent = total ? Math.round((correct / total) * 100) : 0
  const level = LEVELS.find((l) => percent >= l.min)

  const perCourse = {}
  questions.forEach((q, i) => {
    const entry = (perCourse[q.courseId] ??= { correct: 0, total: 0 })
    entry.total++
    if (answers[i] === q.correctOptionIndex) entry.correct++
  })
  const progressRank = (id) => ({ completed: 2, 'in-progress': 1 })[statusById[id]?.state] ?? 0
  const byCourse = courses
    .filter((c) => perCourse[c.$id])
    .map((course) => ({ course, ...perCourse[course.$id], ratio: perCourse[course.$id].correct / perCourse[course.$id].total }))
    .sort((a, b) => a.ratio - b.ratio || progressRank(a.course.$id) - progressRank(b.course.$id))

  const notCompleted = byCourse.filter((e) => progressRank(e.course.$id) < 2)
  const recommended = (percent === 100 ? notCompleted[0] : notCompleted[0] || byCourse[0])?.course || null

  return { correct, total, percent, level, byCourse, recommended }
}

export function useLevelQuiz() {
  const pool = ref({ courses: [], quizzes: [], questions: [] }) // everything loaded, to re-pick on retake
  const questions = ref([])
  const answers = ref([]) // chosen option index per question
  const loading = ref(false)
  const error = ref(null)

  // 'start' | 'question' | 'results'
  const phase = ref('start')
  const currentIndex = ref(0)
  const selectedIndex = ref(null)
  const answered = ref(false)

  const { statusById, fetchFor: fetchStatuses } = useCourseStatuses()

  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
  const courseCount = computed(() => new Set(questions.value.map((q) => q.courseId)).size)
  const courseById = computed(() => Object.fromEntries(pool.value.courses.map((c) => [c.$id, c])))
  const result = computed(() =>
    phase.value === 'results' ? scoreLevelQuiz(questions.value, answers.value, pool.value.courses, statusById.value) : null
  )

  async function load(userId) {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const [courses, quizzes] = await Promise.all([getPublishedCourses(), getPublishedQuizzes()])
      const questionRows = await getQuestionsForQuizzes(quizzes.map((q) => q.$id))
      pool.value = { courses, quizzes, questions: questionRows }
      questions.value = pickLevelQuestions(courses, quizzes, questionRows)
      fetchStatuses(userId) // only refines the recommendation; guests have none
    } catch (err) {
      console.error(err)
      error.value = 'Could not load the quiz. Please try again.'
    } finally {
      loading.value = false
    }
  }

  function start() {
    phase.value = 'question'
    currentIndex.value = 0
    selectedIndex.value = null
    answered.value = false
    answers.value = []
  }

  function selectOption(index) {
    if (!answered.value) selectedIndex.value = index
  }

  function submitAnswer() {
    if (selectedIndex.value === null || answered.value) return // no double-scoring
    answered.value = true
    answers.value[currentIndex.value] = selectedIndex.value
  }

  function nextQuestion() {
    if (!answered.value || phase.value !== 'question') return // must answer first; ignore double-clicks
    if (isLastQuestion.value) {
      phase.value = 'results'
      return
    }
    currentIndex.value++
    selectedIndex.value = null
    answered.value = false
  }

  // A retake gets a fresh random set of questions.
  function retake() {
    const { courses, quizzes, questions: rows } = pool.value
    questions.value = pickLevelQuestions(courses, quizzes, rows)
    start()
  }

  return {
    questions,
    loading,
    error,
    phase,
    currentIndex,
    selectedIndex,
    answered,
    currentQuestion,
    isLastQuestion,
    courseCount,
    courseById,
    result,
    load,
    start,
    selectOption,
    submitAnswer,
    nextQuestion,
    retake,
  }
}
