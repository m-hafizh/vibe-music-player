<template>
  <div class="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md dark:shadow-none border border-gray-100 dark:border-gray-700
    hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
    @click="navigateToPlaylist">
    <!-- Cover Gradient -->
    <div class="aspect-square relative overflow-hidden">
      <div class="absolute inset-0" :style="coverStyle"></div>
      <div class="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
      <i class="fas fa-music text-white/30 text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>

      <!-- Play Button (Spotify-style) -->
      <button
        @click.stop="playPlaylist"
        class="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-green-500 text-white shadow-xl
          flex items-center justify-center opacity-0 translate-y-2
          group-hover:opacity-100 group-hover:translate-y-0
          hover:bg-green-400 hover:scale-105
          transition-all duration-300 focus:outline-none z-10">
        <i class="fas fa-play text-lg ml-0.5"></i>
      </button>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-bold text-gray-900 dark:text-white text-sm truncate transition-colors">{{ playlist.name }}</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate transition-colors">
        {{ playlist.song_count || 0 }} {{ playlist.song_count === 1 ? 'song' : 'songs' }}
        <span class="mx-1">&bull;</span>
        {{ playlist.display_name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore, type Playlist } from '@/stores/playlist'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  playlist: Playlist
}>()

const router = useRouter()
const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()

const coverStyle = computed(() => {
  const color = props.playlist.cover_color || '#1DB954'
  return {
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 40%, ${color}99 100%)`,
  }
})

function navigateToPlaylist() {
  router.push({ path: `/playlist/${props.playlist.$id}` })
}

async function playPlaylist() {
  await playlistStore.fetchPlaylistSongs(props.playlist.$id)
  const songs = playlistStore.currentPlaylistSongs
    .filter((ps) => ps.song)
    .map((ps) => ps.song)

  if (songs.length > 0) {
    playerStore.setPlaylist(songs)
    playerStore.playIndex(0)
  }
}
</script>
