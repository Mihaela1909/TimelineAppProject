<script setup>
// The Timeline logo, linking home. Used by the public header and the admin
// sidebar — when the real logo image is ready, swap it in here only.
</script>

<template>
  <RouterLink to="/" class="font-voice text-xl text-white inline-flex items-center gap-2" aria-label="Timeline — home">
    <span
      class="inline-block w-4 h-4 rounded-full border-2 border-white border-b-transparent rotate-45"
      aria-hidden="true"
    ></span>
    Timeline
  </RouterLink>
</template>
