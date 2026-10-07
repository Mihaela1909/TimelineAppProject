<script setup>
import { getImagePreviewUrl } from '../../services/mediaService'
import AppIcon from '../ui/AppIcon.vue'

// Profile page top (mockup): full-width grayscale banner with a dark strip at the
// bottom, the round avatar centred over its lower edge, then the name.
defineProps({
  name: { type: String, default: '' },
  avatarImageId: { type: String, default: null },
  headerImageId: { type: String, default: null },
  showAdminLink: { type: Boolean, default: false }, // staff shortcut (UX only)
})
</script>

<template>
  <header class="text-center">
    <div class="relative h-40 md:h-[clamp(12rem,20vw,18rem)] bg-umber shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
      <img v-if="headerImageId" :src="getImagePreviewUrl(headerImageId)" alt="" class="w-full h-full object-cover grayscale" />
      <div class="absolute inset-x-0 bottom-0 h-2 md:h-3 bg-bark" aria-hidden="true"></div>
      <RouterLink
        v-if="showAdminLink"
        to="/admin"
        class="absolute top-4 right-4 md:right-8 flex items-center gap-2 px-4 py-2 rounded-lg font-button bg-white/15 text-white text-sm backdrop-blur-sm hover:bg-white/25 transition-colors"
      >
        <AppIcon name="home" class="w-4 h-4" /> Admin panel
      </RouterLink>
    </div>

    <!-- Pulled up by half its size + half the strip, so its centre sits on the strip -->
    <div class="relative -mt-[4.25rem] md:-mt-[6.375rem] mx-auto w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-bark bg-taupe overflow-hidden flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
      <img v-if="avatarImageId" :src="getImagePreviewUrl(avatarImageId)" alt="" class="w-full h-full object-cover" />
      <span v-else class="font-voice text-white text-5xl md:text-7xl">{{ name.charAt(0).toUpperCase() }}</span>
    </div>

    <h1 class="font-voice text-bark text-4xl md:text-5xl mt-3 px-5 break-words">{{ name }}</h1>
  </header>
</template>
