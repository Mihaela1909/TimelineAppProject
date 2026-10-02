<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminCourses, REQUIRED_IMAGES } from '../../composables/useAdminCourses'
import { useAdminLessons } from '../../composables/useAdminLessons'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import ImageUpload from '../../components/ui/ImageUpload.vue'
import PublishToggle from '../../components/ui/PublishToggle.vue'
import CategoryPicker from '../../components/ui/CategoryPicker.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error, categories, fetchAll } = useAdminCourses()
const toast = useToast()
const {
  lessons,
  loading: lessonsLoading,
  fetchForCourse,
  remove: removeLesson,
} = useAdminLessons()

const isEditing = computed(() => !!route.params.id)
const activeTab = ref(route.query.tab === 'lessons' ? 'lessons' : 'details')
const pendingDeleteLesson = ref(null)

watch(activeTab, (tab) => {
  if (tab === 'lessons' && isEditing.value) fetchForCourse(route.params.id)
})

async function confirmDeleteLesson() {
  const target = pendingDeleteLesson.value
  pendingDeleteLesson.value = null // close the modal first so it can't be confirmed twice
  if (await removeLesson(target.$id)) toast.success('Lesson deleted')
  else toast.error('Could not delete this lesson. Please try again.')
}

const form = ref({
  title: '',
  category: '',
  description: '',
  lessonCount: 0,
  icon: 'book',
  coverImageId: null,
  headerImageId: null,
  published: false,
})

const descriptionTooShort = computed(
  () => form.value.description.length > 0 && form.value.description.length < 100
)

onMounted(async () => {
  fetchAll() // existing courses → the list of categories already in use
  if (isEditing.value) {
    const existing = await fetchOne(route.params.id)
    if (existing) form.value = { ...existing }
    if (activeTab.value === 'lessons') fetchForCourse(route.params.id)  // ← add this line
  }
})

// Image fields: `*` when required, red once a save was attempted without one.
const submitted = ref(false)
const isRequired = (field) => field in REQUIRED_IMAGES
const isMissing = (field) => submitted.value && isRequired(field) && !form.value[field]

async function handleSubmit() {
  submitted.value = true
  if (descriptionTooShort.value) return
  const ok = await save(isEditing.value ? route.params.id : null, form.value)
  if (ok) {
    toast.success('Course saved')
    router.push('/admin/courses')
  }
}
</script>

<template>
  <div>
    <RouterLink to="/admin/courses" class="text-xs text-bark/60 hover:text-bark mb-2 inline-block">
      ← Back to Courses
    </RouterLink>
    <h1 class="font-voice text-3xl text-bark mb-4">{{ form.title || 'New Course' }}</h1>

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
          activeTab === 'lessons' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50',
          !isEditing && 'opacity-40 cursor-not-allowed',
        ]"
        :disabled="!isEditing"
        :title="!isEditing ? 'Save the course first to add lessons' : ''"
        @click="activeTab = 'lessons'"
      >
        Lessons
      </button>
    </div>

    <div v-if="activeTab === 'details'" class="bg-white rounded-xl p-6">
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <label class="text-xs text-bark/70 block mb-1">Title *</label>
        <input
          v-model="form.title"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-4"
        />

        <label class="text-xs text-bark/70 block mb-1">Description *</label>
        <textarea
          v-model="form.description"
          required
          rows="3"
          class="w-full px-3 py-2 border rounded-md text-sm mb-1"
          :class="descriptionTooShort ? 'border-red-400' : 'border-black/10'"
        ></textarea>
        <p v-if="descriptionTooShort" class="text-xs text-red-500 mb-3">
          Description must be at least 100 characters
        </p>
        <div v-else class="mb-4"></div>

        <div class="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label for="course-category" class="text-xs text-bark/70 block mb-1">Category *</label>
            <CategoryPicker id="course-category" v-model="form.category" :options="categories" required />
          </div>
          <div class="flex items-end pb-1">
            <PublishToggle v-model="form.published" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-5">
          <ImageUpload v-model="form.coverImageId" label="Cover image" :required="isRequired('coverImageId')" :invalid="isMissing('coverImageId')" />
          <ImageUpload v-model="form.headerImageId" label="Course Header image" :required="isRequired('headerImageId')" :invalid="isMissing('headerImageId')" />
        </div>

        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-olive text-white rounded-md text-sm font-medium disabled:opacity-60"
        >
          {{ saving ? 'Saving…' : 'Save Course' }}
        </button>
      </form>
    </div>

    <div v-else-if="activeTab === 'lessons'" class="bg-white rounded-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <span class="text-xs text-bark/60">{{ lessons.length }} lesson{{ lessons.length === 1 ? '' : 's' }}</span>
        <RouterLink
          :to="`/admin/courses/${route.params.id}/lessons/new`"
          class="font-button text-xs px-4 py-2 rounded-md bg-olive text-white"
        >
          + Add Lesson
        </RouterLink>
      </div>

      <div v-if="lessonsLoading" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-10 bg-olive-light rounded animate-pulse"></div>
      </div>

      <div v-else-if="lessons.length === 0" class="text-center text-sm text-bark/60 py-10">
        No lessons yet. Add your first one to get started.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="lesson in lessons"
          :key="lesson.$id"
          class="flex items-center gap-3 px-4 py-2.5 border border-black/5 rounded-lg text-sm"
        >
          <span class="text-xs text-bark/40 w-5">{{ lesson.order }}</span>
          <span class="flex-1 text-bark">{{ lesson.title }}</span>
          <span
            class="text-xs px-2.5 py-0.5 rounded-full"
            :class="lesson.published ? 'bg-olive-light text-olive' : 'bg-butter text-bark'"
          >
            {{ lesson.published ? 'Published' : 'Draft' }}
          </span>
          <RouterLink
            :to="`/admin/courses/${route.params.id}/lessons/${lesson.$id}/edit`"
            class="text-bark/60 hover:text-bark"
          >
            ✎
          </RouterLink>
          <button class="text-red-500 hover:text-red-700" @click="pendingDeleteLesson = lesson">🗑</button>
        </div>
      </div>

      <ConfirmModal
        :open="!!pendingDeleteLesson"
        title="Delete this lesson?"
        :message="`&quot;${pendingDeleteLesson?.title}&quot; will be permanently deleted.`"
        @confirm="confirmDeleteLesson"
        @cancel="pendingDeleteLesson = null"
      />
    </div>
  </div>
</template>