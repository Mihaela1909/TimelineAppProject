import { ref } from 'vue'
import { countRows, getLatestRows, TABLES } from '../services/dashboardService'

// APPLICATION LOGIC for the admin dashboard: four stat counts plus a
// "Recent Activity" feed built by merging the newest rows of each table.
// There's no separate activity-log table — each row's own $createdAt /
// $updatedAt timestamps are the activity history.

const PER_TABLE = 10

function contentEvents(rows, kind, label, editPath) {
  return rows.map((row) => ({
    id: `${kind}-${row.$id}`,
    icon: kind,
    text: `${row.published ? `${label} published` : 'Draft saved'} — "${row.title}"`,
    date: row.$updatedAt,
    to: editPath(row),
  }))
}

export function useAdminDashboard() {
  const stats = ref({ courses: 0, quizzes: 0, blogPosts: 0, users: 0 })
  const activity = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [courses, quizzes, blogPosts, users, latestCourses, latestQuizzes, latestPosts, latestUsers] =
        await Promise.all([
          countRows(TABLES.COURSES),
          countRows(TABLES.QUIZZES),
          countRows(TABLES.BLOG_POSTS),
          countRows(TABLES.PROFILES),
          getLatestRows(TABLES.COURSES, { limit: PER_TABLE }),
          getLatestRows(TABLES.QUIZZES, { limit: PER_TABLE }),
          getLatestRows(TABLES.BLOG_POSTS, { limit: PER_TABLE }),
          // Sign-ups are about creation time; ordering profiles by
          // $updatedAt would surface role changes / photo approvals instead.
          getLatestRows(TABLES.PROFILES, { limit: PER_TABLE, orderBy: '$createdAt' }),
        ])

      stats.value = { courses, quizzes, blogPosts, users }

      activity.value = [
        ...contentEvents(latestCourses, 'course', 'Course', (r) => `/admin/courses/${r.$id}/edit`),
        ...contentEvents(latestQuizzes, 'quiz', 'Quiz', (r) => `/admin/quizzes/${r.$id}/edit`),
        ...contentEvents(latestPosts, 'post', 'Post', (r) => `/admin/blog-posts/${r.$id}/edit`),
        ...latestUsers.map((row) => ({
          id: `user-${row.$id}`,
          icon: 'user',
          text: `New user signed up — ${row.name || 'unnamed user'}`,
          date: row.$createdAt,
          to: null,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, PER_TABLE * 2)
    } catch (err) {
      error.value = 'Could not load dashboard data. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { stats, activity, loading, error, fetchAll }
}

// Moved to utils/time.js (also used by the quiz page); re-exported for existing imports.
export { timeAgo } from '../utils/time'
