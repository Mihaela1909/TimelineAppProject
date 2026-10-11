<script setup>
import { onMounted } from 'vue'
import { useBlog } from '../composables/useBlog'
import { getImagePreviewUrl } from '../services/mediaService'
import { formatDate, readTimeText } from '../utils/time'
import BlogHero from '../components/blog/BlogHero.vue'
import HistoryCard from '../components/ui/HistoryCard.vue'
import PaginationNav from '../components/ui/PaginationNav.vue'
import ListControls from '../components/ui/ListControls.vue'
import { useListControls, byNewest, byTitle } from '../composables/useListControls'

const PAGE_SIZE = 4 // 2×2 per page, like the mockup

const { posts, loading, error, fetchPublished } = useBlog()
onMounted(fetchPublished)

const SORTS = [
  { value: 'newest', label: 'Newest', compare: byNewest },
  { value: 'oldest', label: 'Oldest', compare: (a, b) => byNewest(b, a) },
  { value: 'az', label: 'A–Z', compare: byTitle },
]

const { searchTerm, activeCategory, sortBy, page, categories, filtered: filteredPosts, paged: pagedPosts, pageCount, gridKey, firstLoad } =
  useListControls(posts, { sorts: SORTS, pageSize: PAGE_SIZE })
</script>

<template>
  <div>
    <BlogHero />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <ListControls
        v-model:search="searchTerm"
        v-model:sort="sortBy"
        v-model:category="activeCategory"
        noun="posts"
        :sorts="SORTS"
        :categories="categories"
      />

      <!-- Loading -->
      <div v-if="loading" class="grid md:grid-cols-2 gap-6 md:gap-10" aria-live="polite">
        <div v-for="n in 4" :key="n" class="h-72 rounded-xl bg-white animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchPublished">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredPosts.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
        <template v-if="posts.length === 0">No blog posts yet. Check back soon.</template>
        <template v-else>
          No posts match<span v-if="searchTerm.trim()"> "{{ searchTerm.trim() }}"</span><span v-if="activeCategory !== 'All'"> in {{ activeCategory }}</span>.
        </template>
      </div>

      <!-- Results -->
      <template v-else>
        <div :key="gridKey" class="grid md:grid-cols-2 gap-6 md:gap-10 mb-12" :class="firstLoad ? 'cards-stagger' : 'cards-swap'">
          <HistoryCard
            v-for="post in pagedPosts"
            :key="post.$id"
            layout="grid"
            :to="`/blog/${post.$id}`"
            :image="post.coverImageId ? getImagePreviewUrl(post.coverImageId) : null"
            :label="post.category"
            :title="post.title"
            :date="formatDate(post.$createdAt)"
            :meta="readTimeText(post.readTime)"
          />
        </div>
        <PaginationNav v-model="page" :page-count="pageCount" />
      </template>
    </div>
  </div>
</template>
