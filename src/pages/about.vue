<template>
  <main class="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
    <div class="flex flex-col items-center text-center space-y-8">
      
      <!-- Icon Graphic -->
      <div class="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-green-400 to-green-500 shadow-xl shadow-green-200/50 dark:shadow-green-900/30 flex items-center justify-center transform -rotate-3 hover:rotate-3 transition-transform duration-500">
        <i class="fas fa-music text-white text-4xl rotate-3"></i>
      </div>

      <!-- Heading -->
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{{ $t('about.heading') }}</h1>
        <p class="text-xl text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto leading-relaxed transition-colors duration-300">
          {{ $t('about.subtitle') }}
        </p>
      </div>

      <!-- Divider -->
      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full my-10 transition-colors duration-300"></div>

      <!-- Content -->
      <div class="text-left space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed px-4 md:px-0 transition-colors duration-300">
        <p>
          {{ $t('about.p1') }}
        </p>
        <p>
          {{ $t('about.p2') }}
        </p>
        <p>
          {{ $t('about.p3') }}
        </p>
      </div>

      <!-- Action Button -->
      <div class="pt-8">
        <router-link to="/" class="inline-flex items-center px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
          <i class="fas fa-play-circle mr-2"></i> {{ $t('about.start_listening') }}
        </router-link>
      </div>
      
    </div>
  </main>
</template>

<script setup lang="ts">
// Minimalist aesthetic about page
</script>
