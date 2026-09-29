<script setup>
import { ref } from 'vue'

const activeTab = ref('values')

const content = {
  values: [
    { title: 'Free, always.', body: 'No ads, no paywalls, no catch.' },
    { title: 'History belongs to everyone.', body: 'Not just those who can afford it.' },
    { title: 'Curiosity, not obligation.', body: 'Learning should feel like exploring, not studying.' },
    { title: 'Growing together.', body: 'A blog and community space to share and discover history.' },
  ],
  devnote:
    'History always felt locked away in textbooks — dense, dry, forgettable. Timeline is my attempt to change that: something free, for anyone curious enough to explore the past.',
}
</script>

<template>
  <section class="bg-white px-6 py-14">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-voice text-3xl text-olive mb-4">Who are we?</h2>

      <div class="flex gap-2 mb-5" role="tablist">
        <button
          role="tab"
          :aria-selected="activeTab === 'values'"
          class="text-sm px-4 py-2 rounded-md transition-colors"
          :class="activeTab === 'values' ? 'bg-olive text-white' : 'bg-olive-light text-olive'"
          @click="activeTab = 'values'"
        >
          Values
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'devnote'"
          class="text-sm px-4 py-2 rounded-md transition-colors"
          :class="activeTab === 'devnote' ? 'bg-olive text-white' : 'bg-olive-light text-olive'"
          @click="activeTab = 'devnote'"
        >
          Dev Note
        </button>
      </div>

      <ul v-if="activeTab === 'values'" class="space-y-2 max-w-xl">
        <li v-for="item in content.values" :key="item.title" class="text-sm text-bark/80">
          <strong class="text-bark">{{ item.title }}</strong> {{ item.body }}
        </li>
      </ul>

      <div v-else class="max-w-xl">
        <p class="text-sm text-bark/80 leading-relaxed mb-2">{{ content.devnote }}</p>
        <p class="text-xs text-olive">&mdash; The Dev</p>
      </div>

      <RouterLink to="/about" class="inline-block mt-5 text-sm text-olive font-medium hover:underline">
        Read more &rarr;
      </RouterLink>
    </div>
  </section>
</template>
