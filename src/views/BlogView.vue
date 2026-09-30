<script setup>
import { onMounted, ref, computed } from 'vue'
import * as blogPostService from '../services/blogPostService'
import { getImagePreviewUrl } from '../services/mediaService'

const posts = ref([])
const loading = ref(true)
const error = ref(null)
const searchTerm = ref('')
const activeCategory = ref('All')

const categoryStyles = {
  'Myth-Busting': 'bg-red-100 text-red-700',
  Listicle: 'bg-blue-100 text-blue-700',
  'Dev Update': 'bg-purple-100 text-purple-700',
  Digest: 'bg-cyan-100 text-cyan-700',
}

onMounted(async () => {
  try {
    posts.value = await blogPostService.getPublishedBlogPosts()
  } catch (err) {
    error.value = 'Could not load the blog.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const categories = computed(() => ['All', ...new Set(posts.value.map((p) => p.category))])

const filteredPosts = computed(() =>
  posts.value.filter((p) => {
    const matchesCategory = activeCategory.value === 'All' || p.category === activeCategory.value
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
)

const featured = computed(() => filteredPosts.value[0])
const rest = computed(() => filteredPosts.value.slice(1))
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="font-voice text-3xl text-bark mb-1">The Blog</h1>
    <p class="text-xs text-bark/60 mb-6">Stories, myths, and updates from Timeline</p>

    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div class="h-24 bg-white rounded-xl animate-pulse"></div>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="n in 4" :key="n" class="h-28 bg-white rounded-lg animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      {{ error }}
    </div>

    <template v-else>
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search posts..."
        class="w-full px-4 py-2.5 bg-white rounded-lg text-sm border border-black/5 mb-4"
      />

      <div class="flex gap-2 mb-8 flex-wrap">
        <button
          v-for="cat in categories"
          :key="cat"
          class="text-xs px-4 py-1.5 rounded-full transition-colors"
          :class="activeCategory === cat ? 'bg-bark text-white' : (categoryStyles[cat] || 'bg-white text-bark/60')"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="filteredPosts.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
        No posts found.
      </div>

      <template v-else>
        <RouterLink
          v-if="featured"
          :to="`/blog/${featured.$id}`"
          class="block bg-bark rounded-xl p-5 flex items-center gap-4 mb-6 hover:opacity-95 transition-opacity"
        >
          <img
            v-if="featured.coverImageId"
            :src="getImagePreviewUrl(featured.coverImageId)"
            :alt="featured.title"
            class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div v-else class="w-20 h-20 rounded-lg bg-olive-light flex-shrink-0"></div>
          <div>
            <span class="text-xs px-2.5 py-0.5 rounded-full" :class="categoryStyles[featured.category]">
              {{ featured.category }}
            </span>
            <div class="text-white font-medium mt-2">{{ featured.title }}</div>
            <div class="text-cream/60 text-xs mt-1">{{ featured.readTime }} · Featured</div>
          </div>
        </RouterLink>

        <div class="grid grid-cols-2 gap-4">
          <RouterLink
            v-for="post in rest"
            :key="post.$id"
            :to="`/blog/${post.$id}`"
            class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              v-if="post.coverImageId"
              :src="getImagePreviewUrl(post.coverImageId)"
              :alt="post.title"
              class="h-24 w-full object-cover"
            />
            <div v-else class="h-24 bg-olive-light"></div>
            <div class="p-3">
              <span class="text-[10px] px-2 py-0.5 rounded-full" :class="categoryStyles[post.category]">
                {{ post.category }}
              </span>
              <div class="text-sm font-medium text-bark mt-2">{{ post.title }}</div>
              <div class="text-xs text-bark/50 mt-1">{{ post.readTime }}</div>
            </div>
          </RouterLink>
        </div>
      </template>
    </template>
  </div>
</template>