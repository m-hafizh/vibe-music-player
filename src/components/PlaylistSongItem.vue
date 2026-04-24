<template>
  <li
    class="group flex justify-between items-center py-4 px-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer transition duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    @click="playSong"
  >
    <div class="flex items-center flex-grow overflow-hidden">
      <!-- Play Button -->
      <button
        @click.prevent.stop="playSong"
        class="w-10 h-10 shrink-0 mr-4 rounded-full flex items-center justify-center
          bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
          group-hover:bg-green-500 group-hover:text-white dark:group-hover:bg-green-500 dark:group-hover:text-white
          transition-all duration-200 focus:outline-none shadow-sm group-hover:shadow-md"
        title="Play song"
      >
        <i class="fas fa-play ml-0.5 text-sm"></i>
      </button>

      <div class="overflow-hidden">
        <p
          class="font-bold text-gray-800 dark:text-gray-200 transition-colors block mb-1 truncate"
          :class="{ 'text-green-500 dark:text-green-400': isCurrentlyPlaying }"
        >
          {{ song.modified_name || song.original_name }}
        </p>
        <span class="text-gray-500 dark:text-gray-400 text-xs transition-colors block truncate">
          {{ song.display_name }}
        </span>
      </div>
    </div>

    <div class="flex items-center shrink-0 space-x-3 text-gray-600 dark:text-gray-300 text-sm transition-colors ml-4">
      <span class="text-xs font-semibold tabular-nums text-gray-400 dark:text-gray-500 w-6 text-right">#{{ position }}</span>

      <i v-if="isCurrentlyPlaying" class="fas fa-volume-up text-green-500 text-sm"></i>

      <!-- Remove Button (owner only) -->
      <button
        v-if="canRemove"
        @click.stop="emit('remove')"
        class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500
          opacity-0 group-hover:opacity-100
          hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
          transition-all duration-200 focus:outline-none"
        title="Remove from playlist"
      >
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  song: any
  position: number
  canRemove: boolean
}>()

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'remove'): void
}>()

const playerStore = usePlayerStore()

const isCurrentlyPlaying = computed(() => {
  const currentId = playerStore.currentSong?.docID || playerStore.currentSong?.$id
  const songId = props.song?.docID || props.song?.$id
  return currentId && songId && currentId === songId
})

function playSong() {
  emit('play')
}
</script>
