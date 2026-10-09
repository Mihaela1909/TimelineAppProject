import { watch } from 'vue'
import { setPageMeta } from '../utils/pageMeta'

// Pages whose title comes from loaded data (a course, lesson, quiz, blog post).
// `getMeta` returns { title, description, image } once the data is there, or null
// while loading — then the router's default (from route meta) stays in place.
export function usePageMeta(getMeta) {
  watch(getMeta, (meta) => meta && setPageMeta(meta), { immediate: true })
}
