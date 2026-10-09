<script setup>
import { useAuth } from '../../composables/useAuth'
import AnimatedLogo from '../layout/AnimatedLogo.vue'

// Logged-in visitors don't need "Sign Up", so that button becomes a
// shortcut to the courses instead.
const { currentUser } = useAuth()
</script>

<template>
  <!-- Entrance, timed with the logo animation (which runs 0–2.9s):
       tagline 0.1s → logo → subtitle 1.0s → buttons 1.2s / 1.3s.
       Buttons appear early on purpose: they're what people click.
       Plays once on page load; no motion with reduced-motion settings. -->
  <section
    class="relative overflow-hidden bg-bark text-white text-center px-5 py-24 md:py-28 min-h-[28rem] md:min-h-[34rem] flex items-center justify-center shadow-[0_6px_10px_-4px_rgba(0,0,0,0.35)]"
  >
    <!-- Background photo on its own layer so it can slowly zoom -->
    <div class="hero-bg absolute inset-0 bg-cover bg-center" aria-hidden="true"></div>
    <!-- Bottom gradient stays fixed on top of the zooming photo -->
    <div
      class="absolute inset-0"
      style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 70%)"
      aria-hidden="true"
    ></div>

    <div class="relative max-w-3xl flex flex-col items-center gap-5">
      <p class="fade-up text-2xl md:text-3xl drop-shadow" style="--delay: 0.1s">
        There's always time for history, discover it with us.
      </p>
      <h1>
        <span class="sr-only">Timeline</span>
        <AnimatedLogo class="h-24 md:h-36 w-auto" aria-hidden="true" />
      </h1>
      <p class="fade-up text-lg md:text-xl text-cream/95 leading-snug drop-shadow" style="--delay: 1s">
        your #1 history course,<br />community-driven website.
      </p>
      <div class="flex flex-wrap justify-center gap-5 mt-3">
        <RouterLink
          to="/#about"
          class="fade-up font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
          style="--delay: 1.2s"
        >
          About Us
        </RouterLink>
        <RouterLink
          v-if="!currentUser"
          to="/register"
          class="fade-up font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
          style="--delay: 1.3s"
        >
          Sign Up
        </RouterLink>
        <RouterLink
          v-else
          to="/courses"
          class="fade-up font-button min-w-[9rem] px-8 py-3 rounded-md bg-olive text-white text-lg shadow-md hover:bg-olive/90 transition-colors"
          style="--delay: 1.3s"
        >
          Browse Courses
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Each piece rises 14px while fading in; --delay sets its turn in the sequence. */
.fade-up {
  animation: fade-up 0.6s ease-out var(--delay, 0s) both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Very slow zoom on the clock photo (barely noticeable, makes the hero feel alive). */
/* Phones get a 900px-wide version (~1/3 the bytes); both are preloaded in index.html. */
.hero-bg {
  background-image: url('/images/home/hero-sm.webp');
  animation: slow-zoom 20s ease-out both;
}
@media (min-width: 768px) {
  .hero-bg {
    background-image: url('/images/home/hero.webp');
  }
}

@keyframes slow-zoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up,
  .hero-bg {
    animation: none;
  }
}
</style>
