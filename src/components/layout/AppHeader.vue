<script setup>
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import AppLogo from './AppLogo.vue'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Quizzes', to: '/quizzes' },
  { label: 'Event of the day', to: '/event-of-the-day' },
  { label: 'About us', to: '/about' },
  { label: 'Blog', to: '/blog' },
]

const { currentUser, authChecked, refreshCurrentUser, logout } = useAuth()
const router = useRouter()

onMounted(() => {
  if (!authChecked.value) refreshCurrentUser()
})

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="bg-olive-dark px-6 py-4 flex items-center justify-between">
    <AppLogo />

    <nav class="hidden md:flex gap-6 text-sm text-white/90">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="hover:text-white transition-colors"
        active-class="text-white font-medium underline underline-offset-4"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="flex items-center gap-3">
      <template v-if="currentUser">
        <RouterLink to="/profile" class="text-sm text-white/90 hidden sm:inline hover:underline">
          {{ currentUser.name }}
        </RouterLink>
        <button
          @click="handleLogout"
          class="text-sm px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          Log out
        </button>
      </template>
      <RouterLink
        v-else
        to="/login"
        class="text-sm px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        Log in
      </RouterLink>
    </div>
  </header>
</template>