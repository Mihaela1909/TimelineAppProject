<template>
  <section class="bg-olive-dark px-6 py-16 text-center text-white">
    <p class="text-sm md:text-base mb-6 text-cream/90">
      There's always time for history, discover it with us.
    </p>
    <div class="font-voice text-3xl md:text-4xl mb-2">Timeline</div>
    <p class="text-xs text-cream/70 mb-8">your #1 history course, community-driven website.</p>

    <div class="flex justify-center gap-3">
      <RouterLink
        to="/about"
        class="text-sm px-5 py-2.5 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
      >
        About Us
      </RouterLink>
      <RouterLink
        to="/register"
        class="text-sm px-5 py-2.5 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
      >
        Sign Up
      </RouterLink>
    </div>
  </section>
</template>
