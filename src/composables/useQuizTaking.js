import { ref, computed } from 'vue'
import { getQuizById } from '../services/quizService'
import { getQuestionsForQuiz } from '../services/quizQuestionService'
import { createAttempt, getAttemptsForUserAndQuiz } from '../services/quizAttemptService'
import { getCourseById } from '../services/courseService'
import { getLessonsForCourse } from '../services/lessonService'
import { useToast } from './useToast'

export function useQuizTaking() {
  const quiz = ref(null)
  const course = ref(null)
  const questions = ref([])
  const pastAttempts = ref([])
  const courseLessonCount = ref(0) // published lessons in the linked course (for 'course completed?')
  const loading = ref(false)
  const error = ref(null)

  // 'start' | 'question' | 'results'
  const phase = ref('start')
  const currentIndex = ref(0)
  const selectedIndex = ref(null)
  const answered = ref(false)
  const correctCount = ref(0)
  const toast = useToast()

  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)

  async function fetchQuiz(quizId, userId) {
    loading.value = true
    error.value = null
    try {
      const quizData = await getQuizById(quizId)
      quiz.value = quizData
      questions.value = await getQuestionsForQuiz(quizId)
      if (quizData.courseId) {
        const [courseData, lessons] = await Promise.all([
          getCourseById(quizData.courseId),
          getLessonsForCourse(quizData.courseId, { publishedOnly: true }),
        ])
        course.value = courseData
        courseLessonCount.value = lessons.length
      }
      if (userId) pastAttempts.value = await getAttemptsForUserAndQuiz(userId, quizId)
    } catch (err) {
      error.value = 'Could not load this quiz.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  function startQuiz() {
    phase.value = 'question'
    currentIndex.value = 0
    selectedIndex.value = null
    answered.value = false
    correctCount.value = 0
  }

  function selectOption(index) {
    if (!answered.value) selectedIndex.value = index
  }

  function submitAnswer() {
    if (selectedIndex.value === null || answered.value) return // no double-scoring
    answered.value = true
    if (selectedIndex.value === currentQuestion.value.correctOptionIndex) {
      correctCount.value++
    }
  }

  async function nextQuestion(userId) {
    if (!answered.value || phase.value !== 'question') return // must answer first; ignore double-clicks
    if (isLastQuestion.value) {
      phase.value = 'results'
      if (userId) {
        // The results screen still shows if saving fails — the user just
        // learns this attempt won't appear in their history.
        try {
          const attempt = await createAttempt({
            userId,
            quizId: quiz.value.$id,
            score: correctCount.value,
            totalQuestions: questions.value.length,
          })
          pastAttempts.value = [attempt, ...pastAttempts.value]
        } catch (err) {
          console.error(err)
          toast.error('Your result could not be saved to your history.')
        }
      }
    } else {
      currentIndex.value++
      selectedIndex.value = null
      answered.value = false
    }
  }

  function retake() {
    startQuiz()
  }

  return {
    quiz,
    course,
    questions,
    pastAttempts,
    courseLessonCount,
    loading,
    error,
    phase,
    currentIndex,
    selectedIndex,
    answered,
    correctCount,
    currentQuestion,
    isLastQuestion,
    fetchQuiz,
    startQuiz,
    selectOption,
    submitAnswer,
    nextQuestion,
    retake,
  }
}