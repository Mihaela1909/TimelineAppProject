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
  const loadingOne = ref(false)
  const loadError = ref(null)
  const saving = ref(false)
  const deleting = ref(false) // separate from saving: a delete from the list isn't a form save

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

  // Edit forms: loads the row being edited, with its own loading/error so the form
  // can show a skeleton or a Retry box instead of an empty form.
  async function fetchOne(id) {
    loadingOne.value = true
    loadError.value = null
    try {
      return await blogPostService.getBlogPostById(id)
    } catch (err) {
      console.error(err)
      loadError.value = 'Could not load this blog post. Please try again.'
      return null
    } finally {
      loadingOne.value = false
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
    if (deleting.value) return false // CHECK: a delete is already running (double-click)
    deleting.value = true
    try {
      await blogPostService.deleteBlogPost(id)
      posts.value = posts.value.filter((p) => p.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      deleting.value = false // RESET: always, even on failure
    }
  }

  // Every category in use, plus the built-in ones (even if no post uses
  // them yet). CategoryPicker dedupes and sorts.
  const categories = computed(() => [...Object.keys(CATEGORY_STYLES), ...posts.value.map((p) => p.category)])

  return { posts, categories, loading, error, saving, deleting, fetchAll, fetchOne, loadingOne, loadError, save, remove }
}