<template>
  <section class="mb-8">
    <div class="flex items-center justify-between mb-5 px-1">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{{ title }}</h2>
      <div class="flex items-center space-x-3">
        <router-link v-if="showSeeAll" to="/library"
          class="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-wide transition-colors">
          See all
        </router-link>
      </div>
    </div>

    <div v-if="playlists.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <playlist-card
        v-for="playlist in displayedPlaylists"
        :key="playlist.$id"
        :playlist="playlist"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
        <i class="fas fa-list-ul text-2xl text-gray-400 dark:text-gray-500"></i>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-sm transition-colors">{{ emptyText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Playlist } from '@/stores/playlist'
import PlaylistCard from '@/components/PlaylistCard.vue'

const props = withDefaults(defineProps<{
  title: string
  playlists: Playlist[]
  maxItems?: number
  showSeeAll?: boolean
  emptyText?: string
}>(), {
  maxItems: 6,
  showSeeAll: true,
  emptyText: 'No playlists yet.',
})

const displayedPlaylists = computed(() => {
  return props.maxItems > 0
    ? props.playlists.slice(0, props.maxItems)
    : props.playlists
})
</script>
