<script setup>
import { onMounted, ref } from 'vue'
import { useInView } from '../../composables/useInView'

// The big Timeline logo, animated in two acts:
// 1. Intro — the small mark assembles in the centre (circle fades up, birds fly
//    in from the sides, the diamond drops, the "I" rises).
// 2. Expand — everything slides left while the underline grows to the right and
//    "imeline" is written along it (outlines drawn left → right, then filled).
// Only translate/opacity are animated (no scale/rotate), so no transform-origin
// tricks are needed in SVG and it behaves the same in every browser.
// Shapes come from "timeline logo.svg"; "imeline" is live text in Metamorphous.
// Replays each time it scrolls back into view; no motion with reduced-motion settings.
defineProps({
  label: { type: String, default: 'Timeline' },
  animated: { type: Boolean, default: true }, // false = just the finished logo
})

const root = ref(null)
const { inView } = useInView(root, { threshold: 0.4, once: false })

// Don't start "writing" before Metamorphous has loaded, or the letters
// would be traced in a fallback font and then jump.
const fontReady = ref(false)
// The Google Fonts stylesheet loads without blocking the page (see index.html), so
// Metamorphous may not be declared yet: wait for its @font-face to appear first
// (max ~3s), then for the font file itself.
async function waitForFont(family, timeoutMs = 3000) {
  const start = Date.now()
  while (![...document.fonts].some((f) => f.family.replace(/["']/g, '') === family)) {
    if (Date.now() - start > timeoutMs) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  await document.fonts.load(`62px ${family}`)
}

onMounted(async () => {
  try {
    await waitForFont('Metamorphous')
  } catch {
    /* still animate with whatever font is available */
  }
  fontReady.value = true
})
</script>

<template>
  <svg
    ref="root"
    viewBox="74 78 376 156"
    role="img"
    :aria-label="label"
    class="animated-logo"
    :class="animated ? { 'is-playing': inView && fontReady } : 'is-static'"
  >
    <defs>
      <!-- Everything left of x=240 (the circle + "I" + short tail) is always visible;
           the rest of the line is revealed by this rect growing to the right. -->
      <clipPath id="logo-line-clip">
        <rect x="0" y="0" width="240" height="400" />
        <rect class="grow" x="240" y="0" width="230" height="400" />
      </clipPath>
      <!-- "imeline" appears left → right, in step with the line -->
      <clipPath id="logo-text-clip">
        <rect class="grow-text" x="160" y="150" width="290" height="80" />
      </clipPath>
    </defs>

    <!-- viewBox is cropped to the drawing's measured extent (x 74.6 → 449.2), so the
         finished logo is exactly centred. Everything slides left from "small mark
         centred" to that position while the line grows (start offset = 105 units). -->
    <g class="slide">
      <g fill="currentColor" stroke="currentColor" stroke-miterlimit="10">
        <path class="arc" clip-path="url(#logo-line-clip)" d="M217.45,150.56c14-43.16-30.31-71.67-76.03-65.14-82.29,13.01-95.75,140.23,3.11,140.07,203.29-5.23,304.93-8.39,304.9-9.48-20.64-.89-131.19.31-134.85.34-33.01.5-85.55.98-170.92.88-1.53,0-35.76-.66-51.72-28.49-11.65-20.32-6.29-47.03,5.42-63.97,22.2-32.09,75.73-41.98,102.59-17.36,15.03,13.78,17.15,34.2,17.49,43.16Z" />
        <polygon class="bird-r" points="197.31 124.77 171.98 133.22 153.46 153.46 179.32 144.75 197.31 124.77" />
        <polygon class="bird-l" points="144.67 153.42 125.13 142.5 102.15 142.84 122.14 153.93 144.67 153.42" />
        <polygon class="diamond" points="148.66 145.43 141.22 152.21 148.74 159.03 156.26 152.1 148.66 145.43" />
        <g class="letter-i" stroke="none">
          <path d="M157.85,207.85c-1.49-.22-2.61-.56-3.36-1.03-.75-.47-1.22-1.14-1.42-2.03-.19-.89-.29-2.13-.29-3.72v-36.26c-2.74.03-5.48.24-8.23.31-.08,11.98-.16,23.96-.24,35.95,0,1.59-.12,2.83-.35,3.72-.24.89-.81,1.62-1.71,2.2-.9.58-3.82,1.1-8.74,1.56v3.58h30.45v-3.58c-2.59-.25-4.62-.48-6.11-.7Z" />
          <path d="M133.52,161.86v3.69c2.54.25,4.55.49,6.01.72,1.46.23,2.56.58,3.3,1.06.74.48,1.2,1.18,1.39,2.1.19.92.29,2.2.29,3.84v4.6c2.71-.84,5.47-1.45,8.31-1.76l.02-2.84c0-1.64.12-2.92.35-3.84.23-.92.79-1.68,1.68-2.27.89-.59,3.75-1.13,8.59-1.61v-3.69h-29.94Z" />
        </g>
      </g>

      <!-- Clip on a wrapper group: a clip-path on the <text> itself would be measured
           inside the text's own transform and land in the wrong place. -->
      <g clip-path="url(#logo-text-clip)">
        <text
          class="word"
          transform="translate(165.83 211.52) scale(1.14 1)"
          font-family="Metamorphous, serif"
          font-size="62.17"
        >imeline</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.animated-logo {
  overflow: visible;
}

/* ---------- Start state (before playing) ---------- */
.slide {
  transform: translateX(105px);
}
.arc,
.bird-l,
.bird-r,
.diamond,
.letter-i {
  opacity: 0;
}
.arc { transform: translateY(10px); }
.bird-l { transform: translate(-28px, 10px); }
.bird-r { transform: translate(28px, -12px); }
.diamond { transform: translateY(-22px); }
.letter-i { transform: translateY(24px); }

/* Line + text reveal: scaleX from the left edge of each rect */
.grow,
.grow-text {
  transform-box: fill-box;
  transform-origin: left center;
  transform: scaleX(0);
}

.word {
  fill: currentColor;
  fill-opacity: 0;
  stroke: currentColor;
  stroke-width: 0.8;
  stroke-dasharray: 260;
  stroke-dashoffset: 260;
}

/* ---------- Act 1: intro (0 – 0.9s) ---------- */
.is-playing .arc { animation: settle 0.6s ease-out 0s forwards; }
.is-playing .letter-i { animation: settle 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.2) 0.15s forwards; }
.is-playing .bird-l,
.is-playing .bird-r { animation: settle 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.1) 0.3s forwards; }
.is-playing .diamond { animation: settle 0.45s cubic-bezier(0.3, 1.4, 0.5, 1) 0.5s forwards; }

/* ---------- Act 2: expand (1.0 – 2.9s) ---------- */
.is-playing .slide { animation: settle 1.6s cubic-bezier(0.45, 0, 0.25, 1) 1s forwards; }
.is-playing .grow { animation: grow 1.6s cubic-bezier(0.45, 0, 0.25, 1) 1s forwards; }
.is-playing .grow-text { animation: grow 1.6s cubic-bezier(0.45, 0, 0.25, 1) 1.05s forwards; }
.is-playing .word {
  animation:
    draw 1.6s ease-out 1.05s forwards,
    fill-in 0.6s ease-out 2.3s forwards;
}

@keyframes settle {
  to { opacity: 1; transform: none; }
}
@keyframes grow {
  to { transform: scaleX(1); }
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@keyframes fill-in {
  to { fill-opacity: 1; stroke-width: 0; }
}

/* Reduced motion: show the finished logo straight away */
@media (prefers-reduced-motion: reduce) {
  .slide,
  .arc,
  .bird-l,
  .bird-r,
  .diamond,
  .letter-i,
  .grow,
  .grow-text {
    opacity: 1;
    transform: none;
  }
  .word {
    fill-opacity: 1;
    stroke-width: 0;
    stroke-dashoffset: 0;
  }
  .is-playing .slide,
  .is-playing .arc,
  .is-playing .bird-l,
  .is-playing .bird-r,
  .is-playing .diamond,
  .is-playing .letter-i,
  .is-playing .grow,
  .is-playing .grow-text,
  .is-playing .word {
    animation: none;
  }
}

/* Static mode (e.g. the login card): the finished logo, no animation */
.is-static .slide,
.is-static .arc,
.is-static .bird-l,
.is-static .bird-r,
.is-static .diamond,
.is-static .letter-i,
.is-static .grow,
.is-static .grow-text {
  opacity: 1;
  transform: none;
}
.is-static .word {
  fill-opacity: 1;
  stroke-width: 0;
  stroke-dashoffset: 0;
}
.is-static .slide,
.is-static .arc,
.is-static .bird-l,
.is-static .bird-r,
.is-static .diamond,
.is-static .letter-i,
.is-static .grow,
.is-static .grow-text,
.is-static .word {
  animation: none;
}
</style>
