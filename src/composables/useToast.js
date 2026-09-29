import { ref } from 'vue'

// Module-scope singleton, same pattern as useAuth's currentUser — every
// component that calls useToast() shares one queue, so a toast triggered
// deep in a form shows up in the one <ToastContainer> mounted in App.vue.
const toasts = ref([])
let nextId = 1

function push(message, type = 'success', duration = 3000) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, duration)
}

export function useToast() {
  return {
    toasts,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
  }
}