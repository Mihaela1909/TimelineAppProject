<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminQuizzes } from '../../composables/useAdminQuizzes'
import { useAdminQuizQuestions } from '../../composables/useAdminQuizQuestions'
import { useAdminCourses } from '../../composables/useAdminCourses'
import ConfirmModal from '../../components/admin/ConfirmModal.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error } = useAdminQuizzes()
const {
  questions,
  loading: questionsLoading,
  fetchForQuiz,
  remove: removeQuestion,
} = useAdminQuizQuestions()
const { courses, fetchAll: fetchCourses } = useAdminCourses()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const activeTab = ref(route.query.tab === 'questions' ? 'questions' : 'details')
const pendingDeleteQuestion = ref(null)

const form = ref({
  title: '',
  courseId: '',
  passingScore: 70,
  published: false,
})

onMounted(async () => {
  fetchCourses()
  if (isEditing.value) {
    const existing = await fetchOne(route.params.id)
    if (existing) form.value = { ...existing }
    if (activeTab.value === 'questions') fetchForQuiz(route.params.id)
  }
})

watch(activeTab, (tab) => {
  if (tab === 'questions' && isEditing.value) fetchForQuiz(route.params.id)
})

async function handleSubmit() {
  const ok = await save(isEditing.value ? route.params.id : null, form.value)
  if (ok) {
    toast.success('Quiz saved')
    router.push('/admin/quizzes')
  }
}

async function confirmDeleteQuestion() {
  await removeQuestion(pendingDeleteQuestion.value.$id)
  toast.success('Question deleted')
  pendingDeleteQuestion.value = null
}
</script>

<template>
  <div>
    <RouterLink to="/admin/quizzes" class="text-xs text-bark/60 hover:text-bark mb-2 inline-block">
      ← Back to Quizzes
    </RouterLink>
    <h1 class="font-voice text-3xl text-bark mb-4">{{ form.title || 'New Quiz' }}</h1>

    <div class="flex gap-4 border-b border-black/10 mb-5 text-sm">
      <button
        class="pb-2 border-b-2"
        :class="activeTab === 'details' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'"
        @click="activeTab = 'details'"
      >
        Details
      </button>
      <button
        class="pb-2 border-b-2"
        :class="[
          activeTab === 'questions' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50',
          !isEditing && 'opacity-40 cursor-not-allowed',
        ]"
        :disabled="!isEditing"
        :title="!isEditing ? 'Save the quiz first to add questions' : ''"
        @click="activeTab = 'questions'"
      >
        Questions
      </button>
    </div>

    <div v-if="activeTab === 'details'" class="bg-white rounded-xl p-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <label class="text-xs text-bark/70 block mb-1">Quiz title *</label>
        <input
          v-model="form.title"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-4"
        />

        <div class="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label class="text-xs text-bark/70 block mb-1">Linked course *</label>
            <select
              v-model="form.courseId"
              required
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm bg-white"
            >
              <option value="" disabled>Select a course</option>
              <option v-for="course in courses" :key="course.$id" :value="course.$id">
                {{ course.title }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs text-bark/70 block mb-1">Passing score (%)</label>
            <input
              v-model.number="form.passingScore"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm"
            />
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm mb-5">
          <input type="checkbox" v-model="form.published" class="accent-olive" />
          Published
        </label>

        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-olive text-white rounded-md text-sm font-medium disabled:opacity-60"
        >
          {{ saving ? 'Saving…' : 'Save Quiz' }}
        </button>
      </form>
    </div>

    <div v-else-if="activeTab === 'questions'" class="bg-white rounded-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <span class="text-xs text-bark/60">{{ questions.length }} question{{ questions.length === 1 ? '' : 's' }}</span>
        <RouterLink
          :to="`/admin/quizzes/${route.params.id}/questions/new`"
          class="text-xs px-4 py-2 rounded-md bg-olive text-white"
        >
          + Add Question
        </RouterLink>
      </div>

      <div v-if="questionsLoading" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-10 bg-olive-light rounded animate-pulse"></div>
      </div>

      <div v-else-if="questions.length === 0" class="text-center text-sm text-bark/60 py-10">
        No questions yet. Add your first one to get started.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(question, index) in questions"
          :key="question.$id"
          class="flex items-center gap-3 px-4 py-2.5 border border-black/5 rounded-lg text-sm"
        >
          <span class="text-xs text-bark/40 w-6">Q{{ index + 1 }}</span>
          <span class="flex-1 text-bark">{{ question.questionText }}</span>
          <RouterLink
            :to="`/admin/quizzes/${route.params.id}/questions/${question.$id}/edit`"
            class="text-bark/60 hover:text-bark"
          >
            ✎
          </RouterLink>
          <button class="text-red-500 hover:text-red-700" @click="pendingDeleteQuestion = question">🗑</button>
        </div>
      </div>

      <ConfirmModal
        :open="!!pendingDeleteQuestion"
        title="Delete this question?"
        message="This question will be permanently deleted."
        @confirm="confirmDeleteQuestion"
        @cancel="pendingDeleteQuestion = null"
      />
    </div>
  </div>
</template>