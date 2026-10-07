<script setup>
import { computed, onMounted } from 'vue'
import { useBlog } from '../../composables/useBlog'
import { getImagePreviewUrl } from '../../services/mediaService'
import SectionHeading from '../ui/SectionHeading.vue'
import CardCarousel from '../ui/CardCarousel.vue'
import HistoryCard from '../ui/HistoryCard.vue'
import AppIcon from '../ui/AppIcon.vue'
import { readTimeText } from '../../utils/time'

const SHOWN = 8
const { posts, loading, error, fetchPublished } = useBlog()
onMounted(fetchPublished)

// Newest first (the service already sorts by creation date).
const latest = computed(() => posts.value.slice(0, SHOWN))

</script>

<template>
  <section class="px-5 md:px-8 py-14 md:py-20 max-w-7xl mx-auto">
    <SectionHeading title="Community Blog" />

    <div v-if="loading" class="flex gap-5 overflow-hidden md:px-14" aria-live="polite">
      <div v-for="n in 3" :key="n" class="flex-shrink-0 w-[78%] sm:w-[45%] lg:w-[calc((100%-2.5rem)/3)] h-64 rounded-lg bg-white animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400 hover:bg-red-100" @click="fetchPublished">Retry</button>
    </div>

    <div v-else-if="latest.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
      No blog posts yet. Check back soon.
    </div>

    <CardCarousel v-else label="Latest blog posts">
      <HistoryCard
        v-for="post in latest"
        :key="post.$id"
        :to="`/blog/${post.$id}`"
        :image="post.coverImageId ? getImagePreviewUrl(post.coverImageId) : null"
        :label="post.category"
        :title="post.title"
        :meta="readTimeText(post.readTime)"
      />
    </CardCarousel>

    <div class="flex justify-end mt-6">
      <RouterLink to="/blog" class="inline-flex items-center gap-2 text-sm font-semibold text-bark hover:text-olive">
        Browse all <AppIcon name="arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>
  </section>
</template>
