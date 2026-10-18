<script setup>
import ToastContainer from './components/ui/ToastContainer.vue'

// Root component: shown on every page. The current page appears in <RouterView>;
// ToastContainer shows the small success/error messages from anywhere in the app.
</script>

<template>
  <!-- Keyboard users: first Tab shows this, Enter jumps past the header/sidebar -->
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-md focus:bg-cream focus:text-bark focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-olive/40"
  >
    Skip to main content
  </a>
  <RouterView />
  <ToastContainer />
</template>
