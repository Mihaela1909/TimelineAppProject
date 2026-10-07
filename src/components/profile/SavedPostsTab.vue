<script setup>
import { getImagePreviewUrl } from '../../services/mediaService'
import { formatDate, readTimeText } from '../../utils/time'
import HistoryCard from '../ui/HistoryCard.vue'

// Profile → "Saved Posts". Dumb component: the profile page passes the saved
// posts (already looked up) and handles removing / retrying.
defineProps({
  posts: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['remove', 'retry'])
</script>

<template>
  <div>
    <div v-if="loading" class="grid sm:grid-cols-2 gap-4" aria-live="polite">
      <div v-for="n in 2" :key="n" class="h-56 bg-white rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="emit('retry')">Retry</button>
    </div>

    <div v-else-if="posts.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
      No saved posts yet. Use <strong>Save</strong> on any blog post to keep it here.
      <RouterLink to="/blog" class="text-olive font-medium">Browse the blog →</RouterLink>
    </div>

    <ul v-else class="grid sm:grid-cols-2 gap-4">
      <li v-for="post in posts" :key="post.$id" class="flex flex-col gap-1.5">
        <HistoryCard
          layout="grid"
          :to="`/blog/${post.$id}`"
          :image="post.coverImageId ? getImagePreviewUrl(post.coverImageId) : null"
          :label="post.category"
          :title="post.title"
          :date="formatDate(post.$createdAt)"
          :meta="readTimeText(post.readTime)"
        />
        <button
          type="button"
          class="self-end text-xs text-bark/60 underline hover:text-red-600 disabled:opacity-50"
          :disabled="busy"
          @click="emit('remove', post)"
        >
          Remove from saved
        </button>
      </li>
    </ul>
  </div>
</template>
