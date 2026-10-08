<script setup>
// 404 page: unknown URLs, and pages the router guard blocks for this role
// (shown as "not found" so the admin area isn't advertised).
</script>

<template>
  <section class="relative overflow-hidden px-5 py-20 md:py-32 text-center">
    <!-- Dot waves like Event of the Day (top as-is, bottom flipped) -->
    <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 top-0 w-full h-auto pointer-events-none" />
    <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 bottom-0 w-full h-auto -scale-y-100 pointer-events-none" />

    <div class="relative max-w-xl mx-auto">
      <p class="font-voice text-olive text-7xl md:text-9xl leading-none mb-4" aria-hidden="true">404</p>
      <h1 class="font-voice text-bark text-3xl md:text-4xl mb-4">Lost in time</h1>

      <div class="flex items-center max-w-xs mx-auto mb-6" aria-hidden="true">
        <span class="w-2.5 h-2.5 bg-bark rotate-45 -mr-1 flex-shrink-0"></span>
        <span class="flex-1 h-0.5 bg-bark/80"></span>
        <span class="w-2.5 h-2.5 bg-bark rotate-45 -ml-1 flex-shrink-0"></span>
      </div>

      <p class="text-bark/80 md:text-lg mb-8">
        This page doesn't exist, or it isn't available to your account.
      </p>

      <div class="flex flex-wrap justify-center gap-3">
        <RouterLink
          to="/"
          class="font-button px-6 py-2.5 rounded-md bg-olive text-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors"
        >
          Back to home
        </RouterLink>
        <RouterLink
          to="/courses"
          class="font-button px-6 py-2.5 rounded-md border border-olive text-olive bg-white hover:bg-olive-light/50 transition-colors"
        >
          Browse courses
        </RouterLink>
      </div>
    </div>
  </section>
</template>
