<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLogo from '../components/layout/AppLogo.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import { ROLES } from '../constants/roles'

// No public header/footer here on purpose: the admin panel is a focused
// workspace. The sidebar logo links back to the live site, and the
// name/avatar links to the user's own profile.
const { currentUser, logout } = useAuth()
const route = useRoute()
const router = useRouter()

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'home', exact: true },
  { label: 'Courses', to: '/admin/courses', icon: 'course' },
  { label: 'Quizzes', to: '/admin/quizzes', icon: 'quiz' },
  { label: 'Blog Posts', to: '/admin/blog-posts', icon: 'post' },
]

// Everything under "Users" is admin-only (the router blocks editors too),
// so the whole group is hidden for editors rather than showing dead links.
const userItems = [
  { label: 'Statistic', to: '/admin/stats' },
  { label: 'Inactive', to: '/admin/users/inactive' },
  { label: 'Users', to: '/admin/users', exact: true },
  { label: 'Image Approvals', to: '/admin/image-approvals' },
]

const isAdmin = computed(() => currentUser.value?.role === ROLES.ADMIN)
const roleLabel = computed(() => {
  const role = currentUser.value?.role || ''
  return role.charAt(0).toUpperCase() + role.slice(1)
})

// Start expanded when the current page is inside the group.
const usersOpen = ref(userItems.some((item) => route.path.startsWith(item.to)))

// Phones: the sidebar is a drawer behind a menu button (like the public header).
const menuOpen = ref(false)
// RESET: close the drawer after navigating.
watch(() => route.fullPath, () => (menuOpen.value = false))
function onKeydown(event) {
  if (event.key === 'Escape') menuOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

async function handleSignOut() {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="md:flex min-h-screen">
    <!-- Phones: top bar with the menu button -->
    <div class="md:hidden sticky top-0 z-30 h-16 bg-bark px-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
      <AppLogo size="sm" />
      <button
        type="button"
        class="text-white p-1"
        :aria-expanded="menuOpen"
        aria-controls="admin-sidebar"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        @click="menuOpen = !menuOpen"
      >
        <AppIcon :name="menuOpen ? 'close' : 'menu'" class="w-8 h-8" />
      </button>
    </div>

    <!-- Click-outside catcher behind the open drawer -->
    <div v-if="menuOpen" class="md:hidden fixed inset-0 z-40 bg-black/40" @click="menuOpen = false"></div>

    <!-- Sidebar: always shown on md+, a slide-in drawer on phones -->
    <aside
      id="admin-sidebar"
      class="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto transition-transform duration-300 ease-out motion-reduce:transition-none md:static md:z-auto md:w-56 md:translate-x-0 md:overflow-visible bg-bark text-cream/90 px-4 py-6 flex flex-col flex-shrink-0"
      :class="menuOpen ? 'translate-x-0 shadow-[4px_0_16px_rgba(0,0,0,0.35)]' : '-translate-x-full'"
    >
      <div class="px-2 mb-6 flex items-center justify-between gap-2">
        <AppLogo />
        <button type="button" class="md:hidden text-white p-1" aria-label="Close menu" @click="menuOpen = false">
          <AppIcon name="close" class="w-7 h-7" />
        </button>
      </div>

      <RouterLink
        to="/profile"
        class="flex items-center gap-3 px-2 py-1.5 mb-6 rounded-lg hover:bg-white/10 transition-colors"
        title="Go to your profile"
      >
        <div class="w-10 h-10 rounded-full overflow-hidden bg-sand flex items-center justify-center flex-shrink-0">
          <img
            v-if="currentUser?.avatarImageId"
            :src="getImagePreviewUrl(currentUser.avatarImageId)"
            alt=""
            class="w-full h-full object-cover"
          />
          <span v-else class="text-bark font-semibold">{{ currentUser?.name?.charAt(0)?.toUpperCase() }}</span>
        </div>
        <span class="text-white truncate">{{ currentUser?.name }}</span>
      </RouterLink>

      <nav class="flex flex-col gap-1 flex-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="text-sm px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3"
          :active-class="item.exact ? '' : 'bg-olive text-white font-medium'"
          :exact-active-class="'bg-olive text-white font-medium'"
        >
          <AppIcon :name="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </RouterLink>

        <template v-if="isAdmin">
          <button
            type="button"
            class="text-sm px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
            :aria-expanded="usersOpen"
            @click="usersOpen = !usersOpen"
          >
            <AppIcon name="user" class="w-5 h-5" />
            Users
            <AppIcon name="chevron" class="w-4 h-4 ml-auto transition-transform" :class="usersOpen ? 'rotate-180' : ''" />
          </button>
          <div v-if="usersOpen" class="flex flex-col gap-1">
            <RouterLink
              v-for="item in userItems"
              :key="item.to"
              :to="item.to"
              class="text-sm pl-11 pr-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              :active-class="item.exact ? '' : 'bg-olive text-white font-medium'"
              :exact-active-class="'bg-olive text-white font-medium'"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </template>
      </nav>

      <div class="pt-4 mt-4">
        <div class="text-sm font-semibold text-green-300 px-2 mb-3">Role: {{ roleLabel }}</div>
        <button
          class="text-sm w-full px-3 py-2.5 rounded-lg bg-olive text-white hover:bg-olive/90 transition-colors flex items-center justify-center gap-2"
          @click="handleSignOut"
        >
          <AppIcon name="logout" class="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
    <main id="main" tabindex="-1" class="flex-1 bg-cream p-4 sm:p-6 md:p-8 min-w-0 min-h-[calc(100vh-4rem)] md:min-h-0 focus:outline-none">
      <RouterView />
    </main>
  </div>
</template>
