<script setup>
import { RouterLink } from 'vue-router'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Quizzes', to: '/quizzes' },
  { label: 'Event of the day', to: '/event-of-the-day' },
  { label: 'About us', to: '/about' },
  { label: 'Blog', to: '/blog' },
]
</script>

<template>
  <header class="bg-olive-dark px-6 py-4 flex items-center justify-between">
    <RouterLink to="/" class="font-voice text-xl text-white flex items-center gap-2">
      <span
        class="inline-block w-4 h-4 rounded-full border-2 border-white border-b-transparent rotate-45"
        aria-hidden="true"
      ></span>
      Timeline
    </RouterLink>

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
      <RouterLink
        to="/login"
        class="text-sm px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        Log in
      </RouterLink>
    </div>
  </header>
</template>
