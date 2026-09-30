<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminQuizzes } from '../../composables/useAdminQuizzes'
import { useAdminCourses } from '../../composables/useAdminCourses'
import ConfirmModal from '../../components/admin/ConfirmModal.vue'
import { useToast } from '../../composables/useToast'

const { quizzes, loading, error, fetchAll, remove } = useAdminQuizzes()
const { courses, fetchAll: fetchCourses } = useAdminCourses()
const pendingDelete = ref(null)
const toast = useToast()

onMounted(() => {
  fetchAll()
  fetchCourses()
})

// Quizzes only store a courseId, not the course's title — this builds a
// quick lookup so the table can show something readable instead of a
// raw Appwrite document ID.
const courseTitleById = computed(() => {
  const map = {}
  courses.value.forEach((c) => (map[c.$id] = c.title))
  return map
})

async function confirmDelete() {
  await remove(pendingDelete.value.$id)
  toast.success('Quiz deleted')
  pendingDelete.value = null
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="font-voice text-3xl text-bark">Quizzes</h1>
      <RouterLink
        to="/admin/quizzes/new"
        class="text-sm px-5 py-2.5 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
      >
        + New Quiz
      </RouterLink>
    </div>

    <div v-if="loading" class="bg-white rounded-xl p-6 space-y-3" aria-live="polite">
      <div v-for="n in 3" :key="n" class="h-8 bg-olive-light rounded animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div v-else-if="quizzes.length === 0" class="bg-white rounded-xl p-12 text-center text-sm text-bark/60">
      No quizzes yet.
      <RouterLink to="/admin/quizzes/new" class="text-olive font-medium">Create your first one</RouterLink>.
    </div>

    <div v-else class="bg-white rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-bark/50 border-b border-black/5">
            <th class="py-3 px-5 font-medium">Title</th>
            <th class="py-3 px-5 font-medium">Course</th>
            <th class="py-3 px-5 font-medium">Status</th>
            <th class="py-3 px-5"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in quizzes" :key="quiz.$id" class="border-b border-black/5 last:border-0">
            <td class="py-3 px-5 text-bark">{{ quiz.title }}</td>
            <td class="py-3 px-5 text-bark/70">{{ courseTitleById[quiz.courseId] || '—' }}</td>
            <td class="py-3 px-5">
              <span
                class="text-xs px-3 py-1 rounded-full"
                :class="quiz.published ? 'bg-olive-light text-olive' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ quiz.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="py-3 px-5 text-right whitespace-nowrap">
              <RouterLink :to="`/admin/quizzes/${quiz.$id}/edit`" class="mr-3 text-bark/60 hover:text-bark">
                ✎
              </RouterLink>
              <button class="text-red-500 hover:text-red-700" @click="pendingDelete = quiz">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :open="!!pendingDelete"
      title="Delete this quiz?"
      :message="`&quot;${pendingDelete?.title}&quot; and all its questions will be permanently deleted.`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>