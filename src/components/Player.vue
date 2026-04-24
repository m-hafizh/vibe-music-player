<template>
  <!-- Player -->
  <div class="fixed bottom-0 left-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-none z-50 transition-colors duration-300 w-full"
    :class="['h-auto pb-3 pt-3 px-4 sm:py-3 sm:px-6']">
    
    <!-- ================= MOBILE STACKED PLAYER ================= -->
    <div class="flex sm:hidden flex-col w-full space-y-2">
      <!-- Title & Action Row -->
  <div class="flex items-start justify-between w-full">
        <div class="flex flex-col truncate pr-4">
          <span class="font-bold text-gray-900 dark:text-white text-[16px] truncate leading-tight">{{ displaySongTitle }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm truncate">{{ displayUploader }}</span>
        </div>
        <!-- Playlist Membership Status -->
        <button
          v-if="hasCurrentSong && userLoggedIn"
          type="button"
          @click.stop="openAddToPlaylistModal"
          :disabled="!canOpenPlaylistModal"
          class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 transition-opacity"
          :class="[
            isPlayingSongInAnyPlaylist ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600',
            canOpenPlaylistModal ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-60'
          ]"
          :title="canOpenPlaylistModal
            ? (isPlayingSongInAnyPlaylist ? 'Already in a playlist — click to manage' : 'Not added to any playlist yet — click to add')
            : 'Login to add songs to playlists'"
        >
          <i class="fas text-white text-[9px]" :class="isPlayingSongInAnyPlaylist ? 'fa-check' : 'fa-plus'"></i>
        </button>
      </div>

      <!-- Scrub Bar Row -->
      <div class="w-full flex flex-col focus:outline-none">
        <div class="w-full pt-1">
          <input type="range" min="0" max="100" step="0.01"
            class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none block"
            :class="isPlayerIdle ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="isPlayerIdle"
            :style="{ background: `linear-gradient(to right, #10B981 ${currentProgressStyle}, #D1D5DB ${currentProgressStyle})` }"
            :value="numericProgress"
            @input="onScrubInput"
            @change="onScrubChange" />
        </div>
        <div class="flex justify-between w-full mt-1.5">
          <span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{{ seek }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{{ duration }}</span>
        </div>
      </div>

      <!-- Playback Controls Row -->
      <div class="flex justify-between items-center w-full px-2 pt-1">
        <!-- Shuffle -->
        <button type="button" @click.prevent="playerStore.toggleShuffle()" class="focus:outline-none transition-colors"
          :disabled="isPlayerIdle"
          :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.shuffle ? 'text-green-500' : 'text-gray-400 dark:text-gray-200 hover:text-gray-600')">
          <i class="fas fa-random text-base"></i>
        </button>

        <!-- Previous -->
        <button type="button" @click.prevent="prevSong" :disabled="isPlayerIdle || !hasPrev"
          class="transition duration-200 focus:outline-none"
          :class="(!isPlayerIdle && hasPrev) ? 'text-gray-700 dark:text-gray-100 hover:text-green-500' : 'text-gray-300 dark:text-gray-600 cursor-default'">
          <i class="fas fa-step-backward text-xl"></i>
        </button>
        
        <!-- Play/Pause -->
        <button type="button" @click.prevent="toggleAudio" :disabled="isPlayerIdle"
          class="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center transition duration-200 focus:outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fa text-white dark:text-gray-900 text-xl"
            :class="{ 'fa-play ml-1': !playing, 'fa-pause': playing }"></i>
        </button>
        
        <!-- Next -->
        <button type="button" @click.prevent="nextSong" :disabled="isPlayerIdle || !hasNext"
          class="transition duration-200 focus:outline-none"
          :class="(!isPlayerIdle && hasNext) ? 'text-gray-700 dark:text-gray-100 hover:text-green-500' : 'text-gray-300 dark:text-gray-600 cursor-default'">
          <i class="fas fa-step-forward text-xl"></i>
        </button>

        <!-- Repeat -->
        <button type="button" @click.prevent="playerStore.toggleRepeat()" class="focus:outline-none transition-colors relative"
          :disabled="isPlayerIdle"
          :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.repeat !== 'off' ? 'text-green-500' : 'text-gray-400 dark:text-gray-200 hover:text-gray-600')">
          <i class="fas text-base" :class="playerStore.repeat === 'one' ? 'fa-sync-alt' : 'fa-redo'"></i>
          <span v-if="playerStore.repeat === 'one'" class="absolute -top-1.5 -right-2 text-[8px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full w-3 h-3 flex items-center justify-center">1</span>
        </button>
      </div>
    </div>

    <!-- ================= TABLET / SMALL LAPTOP PLAYER (640px - 1070px) ================= -->
    <div class="tablet-player h-full w-full flex-col gap-2">
      <!-- Top Row: Song + Main Controls -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center min-w-0 flex-1">
          <div class="min-w-0">
            <div class="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
              {{ displaySongTitle }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5">
              {{ displayUploader }}
            </div>
          </div>
          <button
            v-if="hasCurrentSong && userLoggedIn"
            type="button"
            @click.stop="openAddToPlaylistModal"
            :disabled="!canOpenPlaylistModal"
            class="ml-3 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-opacity"
            :class="[
              isPlayingSongInAnyPlaylist ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600',
              canOpenPlaylistModal ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-60'
            ]"
            :title="canOpenPlaylistModal
              ? (isPlayingSongInAnyPlaylist ? 'Already in a playlist — click to manage' : 'Not added to any playlist yet — click to add')
              : 'Login to add songs to playlists'"
          >
            <i class="fas text-white text-[9px]" :class="isPlayingSongInAnyPlaylist ? 'fa-check' : 'fa-plus'"></i>
          </button>
        </div>

        <div class="flex items-center justify-end gap-4 shrink-0">
          <button type="button" @click.prevent="playerStore.toggleShuffle()" class="focus:outline-none transition-colors"
            :disabled="isPlayerIdle"
            :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.shuffle ? 'text-green-500 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200')"
            title="Toggle Shuffle">
            <i class="fas fa-random text-sm"></i>
          </button>

          <button type="button" @click.prevent="prevSong"
            :disabled="isPlayerIdle || !hasPrev"
            class="transition duration-200 focus:outline-none"
            :class="(!isPlayerIdle && hasPrev) ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
            <i class="fas fa-step-backward"></i>
          </button>

          <button type="button" @click.prevent="toggleAudio" :disabled="isPlayerIdle"
            class="w-10 h-10 bg-white dark:bg-gray-100 text-gray-900 rounded-full flex items-center justify-center transition duration-200 focus:outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fa" :class="{ 'fa-play ml-0.5': !playing, 'fa-pause': playing }"></i>
          </button>

          <button type="button" @click.prevent="nextSong"
            :disabled="isPlayerIdle || !hasNext"
            class="transition duration-200 focus:outline-none"
            :class="(!isPlayerIdle && hasNext) ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
            <i class="fas fa-step-forward"></i>
          </button>

          <button type="button" @click.prevent="playerStore.toggleRepeat()" class="focus:outline-none transition-colors relative"
            :disabled="isPlayerIdle"
            :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.repeat !== 'off' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200')"
            title="Toggle Repeat">
            <i class="fas text-sm" :class="playerStore.repeat === 'one' ? 'fa-sync-alt' : 'fa-redo'"></i>
            <span v-if="playerStore.repeat === 'one'" class="absolute -top-1 -right-2 text-[9px] font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
          </button>
        </div>
      </div>

      <!-- Bottom Row: Progress + Volume -->
      <div class="flex items-center gap-3">
        <span class="text-gray-400 dark:text-gray-500 text-xs w-10 text-right shrink-0 tabular-nums">{{ seek }}</span>
        <div class="flex-1">
          <input type="range" min="0" max="100" step="0.01"
            class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none block"
            :class="isPlayerIdle ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="isPlayerIdle"
            :style="{ background: `linear-gradient(to right, #10B981 ${currentProgressStyle}, #D1D5DB ${currentProgressStyle})` }"
            :value="numericProgress"
            @input="onScrubInput"
            @change="onScrubChange" />
        </div>
        <span class="text-gray-400 dark:text-gray-500 text-xs w-10 shrink-0 tabular-nums">{{ duration }}</span>

        <div class="flex items-center space-x-2 w-28 shrink-0 ml-2">
          <button type="button" @click.prevent="playerStore.toggleMute()" :disabled="isPlayerIdle" class="focus:outline-none text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-5 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed">
            <i class="fas text-sm" :class="playerStore.muted || playerStore.volume === 0 ? 'fa-volume-off text-gray-400' : 'fa-volume-up'"></i>
          </button>
          <input type="range" min="0" max="1" step="0.01"
            class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none"
            :class="isPlayerIdle ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="isPlayerIdle"
            :style="{ background: `linear-gradient(to right, #10B981 ${(playerStore.muted ? 0 : playerStore.volume) * 100}%, #D1D5DB ${(playerStore.muted ? 0 : playerStore.volume) * 100}%)` }"
            :value="playerStore.muted ? 0 : playerStore.volume"
            @input="updateVolume" />
        </div>
      </div>
    </div>

    <!-- ================= DESKTOP PLAYER ================= -->
    <div class="desktop-player h-full w-full items-center gap-6 grid-cols-[minmax(240px,1fr)_minmax(480px,2fr)_minmax(240px,1fr)]">
      <!-- Left: Song Info -->
      <div class="flex items-center min-w-0">
        <div class="min-w-0">
          <div class="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
            {{ displaySongTitle }}
          </div>
          <div class="text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5 flex items-center">
            <span class="truncate">{{ displayUploader }}</span>
            
          </div>
        </div>
        <div class="min-w-0">
          <button
            v-if="hasCurrentSong && userLoggedIn"
            type="button"
            @click.stop="openAddToPlaylistModal"
            :disabled="!canOpenPlaylistModal"
            class="ml-3 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-opacity"
            :class="[
              isPlayingSongInAnyPlaylist ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600',
              canOpenPlaylistModal ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-60'
            ]"
            :title="canOpenPlaylistModal
              ? (isPlayingSongInAnyPlaylist ? 'Already in a playlist — click to manage' : 'Not added to any playlist yet — click to add')
              : 'Login to add songs to playlists'"
          >
            <i class="fas text-white text-[9px]" :class="isPlayingSongInAnyPlaylist ? 'fa-check' : 'fa-plus'"></i>
          </button>
        </div>
      </div>

      <!-- Center: Transport + Progress -->
      <div class="flex flex-col justify-center">
        <div class="flex items-center justify-center space-x-6 mb-2">
          <button type="button" @click.prevent="playerStore.toggleShuffle()" class="focus:outline-none transition-colors"
            :disabled="isPlayerIdle"
            :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.shuffle ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200')"
            title="Toggle Shuffle">
            <i class="fas fa-random text-base"></i>
          </button>

          <button type="button" @click.prevent="prevSong"
            :disabled="isPlayerIdle || !hasPrev"
            class="transition duration-200 focus:outline-none"
            :class="(!isPlayerIdle && hasPrev) ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
            <i class="fas fa-step-backward text-lg"></i>
          </button>

          <button type="button" @click.prevent="toggleAudio" id="player-play-button" :disabled="isPlayerIdle"
            class="w-12 h-12 bg-white dark:bg-gray-100 text-gray-900 rounded-full flex items-center justify-center transition duration-200 focus:outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fa text-xl" :class="{ 'fa-play ml-0.5': !playing, 'fa-pause': playing }"></i>
          </button>

          <button type="button" @click.prevent="nextSong"
            :disabled="isPlayerIdle || !hasNext"
            class="transition duration-200 focus:outline-none"
            :class="(!isPlayerIdle && hasNext) ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-default'">
            <i class="fas fa-step-forward text-lg"></i>
          </button>

          <button type="button" @click.prevent="playerStore.toggleRepeat()" class="focus:outline-none transition-colors relative"
            :disabled="isPlayerIdle"
            :class="isPlayerIdle ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : (playerStore.repeat !== 'off' ? 'text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200')"
            title="Toggle Repeat">
            <i class="fas text-base" :class="playerStore.repeat === 'one' ? 'fa-sync-alt' : 'fa-redo'"></i>
            <span v-if="playerStore.repeat === 'one'" class="absolute -top-1 -right-2 text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
          </button>
        </div>

        <div class="flex items-center w-full">
          <span class="text-gray-400 dark:text-gray-500 text-sm w-12 text-right shrink-0 tabular-nums">{{ seek }}</span>
          <div class="mx-3 flex-1">
            <input type="range" min="0" max="100" step="0.01"
              class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none block"
              :class="isPlayerIdle ? 'opacity-50 cursor-not-allowed' : ''"
              :disabled="isPlayerIdle"
              :style="{ background: `linear-gradient(to right, #10B981 ${currentProgressStyle}, #D1D5DB ${currentProgressStyle})` }"
              :value="numericProgress"
              @input="onScrubInput"
              @change="onScrubChange" />
          </div>
          <span class="text-gray-400 dark:text-gray-500 text-sm w-12 shrink-0 tabular-nums">{{ duration }}</span>
        </div>
      </div>

      <!-- Right: Utility -->
      <div class="flex items-center justify-end">
        <div class="flex items-center space-x-2 w-40">
          <button type="button" @click.prevent="playerStore.toggleMute()" :disabled="isPlayerIdle" class="focus:outline-none text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-6 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed">
            <i class="fas text-lg" :class="playerStore.muted || playerStore.volume === 0 ? 'fa-volume-off text-gray-400' : 'fa-volume-up'"></i>
          </button>
          <input type="range" min="0" max="1" step="0.01"
            class="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none"
            :class="isPlayerIdle ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="isPlayerIdle"
            :style="{ background: `linear-gradient(to right, #10B981 ${(playerStore.muted ? 0 : playerStore.volume) * 100}%, #D1D5DB ${(playerStore.muted ? 0 : playerStore.volume) * 100}%)` }"
            :value="playerStore.muted ? 0 : playerStore.volume"
            @input="updateVolume" />
        </div>
      </div>
    </div>

    <AddToPlaylistModal
      :visible="showPlaylistModal"
      :song-id="currentSongId"
      :song-name="currentSong.modified_name || currentSong.original_name || ''"
      @cancel="showPlaylistModal = false"
      @added="handleSongAddedFromPlayer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import AddToPlaylistModal from '@/components/AddToPlaylistModal.vue'

