import { ref } from 'vue'
import { getCourseById } from '../services/courseService'
import { getLessonsForCourse } from '../services/lessonService'

export function useCourseDetail() {
  const course = ref(null)
  const lessons = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCourseAndLessons(courseId) {
    loading.value = true
    error.value = null
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsForCourse(courseId, { publishedOnly: true }),
      ])
      course.value = courseData
      lessons.value = lessonsData
    } catch (err) {
      error.value = 'Could not load this course.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { course, lessons, loading, error, fetchCourseAndLessons }
}