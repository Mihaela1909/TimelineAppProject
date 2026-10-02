<script setup>
import { computed, ref } from 'vue'
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

async function handleSignOut() {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-56 bg-bark text-cream/90 px-4 py-6 flex flex-col flex-shrink-0">
      <div class="px-2 mb-6">
        <AppLogo />
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
    <div class="flex-1 bg-cream p-8 min-w-0">
      <RouterView />
    </div>
  </div>
</template>
