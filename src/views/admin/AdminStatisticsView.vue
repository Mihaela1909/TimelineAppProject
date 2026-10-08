<script setup>
import { computed, onMounted } from 'vue'
import { useAdminStatistics } from '../../composables/useAdminStatistics'

const { stats, loading, error, fetchAll } = useAdminStatistics()

onMounted(fetchAll)

const tiles = computed(() => {
  if (!stats.value) return []
  const t = stats.value.tiles
  const delta = t.newThisMonth - t.newLastMonth
  return [
    {
      label: 'New users this month',
      value: t.newThisMonth,
      note: delta === 0 ? 'Same as last month' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} vs last month`,
      tone: delta > 0 ? 'up' : delta < 0 ? 'down' : null,
    },
    { label: 'Active learners', value: t.activeLearners, note: 'Last 30 days' },
    { label: 'Lessons completed', value: t.lessonsCompleted.toLocaleString(), note: 'All time' },
    { label: 'Avg. quiz score', value: `${t.avgQuizScore}%`, note: `${t.quizAttempts.toLocaleString()} attempts` },
  ]
})

// Column heights scale to the busiest month; a floor of 1 avoids /0.
const signupMax = computed(() => Math.max(1, ...(stats.value?.signups.map((m) => m.value) || [])))
const learnerMax = computed(() => Math.max(1, ...(stats.value?.courses.map((c) => c.learners) || [])))
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3 justify-between items-center mb-8">
      <h1 class="font-voice text-3xl md:text-4xl text-bark">Statistics</h1>
      <button
        class="text-sm px-4 py-2 rounded-md border border-olive text-olive disabled:opacity-60"
        :disabled="loading"
        @click="fetchAll"
      >
        Refresh
      </button>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div v-else-if="!stats" class="space-y-4" aria-live="polite">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="h-28 bg-white rounded-xl animate-pulse"></div>
      </div>
      <div class="h-64 bg-white rounded-xl animate-pulse"></div>
    </div>

    <!-- On refresh, keep the old numbers visible (dimmed) instead of flashing skeletons. -->
    <div v-else class="space-y-6 transition-opacity" :class="loading ? 'opacity-60' : ''">
      <!-- Stat tiles -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="tile in tiles" :key="tile.label" class="bg-white rounded-xl p-5">
          <div class="text-sm text-bark/70 mb-1">{{ tile.label }}</div>
          <div class="text-3xl font-semibold text-bark">{{ tile.value }}</div>
          <div
            class="text-xs mt-1"
            :class="tile.tone === 'up' ? 'text-green-700' : tile.tone === 'down' ? 'text-red-600' : 'text-bark/50'"
          >
            {{ tile.note }}
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Sign-ups per month: single-series column chart -->
        <section class="bg-white rounded-xl p-4 md:p-6">
          <h2 class="text-lg font-semibold text-bark">New sign-ups</h2>
          <p class="text-xs text-bark/50 mb-6">Per month, last 6 months</p>

          <div class="flex items-end justify-around h-44 border-b border-black/10">
            <div
              v-for="month in stats.signups"
              :key="month.key"
              class="group relative flex flex-col items-center justify-end h-full flex-1 outline-none"
              tabindex="0"
              :aria-label="`${month.fullLabel}: ${month.value} sign-ups`"
            >
              <span class="text-xs text-bark mb-1 tabular-nums">{{ month.value }}</span>
              <div
                class="w-6 bg-olive rounded-t transition-opacity group-hover:opacity-80"
                :style="{ height: `${(month.value / signupMax) * 80}%`, minHeight: month.value ? '4px' : '0' }"
              ></div>
              <div
                class="pointer-events-none absolute -top-8 whitespace-nowrap bg-bark text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
              >
                {{ month.fullLabel }} · {{ month.value }} sign-up{{ month.value === 1 ? '' : 's' }}
              </div>
            </div>
          </div>
          <div class="flex justify-around mt-2">
            <span v-for="month in stats.signups" :key="month.key" class="flex-1 text-center text-xs text-bark/60">
              {{ month.label }}
            </span>
          </div>
        </section>

        <!-- Community breakdown -->
        <section class="bg-white rounded-xl p-4 md:p-6">
          <h2 class="text-lg font-semibold text-bark">Community</h2>
          <p class="text-xs text-bark/50 mb-6">{{ stats.community.total }} accounts in total</p>

          <div class="grid grid-cols-3 gap-3 mb-6">
            <div v-for="role in stats.community.roles" :key="role.label" class="bg-cream/60 rounded-lg p-4 text-center">
              <div class="text-2xl font-semibold text-bark">{{ role.value }}</div>
              <div class="text-xs text-bark/60">{{ role.label }}</div>
            </div>
          </div>

          <div class="flex justify-between text-xs text-bark mb-2">
            <span>Active · {{ stats.community.active }}</span>
            <span>Inactive · {{ stats.community.inactive }}</span>
          </div>
          <div class="flex h-3 gap-0.5 rounded-full overflow-hidden bg-olive-light" role="img"
            :aria-label="`${stats.community.active} active, ${stats.community.inactive} inactive`">
            <div class="bg-olive" :style="{ width: `${(stats.community.active / Math.max(1, stats.community.total)) * 100}%` }"></div>
            <div class="bg-red-400" :style="{ width: `${(stats.community.inactive / Math.max(1, stats.community.total)) * 100}%` }"></div>
          </div>
          <RouterLink to="/admin/users/inactive" class="inline-block text-xs text-olive font-medium mt-3">
            View inactive users →
          </RouterLink>
        </section>
      </div>

      <!-- Course engagement: single-series horizontal bars -->
      <section class="bg-white rounded-xl p-4 md:p-6">
        <h2 class="text-lg font-semibold text-bark">Course engagement</h2>
        <p class="text-xs text-bark/50 mb-6">Learners who completed at least one lesson, and how many finished the course</p>

        <div v-if="stats.courses.length === 0" class="text-sm text-bark/60">No courses yet.</div>
        <ul v-else class="space-y-3">
          <li v-for="course in stats.courses" :key="course.id" class="grid grid-cols-[minmax(0,7rem)_1fr_auto] sm:grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-2 sm:gap-4 text-sm">
            <RouterLink :to="`/admin/courses/${course.id}/edit`" class="text-bark truncate hover:text-olive" :title="course.title">
              {{ course.title }}
            </RouterLink>
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="h-4 bg-olive rounded-r"
                :style="{ width: `${(course.learners / learnerMax) * 100}%`, minWidth: course.learners ? '4px' : '0' }"
              ></div>
              <span class="text-xs text-bark tabular-nums">{{ course.learners }}</span>
            </div>
            <span class="text-xs text-bark/60 whitespace-nowrap tabular-nums">{{ course.completed }} completed</span>
          </li>
        </ul>
      </section>

      <!-- Quiz performance table -->
      <section class="bg-white rounded-xl p-4 md:p-6">
        <h2 class="text-lg font-semibold text-bark">Quiz performance</h2>
        <p class="text-xs text-bark/50 mb-4">Sorted by number of attempts</p>

        <div v-if="stats.quizzes.length === 0" class="text-sm text-bark/60">No quizzes yet.</div>
        <div v-else class="overflow-x-auto -mx-1 px-1">
        <table class="w-full min-w-[28rem] text-sm">
          <thead>
            <tr class="text-left text-bark/50 border-b border-black/10">
              <th class="py-2 pr-4 font-medium">Quiz</th>
              <th class="py-2 pr-4 font-medium text-right">Attempts</th>
              <th class="py-2 pr-4 font-medium w-1/3">Avg. score</th>
              <th class="py-2 font-medium text-right">Pass rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in stats.quizzes" :key="quiz.id" class="border-b border-black/5 last:border-0">
              <td class="py-3 pr-4">
                <RouterLink :to="`/admin/quizzes/${quiz.id}/edit`" class="text-bark hover:text-olive">{{ quiz.title }}</RouterLink>
              </td>
              <td class="py-3 pr-4 text-right tabular-nums text-bark">{{ quiz.attempts }}</td>
              <td class="py-3 pr-4">
                <div v-if="quiz.attempts" class="flex items-center gap-2">
                  <div class="flex-1 h-2 rounded-full bg-olive-light">
                    <div class="h-full rounded-full bg-olive" :style="{ width: `${quiz.avgScore}%` }"></div>
                  </div>
                  <span class="text-xs text-bark tabular-nums w-9 text-right">{{ quiz.avgScore }}%</span>
                </div>
                <span v-else class="text-xs text-bark/40">—</span>
              </td>
              <td class="py-3 text-right tabular-nums text-bark">{{ quiz.attempts ? `${quiz.passRate}%` : '—' }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>
    </div>
  </div>
</template>
