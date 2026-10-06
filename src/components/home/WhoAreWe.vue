<script setup>
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import { useInView } from '../../composables/useInView'

// Napoleon rides into the window each time the section scrolls into view
// (resets once it has fully left the screen).
const art = ref(null)
const { inView } = useInView(art, { threshold: 0.35, once: false })

// The text column fades up piece by piece (like the hero), also replaying on scroll-in.
const textCol = ref(null)
const { inView: textInView } = useInView(textCol, { threshold: 0.25, once: false })

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
  <!-- Built from separate layers (not one flat image) so each part can adapt
       to the screen: olive diagonal + dots are CSS/background, the window
       artwork is a stacked set of transparent images, the text has its own column. -->
  <section class="relative overflow-hidden bg-white shadow-[0_-4px_10px_-6px_rgba(0,0,0,0.25),0_6px_10px_-6px_rgba(0,0,0,0.25)]">
    <!-- Dot pattern on the right (behind the olive, so dots only show on white) -->
    <img
      src="/images/home/who-are-we/dots.webp"
      alt=""
      class="hidden md:block absolute right-0 top-0 h-full w-auto max-w-none pointer-events-none"
    />
    <!-- md+: olive diagonal across the left of the section -->
    <div
      class="hidden md:block absolute inset-0 bg-olive [clip-path:polygon(0_0,16.5%_0,66.5%_100%,0_100%)]"
      aria-hidden="true"
    ></div>

    <div class="relative max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16 lg:py-20 grid md:grid-cols-[1fr_minmax(0,42%)] lg:grid-cols-[1fr_minmax(0,40%)] gap-10 md:gap-12 items-center">
      <!-- Artwork -->
      <div class="relative">
        <!-- Phones: the diagonal sits behind the artwork only, so the text stays on white -->
        <div
          class="md:hidden absolute -inset-x-5 -top-12 -bottom-4 bg-olive [clip-path:polygon(0_0,35%_0,100%_100%,0_100%)]"
          aria-hidden="true"
        ></div>

        <!-- Square stage: every layer is positioned in % of it, so they stay
             aligned at any size. Order = back to front. -->
        <div ref="art" :class="{ 'is-revealed': inView }" class="relative w-full max-w-[21rem] sm:max-w-[25.5rem] md:max-w-[36rem] lg:max-w-[37rem] mx-auto md:mx-0 aspect-square">
          <img src="/images/home/who-are-we/ring-back.webp" alt="" class="ring-pop absolute left-[-7%] top-[-9.5%] w-[50%]" />
          <img src="/images/home/who-are-we/window.webp" alt="" class="absolute inset-0 w-full h-full" />

          <!-- Napoleon is clipped only on the RIGHT (outer edge of the right column,
               84.7% — measured from window.webp) and BOTTOM (sill line, 85%), so he
               rides in hidden behind the column and sill, then breaks out of the
               frame over the top and left edges in his final pose. -->
          <div class="absolute inset-0 [clip-path:inset(-50%_15.3%_15%_-50%)]">
            <img
              src="/images/home/who-are-we/napoleon.webp"
              alt="Napoleon on a rearing horse, emerging from a stone window"
              class="absolute left-[2%] top-[-3%] w-[86%] ease-out motion-reduce:transition-none motion-reduce:transform-none"
              :class="
                inView
                  ? 'transition-transform duration-[1600ms] translate-x-0 translate-y-0 rotate-0'
                  : 'translate-x-[35%] translate-y-[70%] rotate-[8deg]'
              "
            />
          </div>

          <img src="/images/home/who-are-we/window-front.webp" alt="" class="absolute inset-0 w-full h-full" />
          <img src="/images/home/who-are-we/rings-front.webp" alt="" style="--delay: 0.25s" class="ring-pop absolute left-[68.5%] top-[67%] w-[47%]" />
        </div>
      </div>

      <!-- Text — pieces fade up in order (--delay); value icons pop in -->
      <div ref="textCol" class="flex flex-col justify-center" :class="{ 'is-revealed': textInView }">
        <!-- Figma: "Who" 200px, "are we" 140px (= 0.7em) in a ~2400px-wide frame.
             The h2 size = "Who", scaling with the screen like the Figma frame
             (8.2vw, clamped); "are we" and "?" are sized in em relative to it. -->
        <h2 class="font-voice text-olive text-[4.5rem] md:text-[clamp(4.5rem,8.2vw,9.5rem)] mt-4 md:mt-0 mb-6 md:mb-8 flex items-end reveal" style="--delay: 0.1s">
          <span class="flex flex-col leading-[0.8]">
            <span>Who</span>
            <span class="text-[0.7em] -mt-[0.02em] pl-[0.04em] whitespace-nowrap">are we</span>
          </span>
          <!-- One big "?" spanning both lines; its diamond dot sits on the "are we" baseline. -->
          <span class="text-[2.3em] leading-[0.7] -ml-[0.13em] mb-[-0.02em]" aria-hidden="true">?</span>
          <span class="sr-only">?</span>
        </h2>

        <div class="grid grid-cols-2 gap-3 md:gap-5 mb-6 reveal" style="--delay: 0.3s" role="tablist" aria-label="About Timeline">
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

        <!-- Both panels sit in the same grid cell; the inactive one is invisible
             but still takes up space, so the card keeps the same height on both tabs. -->
        <div class="grid">
        <!-- Values -->
        <ul
          id="who-panel-values"
          role="tabpanel"
          aria-labelledby="who-tab-values"
          class="[grid-area:1/1] space-y-4 md:space-y-4"
          :class="activeTab === 'values' ? '' : 'invisible'"
        >
          <li
            v-for="(value, i) in values"
            :key="value.title"
            class="flex items-center gap-3 md:gap-5 reveal"
            :class="i % 2 === 1 ? 'flex-row-reverse text-right' : ''"
            :style="{ '--delay': `${0.45 + i * 0.15}s` }"
          >
            <span class="icon-pop flex-shrink-0 w-10 h-10 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-full bg-olive text-cream flex items-center justify-center ring-4 ring-white">
              <AppIcon :name="value.icon" class="w-5 h-5 md:w-7 md:h-7 xl:w-8 xl:h-8" />
            </span>
            <p class="text-sm md:text-base xl:text-lg text-bark leading-snug">
              <strong class="font-bold">{{ value.title }}</strong> {{ value.text }}
            </p>
          </li>
        </ul>

        <!-- Dev note -->
        <div
          id="who-panel-dev-note"
          role="tabpanel"
          aria-labelledby="who-tab-dev-note"
          class="[grid-area:1/1] text-sm md:text-base xl:text-lg text-bark leading-snug reveal"
          style="--delay: 0.45s"
          :class="activeTab === 'dev-note' ? '' : 'invisible'"
        >
          <p class="mb-4">
            Textbooks made history feel dense and forgettable. Timeline is my attempt to fix that — free for anyone
            studying, or just here for a little past time.
          </p>
          <p class="text-bark/60 pl-2">- The Dev</p>
        </div>
        </div>

        <RouterLink
          to="/about"
          class="self-end pt-6 inline-flex items-center gap-2 text-sm md:text-xl font-semibold text-bark hover:text-olive reveal"
          style="--delay: 0.95s"
        >
          Read more <AppIcon name="arrow-right" class="w-4 h-4 md:w-6 md:h-6" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Text pieces: rise 14px while fading in, in order of --delay (same feel as the hero). */
.reveal {
  opacity: 0;
  transform: translateY(14px);
}
.is-revealed .reveal {
  animation: reveal-up 0.6s ease-out var(--delay, 0s) forwards;
}

/* Value icons pop slightly after their row starts appearing */
.icon-pop {
  transform: scale(0.4);
}
.is-revealed .icon-pop {
  animation: icon-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) calc(var(--delay, 0s) + 0.1s) forwards;
}

/* Decorative rings pop in with the artwork */
.ring-pop {
  opacity: 0;
  transform: scale(0.6);
}
.is-revealed .ring-pop {
  animation: ring-pop 0.7s cubic-bezier(0.3, 1.4, 0.5, 1) var(--delay, 0s) forwards;
}

@keyframes reveal-up {
  to { opacity: 1; transform: none; }
}
@keyframes icon-pop {
  to { transform: none; }
}
@keyframes ring-pop {
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .icon-pop,
  .ring-pop {
    opacity: 1;
    transform: none;
  }
  .is-revealed .reveal,
  .is-revealed .icon-pop,
  .is-revealed .ring-pop {
    animation: none;
  }
}
</style>
