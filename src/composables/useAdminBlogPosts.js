import { ref, computed } from 'vue'
import * as blogPostService from '../services/blogPostService'
import { missingFieldsMessage } from '../utils/formChecks'

// Required in Appwrite — checked here first so the user gets a clear
// message instead of a generic "could not save".
export const REQUIRED_IMAGES = { coverImageId: 'cover image' }
import { CATEGORY_STYLES } from '../constants/blogCategories'

export function useAdminBlogPosts() {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      posts.value = await blogPostService.getAllBlogPosts()
    } catch (err) {
      error.value = 'Could not load blog posts.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      return await blogPostService.getBlogPostById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function save(id, data) {
    if (saving.value) return null // already saving — ignore double-clicks
    error.value = missingFieldsMessage(data, REQUIRED_IMAGES)
    if (error.value) return null
    saving.value = true
    try {
      return id
        ? await blogPostService.updateBlogPost(id, data)
        : await blogPostService.createBlogPost(data)
    } catch (err) {
      error.value = 'Could not save this post.'
      console.error(err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Returns true/false; the caller shows the toast. Deliberately doesn't set
  // `error`, which is the page's load error and would replace the whole list.
  async function remove(id) {
    try {
      await blogPostService.deleteBlogPost(id)
      posts.value = posts.value.filter((p) => p.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // Every category in use, plus the built-in ones (even if no post uses
  // them yet). CategoryPicker dedupes and sorts.
  const categories = computed(() => [...Object.keys(CATEGORY_STYLES), ...posts.value.map((p) => p.category)])

  return { posts, categories, loading, error, saving, fetchAll, fetchOne, save, remove }
}