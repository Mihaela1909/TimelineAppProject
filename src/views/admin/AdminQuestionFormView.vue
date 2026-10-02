<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminQuizQuestions } from '../../composables/useAdminQuizQuestions'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error } = useAdminQuizQuestions()
const toast = useToast()

const isEditing = computed(() => !!route.params.questionId)

const form = ref({
  quizId: route.params.id,
  questionText: '',
  options: ['', ''],
  correctOptionIndex: 0,
  // "Add Question" passes the next free position, so new questions go last.
  order: Number(route.query.order) || 1,
})

onMounted(async () => {
  if (isEditing.value) {
    const existing = await fetchOne(route.params.questionId)
    if (existing) form.value = { ...existing }
  }
})

function addOption() {
  if (form.value.options.length < 6) form.value.options.push('')
}

function removeOption(index) {
  if (form.value.options.length <= 2) return
  form.value.options.splice(index, 1)
  if (form.value.correctOptionIndex >= form.value.options.length) {
    form.value.correctOptionIndex = 0
  }
}

async function handleSubmit() {
  const wasEditing = isEditing.value
  const savedQuestion = await save(wasEditing ? route.params.questionId : null, form.value)
  if (!savedQuestion) return

  toast.success('Question saved')

  if (!wasEditing) {
    router.replace(`/admin/quizzes/${route.params.id}/questions/${savedQuestion.$id}/edit`)
  }
}
</script>

<template>
  <div>
    <RouterLink
      :to="`/admin/quizzes/${route.params.id}/edit?tab=questions`"
      class="text-xs text-bark/60 hover:text-bark mb-2 inline-block"
    >
      ← Back to Questions
    </RouterLink>
    <h1 class="font-voice text-2xl text-bark mb-4">{{ isEditing ? 'Edit Question' : 'New Question' }}</h1>

    <div class="bg-white rounded-xl p-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-[1fr_100px] gap-4 mb-4">
          <div>
            <label class="text-xs text-bark/70 block mb-1">Question *</label>
            <input
              v-model="form.questionText"
              required
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-bark/70 block mb-1">Order</label>
            <input
              v-model.number="form.order"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm"
            />
          </div>
        </div>

        <label class="text-xs text-bark/70 block mb-2">
          Answer options * <span class="text-bark/40">(select the correct one)</span>
        </label>
        <div class="space-y-2 mb-2">
          <div v-for="(option, index) in form.options" :key="index" class="flex items-center gap-2">
            <input
              type="radio"
              :name="'correct'"
              :checked="form.correctOptionIndex === index"
              class="accent-olive"
              @change="form.correctOptionIndex = index"
            />
            <input
              v-model="form.options[index]"
              required
              placeholder="Answer option"
              class="flex-1 px-3 py-2 border border-black/10 rounded-md text-sm"
            />
            <button
              type="button"
              class="text-red-400 hover:text-red-600 text-xs w-6"
              :disabled="form.options.length <= 2"
              :class="form.options.length <= 2 && 'opacity-30 cursor-not-allowed'"
              @click="removeOption(index)"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          v-if="form.options.length < 6"
          type="button"
          class="text-xs text-olive font-medium mb-5"
          @click="addOption"
        >
          + Add option
        </button>
        <div v-else class="mb-5"></div>

        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-olive text-white rounded-md text-sm font-medium disabled:opacity-60"
        >
          {{ saving ? 'Saving…' : 'Save Question' }}
        </button>
      </form>
    </div>
  </div>
</template>