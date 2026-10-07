<script setup>
// Napoleon on a rearing horse breaking out of a stone window, with the cream
// rings — shared by "Who are we" (home) and the login / register screens.
// A square stage: every layer is placed in % of it, so they stay aligned at
// any size. Order = back to front. The parent controls size and `playing`.
defineProps({
  playing: { type: Boolean, default: false }, // true = Napoleon rides in + rings pop
  layout: { type: String, default: 'home' }, // ring positions: 'home' | 'auth' (from each mockup)
})

// Placement in % of the stage, per mockup.
// Home: big ring top-left, pair bottom-right, Napoleon bigger and breaking out top-left.
// Auth (login/register): big ring top-right, pair bottom-left (mirrored), Napoleon inside the frame.
const LAYOUTS = {
  home: { back: 'left-[-7%] top-[-9.5%] w-[50%]', front: 'left-[68.5%] top-[67%] w-[47%]', rider: 'left-[2%] top-[-3%] w-[86%]' },
  auth: { back: 'left-[56%] top-[-9%] w-[50%]', front: 'left-[-17%] top-[69%] w-[44%] [--flip:-1]', rider: 'left-[8%] top-[5%] w-[78%]' },
}
</script>

<template>
  <div :class="{ 'is-playing': playing }" class="relative w-full aspect-square">
    <img src="/images/home/who-are-we/ring-back.webp" alt="" class="ring-pop absolute" :class="LAYOUTS[layout].back" />
    <!-- drop-shadow follows the window's outline (not its box), matching the
         paper-cut shadow baked into the Napoleon image: down and to the left -->
    <img src="/images/home/who-are-we/window.webp" alt="" class="absolute inset-0 w-full h-full [filter:drop-shadow(-0.5rem_0.75rem_0.75rem_rgba(0,0,0,0.35))]" />

    <!-- Napoleon is clipped only on the RIGHT (outer edge of the right column,
         84.7% — measured from window.webp) and BOTTOM (sill line, 85%), so he
         rides in hidden behind the column and sill, then breaks out of the
         frame over the top and left edges in his final pose. -->
    <div class="absolute inset-0 [clip-path:inset(-50%_15.3%_15%_-50%)]">
      <img
        src="/images/home/who-are-we/napoleon.webp"
        alt="Napoleon on a rearing horse, emerging from a stone window"
        class="rider absolute"
        :class="LAYOUTS[layout].rider"
      />
    </div>

    <img src="/images/home/who-are-we/window-front.webp" alt="" class="absolute inset-0 w-full h-full" />
    <img src="/images/home/who-are-we/rings-front.webp" alt="" style="--delay: 0.25s" class="ring-pop absolute" :class="LAYOUTS[layout].front" />
  </div>
</template>

<style scoped>
/* Napoleon starts down-right (hidden behind the window front) and rides in.
   Leaving `.is-playing` snaps him back instantly, so a replay never shows him
   riding out. */
.rider {
  transform: translate(35%, 70%) rotate(8deg);
}
.is-playing .rider {
  transform: none;
  transition: transform 1600ms ease-out;
}

/* Decorative rings pop in with the artwork. --flip: -1 mirrors a ring
   (part of the transform, so the pop animation doesn't undo it). */
.ring-pop {
  opacity: 0;
  transform: scaleX(var(--flip, 1)) scale(0.6);
}
.is-playing .ring-pop {
  animation: ring-pop 0.7s cubic-bezier(0.3, 1.4, 0.5, 1) var(--delay, 0s) forwards;
}
@keyframes ring-pop {
  to { opacity: 1; transform: scaleX(var(--flip, 1)); }
}

@media (prefers-reduced-motion: reduce) {
  .rider {
    transform: none;
  }
  .ring-pop {
    opacity: 1;
    transform: scaleX(var(--flip, 1));
  }
  .is-playing .rider {
    transition: none;
  }
  .is-playing .ring-pop {
    animation: none;
  }
}
</style>
