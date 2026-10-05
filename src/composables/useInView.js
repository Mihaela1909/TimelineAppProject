import { ref, onMounted, onBeforeUnmount } from 'vue'

// UI helper: true while `target` (a template ref) is in view.
// Used to start entrance animations when the visitor actually sees them.
// - becomes true when at least `threshold` of the element is visible
// - `once: true`  → stays true after the first time (animation plays once)
// - `once: false` → resets to false only when the element has COMPLETELY
//   left the screen, so a replaying animation never resets in plain sight.
export function useInView(target, { threshold = 0.3, once = true } = {}) {
  const inView = ref(false)
  let observer = null

  onMounted(() => {
    // Very old browsers: just show the final state.
    if (!('IntersectionObserver' in window) || !target.value) {
      inView.value = true
      return
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          inView.value = true
          if (once) observer.disconnect()
        } else if (!once && !entry.isIntersecting) {
          inView.value = false
        }
      },
      // 0 = "fully left the screen" (for resetting), threshold = "visible enough" (for starting)
      { threshold: [0, threshold] }
    )
    observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { inView }
}
