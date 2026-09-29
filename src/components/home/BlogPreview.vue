<script setup>
const posts = [
  { id: 1, title: 'The Untold Story of Cleopatra', tag: 'Myth-busting', read: '4 min read' },
  { id: 2, title: '5 Roman Inventions You Still Use Today', tag: 'Listicle', read: '3 min read' },
  { id: 3, title: 'New Course Live: Ancient China', tag: 'Dev Update', read: '2 min read' },
]
</script>

<template>
  <section class="px-6 py-14 max-w-5xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="font-voice text-2xl text-bark whitespace-nowrap">Community Blog</h2>
      <div class="flex-1 h-px bg-olive/50"></div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink
        v-for="post in posts"
        :key="post.id"
        :to="`/blog/${post.id}`"
        class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="h-20 bg-olive-light"></div>
        <div class="p-3">
          <span class="text-[10px] bg-olive-light text-olive px-2 py-0.5 rounded-full">{{ post.tag }}</span>
          <div class="text-sm font-medium text-bark mt-2">{{ post.title }}</div>
          <div class="text-xs text-bark/50 mt-1">{{ post.read }}</div>
        </div>
      </RouterLink>
    </div>

    <div class="text-right mt-4">
      <RouterLink to="/blog" class="text-sm text-olive font-medium hover:underline">
        Browse all &rarr;
      </RouterLink>
    </div>
  </section>
</template>
