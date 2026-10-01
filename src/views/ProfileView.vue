<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAdminQuizzes } from '../composables/useAdminQuizzes'
import { useAdminCourses } from '../composables/useAdminCourses'
import { getAllAttemptsForUser } from '../services/quizAttemptService'
import { getAllProgressForUser } from '../services/progressService'
import { getLessonsForCourse } from '../services/lessonService'
import { submitPendingImage } from '../services/profileSettingsService'
import { getImagePreviewUrl } from '../services/mediaService'
import AvatarUpload from '../components/ui/AvatarUpload.vue'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { currentUser, updateName, updateEmail, updatePassword, logout, loading: authLoading, error: authError } = useAuth()
const { quizzes, fetchAll: fetchQuizzes } = useAdminQuizzes()
const { courses, fetchAll: fetchCourses } = useAdminCourses()
const toast = useToast()

const activeTab = ref('courses')
const attempts = ref([])
const progressRows = ref([])
const dataLoading = ref(true)

const nameForm = ref('')
const emailForm = ref('')
const emailPassword = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const nameSaved = ref(false)
const emailSaved = ref(false)
const passwordSaved = ref(false)
const confirmingDelete = ref(false)

onMounted(async () => {
  nameForm.value = currentUser.value?.name || ''
  emailForm.value = currentUser.value?.email || ''
  fetchQuizzes()
  const [, attemptsData, progressData] = await Promise.all([
    fetchCourses(), // must finish before computeCourseProgress reads courseById
    getAllAttemptsForUser(currentUser.value.$id),
    getAllProgressForUser(currentUser.value.$id),
  ])
  attempts.value = attemptsData
  progressRows.value = progressData
  await computeCourseProgress()
  dataLoading.value = false
})

const quizById = computed(() => Object.fromEntries(quizzes.value.map((q) => [q.$id, q])))
const courseById = computed(() => Object.fromEntries(courses.value.map((c) => [c.$id, c])))

// NOTE: this deliberately does NOT use course.lessonCount, since that's a
// manually-typed field that can drift out of sync with the real lessons.
// Instead it fetches the actual published lesson count per course, so
// "completed" is always based on real data.
const courseProgress = ref([])

async function computeCourseProgress() {
  const map = {}
  progressRows.value.forEach((row) => {
    if (!map[row.courseId]) map[row.courseId] = new Set()
    map[row.courseId].add(row.lessonId)
  })

  const entries = await Promise.all(
    Object.entries(map).map(async ([courseId, lessonSet]) => {
      const course = courseById.value[courseId]
      if (!course) return null
      const realLessons = await getLessonsForCourse(courseId, { publishedOnly: true })
      const completedCount = lessonSet.size
      const total = realLessons.length || completedCount
      return { course, completedCount, total, isComplete: completedCount >= total }
    })
  )
  courseProgress.value = entries.filter(Boolean)
}

const enrolledCount = computed(() => courseProgress.value.length)
const completedCoursesCount = computed(() => courseProgress.value.filter((c) => c.isComplete).length)
const inProgressCourses = computed(() => courseProgress.value.filter((c) => !c.isComplete))
const completedCourses = computed(() => courseProgress.value.filter((c) => c.isComplete))

const quizStats = computed(() => {
  if (attempts.value.length === 0) return { count: 0, avg: 0 }
  const totalPct = attempts.value.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0)
  return { count: attempts.value.length, avg: Math.round(totalPct / attempts.value.length) }
})

// kind is 'avatar' | 'header'. Uploads never change the live photo —
// they're stored as pending until an admin approves them.
const PENDING_KEY = { avatar: 'pendingAvatarImageId', header: 'pendingHeaderImageId' }

async function submitImage(kind, fileId) {
  try {
    await submitPendingImage(currentUser.value.$id, kind, fileId)
    currentUser.value[PENDING_KEY[kind]] = fileId
    toast.success(fileId ? 'Photo submitted — an admin will review it soon' : 'Request cancelled')
  } catch (err) {
    console.error(err)
    toast.error('Could not save your photo. Please try again.')
  }
}

async function saveName() {
  nameSaved.value = false
  if (await updateName(nameForm.value)) {
    nameSaved.value = true
    setTimeout(() => (nameSaved.value = false), 2500)
  }
}

async function saveEmail() {
  emailSaved.value = false
  if (await updateEmail(emailForm.value, emailPassword.value)) {
    emailSaved.value = true
    emailPassword.value = ''
    setTimeout(() => (emailSaved.value = false), 2500)
  }
}

async function savePassword() {
  passwordSaved.value = false
  if (await updatePassword(newPassword.value, currentPassword.value)) {
    passwordSaved.value = true
    currentPassword.value = ''
    newPassword.value = ''
    setTimeout(() => (passwordSaved.value = false), 2500)
  }
}

