import { ref, computed } from 'vue'
import * as courseService from '../services/courseService'
import { missingFieldsMessage } from '../utils/formChecks'

// Required in Appwrite — checked here first so the user gets a clear
// message instead of a generic "could not save".
export const REQUIRED_IMAGES = { coverImageId: 'cover image', headerImageId: 'header image' }

// APPLICATION LOGIC for the admin Courses screens. Separate from
// useCourses.js (which is the public-facing, read-only homepage version)
// because the admin needs unpublished courses too, plus write operations.
export function useAdminCourses() {
  const courses = ref([])
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
      courses.value = await courseService.getAllCourses()
    } catch (err) {
      error.value = 'Could not load courses. Please try again.'
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
      return await courseService.getCourseById(id)
    } catch (err) {
      console.error(err)
      loadError.value = 'Could not load this course. Please try again.'
      return null
    } finally {
      loadingOne.value = false
    }
  }

  async function save(id, data) {
    if (saving.value) return false // already saving — ignore double-clicks
    error.value = missingFieldsMessage(data, REQUIRED_IMAGES)
    if (error.value) return false
    saving.value = true
    try {
      if (id) {
        await courseService.updateCourse(id, data)
      } else {
        await courseService.createCourse(data)
      }
      return true
    } catch (err) {
      error.value = 'Could not save this course. Please check the form and try again.'
      console.error(err)
      return false
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
      await courseService.deleteCourse(id)
      courses.value = courses.value.filter((c) => c.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      deleting.value = false // RESET: always, even on failure
    }
  }

  // Every category used by an existing course (CategoryPicker dedupes and sorts).
  const categories = computed(() => courses.value.map((c) => c.category))

  return { courses, categories, loading, error, saving, deleting, fetchAll, fetchOne, loadingOne, loadError, save, remove }
}