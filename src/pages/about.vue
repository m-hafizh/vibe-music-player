<template>
  <main class="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
    <div class="flex flex-col items-center text-center space-y-8">
      
      <!-- Icon Graphic -->
      <div class="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-green-400 to-green-500 shadow-xl shadow-green-200/50 dark:shadow-green-900/30 flex items-center justify-center transform -rotate-3 hover:rotate-3 transition-transform duration-500">
        <i class="fas fa-music text-white text-4xl rotate-3"></i>
      </div>

      <!-- Heading -->
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Meet Vibe.</h1>
        <p class="text-xl text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto leading-relaxed transition-colors duration-300">
          The most beautiful way to manage, organize, and listen to your personal music collection.
        </p>
      </div>

      <!-- Divider -->
      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full my-10 transition-colors duration-300"></div>

      <!-- Content -->
      <div class="text-left space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed px-4 md:px-0 transition-colors duration-300">
        <p>
          Vibe is an open-source, modern music player built from the ground up for performance and aesthetic purity. Powered by Vue 3, Vite, and Appwrite, it offers a seamless and highly responsive audio experience.
        </p>
        <p>
          Whether you are uploading a vast library of genres or casually streaming a few favorites, Vibe's custom-built audio engine guarantees gapless transitions, intelligent network caching, and perfect sync across your devices.
        </p>
        <p>
          Design is at the core of everything we do. We stripped away the bulky complexity of traditional media managers to leave behind exactly what matters: your music.
        </p>
      </div>

      <!-- Action Button -->
      <div class="pt-8">
        <router-link to="/" class="inline-flex items-center px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
          <i class="fas fa-play-circle mr-2"></i> Start Listening
        </router-link>
      </div>
      
    </div>
  </main>
</template>

<script setup lang="ts">
// Minimalist aesthetic about page
</script>
