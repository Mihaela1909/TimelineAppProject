<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAdminQuizzes } from '../composables/useAdminQuizzes'
import { getAllAttemptsForUser } from '../services/quizAttemptService'

const { currentUser, updateName, updatePassword, loading: authLoading, error: authError } = useAuth()
const { quizzes, fetchAll: fetchQuizzes } = useAdminQuizzes()

const activeTab = ref('history')
const attempts = ref([])
const attemptsLoading = ref(true)

const nameForm = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const nameSaved = ref(false)
const passwordSaved = ref(false)

onMounted(async () => {
  nameForm.value = currentUser.value?.name || ''
  fetchQuizzes()
  try {
    attempts.value = await getAllAttemptsForUser(currentUser.value.$id)
  } finally {
    attemptsLoading.value = false
  }
})

const quizById = computed(() => {
  const map = {}
  quizzes.value.forEach((q) => (map[q.$id] = q))
  return map
})

const stats = computed(() => {
  if (attempts.value.length === 0) return { count: 0, avg: 0 }
  const totalPct = attempts.value.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0)
  return { count: attempts.value.length, avg: Math.round(totalPct / attempts.value.length) }
})

const memberSince = computed(() => {
  if (!currentUser.value?.registration) return ''
  return new Date(currentUser.value.registration).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

async function saveName() {
  nameSaved.value = false
  const ok = await updateName(nameForm.value)
  if (ok) {
    nameSaved.value = true
    setTimeout(() => (nameSaved.value = false), 2500)
  }
}

async function savePassword() {
  passwordSaved.value = false
  const ok = await updatePassword(newPassword.value, currentPassword.value)
  if (ok) {
    passwordSaved.value = true
    currentPassword.value = ''
    newPassword.value = ''
    setTimeout(() => (passwordSaved.value = false), 2500)
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <div class="bg-bark rounded-2xl p-6 flex items-center gap-4 mb-5">
      <div class="w-14 h-14 rounded-full bg-sand flex items-center justify-center text-bark text-xl font-semibold flex-shrink-0">
        {{ currentUser?.name?.charAt(0)?.toUpperCase() }}
      </div>
      <div>
        <div class="text-lg font-semibold text-white">{{ currentUser?.name }}</div>
        <div class="text-xs text-cream/60">Learning since {{ memberSince }}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="bg-white rounded-lg p-4 text-center">
        <div class="text-xl font-semibold text-bark">{{ stats.count }}</div>
        <div class="text-xs text-bark/50">Quizzes taken</div>
      </div>
      <div class="bg-white rounded-lg p-4 text-center">
        <div class="text-xl font-semibold text-olive">{{ stats.avg }}%</div>
        <div class="text-xs text-bark/50">Average score</div>
      </div>
    </div>

    <div class="flex gap-4 border-b border-black/10 mb-5 text-sm">
      <button
        class="pb-2 border-b-2"
        :class="activeTab === 'history' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'"
        @click="activeTab = 'history'"
      >
        Quiz History
      </button>
      <button
        class="pb-2 border-b-2"
        :class="activeTab === 'settings' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'"
        @click="activeTab = 'settings'"
      >
        Settings
      </button>
    </div>

    <!-- QUIZ HISTORY -->
    <div v-if="activeTab === 'history'">
      <div v-if="attemptsLoading" class="space-y-2" aria-live="polite">
        <div v-for="n in 3" :key="n" class="h-14 bg-white rounded-lg animate-pulse"></div>
      </div>
      <div v-else-if="attempts.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
        You haven't taken any quizzes yet.
        <RouterLink to="/quizzes" class="text-olive font-medium">Browse quizzes →</RouterLink>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="attempt in attempts"
          :key="attempt.$id"
          class="flex items-center gap-3 bg-white px-4 py-3 rounded-lg text-sm"
        >
          <div class="flex-1">
            <div class="font-medium text-bark">{{ quizById[attempt.quizId]?.title || 'Quiz' }}</div>
            <div class="text-xs text-bark/50">{{ new Date(attempt.$createdAt).toLocaleDateString() }}</div>
          </div>
          <span
            class="text-xs px-3 py-1 rounded-full font-medium"
            :class="
              attempt.score / attempt.totalQuestions >= (quizById[attempt.quizId]?.passingScore || 70) / 100
                ? 'bg-olive-light text-olive'
                : 'bg-yellow-100 text-yellow-700'
            "
          >
            {{ attempt.score }}/{{ attempt.totalQuestions }}
          </span>
        </div>
      </div>
    </div>

    <!-- SETTINGS -->
    <div v-else-if="activeTab === 'settings'" class="space-y-4">
      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Profile</div>
        <label class="text-xs text-bark/70 block mb-1">Display name</label>
        <input v-model="nameForm" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <button
          class="text-xs px-4 py-2 rounded-md bg-olive text-white disabled:opacity-60"
          :disabled="authLoading"
          @click="saveName"
        >
          Save Changes
        </button>
        <span v-if="nameSaved" class="text-xs text-olive ml-2">✓ Saved</span>
      </div>

      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Change password</div>
        <div v-if="authError" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
          {{ authError }}
        </div>
        <label class="text-xs text-bark/70 block mb-1">Current password</label>
        <input
          v-model="currentPassword"
          type="password"
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3"
        />
        <label class="text-xs text-bark/70 block mb-1">New password</label>
        <input
          v-model="newPassword"
          type="password"
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3"
        />
        <button
          class="text-xs px-4 py-2 rounded-md bg-olive text-white disabled:opacity-60"
          :disabled="authLoading || !currentPassword || !newPassword"
          @click="savePassword"
        >
          Update Password
        </button>
        <span v-if="passwordSaved" class="text-xs text-olive ml-2">✓ Updated</span>
      </div>
    </div>
  </div>
</template>