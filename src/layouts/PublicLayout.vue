<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

// Page frame for the public site: header on top, the current page in the
// middle (<RouterView>), footer at the bottom. Admin pages use AdminLayout instead.
</script>

<template>
  <AppHeader />
  <main id="main" tabindex="-1" class="focus:outline-none">
    <RouterView />
  </main>
  <AppFooter />
</template>
