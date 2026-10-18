<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import PopularCourses from '../components/home/PopularCourses.vue'
import QuizTeaser from '../components/home/QuizTeaser.vue'
import EventOfDay from '../components/home/EventOfDay.vue'
import WhoAreWe from '../components/home/WhoAreWe.vue'
import BlogPreview from '../components/home/BlogPreview.vue'

// HOME PAGE (/): only puts the home sections in order. Each section is its
// own component in components/home/ and loads its own data.
</script>

<template>
  <div>
    <HeroSection />
    <PopularCourses />
    <QuizTeaser />
    <EventOfDay />
    <WhoAreWe />
    <BlogPreview />
  </div>
</template>
