<script setup>
import { RouterLink } from 'vue-router'

// NOTE: no AppHeader/AppFooter here on purpose — the admin panel intentionally
// drops the public site's marketing chrome for a focused, functional UI.
const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'ti-home' },
  { label: 'Courses', to: '/admin/courses', icon: 'ti-book' },
  { label: 'Quizzes', to: '/admin/quizzes', icon: 'ti-clipboard-check' },
  { label: 'Blog Posts', to: '/admin/blog-posts', icon: 'ti-article' },
  { label: 'Statistics', to: '/admin/stats', icon: 'ti-chart-bar' },
  { label: 'Users', to: '/admin/users', icon: 'ti-users' },
]
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-48 bg-bark text-cream/90 p-4 flex flex-col">
      <div class="font-voice text-lg text-white mb-6 px-2">Timeline</div>
      <nav class="flex flex-col gap-1 flex-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2"
          active-class="bg-olive text-white font-medium"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="border-t border-white/10 pt-3 mt-3">
        <div class="text-xs text-olive-light mb-2">Role: Admin</div>
        <button class="text-xs w-full px-3 py-2 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors">
          Sign out
        </button>
      </div>
    </aside>
    <div class="flex-1 bg-cream p-6">
      <RouterView />
    </div>
  </div>
</template>
