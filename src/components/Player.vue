<template>
  <!-- Player -->
  <div class="fixed bottom-0 left-0 bg-white dark:bg-gray-900 px-5 py-4 align-top w-full h-20
    border-t border-gray-200 dark:border-gray-800 shadow-lg z-50 transition-colors duration-300">
    <div class="relative flex items-center h-full w-full">
      <!-- Playback Navigation -->
      <div class="flex items-center mr-5 shrink-0">
        <button type="button" @click.prevent="prevSong"
          :disabled="!hasPrev"
          class="transition duration-200 focus:outline-none"
          :class="hasPrev ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
          <i class="fas fa-step-backward text-lg"></i>
        </button>
        
        <button type="button" @click.prevent="toggleAudio" id="player-play-button"
          class="mx-4 transition duration-200 focus:outline-none">
          <i class="fa text-gray-500 dark:text-gray-400 text-2xl hover:text-gray-700 dark:hover:text-gray-200"
            :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
        </button>
        
        <button type="button" @click.prevent="nextSong"
          :disabled="!hasNext"
          class="transition duration-200 focus:outline-none"
          :class="hasNext ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
          <i class="fas fa-step-forward text-lg"></i>
        </button>
      </div>

      <!-- Current Position -->
      <div class="text-gray-400 dark:text-gray-500 text-lg w-14 text-center shrink-0">
        <span class="player-currenttime">{{ seek }}</span>
      </div>

      <!-- Scrub Area -->
      <div class="flex-grow mx-4 flex flex-col justify-center">
        <div class="text-sm text-center w-full mb-2 truncate"
          v-if="currentSong.modified_name">
          <span class="font-bold text-gray-700 dark:text-gray-200">{{ currentSong.modified_name }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-xs ml-2 hidden lg:inline">(Uploaded by {{ currentSong.display_name }})</span>
        </div>
        
        <input type="range" min="0" max="100" step="0.01"
          class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none block"
          :style="{ background: `linear-gradient(to right, #10B981 ${currentProgressStyle}, #D1D5DB ${currentProgressStyle})` }"
          :value="numericProgress"
          @input="onScrubInput"
          @change="onScrubChange" />
      </div>

      <!-- Duration -->
      <div class="text-gray-400 dark:text-gray-500 text-lg w-14 text-center mr-4 shrink-0">
        <span class="player-duration">{{ duration }}</span>
      </div>

      <!-- Right Controls: Shuffle, Repeat, Volume -->
      <div class="flex items-center space-x-5 border-l pl-5 border-gray-200 dark:border-gray-700 shrink-0 transition-colors duration-300">
        <button type="button" @click.prevent="playerStore.toggleShuffle()" class="focus:outline-none transition-colors"
          :class="playerStore.shuffle ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
          title="Toggle Shuffle">
          <i class="fas fa-random text-lg"></i>
        </button>
        
        <button type="button" @click.prevent="playerStore.toggleRepeat()" class="focus:outline-none transition-colors relative"
          :class="playerStore.repeat !== 'off' ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
          title="Toggle Repeat">
          <i class="fas text-lg" :class="playerStore.repeat === 'one' ? 'fa-sync-alt' : 'fa-redo'"></i>
          <span v-if="playerStore.repeat === 'one'" class="absolute -top-1 -right-2 text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">1</span>
        </button>

        <div class="flex items-center space-x-2 w-32">
          <button type="button" @click.prevent="playerStore.toggleMute()" class="focus:outline-none text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-6">
            <i class="fas text-lg" :class="playerStore.muted || playerStore.volume === 0 ? 'fa-volume-off text-gray-400' : 'fa-volume-up'"></i>
          </button>
          <input type="range" min="0" max="1" step="0.01"
            class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none"
            :style="{ background: `linear-gradient(to right, #10B981 ${(playerStore.muted ? 0 : playerStore.volume) * 100}%, #D1D5DB ${(playerStore.muted ? 0 : playerStore.volume) * 100}%)` }"
            :value="playerStore.muted ? 0 : playerStore.volume"
            @input="updateVolume" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const playing = computed(() => playerStore.playing)
const seek = computed(() => playerStore.seek)
const duration = computed(() => playerStore.duration)
const currentSong = computed(() => playerStore.currentSong)
const hasNext = computed(() => playerStore.hasNext)
const hasPrev = computed(() => playerStore.hasPrev)

function updateVolume(event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value);
  playerStore.setVolume(val);
}

// Scrubbing Drag State
const isDragging = ref(false)
const dragPercentage = ref(0) // 0 to 100

const currentProgressStyle = computed(() => {
  return isDragging.value ? `${dragPercentage.value}%` : playerStore.playerProgress
})

const numericProgress = computed(() => {
  return isDragging.value ? dragPercentage.value : parseFloat(playerStore.playerProgress) || 0
})

function onScrubInput(event: Event) {
  isDragging.value = true
  dragPercentage.value = parseFloat((event.target as HTMLInputElement).value)
}

function onScrubChange(event: Event) {
  isDragging.value = false
  const percentage = parseFloat((event.target as HTMLInputElement).value) / 100
  playerStore.updateSeek(percentage)
}

function toggleAudio() {
  playerStore.toggleAudio()
}

function nextSong() {
  playerStore.nextSong()
}

function prevSong() {
  playerStore.prevSong()
}
</script>

<style scoped>
/* Custom range slider styling */
input[type=range] {
  -webkit-appearance: none;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #10B981; /* Tailwind green-500 */
  cursor: pointer;
  margin-top: -4px;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: transparent;
  border-radius: 4px;
}
</style>
