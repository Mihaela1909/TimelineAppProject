<script setup>
import { useAuth } from '../../composables/useAuth'
import AppLogo from '../layout/AppLogo.vue'

// Logged-in visitors don't need "Sign Up", so that button becomes a
// shortcut to the courses instead.
const { currentUser } = useAuth()
</script>

<template>
  <section
    class="relative bg-bark bg-cover bg-center text-white text-center px-5 py-24 md:py-28 min-h-[28rem] md:min-h-[34rem] flex items-center justify-center shadow-[0_6px_10px_-4px_rgba(0,0,0,0.35)]"
    style="background-image: url('/images/home/hero.webp')"
  >
    <div class="max-w-3xl flex flex-col items-center gap-5">
      <p class="text-2xl md:text-3xl drop-shadow">There's always time for history, discover it with us.</p>
      <h1>
        <span class="sr-only">Timeline</span>
        <AppLogo size="lg" :link="false" aria-hidden="true" />
      </h1>
      <p class="text-lg md:text-xl text-cream/95 leading-snug drop-shadow">
        your #1 history course,<br />community-driven website.
      </p>
      <div class="flex flex-wrap justify-center gap-5 mt-3">
        <RouterLink
          to="/about"
          class="font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
        >
          About Us
        </RouterLink>
        <RouterLink
          v-if="!currentUser"
          to="/register"
          class="font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
        >
          Sign Up
        </RouterLink>
        <RouterLink
          v-else
          to="/courses"
          class="font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
        >
          Browse Courses
        </RouterLink>
      </div>
    </div>
  </section>
</template>
