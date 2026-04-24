<template>
  <li class="group flex justify-between items-center py-4 px-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer transition duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50" :class="`song-id-${song.docID}`" @click="playSong">
    <div class="flex items-center flex-grow overflow-hidden">
      <!-- Play Button -->
      <button @click.prevent.stop="playSong"
        class="w-10 h-10 shrink-0 mr-4 rounded-full flex items-center justify-center 
          bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
          group-hover:bg-green-500 group-hover:text-white dark:group-hover:bg-green-500 dark:group-hover:text-white
          transition-all duration-200 focus:outline-none shadow-sm group-hover:shadow-md"
        title="Play song"
      >
        <i class="fas fa-play ml-0.5 text-sm"></i>
      </button>

      <div class="overflow-hidden">
        <router-link :to="{ name: '/song/[id]', params: { id: song.docID } }"
          class="font-bold text-gray-800 dark:text-gray-200 transition-colors composition-name block mb-1 truncate hover:text-green-500" @click.stop>
          {{ song.modified_name }}
        </router-link>
        <span class="text-gray-500 dark:text-gray-400 text-xs transition-colors block truncate">
          {{ song.display_name }}
        </span>
      </div>
    </div>

    <div class="flex items-center shrink-0 space-x-4 text-gray-600 dark:text-gray-300 text-sm transition-colors ml-4">
      <!-- Add to Playlist Button (logged in only) -->
      <button v-if="userLoggedIn"
        @click.stop="showPlaylistModal = true"
        class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500
          opacity-0 group-hover:opacity-100
          hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20
          transition-all duration-200 focus:outline-none"
        :class="isAddedToAnyPlaylist ? 'text-green-500 dark:text-green-400' : ''"
        :title="isAddedToAnyPlaylist ? 'Already in a playlist' : 'Add to playlist'">
        <i class="fas text-sm" :class="isAddedToAnyPlaylist ? 'fa-check' : 'fa-plus'"></i>
      </button>

      <router-link custom
        :to="{ name: '/song/[id]', params: { id: song.docID }, hash: '#comments' }"
        v-slot="{ navigate }">
        <span class="comments hover:text-green-500 dark:hover:text-green-400 transition-colors inline-flex items-center space-x-1 px-2" @click="navigate">
          <i class="fa fa-comments"></i>
          <span class="font-medium">{{ song.comment_count }}</span>
        </span>
      </router-link>
    </div>

    <!-- Add to Playlist Modal -->
    <AddToPlaylistModal
      :visible="showPlaylistModal"
      :song-id="song.docID"
      :song-name="song.modified_name"
      @cancel="showPlaylistModal = false"
      @added="handleSongAdded"
    />
  </li>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import AddToPlaylistModal from '@/components/AddToPlaylistModal.vue'

const props = defineProps<{
  song: any
}>()

const authStore = useAuthStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const userLoggedIn = computed(() => authStore.userLoggedIn)
const showPlaylistModal = ref(false)
const songId = computed(() => props.song?.docID || '')

const isAddedToAnyPlaylist = computed(() => {
  if (!userLoggedIn.value || !songId.value) {
    return false
  }

  return !!playlistStore.userPlaylistSongLookup[songId.value]
})

async function loadPlaylistMembership() {
  if (!userLoggedIn.value) {
    return
  }

  if (!songId.value) {
    return
  }

  await playlistStore.checkSongInAnyUserPlaylist(songId.value)
}

function handleSongAdded() {
  showPlaylistModal.value = false
  loadPlaylistMembership()
}

function playSong() {
  playerStore.newSong(props.song)
}

watch([songId, () => authStore.userLoggedIn], () => {
  loadPlaylistMembership()
}, { immediate: true })

watch(showPlaylistModal, (isOpen) => {
  if (!isOpen) {
    loadPlaylistMembership()
  }
})
</script>
