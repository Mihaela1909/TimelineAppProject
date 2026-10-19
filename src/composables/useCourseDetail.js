import { ref } from 'vue'
import { getCourseById } from '../services/courseService'
import { getLessonsForCourse } from '../services/lessonService'
import { getQuizForCourse } from '../services/quizService'
import { useAuth } from './useAuth'

// APPLICATION LOGIC for the course overview and lesson pages: loads one course,
// its published lessons (in order) and its quiz, all at the same time.

export function useCourseDetail() {
  const course = ref(null)
  const lessons = ref([])
  const quiz = ref(null) // the course's published quiz, if it has one
  const loading = ref(false)
  const error = ref(null)
  const { isStaff } = useAuth()

  // Load the course, its published lessons and its quiz in parallel.
  async function fetchCourseAndLessons(courseId) {
    loading.value = true
    error.value = null
    try {
      const [courseData, lessonsData, quizData] = await Promise.all([
        getCourseById(courseId),
        getLessonsForCourse(courseId, { publishedOnly: true }),
        // The quiz is optional: a failure here shouldn't hide the course itself.
        getQuizForCourse(courseId, { publishedOnly: true }).catch((err) => {
          console.error(err)
          return null
        }),
      ])
      // A draft (not published) course is only shown to staff, so they can preview it.
      if (!courseData.published && !isStaff.value) {
        error.value = "This course isn't available."
        return
      }
      course.value = courseData
      lessons.value = lessonsData
      quiz.value = quizData
    } catch (err) {
      error.value = 'Could not load this course.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { course, lessons, quiz, loading, error, fetchCourseAndLessons }
}