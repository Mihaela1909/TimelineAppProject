import { ref } from 'vue'
import * as quizService from '../services/quizService'

export function useAdminQuizzes() {
  const quizzes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      quizzes.value = await quizService.getAllQuizzes()
    } catch (err) {
      error.value = 'Could not load quizzes.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      return await quizService.getQuizById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function save(id, data) {
    saving.value = true
    error.value = null
    try {
      return id ? await quizService.updateQuiz(id, data) : await quizService.createQuiz(data)
    } catch (err) {
      error.value = 'Could not save this quiz.'
      console.error(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id) {
    try {
      await quizService.deleteQuiz(id)
      quizzes.value = quizzes.value.filter((q) => q.$id !== id)
      return true
    } catch (err) {
      error.value = 'Could not delete this quiz.'
      console.error(err)
      return false
    }
  }

  return { quizzes, loading, error, saving, fetchAll, fetchOne, save, remove }
}