<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminBlogPosts, REQUIRED_IMAGES } from '../../composables/useAdminBlogPosts'
import RichTextEditor from '../../components/ui/RichTextEditor.vue'
import ImageUpload from '../../components/ui/ImageUpload.vue'
import PublishToggle from '../../components/ui/PublishToggle.vue'
import CategoryPicker from '../../components/ui/CategoryPicker.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error, categories, fetchAll } = useAdminBlogPosts()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)

const form = ref({
  title: '',
  category: '',
  readTime: '',
  introduction: '',
  content: '',
  coverImageId: null,
  published: false,
})

onMounted(async () => {
  fetchAll() // existing posts → the list of categories already in use
  if (isEditing.value) {
    const existing = await fetchOne(route.params.id)
    if (existing) form.value = { ...existing }
  }
})

// Image fields: `*` when required, red once a save was attempted without one.
const submitted = ref(false)
const isRequired = (field) => field in REQUIRED_IMAGES
const isMissing = (field) => submitted.value && isRequired(field) && !form.value[field]

async function handleSubmit() {
  submitted.value = true
  const ok = await save(isEditing.value ? route.params.id : null, form.value)
  if (ok) {
    toast.success('Post saved')
    router.push('/admin/blog-posts')
  }
}
</script>

<template>
  <div>
    <RouterLink to="/admin/blog-posts" class="text-xs text-bark/60 hover:text-bark mb-2 inline-block">
      ← Back to Blog Posts
    </RouterLink>
    <h1 class="font-voice text-3xl text-bark mb-4">{{ isEditing ? 'Edit Blog Post' : 'New Blog Post' }}</h1>

    <div class="bg-white rounded-xl p-6">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <label class="text-xs text-bark/70 block mb-1">Title *</label>
        <input
          v-model="form.title"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-4"
        />

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="post-category" class="text-xs text-bark/70 block mb-1">Category *</label>
            <CategoryPicker id="post-category" v-model="form.category" :options="categories" required />
          </div>
          <div>
            <label class="text-xs text-bark/70 block mb-1">Read Time</label>
            <input
              v-model="form.readTime"
              placeholder="5 mins"
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm"
            />
          </div>
        </div>

        <label class="text-xs text-bark/70 block mb-1">Introduction *</label>
        <input
          v-model="form.introduction"
          required
          placeholder="A one-line hook shown on the blog preview card"
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-4"
        />

        <label class="text-xs text-bark/70 block mb-1">Content *</label>
        <div class="mb-4">
          <RichTextEditor v-model="form.content" />
        </div>

        <div class="mb-5">
          <ImageUpload v-model="form.coverImageId" label="Cover image" :required="isRequired('coverImageId')" :invalid="isMissing('coverImageId')" />
        </div>

        <div class="mb-5">
          <PublishToggle v-model="form.published" />
        </div>

        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 bg-olive text-white rounded-md text-sm font-medium disabled:opacity-60"
        >
          {{ saving ? 'Saving…' : 'Save Post' }}
        </button>
      </form>
    </div>
  </div>
</template>