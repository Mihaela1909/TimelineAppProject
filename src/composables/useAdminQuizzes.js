import { ref } from 'vue'
import * as quizService from '../services/quizService'
import { missingFieldsMessage } from '../utils/formChecks'

// Required in Appwrite — checked here first so the user gets a clear
// message instead of a generic "could not save".
export const REQUIRED_IMAGES = { coverImageId: 'cover image', headerImageId: 'header image' }

export function useAdminQuizzes() {
  const quizzes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadingOne = ref(false)
  const loadError = ref(null)
  const saving = ref(false)
  const deleting = ref(false) // separate from saving: a delete from the list isn't a form save

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

  // Edit forms: loads the row being edited, with its own loading/error so the form
  // can show a skeleton or a Retry box instead of an empty form.
  async function fetchOne(id) {
    loadingOne.value = true
    loadError.value = null
    try {
      return await quizService.getQuizById(id)
    } catch (err) {
      console.error(err)
      loadError.value = 'Could not load this quiz. Please try again.'
      return null
    } finally {
      loadingOne.value = false
    }
  }

  async function save(id, data) {
    if (saving.value) return null // already saving — ignore double-clicks
    error.value = missingFieldsMessage(data, REQUIRED_IMAGES)
    if (error.value) return null
    saving.value = true
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

  // Returns true/false; the caller shows the toast. Deliberately doesn't set
  // `error`, which is the page's load error and would replace the whole list.
  async function remove(id) {
    if (deleting.value) return false // CHECK: a delete is already running (double-click)
    deleting.value = true
    try {
      await quizService.deleteQuiz(id)
      quizzes.value = quizzes.value.filter((q) => q.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      deleting.value = false // RESET: always, even on failure
    }
  }

  return { quizzes, loading, error, saving, deleting, fetchAll, fetchOne, loadingOne, loadError, save, remove }
}