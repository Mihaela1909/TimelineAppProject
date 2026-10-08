<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminDashboard, timeAgo } from '../../composables/useAdminDashboard'
import AppIcon from '../../components/ui/AppIcon.vue'

const { stats, activity, loading, error, fetchAll } = useAdminDashboard()
const showAll = ref(false)

onMounted(fetchAll)

const statCards = computed(() => [
  { label: 'Courses', value: stats.value.courses, to: '/admin/courses' },
  { label: 'Quizzes', value: stats.value.quizzes, to: '/admin/quizzes' },
  { label: 'Blog Posts', value: stats.value.blogPosts, to: '/admin/blog-posts' },
  { label: 'Users', value: stats.value.users, to: '/admin/users' },
])

const quickActions = [
  { label: 'New Course', to: '/admin/courses/new' },
  { label: 'New Quiz', to: '/admin/quizzes/new' },
  { label: 'New Post', to: '/admin/blog-posts/new' },
]

const visibleActivity = computed(() => (showAll.value ? activity.value : activity.value.slice(0, 3)))
</script>

<template>
  <div>
    <h1 class="font-voice text-3xl md:text-4xl text-bark mb-8">Dashboard</h1>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm mb-6" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <RouterLink
        v-for="card in statCards"
        :key="card.label"
        :to="card.to"
        class="bg-white rounded-xl p-5 hover:shadow-md transition-shadow"
      >
        <div class="text-sm text-bark/70 mb-1">{{ card.label }}</div>
        <div v-if="loading" class="h-9 w-12 bg-olive-light rounded animate-pulse"></div>
        <div v-else class="text-3xl md:text-4xl font-bold text-bark">{{ card.value }}</div>
      </RouterLink>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <RouterLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="font-button flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-olive text-white font-semibold hover:bg-olive/90 transition-colors"
      >
        <AppIcon name="plus" class="w-4 h-4" />
        {{ action.label }}
      </RouterLink>
    </div>

    <div class="bg-white rounded-xl p-4 md:p-6">
      <h2 class="text-lg font-semibold text-bark mb-4">Recent Activity</h2>

      <div v-if="loading" class="space-y-3" aria-live="polite">
        <div v-for="n in 3" :key="n" class="h-6 bg-olive-light rounded animate-pulse"></div>
      </div>

      <div v-else-if="activity.length === 0" class="text-sm text-bark/60 py-4">No activity yet.</div>

      <ul v-else class="space-y-3">
        <li v-for="item in visibleActivity" :key="item.id" class="flex items-center gap-3 text-sm">
          <AppIcon :name="item.icon" class="w-5 h-5 text-bark flex-shrink-0" />
          <RouterLink v-if="item.to" :to="item.to" class="flex-1 text-bark hover:text-olive truncate">{{ item.text }}</RouterLink>
          <span v-else class="flex-1 text-bark truncate">{{ item.text }}</span>
          <span class="text-amber-600 text-xs whitespace-nowrap">{{ timeAgo(item.date) }}</span>
        </li>
      </ul>

      <div v-if="activity.length > 3" class="flex justify-end mt-5">
        <button
          class="px-6 py-2.5 rounded-xl bg-olive text-white font-semibold hover:bg-olive/90 transition-colors"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Show Less' : 'See All' }}
        </button>
      </div>
    </div>
  </div>
</template>
