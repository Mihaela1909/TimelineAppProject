<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
</script>

<template>
  <AppHeader />
  <main id="main" tabindex="-1" class="focus:outline-none">
    <RouterView />
  </main>
  <AppFooter />
</template>
