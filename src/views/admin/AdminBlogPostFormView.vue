<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminBlogPosts } from '../../composables/useAdminBlogPosts'
import RichTextEditor from '../../components/admin/RichTextEditor.vue'
import ImageUpload from '../../components/admin/ImageUpload.vue'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { fetchOne, save, saving, error } = useAdminBlogPosts()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)

const categories = ['Myth-Busting', 'Listicle', 'Dev Update', 'Digest']

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
  if (isEditing.value) {
    const existing = await fetchOne(route.params.id)
    if (existing) form.value = { ...existing }
  }
})

async function handleSubmit() {
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
            <label class="text-xs text-bark/70 block mb-1">Category *</label>
            <select
              v-model="form.category"
              required
              class="w-full px-3 py-2 border border-black/10 rounded-md text-sm bg-white"
            >
              <option value="" disabled>Select</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
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
          <ImageUpload v-model="form.coverImageId" label="Cover image" />
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
          {{ saving ? 'Saving…' : 'Save Post' }}
        </button>
      </form>
    </div>
  </div>
</template>