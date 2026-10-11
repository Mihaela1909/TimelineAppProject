import { ref, computed, watch } from 'vue'

// UI LOGIC shared by the courses, quizzes and blog pages: search box, category
// pills, sort menu and pagination over a list that's already loaded.
//   items      – ref/computed array (courses, quizzes or posts)
//   sorts      – [{ value, label, compare(a, b) }]; the first one is the default
//   pageSize   – cards per page
//   categoryOf – how to read an item's category (quizzes use their course's)
export function useListControls(items, { sorts, pageSize, categoryOf = (item) => item.category }) {
  const searchTerm = ref('')
  const activeCategory = ref('All')
  const sortBy = ref(sorts[0].value)
  const page = ref(1)

  const categories = computed(() => ['All', ...new Set(items.value.map(categoryOf).filter(Boolean))])

  const filtered = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    const matches = items.value.filter((item) => {
      const inCategory = activeCategory.value === 'All' || categoryOf(item) === activeCategory.value
      return inCategory && item.title.toLowerCase().includes(term)
    })
    const { compare } = sorts.find((s) => s.value === sortBy.value)
    return [...matches].sort(compare)
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
  const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

  // Card animation: the first set of cards fades up one by one ('cards-stagger');
  // after any change it's one quick fade ('cards-swap'). A new gridKey re-mounts the grid.
  const gridKey = ref(0)
  const firstLoad = ref(true)
  watch([searchTerm, activeCategory, sortBy, page], () => {
    firstLoad.value = false
    gridKey.value++
  })

  // RESET: a new search / filter / sort starts again from page 1.
  watch([searchTerm, activeCategory, sortBy], () => (page.value = 1))

  return { searchTerm, activeCategory, sortBy, page, categories, filtered, paged, pageCount, gridKey, firstLoad }
}

// Sort comparers used by more than one page.
export const byNewest = (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
export const byTitle = (a, b) => a.title.localeCompare(b.title)