async function confirmDeleteAccount() {
  confirmingDelete.value = false
  await logout()
  toast.success('You have been signed out. Contact support to fully delete your account.')
  router.push('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <div
      class="rounded-2xl p-6 flex items-center gap-4 mb-5 bg-bark bg-cover bg-center"
      :style="currentUser?.headerImageId ? { backgroundImage: `url(${getImagePreviewUrl(currentUser.headerImageId)})` } : {}"
    >
      <div class="w-14 h-14 rounded-full overflow-hidden bg-sand flex items-center justify-center flex-shrink-0 ring-2 ring-white/40">
        <img
          v-if="currentUser?.avatarImageId"
          :src="getImagePreviewUrl(currentUser.avatarImageId)"
          alt=""
          class="w-full h-full object-cover"
        />
        <span v-else class="text-bark text-xl font-semibold">{{ currentUser?.name?.charAt(0)?.toUpperCase() }}</span>
      </div>
      <div class="drop-shadow">
        <div class="text-lg font-semibold text-white">{{ currentUser?.name }}</div>
        <div class="text-xs text-cream/60">
          Learning since
          {{ currentUser?.registration ? new Date(currentUser.registration).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '' }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-3 mb-6">
      <div class="bg-white rounded-lg p-4 text-center border border-olive/30">
        <div class="text-xl font-semibold text-bark">{{ enrolledCount }}</div>
        <div class="text-[11px] text-bark/50">Enrolled</div>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-olive/30">
        <div class="text-xl font-semibold text-bark">{{ completedCoursesCount }}</div>
        <div class="text-[11px] text-bark/50">Completed</div>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-olive/30">
        <div class="text-xl font-semibold text-bark">{{ quizStats.count }}</div>
        <div class="text-[11px] text-bark/50">Quizzes taken</div>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-olive/30">
        <div class="text-xl font-semibold text-olive">{{ quizStats.avg }}%</div>
        <div class="text-[11px] text-bark/50">Avg. score</div>
      </div>
    </div>

    <div class="flex gap-4 border-b border-black/10 mb-5 text-sm">
      <button class="pb-2 border-b-2" :class="activeTab === 'courses' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'" @click="activeTab = 'courses'">My Courses</button>
      <button class="pb-2 border-b-2" :class="activeTab === 'history' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'" @click="activeTab = 'history'">Quiz History</button>
      <button class="pb-2 border-b-2" :class="activeTab === 'settings' ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/50'" @click="activeTab = 'settings'">Settings</button>
    </div>

    <div v-if="activeTab === 'courses'">
      <div v-if="dataLoading" class="grid grid-cols-3 gap-3" aria-live="polite">
        <div v-for="n in 3" :key="n" class="h-32 bg-white rounded-lg animate-pulse"></div>
      </div>
      <div v-else-if="courseProgress.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
        Nothing started yet.
        <RouterLink to="/courses" class="text-olive font-medium">Browse courses →</RouterLink>
      </div>
      <div v-else class="space-y-6">
        <div v-if="inProgressCourses.length">
          <div class="text-sm font-semibold text-bark mb-3">Continue on:</div>
          <div class="grid grid-cols-3 gap-3">
            <RouterLink
              v-for="entry in inProgressCourses"
              :key="entry.course.$id"
              :to="`/courses/${entry.course.$id}`"
              class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="relative">
                <img
                  v-if="entry.course.coverImageId"
                  :src="getImagePreviewUrl(entry.course.coverImageId)"
                  :alt="entry.course.title"
                  class="h-20 w-full object-cover"
                />
                <div v-else class="h-20 bg-olive-light"></div>
                <span class="absolute top-1.5 right-1.5 bg-yellow-400 text-bark text-[9px] font-semibold px-2 py-0.5 rounded-full">In Progress</span>
              </div>
              <div class="p-2.5">
                <div class="text-xs font-medium text-bark leading-tight">{{ entry.course.title }}</div>
                <div class="text-[10px] text-bark/50 mt-1">{{ entry.completedCount }}/{{ entry.total }} lessons</div>
              </div>
            </RouterLink>
          </div>
        </div>

        <div v-if="completedCourses.length">
          <div class="text-sm font-semibold text-bark mb-3">Completed:</div>
          <div class="grid grid-cols-3 gap-3">
            <RouterLink
              v-for="entry in completedCourses"
              :key="entry.course.$id"
              :to="`/courses/${entry.course.$id}`"
              class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="relative">
                <img
                  v-if="entry.course.coverImageId"
                  :src="getImagePreviewUrl(entry.course.coverImageId)"
                  :alt="entry.course.title"
                  class="h-20 w-full object-cover"
                />
                <div v-else class="h-20 bg-olive-light"></div>
                <span class="absolute top-1.5 right-1.5 bg-olive text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">✓ Completed</span>
              </div>
              <div class="p-2.5">
                <div class="text-xs font-medium text-bark leading-tight">{{ entry.course.title }}</div>
                <div class="text-[10px] text-bark/50 mt-1">{{ entry.total }}/{{ entry.total }} lessons</div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'history'">
      <div v-if="dataLoading" class="space-y-2" aria-live="polite">
        <div v-for="n in 3" :key="n" class="h-14 bg-white rounded-lg animate-pulse"></div>
      </div>
      <div v-else-if="attempts.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
        You haven't taken any quizzes yet.
        <RouterLink to="/quizzes" class="text-olive font-medium">Browse quizzes →</RouterLink>
      </div>
      <div v-else class="space-y-2">
        <div v-for="attempt in attempts" :key="attempt.$id" class="flex items-center gap-3 bg-white px-4 py-3 rounded-lg text-sm">
          <div class="flex-1">
            <div class="font-medium text-bark">{{ quizById[attempt.quizId]?.title || 'Quiz' }}</div>
            <div class="text-xs text-bark/50">{{ new Date(attempt.$createdAt).toLocaleDateString() }}</div>
          </div>
          <span
            class="text-xs px-3 py-1 rounded-full font-medium"
            :class="attempt.score / attempt.totalQuestions >= (quizById[attempt.quizId]?.passingScore || 70) / 100 ? 'bg-olive-light text-olive' : 'bg-yellow-100 text-yellow-700'"
          >
            {{ attempt.score }}/{{ attempt.totalQuestions }}
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'settings'" class="space-y-4">
      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Profile Picture</div>
        <AvatarUpload
          :live-image-id="currentUser?.avatarImageId"
          :pending-image-id="currentUser?.pendingAvatarImageId"
          shape="circle"
          @submit="submitImage('avatar', $event)"
          @withdraw="submitImage('avatar', null)"
        />
      </div>

      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Profile Header</div>
        <AvatarUpload
          :live-image-id="currentUser?.headerImageId"
          :pending-image-id="currentUser?.pendingHeaderImageId"
          shape="rectangle"
          @submit="submitImage('header', $event)"
          @withdraw="submitImage('header', null)"
        />
      </div>

      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Profile Settings</div>
        <label class="text-xs text-bark/70 block mb-1">Display name</label>
        <input v-model="nameForm" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <button class="text-xs px-4 py-2 rounded-md bg-olive text-white disabled:opacity-60" :disabled="authLoading" @click="saveName">
          Save Changes
        </button>
        <span v-if="nameSaved" class="text-xs text-olive ml-2">✓ Saved</span>
      </div>

      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Email</div>
        <div v-if="authError" class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{{ authError }}</div>
        <label class="text-xs text-bark/70 block mb-1">Email</label>
        <input v-model="emailForm" type="email" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <label class="text-xs text-bark/70 block mb-1">Confirm with your password</label>
        <input v-model="emailPassword" type="password" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <button class="text-xs px-4 py-2 rounded-md bg-olive text-white disabled:opacity-60" :disabled="authLoading || !emailPassword" @click="saveEmail">
          Save Email
        </button>
        <span v-if="emailSaved" class="text-xs text-olive ml-2">✓ Saved</span>
      </div>

      <div class="bg-white rounded-xl p-5">
        <div class="text-xs font-semibold text-bark mb-3">Change password</div>
        <label class="text-xs text-bark/70 block mb-1">Current password</label>
        <input v-model="currentPassword" type="password" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <label class="text-xs text-bark/70 block mb-1">New password</label>
        <input v-model="newPassword" type="password" class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3" />
        <button class="text-xs px-4 py-2 rounded-md bg-olive text-white disabled:opacity-60" :disabled="authLoading || !currentPassword || !newPassword" @click="savePassword">
          Update Password
        </button>
        <span v-if="passwordSaved" class="text-xs text-olive ml-2">✓ Updated</span>
      </div>

      <div class="bg-red-50 border border-red-200 rounded-xl p-5 flex justify-between items-center">
        <div>
          <div class="text-xs font-semibold text-red-700">Delete account</div>
          <div class="text-xs text-red-600/80">This signs you out and removes your personal data.</div>
        </div>
        <button class="text-xs px-4 py-2 rounded-md bg-red-500 text-white" @click="confirmingDelete = true">Delete</button>
      </div>
    </div>

    <ConfirmModal
      :open="confirmingDelete"
      title="Delete your account?"
      message="You'll be signed out and your personal data will be removed. This can't be undone."
      @confirm="confirmDeleteAccount"
      @cancel="confirmingDelete = false"
    />
  </div>
</template>