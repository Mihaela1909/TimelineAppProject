<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useProfileProgress } from '../composables/useProfileProgress'
import { useProfileImages } from '../composables/useProfileImages'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import { useToast } from '../composables/useToast'
import { STAFF_ROLES } from '../constants/roles'
import { useSavedPosts } from '../composables/useSavedPosts'
import { useBlog } from '../composables/useBlog'
import SavedPostsTab from '../components/profile/SavedPostsTab.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileSection from '../components/profile/ProfileSection.vue'
import ProfileCoursesTab from '../components/profile/ProfileCoursesTab.vue'
import QuizHistoryTab from '../components/profile/QuizHistoryTab.vue'
import AuthField from '../components/auth/AuthField.vue'
import StatBoxes from '../components/ui/StatBoxes.vue'
import ProfileTabs from '../components/profile/ProfileTabs.vue'
import ProfilePhotosCard from '../components/profile/ProfilePhotosCard.vue'

const router = useRouter()
const { currentUser, updateName, updateEmail, updatePassword, logout, loading: authLoading, error: authError } = useAuth()
const {
  attempts,
  courseProgress,
  inProgressCourses,
  completedCourses,
  quizById,
  quizStats,
  loading: dataLoading,
  error: dataError,
  fetchFor,
} = useProfileProgress()
const { submit: submitPendingImage } = useProfileImages()
const toast = useToast()

const activeTab = ref('courses')

// Saved posts: loaded the first time the tab is opened.
const { savedIds, loading: savedLoading, error: savedError, busy: savedBusy, fetchFor: fetchSaved, toggle: toggleSaved } = useSavedPosts()
const { posts: blogPosts, loading: blogLoading, error: blogError, fetchPublished: fetchBlogPosts } = useBlog()
let savedLoaded = false
async function loadSaved() {
  savedLoaded = true
  await Promise.all([fetchSaved(currentUser.value?.$id), fetchBlogPosts()])
}
watch(activeTab, (tab) => {
  if (tab === 'saved' && !savedLoaded) loadSaved()
})
// Most recently saved first; posts that were deleted or unpublished drop out.
const savedPosts = computed(() =>
  [...savedIds.value].reverse().map((id) => blogPosts.value.find((p) => p.$id === id)).filter(Boolean)
)
async function removeSaved(post) {
  const nowSaved = await toggleSaved(currentUser.value?.$id, post.$id)
  if (nowSaved === null) toast.error('Could not remove this post. Please try again.')
  else toast.success('Removed from saved posts')
}

const nameForm = ref('')
const emailForm = ref('')
const emailPassword = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const profileSaved = ref(false)
const passwordSaved = ref(false)
const confirmingDelete = ref(false)
// Which settings card the current authError belongs to, so it shows in the right place.
const errorFor = ref(null)

onMounted(() => {
  nameForm.value = currentUser.value?.name || ''
  emailForm.value = currentUser.value?.email || ''
  fetchFor(currentUser.value?.$id)
})

// Staff (admins + editors) get a shortcut into the admin panel. UX only —
// the router guard and Appwrite permissions still decide what they can do.
const canOpenAdmin = computed(() => STAFF_ROLES.includes(currentUser.value?.role))

// '–' while loading, so the boxes don't flash 0 first
const stats = computed(() => {
  const value = (v) => (dataLoading.value ? '–' : v)
  return [
    { value: value(courseProgress.value.length), label: 'Enrolled Courses' },
    { value: value(completedCourses.value.length), label: 'Courses Completed' },
    { value: value(quizStats.value.count), label: 'Quizzes taken' },
    { value: value(`${quizStats.value.avg}%`), label: 'Avg. score' },
  ]
})

const TABS = [
  { id: 'courses', label: 'My Courses' },
  { id: 'history', label: 'Quiz History' },
  { id: 'saved', label: 'Saved Posts' },
  { id: 'settings', label: 'Settings' },
]

// Appwrite asks for the password only when the email changes, so that field
// appears only then.
const emailChanged = computed(() => emailForm.value.trim() !== (currentUser.value?.email || ''))

// kind is 'avatar' | 'header'; fileId = null cancels a pending request.
async function submitImage(kind, fileId) {
  if (await submitPendingImage(kind, fileId)) {
    toast.success(fileId ? 'Photo submitted — an admin will review it soon' : 'Request cancelled')
  } else {
    toast.error('Could not save your photo. Please try again.')
  }
}

