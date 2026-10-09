<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBlog } from '../composables/useBlog'
import { getImagePreviewUrl } from '../services/mediaService'
import { useToast } from '../composables/useToast'
import { useAuth } from '../composables/useAuth'
import { useSavedPosts } from '../composables/useSavedPosts'
import { formatDate, readTimeText } from '../utils/time'
import SectionHeading from '../components/ui/SectionHeading.vue'
import CardCarousel from '../components/ui/CardCarousel.vue'
import HistoryCard from '../components/ui/HistoryCard.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { usePageMeta } from '../composables/usePageMeta'
import { toDescription } from '../utils/pageMeta'

const route = useRoute()
const toast = useToast()

const { post, posts, relatedPosts, loading, error, fetchPost } = useBlog()
usePageMeta(() =>
  post.value && {
    title: post.value.title,
    description: toDescription(post.value.introduction || post.value.content),
    image: post.value.coverImageId ? getImagePreviewUrl(post.value.coverImageId) : null,
  }
)

const { currentUser } = useAuth()
const { isSaved, busy: saveBusy, fetchFor: fetchSaved, loadedFor, toggle } = useSavedPosts()

onMounted(() => {
  fetchPost(route.params.id)
  // Saved state is shared app-wide; only load it if it isn't loaded for this user yet.
  if (currentUser.value && loadedFor.value !== currentUser.value.$id) fetchSaved(currentUser.value.$id)
})

async function handleSave() {
  const nowSaved = await toggle(currentUser.value?.$id, post.value.$id)
  if (nowSaved === null) toast.error('Could not update your saved posts. Please try again.')
  else toast.success(nowSaved ? 'Saved to your profile' : 'Removed from saved posts')
}
// Clicking another post reuses this same component, so reload on id change.
watch(() => route.params.id, (id) => id && fetchPost(id))

// "Browse more": same-category posts first, then the newest others (max 8).
const morePosts = computed(() => {
  const others = posts.value.filter((p) => p.$id !== post.value?.$id && !relatedPosts.value.includes(p))
  return [...relatedPosts.value, ...others].slice(0, 8)
})

async function share() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: post.value?.title || 'Timeline blog', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  } catch (err) {
    if (err?.name !== 'AbortError') toast.error('Could not share this post')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">
    <RouterLink to="/blog" class="inline-flex items-center gap-2 text-sm text-bark hover:text-olive mb-5">
      <AppIcon name="arrow-left" class="w-4 h-4" /> Blog
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)]" aria-live="polite">
      <div class="h-48 md:h-64 bg-olive-light animate-pulse"></div>
      <div class="max-w-3xl mx-auto p-8 space-y-4">
        <div class="h-10 w-2/3 mx-auto bg-olive-light rounded animate-pulse"></div>
        <div class="h-24 bg-olive-light rounded animate-pulse"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchPost(route.params.id)">Retry</button>
    </div>

    <template v-else-if="post">
      <article :key="post.$id" class="swap relative bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
        <!-- Cover as a grayscale banner with the umber fade -->
        <div class="relative h-40 md:h-[clamp(12rem,22vw,22rem)] bg-umber shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
          <img v-if="post.coverImageId" :src="getImagePreviewUrl(post.coverImageId)" alt="" class="w-full h-full object-cover grayscale" />
          <div class="absolute inset-x-0 bottom-0 h-1/3" style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)" aria-hidden="true"></div>
        </div>

        <div class="relative px-5 py-8 md:px-16 md:py-12">
          <!-- Dot waves like Event of the Day (top as-is, bottom flipped) -->
          <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 top-0 w-full h-auto pointer-events-none" />
          <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 bottom-0 w-full h-auto -scale-y-100 pointer-events-none" />

          <div class="relative max-w-3xl mx-auto">
            <!-- Header -->
            <div class="text-center">
              <span v-if="post.category" class="inline-block bg-olive text-white text-sm px-8 py-1 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.3)] mb-4">{{ post.category }}</span>
              <h1 class="font-voice text-bark text-3xl md:text-5xl leading-tight mb-6">{{ post.title }}</h1>
            </div>

            <!-- Introduction + date / read time -->
            <div class="flex flex-col sm:flex-row gap-4 bg-cream border border-ochre rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.2)] px-5 py-4">
              <p v-if="post.introduction" class="flex-1 text-sm md:text-base text-bark leading-snug">{{ post.introduction }}</p>
              <div class="flex sm:flex-col justify-between sm:justify-center gap-1 sm:pl-5 sm:border-l sm:border-ochre/60 text-sm font-semibold text-ochre whitespace-nowrap sm:text-right">
                <span>{{ formatDate(post.$createdAt) }}</span>
                <span v-if="post.readTime">{{ readTimeText(post.readTime) }}</span>
              </div>
            </div>

            <!-- Divider with a diamond at each end -->
            <div class="flex items-center my-8 md:my-10 -mx-2 md:-mx-12" aria-hidden="true">
              <span class="w-2.5 h-2.5 bg-bark rotate-45 -mr-1"></span>
              <span class="flex-1 h-0.5 bg-bark/80"></span>
              <span class="w-2.5 h-2.5 bg-bark rotate-45 -ml-1"></span>
            </div>

            <div class="reading-content lesson-editor-content text-bark text-base md:text-lg mb-10" v-html="post.content"></div>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="font-sans inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-olive text-white font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors"
                @click="share"
              >
                <AppIcon name="share" class="w-5 h-5" /> Share
              </button>
              <!-- Save: logged-in users toggle it; guests are sent to log in (and back here after). -->
              <button
                v-if="currentUser"
                type="button"
                class="font-sans inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-olive font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-colors disabled:opacity-60"
                :class="isSaved(post.$id) ? 'bg-olive-light text-olive' : 'bg-white text-olive hover:bg-olive-light/50'"
                :aria-pressed="isSaved(post.$id)"
                :disabled="saveBusy"
                @click="handleSave"
              >
                <AppIcon :name="isSaved(post.$id) ? 'bookmark-filled' : 'bookmark'" class="w-5 h-5" />
                {{ isSaved(post.$id) ? 'Saved' : 'Save' }}
              </button>
              <RouterLink
                v-else
                :to="{ name: 'login', query: { redirect: route.fullPath } }"
                class="font-sans inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-olive bg-white text-olive font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:bg-olive-light/50 transition-colors"
                title="Log in to save posts"
              >
                <AppIcon name="bookmark" class="w-5 h-5" /> Save
              </RouterLink>
            </div>
          </div>
        </div>
      </article>

      <!-- Browse more -->
      <section v-if="morePosts.length" class="max-w-6xl mx-auto mt-12 md:mt-16">
        <SectionHeading title="Browse more" />
        <CardCarousel label="More blog posts">
          <HistoryCard
            v-for="p in morePosts"
            :key="p.$id"
            :to="`/blog/${p.$id}`"
            :image="p.coverImageId ? getImagePreviewUrl(p.coverImageId) : null"
            :label="p.category"
            :title="p.title"
            :meta="readTimeText(p.readTime)"
          />
        </CardCarousel>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* Opening another post (same page component): the article fades in */
.swap {
  animation: swap-in 0.35s ease-out;
}
@keyframes swap-in {
  from { opacity: 0; transform: translateY(8px); }
}
@media (prefers-reduced-motion: reduce) {
  .swap { animation: none; }
}
</style>
