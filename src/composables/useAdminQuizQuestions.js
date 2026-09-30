import { ref } from 'vue'
import * as questionService from '../services/quizQuestionService'

export function useAdminQuizQuestions() {
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  async function fetchForQuiz(quizId) {
    loading.value = true
    error.value = null
    try {
      questions.value = await questionService.getQuestionsForQuiz(quizId)
    } catch (err) {
      error.value = 'Could not load questions.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      return await questionService.getQuestionById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function save(id, data) {
    saving.value = true
    error.value = null
    try {
      return id ? await questionService.updateQuestion(id, data) : await questionService.createQuestion(data)
    } catch (err) {
      error.value = 'Could not save this question.'
      console.error(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id) {
    try {
      await questionService.deleteQuestion(id)
      questions.value = questions.value.filter((q) => q.$id !== id)
      return true
    } catch (err) {
      error.value = 'Could not delete this question.'
      console.error(err)
      return false
    }
  }

  return { questions, loading, error, saving, fetchForQuiz, fetchOne, save, remove }
}