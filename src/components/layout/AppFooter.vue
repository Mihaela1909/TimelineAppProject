<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-olive-dark text-cream/90 px-6 pt-10 pb-6 mt-16">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between gap-8 border-b border-white/10 pb-8 mb-6">
        <div class="max-w-xs">
          <div class="font-voice text-xl text-white mb-2">Timeline</div>
          <p class="text-xs text-cream/70">
            Free history courses, quizzes, and stories — for anyone curious about the past.
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-cream/70 mb-2">Save your progress as you go</p>
          <RouterLink
            to="/register"
            class="font-button inline-block text-sm px-5 py-2 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
          >
            Sign up free
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs mb-8">
        <div>
          <div class="text-cream/50 uppercase tracking-wide mb-2">Explore</div>
          <ul class="space-y-1 text-cream/85">
            <li><RouterLink to="/courses">Courses</RouterLink></li>
            <li><RouterLink to="/blog">Blog</RouterLink></li>
            <li><RouterLink to="/quizzes">Quizzes</RouterLink></li>
            <li><RouterLink to="/about">About us</RouterLink></li>
          </ul>
        </div>
        <div>
          <div class="text-cream/50 uppercase tracking-wide mb-2">Support</div>
          <ul class="space-y-1 text-cream/85">
            <li>Contact / Feedback</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <div class="text-cream/50 uppercase tracking-wide mb-2">Sources</div>
          <p class="text-cream/85">Wikipedia &amp; open-access museum archives</p>
        </div>
        <div>
          <div class="text-cream/50 uppercase tracking-wide mb-2">Follow</div>
          <p class="text-cream/85">Instagram &middot; X</p>
        </div>
      </div>

      <div class="text-xs text-cream/50 flex justify-between border-t border-white/10 pt-4">
        <span>&copy; {{ currentYear }} Timeline</span>
        <span>Made by [Your Name]</span>
      </div>
    </div>
  </footer>
</template>
