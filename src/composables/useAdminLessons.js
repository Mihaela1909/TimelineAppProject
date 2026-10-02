import { ref } from 'vue'
import * as lessonService from '../services/lessonService'
import { missingFieldsMessage } from '../utils/formChecks'

// Required in Appwrite — checked here first so the user gets a clear
// message instead of a generic "could not save".
export const REQUIRED_IMAGES = { imageId: 'lesson image' }

export function useAdminLessons() {
  const lessons = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  async function fetchForCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      lessons.value = await lessonService.getLessonsForCourse(courseId)
    } catch (err) {
      error.value = 'Could not load lessons.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      return await lessonService.getLessonById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function save(id, data) {
    if (saving.value) return null // already saving — ignore double-clicks
    error.value = missingFieldsMessage(data, REQUIRED_IMAGES)
    if (error.value) return null
    saving.value = true
    try {
      // Return the saved row itself (not just true/false) so callers can
      // read its $id — needed when creating a lesson for the first time,
      // since there's no id to pass in beforehand.
      return id ? await lessonService.updateLesson(id, data) : await lessonService.createLesson(data)
    } catch (err) {
      error.value = 'Could not save this lesson.'
      console.error(err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Returns true/false; the caller shows the toast. Deliberately doesn't set
  // `error`, which is the page's load error and would replace the whole list.
  async function remove(id) {
    try {
      await lessonService.deleteLesson(id)
      lessons.value = lessons.value.filter((l) => l.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return { lessons, loading, error, saving, fetchForCourse, fetchOne, save, remove }
}