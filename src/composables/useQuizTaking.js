import { ref, computed } from 'vue'
import { getQuizById } from '../services/quizService'
import { getQuestionsForQuiz } from '../services/quizQuestionService'
import { createAttempt, getAttemptsForUserAndQuiz } from '../services/quizAttemptService'
import { getCourseById } from '../services/courseService'

export function useQuizTaking() {
  const quiz = ref(null)
  const course = ref(null)
  const questions = ref([])
  const pastAttempts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 'start' | 'question' | 'results'
  const phase = ref('start')
  const currentIndex = ref(0)
  const selectedIndex = ref(null)
  const answered = ref(false)
  const correctCount = ref(0)

  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)

  async function fetchQuiz(quizId, userId) {
    loading.value = true
    error.value = null
    try {
      const quizData = await getQuizById(quizId)
      quiz.value = quizData
      questions.value = await getQuestionsForQuiz(quizId)
      if (quizData.courseId) course.value = await getCourseById(quizData.courseId)
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
    if (selectedIndex.value === null) return
    answered.value = true
    if (selectedIndex.value === currentQuestion.value.correctOptionIndex) {
      correctCount.value++
    }
  }

  async function nextQuestion(userId) {
    if (isLastQuestion.value) {
      phase.value = 'results'
      if (userId) {
        const attempt = await createAttempt({
          userId,
          quizId: quiz.value.$id,
          score: correctCount.value,
          totalQuestions: questions.value.length,
        })
        pastAttempts.value = [attempt, ...pastAttempts.value]
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