<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminLessons, REQUIRED_IMAGES } from '../../composables/useAdminLessons'
import { useAdminCourses } from '../../composables/useAdminCourses'
import RichTextEditor from '../../components/ui/RichTextEditor.vue'
import ImageUpload from '../../components/ui/ImageUpload.vue'
import PublishToggle from '../../components/ui/PublishToggle.vue'
import { useToast } from '../../composables/useToast'
import AppIcon from '../../components/ui/AppIcon.vue'

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

// Image fields: `*` when required, red once a save was attempted without one.
const submitted = ref(false)
const isRequired = (field) => field in REQUIRED_IMAGES
const isMissing = (field) => submitted.value && isRequired(field) && !form.value[field]

async function handleSubmit() {
  submitted.value = true
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
      class="inline-flex items-center gap-2 text-base text-bark/80 hover:text-bark mb-3"
    >
      <AppIcon name="arrow-left" class="w-5 h-5 text-bark" />
      <span>
        Back to Lessons<template v-if="courseTitle"> · <span class="text-olive font-semibold">{{ courseTitle }}</span></template>
      </span>
    </RouterLink>
    <h1 class="font-voice text-5xl text-bark mb-8">{{ isEditing ? 'Edit Lesson' : 'New Lesson' }}</h1>

    <div class="bg-white rounded-2xl p-8">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-[1fr_12rem] gap-6 mb-5">
          <div>
            <label for="lesson-title" class="text-base text-bark block mb-1.5">
              Lesson title <sup class="text-bark/60">*</sup>
            </label>
            <input
              id="lesson-title"
              v-model="form.title"
              required
              class="w-full px-4 py-2.5 bg-field border border-field-border rounded-md text-base text-bark focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <div>
            <label for="lesson-order" class="text-base text-bark block mb-1.5">Order</label>
            <input
              id="lesson-order"
              v-model.number="form.order"
              type="number"
              min="1"
              class="w-full px-4 py-2.5 bg-field border border-field-border rounded-md text-base text-bark focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
        </div>

        <div class="mb-6">
          <span class="text-base text-bark block mb-1.5">Content <sup class="text-bark/60">*</sup></span>
          <RichTextEditor v-model="form.content" />
        </div>

        <div class="flex flex-wrap items-end justify-between gap-6">
          <ImageUpload v-model="form.imageId" label="Lesson image" :required="isRequired('imageId')" :invalid="isMissing('imageId')" />

          <div class="flex flex-col items-end gap-5">
            <PublishToggle v-model="form.published" />

            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 bg-olive text-white rounded-lg text-base font-semibold hover:bg-olive/90 transition-colors disabled:opacity-60"
            >
              {{ saving ? 'Saving…' : 'Save Lesson' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
