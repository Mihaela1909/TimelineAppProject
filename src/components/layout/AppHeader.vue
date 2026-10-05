<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { getImagePreviewUrl } from '../../services/mediaService'
import { STAFF_ROLES } from '../../constants/roles'
import AppLogo from './AppLogo.vue'
import AppIcon from '../ui/AppIcon.vue'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Quizzes', to: '/quizzes' },
  { label: 'Event of the day', to: '/event-of-the-day' },
  { label: 'About us', to: '/about' },
  { label: 'Blog', to: '/blog' },
]

const { currentUser, authChecked, refreshCurrentUser, logout } = useAuth()
const route = useRoute()
const router = useRouter()

const mobileOpen = ref(false) // hamburger panel (small screens)
const accountOpen = ref(false) // profile-circle dropdown (logged in)

const isStaff = computed(() => STAFF_ROLES.includes(currentUser.value?.role))

onMounted(() => {
  if (!authChecked.value) refreshCurrentUser()
})

// RESET: close any open menu after navigating.
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
    accountOpen.value = false
  }
)

async function handleLogout() {
  accountOpen.value = false
  mobileOpen.value = false
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="bg-olive relative z-30">
    <div class="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-6">
      <AppLogo size="sm" />

      <nav class="hidden md:flex items-center gap-8 lg:gap-10 text-white" aria-label="Main">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-base hover:text-cream transition-colors underline-offset-8 decoration-2"
          active-class="underline"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3">
        <!-- Profile circle: login link when logged out, account menu when logged in -->
        <RouterLink
          v-if="!currentUser"
          to="/login"
          class="hidden md:flex w-14 h-14 rounded-full bg-ochre items-center justify-center text-white hover:brightness-105 transition"
          aria-label="Log in"
        >
          <AppIcon name="person" class="w-7 h-7" />
        </RouterLink>
        <div v-else class="relative hidden md:block">
          <button
            type="button"
            class="w-14 h-14 rounded-full bg-ochre flex items-center justify-center text-white overflow-hidden hover:brightness-105 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cream/60"
            :aria-expanded="accountOpen"
            aria-haspopup="menu"
            :aria-label="`Account menu for ${currentUser.name}`"
            @click="accountOpen = !accountOpen"
          >
            <img
              v-if="currentUser.avatarImageId"
              :src="getImagePreviewUrl(currentUser.avatarImageId)"
              alt=""
              class="w-full h-full object-cover"
            />
            <AppIcon v-else name="person" class="w-7 h-7" />
          </button>

          <div
            v-if="accountOpen"
            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden z-40"
            role="menu"
          >
            <div class="px-4 py-3 border-b border-black/5">
              <div class="text-sm font-semibold text-bark truncate">{{ currentUser.name }}</div>
              <div class="text-xs text-bark/60 truncate">{{ currentUser.email }}</div>
            </div>
            <RouterLink to="/profile" class="block px-4 py-2.5 text-sm text-bark hover:bg-olive-light/60" role="menuitem">
              My profile
            </RouterLink>
            <RouterLink v-if="isStaff" to="/admin" class="block px-4 py-2.5 text-sm text-bark hover:bg-olive-light/60" role="menuitem">
              Admin panel
            </RouterLink>
            <button
              type="button"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-black/5"
              role="menuitem"
              @click="handleLogout"
            >
              <AppIcon name="logout" class="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        <!-- Hamburger (small screens) -->
        <button
          type="button"
          class="md:hidden text-white p-1"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <AppIcon :name="mobileOpen ? 'close' : 'menu'" class="w-9 h-9" />
        </button>
      </div>
    </div>

    <!-- Click-outside catcher for the account menu -->
    <div v-if="accountOpen" class="fixed inset-0 z-30" @click="accountOpen = false"></div>

    <!-- Mobile menu panel -->
    <nav
      v-if="mobileOpen"
      id="mobile-menu"
      class="md:hidden absolute inset-x-0 top-full bg-olive border-t border-white/15 shadow-lg px-5 pb-5"
      aria-label="Main"
    >
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="block py-3 text-lg text-white border-b border-white/10"
        active-class="font-semibold"
      >
        {{ link.label }}
      </RouterLink>
      <div class="pt-4 flex flex-wrap gap-3">
        <template v-if="currentUser">
          <RouterLink to="/profile" class="font-button px-4 py-2 rounded-md bg-cream text-bark">My profile</RouterLink>
          <RouterLink v-if="isStaff" to="/admin" class="font-button px-4 py-2 rounded-md bg-cream text-bark">Admin panel</RouterLink>
          <button type="button" class="px-4 py-2 rounded-md border border-cream/60 text-white" @click="handleLogout">Log out</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="font-button px-4 py-2 rounded-md bg-cream text-bark">Log in</RouterLink>
          <RouterLink to="/register" class="font-button px-4 py-2 rounded-md border border-cream/60 text-white">Sign up</RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>
