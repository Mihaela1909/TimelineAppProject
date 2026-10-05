<script setup>
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'

// Two tabs: "Values" (icon list) and "Dev Note". The selected tab is the
// filled olive one; the other is the light outlined one.
const tabs = [
  { id: 'values', label: 'Values' },
  { id: 'dev-note', label: 'Dev Note' },
]
const activeTab = ref('values')

const values = [
  { icon: 'coin-off', title: 'Free, always.', text: 'No ads, no paywalls, no catch.' },
  { icon: 'book-open', title: 'Curiosity, not obligation.', text: 'Learning should feel like exploring, not studying.' },
  { icon: 'user', title: 'Growing together.', text: 'A blog and community space to share and discover history with others.' },
]

// Arrow keys move between tabs (standard tab keyboard behaviour).
function onTabKeydown(event, index) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  const next = tabs[(index + step + tabs.length) % tabs.length]
  activeTab.value = next.id
  document.getElementById(`who-tab-${next.id}`)?.focus()
}
</script>

<template>
  <!-- md+: artwork as the section background, content on its white right side.
       Phones: the artwork as a band on top, content on white below. -->
  <section
    class="bg-white md:bg-[url('/images/home/who-are-we.webp')] md:bg-cover md:bg-left shadow-[0_-4px_10px_-6px_rgba(0,0,0,0.25),0_6px_10px_-6px_rgba(0,0,0,0.25)]"
  >
    <div
      class="md:hidden h-56 bg-[url('/images/home/who-are-we.webp')] bg-cover bg-left"
      aria-hidden="true"
    ></div>
    <!-- lg+: same proportions as the artwork (2000×981), so the olive triangle
         lands where the mockup has it and never runs under the text. -->
    <div class="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-20 md:min-h-[38rem] lg:min-h-[49vw] lg:py-12 flex">
      <div class="md:ml-auto w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center">
        <h2 class="font-voice text-olive leading-[0.8] mb-6 md:mb-8 flex items-end gap-2">
          <span class="flex flex-col">
            <span class="text-6xl md:text-8xl xl:text-9xl">Who</span>
            <span class="text-5xl md:text-7xl xl:text-8xl pl-1">are we</span>
          </span>
          <span class="text-7xl md:text-9xl xl:text-[10rem] leading-none -mb-1 md:-mb-3" aria-hidden="true">?</span>
          <span class="sr-only">?</span>
        </h2>

        <div class="grid grid-cols-2 gap-3 md:gap-5 mb-6" role="tablist" aria-label="About Timeline">
          <button
            v-for="(tab, i) in tabs"
            :id="`who-tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`who-panel-${tab.id}`"
            :tabindex="activeTab === tab.id ? 0 : -1"
            class="py-2 rounded-md text-base md:text-xl xl:text-2xl shadow transition-colors"
            :class="activeTab === tab.id ? 'bg-olive text-white' : 'bg-cream text-bark border border-bark/40 hover:bg-white'"
            @click="activeTab = tab.id"
            @keydown="onTabKeydown($event, i)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Values -->
        <ul
          v-if="activeTab === 'values'"
          id="who-panel-values"
          role="tabpanel"
          aria-labelledby="who-tab-values"
          class="space-y-4 md:space-y-5"
        >
          <li
            v-for="(value, i) in values"
            :key="value.title"
            class="flex items-center gap-3 md:gap-5"
            :class="i % 2 === 1 ? 'flex-row-reverse text-right' : ''"
          >
            <span class="flex-shrink-0 w-10 h-10 md:w-16 md:h-16 xl:w-20 xl:h-20 rounded-full bg-olive text-cream flex items-center justify-center ring-4 ring-white">
              <AppIcon :name="value.icon" class="w-5 h-5 md:w-8 md:h-8 xl:w-10 xl:h-10" />
            </span>
            <p class="text-sm md:text-base xl:text-xl text-bark leading-snug">
              <strong class="font-bold">{{ value.title }}</strong> {{ value.text }}
            </p>
          </li>
        </ul>

        <!-- Dev note -->
        <div
          v-else
          id="who-panel-dev-note"
          role="tabpanel"
          aria-labelledby="who-tab-dev-note"
          class="text-sm md:text-base xl:text-xl text-bark leading-snug"
        >
          <p class="mb-4">
            Textbooks made history feel dense and forgettable. Timeline is my attempt to fix that — free for anyone
            studying, or just here for a little past time.
          </p>
          <p class="text-bark/60 pl-2">- The Dev</p>
        </div>

        <RouterLink
          to="/about"
          class="self-end pt-6 inline-flex items-center gap-2 text-sm md:text-xl font-semibold text-bark hover:text-olive"
        >
          Read more <AppIcon name="arrow-right" class="w-4 h-4 md:w-6 md:h-6" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