// One "Save Changes" for name + email: only what changed is sent, name first.
async function saveProfile() {
  errorFor.value = 'profile'
  profileSaved.value = false
  const nameChanged = nameForm.value.trim() !== (currentUser.value?.name || '')
  if (nameChanged && !(await updateName(nameForm.value))) return
  if (emailChanged.value) {
    if (!(await updateEmail(emailForm.value, emailPassword.value))) return
    emailPassword.value = ''
  }
  profileSaved.value = true
  setTimeout(() => (profileSaved.value = false), 2500)
}

async function savePassword() {
  errorFor.value = 'password'
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
  <div class="pb-16">
    <ProfileHeader
      :name="currentUser?.name || ''"
      :avatar-image-id="currentUser?.avatarImageId"
      :header-image-id="currentUser?.headerImageId"
      :show-admin-link="canOpenAdmin"
    />

    <div class="max-w-6xl mx-auto px-5 md:px-8">
      <!-- Stat boxes (same style as the quiz intro) -->
      <StatBoxes class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-8 mb-10" :stats="stats" />

      <ProfileTabs v-model="activeTab" :tabs="TABS" />

      <ProfileCoursesTab
        v-if="activeTab === 'courses'"
        :in-progress="inProgressCourses"
        :completed="completedCourses"
        :loading="dataLoading"
        :error="dataError"
        @retry="fetchFor(currentUser?.$id)"
      />

      <QuizHistoryTab
        v-else-if="activeTab === 'history'"
        :attempts="attempts"
        :quiz-by-id="quizById"
        :loading="dataLoading"
        :error="dataError"
        @retry="fetchFor(currentUser?.$id)"
      />

      <ProfileSection v-else-if="activeTab === 'saved'" title="Saved for later:">
        <SavedPostsTab
          :posts="savedPosts"
          :loading="savedLoading || blogLoading"
          :error="savedError || blogError"
          :busy="savedBusy"
          @remove="removeSaved"
          @retry="loadSaved"
        />
      </ProfileSection>

      <div v-else-if="activeTab === 'settings'" class="space-y-8">
        <ProfileSection title="Profile Settings">
          <form class="max-w-3xl" @submit.prevent="saveProfile">
            <div v-if="authError && errorFor === 'profile'" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4" role="alert">{{ authError }}</div>
            <AuthField id="profile-name" v-model="nameForm" label="Display name" autocomplete="name" />
            <AuthField id="profile-email" v-model="emailForm" label="Email" type="email" autocomplete="email" />
            <AuthField v-if="emailChanged" id="profile-email-password" v-model="emailPassword" label="Confirm the new email with your password" type="password" autocomplete="current-password" />
            <div class="flex items-center justify-end gap-3">
              <span v-if="profileSaved" class="text-sm text-leaf font-semibold">✓ Saved</span>
              <button type="submit" class="px-6 py-2.5 rounded-md bg-olive text-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 disabled:opacity-60" :disabled="authLoading || (emailChanged && !emailPassword)">
                Save Changes
              </button>
            </div>
          </form>
        </ProfileSection>

        <ProfilePhotosCard v-if="currentUser" :user="currentUser" @submit="submitImage" />

        <ProfileSection title="Change Password">
          <form class="max-w-3xl" @submit.prevent="savePassword">
            <div v-if="authError && errorFor === 'password'" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4" role="alert">{{ authError }}</div>
            <AuthField id="current-password" v-model="currentPassword" label="Current password" type="password" autocomplete="current-password" />
            <AuthField id="new-password" v-model="newPassword" label="New password" type="password" autocomplete="new-password" />
            <div class="flex items-center justify-end gap-3">
              <span v-if="passwordSaved" class="text-sm text-leaf font-semibold">✓ Updated</span>
              <button type="submit" class="px-6 py-2.5 rounded-md bg-olive text-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 disabled:opacity-60" :disabled="authLoading || !currentPassword || !newPassword">
                Update Password
              </button>
            </div>
          </form>
        </ProfileSection>

        <div class="bg-red-50 border border-red-200 rounded-xl px-5 py-5 md:px-14 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <div class="font-semibold text-red-700 text-lg">Delete account</div>
            <div class="text-sm text-red-700/80">This permanently removes your data.</div>
          </div>
          <button type="button" class="px-6 py-2.5 rounded-md bg-red-500 text-white hover:bg-red-600" @click="confirmingDelete = true">Delete</button>
        </div>
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
