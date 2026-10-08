<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminQuizzes, REQUIRED_IMAGES } from '../../composables/useAdminQuizzes'
import { useAdminQuizQuestions } from '../../composables/useAdminQuizQuestions'
import { useAdminCourses } from '../../composables/useAdminCourses'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import ImageUpload from '../../components/ui/ImageUpload.vue'
import PublishToggle from '../../components/ui/PublishToggle.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import QuizQuestionList from '../../components/admin/QuizQuestionList.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, loadingOne, loadError, save, saving, error } = useAdminQuizzes()
const {
  questions,
  loading: questionsLoading,
  fetchForQuiz,
  remove: removeQuestion,
  deleting: deletingQuestion,
  reorder,
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
  coverImageId: null,
  headerImageId: null,
  published: false,
})

async function loadRow() {
  const existing = await fetchOne(route.params.id)
  if (existing) form.value = { ...existing }
}

onMounted(async () => {
  fetchCourses()
  if (isEditing.value) {
    await loadRow()
    if (activeTab.value === 'questions') fetchForQuiz(route.params.id)
  }
})

watch(activeTab, (tab) => {
  if (tab === 'questions' && isEditing.value) fetchForQuiz(route.params.id)
})

// Image fields: `*` when required, red once a save was attempted without one.
const submitted = ref(false)
const isRequired = (field) => field in REQUIRED_IMAGES
const isMissing = (field) => submitted.value && isRequired(field) && !form.value[field]

async function handleSubmit() {
  submitted.value = true
  const ok = await save(isEditing.value ? route.params.id : null, form.value)
  if (ok) {
    toast.success('Quiz saved')
    router.push('/admin/quizzes')
  }
}

async function moveQuestion(from, to) {
  if (!(await reorder(from, to))) toast.error('Could not save the new order. Please try again.')
}

async function confirmDeleteQuestion() {
  const target = pendingDeleteQuestion.value
  pendingDeleteQuestion.value = null // close the modal first so it can't be confirmed twice
  if (await removeQuestion(target.$id)) toast.success('Question deleted')
  else toast.error('Could not delete this question. Please try again.')
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

    <div v-if="activeTab === 'details'" class="bg-white rounded-xl p-4 md:p-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4" role="alert">
        {{ error }}
      </div>

      <!-- Editing: skeleton while the row loads, Retry box if it fails -->

      <div v-if="loadingOne" class="space-y-4" aria-live="polite" aria-busy="true">

        <div class="h-10 bg-olive-light rounded animate-pulse"></div>

        <div class="h-28 bg-olive-light rounded animate-pulse"></div>

        <div class="h-10 w-1/2 bg-olive-light rounded animate-pulse"></div>

      </div>

      <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">

        <p class="mb-3">{{ loadError }}</p>

        <button type="button" class="px-4 py-2 rounded-md border border-red-400" @click="loadRow">Retry</button>

      </div>

      <form v-else @submit.prevent="handleSubmit">
        <label class="text-xs text-bark/70 block mb-1">Quiz title *</label>
        <input
          v-model="form.title"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-4"
        />

        <div class="grid sm:grid-cols-2 gap-4 mb-5">
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

        <div class="mb-5 space-y-4">
          <ImageUpload v-model="form.coverImageId" label="Cover image" :required="isRequired('coverImageId')" :invalid="isMissing('coverImageId')" />
          <ImageUpload v-model="form.headerImageId" label="Quiz header image" :required="isRequired('headerImageId')" :invalid="isMissing('headerImageId')" />
        </div>

        <div class="mb-5">
          <PublishToggle v-model="form.published" />
        </div>

        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-olive text-white rounded-md text-sm font-medium disabled:opacity-60"
        >
          {{ saving ? 'Saving…' : 'Save Quiz' }}
        </button>
      </form>
    </div>

    <div v-else-if="activeTab === 'questions'" class="bg-white rounded-xl p-4 md:p-6">
      <div class="flex justify-between items-center gap-4 mb-4">
        <span class="text-base text-sand-dark">
          {{ questions.length }} question{{ questions.length === 1 ? '' : 's' }}<template v-if="questions.length > 1"> · drag to reorder</template>
        </span>
        <RouterLink
          :to="`/admin/quizzes/${route.params.id}/questions/new?order=${questions.length + 1}`"
          class="font-button flex items-center gap-2 px-5 py-3 rounded-xl bg-olive text-white font-semibold hover:bg-olive/90 transition-colors"
        >
          <AppIcon name="plus" class="w-4 h-4" />
          Add Question
        </RouterLink>
      </div>

      <div v-if="questionsLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-20 bg-olive-light rounded-md animate-pulse"></div>
      </div>

      <div v-else-if="questions.length === 0" class="text-center text-sm text-bark/60 py-10">
        No questions yet. Add your first one to get started.
      </div>

      <QuizQuestionList
        v-else
        :questions="questions"
        :quiz-id="route.params.id"
        :deleting="deletingQuestion"
        @move="moveQuestion"
        @delete="pendingDeleteQuestion = $event"
      />

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