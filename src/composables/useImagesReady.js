import { ref, onMounted } from 'vue'

// UI helper: `ready` turns true once ALL the given images are downloaded and
// decoded, so an animation built from several images can start with every
// piece in place (instead of figures popping in one by one as they arrive).
// The <img> tags use the same URLs, so the browser only downloads each once.
// After `timeout` ms it starts anyway, so a slow or broken image can't block the page.
export function useImagesReady(urls, { timeout = 4000 } = {}) {
  const ready = ref(false)

  onMounted(() => {
    const loads = urls.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {}) // a failed image shouldn't hold up the rest
    })
    const giveUp = new Promise((resolve) => setTimeout(resolve, timeout))
    Promise.race([Promise.all(loads), giveUp]).then(() => (ready.value = true))
  })

  return { ready }
}
