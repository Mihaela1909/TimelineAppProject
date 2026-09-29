<template>
  <section class="bg-white px-6 py-14">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
      <div class="flex-1">
        <h2 class="font-voice text-2xl text-bark mb-3">Wanna test your knowledge?</h2>
        <p class="text-sm text-bark/70 mb-5 max-w-sm">
          Take a short quiz to find out your general history knowledge level and get recommended a
          course from our selection.
        </p>
        <div class="flex gap-3">
          <RouterLink
            to="/quizzes"
            class="text-sm px-5 py-2.5 rounded-md bg-olive text-white hover:bg-olive/90 transition-colors"
          >
            Start Quiz
          </RouterLink>
          <RouterLink
            to="/quizzes"
            class="text-sm px-5 py-2.5 rounded-md border border-olive text-olive hover:bg-olive-light transition-colors"
          >
            Browse Quizzes
          </RouterLink>
        </div>
      </div>
      <div class="w-40 h-40 rounded-full bg-olive-light flex items-center justify-center flex-shrink-0">
        <span class="font-voice text-4xl text-olive">?</span>
      </div>
    </div>
  </section>
</template>
