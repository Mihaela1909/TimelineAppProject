<script setup>
import { useAuth } from '../../composables/useAuth'
import AppLogo from './AppLogo.vue'

const { currentUser } = useAuth()
const currentYear = new Date().getFullYear()

// `to` = a page in the app; items without it are plain text (no page yet).
const columns = [
  {
    title: 'Explore',
    items: [
      { label: 'Courses', to: '/courses' },
      { label: 'Blog', to: '/blog' },
      { label: 'Quizzes', to: '/quizzes' },
      { label: 'About us', to: '/about' },
    ],
  },
  { title: 'Support', items: [{ label: 'Contact/Feedback' }, { label: 'FAQ' }] },
  { title: 'Sources', items: [{ label: 'Wikipedia & open-access museum archives' }] },
  { title: 'Follow', items: [{ label: 'Instagram' }, { label: 'X' }] },
]
</script>

<template>
  <footer class="bg-olive text-white px-5 md:px-8 pt-12 pb-6">
    <div class="max-w-7xl mx-auto grid gap-10 md:grid-cols-[auto_1fr] md:gap-16 items-start">
      <!-- Logo + sign-up call to action: one fixed-width block, so the logo and the
           button are exactly the same width and read as a unit. -->
      <div class="w-44 mx-auto md:mx-0 flex flex-col items-stretch gap-3 text-center">
        <AppLogo size="fill" />
        <template v-if="!currentUser">
          <p class="text-xs text-cream/90 whitespace-nowrap">Save your progress as you go</p>
          <RouterLink
            to="/register"
            class="font-button block py-2.5 rounded-lg bg-cream text-bark text-lg shadow hover:bg-white transition-colors"
          >
            Sign Up Free
          </RouterLink>
        </template>
        <RouterLink
          v-else
          to="/profile"
          class="font-button block py-2.5 rounded-lg bg-cream text-bark text-lg shadow hover:bg-white transition-colors"
        >
          My Profile
        </RouterLink>
      </div>

      <!-- Link columns, with the thin line + diamond under the headings -->
      <div class="relative">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-8 md:gap-x-0 gap-y-8">
          <div v-for="(column, i) in columns" :key="column.title">
            <h3 class="text-lg mb-1 md:pr-6">{{ column.title }}</h3>
            <!-- Fixed height = the diamond's size on every column, so the lines all sit at
                 the same level whether or not their column shows a diamond. -->
            <div class="flex items-center h-2 md:h-2.5 mb-3" aria-hidden="true">
              <span class="flex-1 h-px bg-white/80"></span>
              <!-- Diamond inside the line's flex row, so items-center keeps it exactly level.
                   Phones: every column has one. md+: the columns' lines join up, so only the last one. -->
              <span
                class="flex-shrink-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-white rotate-45 -ml-1"
                :class="{ 'md:hidden': i < columns.length - 1 }"
              ></span>
            </div>
            <ul class="space-y-1.5 text-sm text-cream/90 md:pr-6">
              <li v-for="item in column.items" :key="item.label">
                <RouterLink v-if="item.to" :to="item.to" class="hover:text-white hover:underline">{{ item.label }}</RouterLink>
                <span v-else>{{ item.label }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto mt-10 pt-4 border-t border-white/15 text-xs text-cream/70 text-center md:text-left">
      &copy; {{ currentYear }} Timeline
    </div>
  </footer>
</template>
