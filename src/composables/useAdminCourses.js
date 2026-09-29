import { ref } from 'vue'
import * as courseService from '../services/courseService'

// APPLICATION LOGIC for the admin Courses screens. Separate from
// useCourses.js (which is the public-facing, read-only homepage version)
// because the admin needs unpublished courses too, plus write operations.
export function useAdminCourses() {
  const courses = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

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

  async function fetchOne(id) {
    loading.value = true
    error.value = null
    try {
      return await courseService.getCourseById(id)
    } catch (err) {
      error.value = 'Could not load this course.'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function save(id, data) {
    saving.value = true
    error.value = null
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

  async function remove(id) {
    try {
      await courseService.deleteCourse(id)
      courses.value = courses.value.filter((c) => c.$id !== id)
      return true
    } catch (err) {
      error.value = 'Could not delete this course.'
      console.error(err)
      return false
    }
  }

  return { courses, loading, error, saving, fetchAll, fetchOne, save, remove }
}