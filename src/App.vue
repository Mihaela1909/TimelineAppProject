<script setup>
// App.vue no longer owns header/footer directly — that now lives in
// PublicLayout / AdminLayout, chosen per-route in router/index.js.
// This keeps App.vue trivial and layout decisions in one obvious place.
</script>

<template>
  <RouterView />
</template>
