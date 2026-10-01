<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminLessons } from '../../composables/useAdminLessons'
import { useAdminCourses } from '../../composables/useAdminCourses'
import RichTextEditor from '../../components/ui/RichTextEditor.vue'
import ImageUpload from '../../components/ui/ImageUpload.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error } = useAdminLessons()
const { fetchOne: fetchCourse } = useAdminCourses()
const toast = useToast()

const isEditing = computed(() => !!route.params.lessonId)
const courseTitle = ref('')

const form = ref({
  courseId: route.params.id,
  title: '',
  order: 1,
  content: '',
  imageId: null,
  published: false,
})

onMounted(async () => {
  const course = await fetchCourse(route.params.id)
  if (course) courseTitle.value = course.title

  if (isEditing.value) {
    const existing = await fetchOne(route.params.lessonId)
    if (existing) form.value = { ...existing }
  }
})

async function handleSubmit() {
  const wasEditing = isEditing.value
  const savedLesson = await save(wasEditing ? route.params.lessonId : null, form.value)
  if (!savedLesson) return

  toast.success('Lesson saved')

  if (!wasEditing) {
    router.replace(`/admin/courses/${route.params.id}/lessons/${savedLesson.$id}/edit`)
  }
}
</script>

<template>
  <div>
    <RouterLink
      :to="`/admin/courses/${route.params.id}/edit?tab=lessons`"
      class="text-xs text-bark/60 hover:text-bark mb-2 inline-block"
    >
      ← Back to Lessons <span v-if="courseTitle" class="font-medium">· {{ courseTitle }}</span>
    </RouterLink>
    <h1 class="font-voice text-2xl text-bark mb-4">{{ isEditing ? 'Edit Lesson' : 'New Lesson' }}</h1>

    <div class="bg-white rounded-xl p-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-[1fr_100px] gap-4 mb-4">
          <div>
            <label class="text-xs text-bark/70 block mb-1">Lesson title *</label>
            <input
              v-model="form.title"
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

        <label class="text-xs text-bark/70 block mb-1">Content *</label>
        <div class="mb-4">
          <RichTextEditor v-model="form.content" />
        </div>

        <div class="mb-5">
          <ImageUpload v-model="form.imageId" label="Lesson image" />
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
          {{ saving ? 'Saving…' : 'Save Lesson' }}
        </button>
      </form>
    </div>
  </div>
</template>