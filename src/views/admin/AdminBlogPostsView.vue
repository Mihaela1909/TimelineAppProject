<script setup>
import { onMounted, ref } from 'vue'
import { useAdminBlogPosts } from '../../composables/useAdminBlogPosts'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import { useToast } from '../../composables/useToast'
import { categoryStyle } from '../../constants/blogCategories'

const { posts, loading, error, deleting, fetchAll, remove } = useAdminBlogPosts()
const pendingDelete = ref(null)
const toast = useToast()

onMounted(fetchAll)


async function confirmDelete() {
  const target = pendingDelete.value
  pendingDelete.value = null // close the modal first so it can't be confirmed twice
  if (await remove(target.$id)) toast.success('Post deleted')
  else toast.error('Could not delete this post. Please try again.')
}
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3 justify-between items-center mb-6">
      <h1 class="font-voice text-3xl text-bark">Blog Posts</h1>
      <RouterLink
        to="/admin/blog-posts/new"
        class="font-button text-sm px-5 py-2.5 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
      >
        + New Post
      </RouterLink>
    </div>

    <div v-if="loading" class="bg-white rounded-xl p-4 md:p-6 space-y-3" aria-live="polite">
      <div v-for="n in 3" :key="n" class="h-8 bg-olive-light rounded animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div v-else-if="posts.length === 0" class="bg-white rounded-xl p-12 text-center text-sm text-bark/60">
      No blog posts yet.
      <RouterLink to="/admin/blog-posts/new" class="text-olive font-medium">Write your first one</RouterLink>.
    </div>

    <div v-else class="bg-white rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-bark/50 border-b border-black/5">
            <th class="py-3 px-3 md:px-5 font-medium">Title</th>
            <th class="hidden sm:table-cell py-3 px-3 md:px-5 font-medium">Category</th>
            <th class="py-3 px-3 md:px-5 font-medium">Status</th>
            <th class="py-3 px-3 md:px-5"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.$id" class="border-b border-black/5 last:border-0">
            <td class="py-3 px-3 md:px-5 text-bark">{{ post.title }}</td>
            <td class="hidden sm:table-cell py-3 px-3 md:px-5">
              <span
                class="text-xs px-3 py-1 rounded-full"
                :class="categoryStyle(post.category)"
              >
                {{ post.category }}
              </span>
            </td>
            <td class="py-3 px-3 md:px-5">
              <span
                class="text-xs px-3 py-1 rounded-full"
                :class="post.published ? 'bg-olive-light text-olive' : 'bg-butter text-bark'"
              >
                {{ post.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="py-3 px-3 md:px-5 text-right whitespace-nowrap">
              <RouterLink :to="`/admin/blog-posts/${post.$id}/edit`" class="mr-3 text-bark/60 hover:text-bark">
                ✎
              </RouterLink>
              <button class="text-red-500 hover:text-red-700 disabled:opacity-40" :disabled="deleting" @click="pendingDelete = post">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :open="!!pendingDelete"
      title="Delete this post?"
      :message="`&quot;${pendingDelete?.title}&quot; will be permanently deleted.`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>