const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()

const playing = computed(() => playerStore.playing)
const seek = computed(() => playerStore.seek)
const duration = computed(() => playerStore.duration)
const currentSong = computed(() => playerStore.currentSong)
const hasNext = computed(() => playerStore.hasNext)
const hasPrev = computed(() => playerStore.hasPrev)
const currentSongId = computed(() => currentSong.value?.docID || currentSong.value?.$id || '')
const hasCurrentSong = computed(() => !!currentSongId.value)
const isPlayerIdle = computed(() => !hasCurrentSong.value)
const displaySongTitle = computed(() => currentSong.value?.modified_name || currentSong.value?.original_name || '-')
const displayUploader = computed(() => currentSong.value?.display_name || '-')
const userLoggedIn = computed(() => authStore.userLoggedIn)
const showPlaylistModal = ref(false)
const canOpenPlaylistModal = computed(() => authStore.userLoggedIn && !!currentSongId.value)

const isPlayingSongInAnyPlaylist = computed(() => {
  if (!authStore.userLoggedIn || !currentSongId.value) {
    return false
  }

  return !!playlistStore.userPlaylistSongLookup[currentSongId.value]
})

async function refreshPlayingSongPlaylistStatus() {
  if (!authStore.userLoggedIn || !currentSongId.value) {
    return
  }

  await playlistStore.checkSongInAnyUserPlaylist(currentSongId.value)
}

function openAddToPlaylistModal() {
  if (!canOpenPlaylistModal.value) return
  showPlaylistModal.value = true
}

function handleSongAddedFromPlayer() {
  showPlaylistModal.value = false
  refreshPlayingSongPlaylistStatus()
}

watch(showPlaylistModal, (isOpen) => {
  if (!isOpen) {
    refreshPlayingSongPlaylistStatus()
  }
})

watch([currentSongId, () => authStore.userLoggedIn], () => {
  refreshPlayingSongPlaylistStatus()
}, { immediate: true })

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
.tablet-player,
.desktop-player {
  display: none;
}

@media (min-width: 640px) and (max-width: 1070px) {
  .tablet-player {
    display: flex;
  }
}

@media (min-width: 1071px) {
  .desktop-player {
    display: grid;
  }
}

/* Custom range slider styling */
input[type=range] {
  -webkit-appearance: none;
  appearance: none;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
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
