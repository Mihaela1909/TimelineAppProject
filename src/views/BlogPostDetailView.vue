<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as blogPostService from '../services/blogPostService'
import { getImagePreviewUrl } from '../services/mediaService'
import { useToast } from '../composables/useToast'

const route = useRoute()
const toast = useToast()

const post = ref(null)
const allPosts = ref([])
const loading = ref(true)
const error = ref(null)

const categoryStyles = {
  'Myth-Busting': 'bg-red-100 text-red-700',
  Listicle: 'bg-blue-100 text-blue-700',
  'Dev Update': 'bg-purple-100 text-purple-700',
  Digest: 'bg-cyan-100 text-cyan-700',
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const [postData, published] = await Promise.all([
      blogPostService.getBlogPostById(route.params.id),
      blogPostService.getPublishedBlogPosts(),
    ])
    post.value = postData
    allPosts.value = published
  } catch (err) {
    error.value = 'Could not load this post.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const relatedPosts = computed(() =>
  allPosts.value.filter((p) => p.$id !== post.value?.$id && p.category === post.value?.category).slice(0, 2)
)

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.$createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

async function share() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  } catch {
    toast.error('Could not copy link')
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div class="h-6 bg-white rounded-lg animate-pulse w-1/3"></div>
      <div class="h-40 bg-white rounded-lg animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      {{ error }}
    </div>

    <template v-else-if="post">
      <RouterLink to="/blog" class="text-xs text-bark/60 hover:text-bark mb-3 inline-block">← Blog</RouterLink>

      <span class="text-xs px-3 py-1 rounded-full" :class="categoryStyles[post.category]">{{ post.category }}</span>
      <h1 class="font-voice text-2xl text-bark mt-3 mb-2 leading-tight">{{ post.title }}</h1>
      <div class="text-xs text-bark/50 mb-5">{{ formattedDate }} · {{ post.readTime }}</div>

      <img
        v-if="post.coverImageId"
        :src="getImagePreviewUrl(post.coverImageId)"
        :alt="post.title"
        class="w-full rounded-lg mb-6"
      />

      <p class="text-sm text-bark/80 italic mb-5">{{ post.introduction }}</p>

      <div class="lesson-editor-content text-sm mb-6" v-html="post.content"></div>

      <button
        class="text-xs px-4 py-2 rounded-md bg-olive text-white mb-10"
        @click="share"
      >
        Share
      </button>

      <div v-if="relatedPosts.length" class="border-t border-black/5 pt-6">
        <div class="text-sm font-semibold text-bark mb-3">Related posts</div>
        <div class="space-y-2">
          <RouterLink
            v-for="related in relatedPosts"
            :key="related.$id"
            :to="`/blog/${related.$id}`"
            class="flex items-center gap-3 bg-white px-4 py-3 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div class="flex-1 text-sm text-bark">{{ related.title }}</div>
            <span class="text-xs text-bark/40">{{ related.readTime }}</span>
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>