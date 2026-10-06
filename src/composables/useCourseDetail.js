import { ref } from 'vue'
import { getCourseById } from '../services/courseService'
import { getLessonsForCourse } from '../services/lessonService'
import { getQuizForCourse } from '../services/quizService'

export function useCourseDetail() {
  const course = ref(null)
  const lessons = ref([])
  const quiz = ref(null) // the course's published quiz, if it has one
  const loading = ref(false)
  const error = ref(null)

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