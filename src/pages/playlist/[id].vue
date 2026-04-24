<template>
  <main>
    <!-- Playlist Header -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0" :style="headerGradient"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-900"></div>

      <div class="container mx-auto relative z-10 px-6 pt-16 pb-8">
        <div class="flex items-end space-x-6">
          <!-- Playlist Cover -->
          <div class="w-48 h-48 rounded-xl shadow-2xl shrink-0 flex items-center justify-center"
            :style="{ background: coverColor }">
            <i class="fas fa-music text-white/40 text-6xl"></i>
          </div>

          <!-- Playlist Info -->
          <div class="pb-2 flex-grow overflow-hidden">
            <p class="text-xs font-bold text-gray-600 dark:text-white/80 uppercase tracking-widest mb-2">{{ $t('playlist.label_playlist') }}</p>
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 truncate">{{ playlist?.name || $t('playlist.loading') }}</h1>
            <p v-if="playlist?.description" class="text-sm text-gray-600 dark:text-white/70 mb-3 line-clamp-2">{{ playlist.description }}</p>
            <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-white/60">
              <span class="font-medium text-gray-800 dark:text-white/90">{{ playlist?.display_name }}</span>
              <span>&bull;</span>
              <span>{{ playlist?.song_count || 0 }} {{ playlist?.song_count === 1 ? 'song' : 'songs' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Bar -->
    <section class="container mx-auto px-6 py-5">
      <div class="flex items-center space-x-4">
        <!-- Play All -->
        <button @click="playAll"
          :disabled="!playlistSongs.length"
          class="w-14 h-14 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center
            hover:bg-green-400 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100
            transition-all duration-200 focus:outline-none">
          <i class="fas fa-play text-xl ml-0.5"></i>
        </button>

        <!-- Shuffle -->
        <button @click="shufflePlay"
          :disabled="!playlistSongs.length"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400
            hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
            disabled:opacity-40 transition-colors focus:outline-none"
          title="Shuffle play">
          <i class="fas fa-random text-lg"></i>
        </button>

        <div class="flex-grow"></div>

        <!-- Edit (owner only) -->
        <button v-if="isOwner" @click="showEditModal = true"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400
            hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors focus:outline-none"
          title="Edit playlist">
          <i class="fas fa-pencil-alt"></i>
        </button>

        <!-- Delete (owner only) -->
        <button v-if="isOwner" @click="showDeleteModal = true"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400
            hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
            transition-colors focus:outline-none"
          title="Delete playlist">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </section>

    <!-- Song List -->
    <section class="container mx-auto px-6 pb-20">
      <div v-if="loading" class="text-center py-16">
        <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
      </div>

      <div v-else-if="playlistSongs.length" class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-none transition-colors">
        <ol>
          <playlist-song-item
            v-for="(ps, index) in playlistSongs"
            :key="ps.$id"
            :song="ps.song"
            :position="index + 1"
            :can-remove="isOwner"
            @play="playSongAtIndex(index)"
            @remove="triggerRemove(ps)"
          />
        </ol>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
          <i class="fas fa-music text-3xl text-gray-300 dark:text-gray-600"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">{{ $t('playlist.empty') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">{{ $t('playlist.empty_desc') }}</p>
      </div>
    </section>

    <!-- Edit Playlist Modal -->
    <CreatePlaylistModal
      :visible="showEditModal"
      :edit-playlist="playlist"
      @cancel="showEditModal = false"
      @updated="onPlaylistUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :visible="showDeleteModal"
      title="Delete Playlist"
      :message="`Are you sure you want to delete '${playlist?.name}'? All songs will be removed from this playlist.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Remove Song Confirmation Modal -->
    <ConfirmModal
      :visible="showRemoveModal"
      title="Remove Song"
      :message="`Remove '${removingPS?.song?.modified_name || 'this song'}' from the playlist?`"
      confirm-text="Remove"
      variant="danger"
      @confirm="handleRemoveSong"
      @cancel="showRemoveModal = false"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistStore, type PlaylistSong } from '@/stores/playlist'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { account } from '@/includes/appwrite'
import PlaylistSongItem from '@/components/PlaylistSongItem.vue'
import CreatePlaylistModal from '@/components/CreatePlaylistModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const playlist = computed(() => playlistStore.currentPlaylist)
const playlistSongs = computed(() => playlistStore.currentPlaylistSongs)
const loading = computed(() => playlistStore.loading)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRemoveModal = ref(false)
const removingPS = ref<PlaylistSong | null>(null)
const currentUserId = ref('')

const coverColor = computed(() => playlist.value?.cover_color || '#1DB954')

const headerGradient = computed(() => {
  const c = coverColor.value
  return {
    background: `linear-gradient(180deg, ${c} 0%, ${c}cc 40%, transparent 100%)`,
  }
})

const isOwner = computed(() => {
  return !!currentUserId.value && playlist.value?.uid === currentUserId.value
})

onMounted(async () => {
  const playlistId = route.params.id as string

  // Get current user ID
  try {
    const user = await account.get()
    currentUserId.value = user.$id
  } catch {
    // Not logged in
  }

  // Fetch playlist and songs
  const doc = await playlistStore.fetchPlaylist(playlistId)
  if (!doc) {
    router.push({ path: '/' })
    return
  }
  await playlistStore.fetchPlaylistSongs(playlistId)
})

function getSongs() {
  return playlistSongs.value.filter((ps) => ps.song).map((ps) => ps.song)
}

function playAll() {
  const songs = getSongs()
  if (songs.length) {
    playerStore.setPlaylist(songs)
    playerStore.playIndex(0)
  }
}

function shufflePlay() {
  const songs = getSongs()
  if (songs.length) {
    playerStore.setPlaylist(songs)
    const randomIdx = Math.floor(Math.random() * songs.length)
    playerStore.playIndex(randomIdx)
    if (!playerStore.shuffle) {
      playerStore.toggleShuffle()
    }
  }
}

function playSongAtIndex(index: number) {
  const songs = getSongs()
  if (songs.length) {
    playerStore.setPlaylist(songs)
    playerStore.playIndex(index)
  }
}

function onPlaylistUpdated() {
  showEditModal.value = false
}

async function handleDelete() {
  showDeleteModal.value = false
  if (playlist.value) {
    try {
      await playlistStore.deletePlaylist(playlist.value.$id)
      toastStore.showToast('Playlist deleted successfully.', 'success')
      router.push({ path: '/' })
    } catch (error) {
      console.error('Delete playlist error:', error)
      toastStore.showToast('Failed to delete playlist.', 'error')
    }
  }
}

function triggerRemove(ps: PlaylistSong) {
  removingPS.value = ps
  showRemoveModal.value = true
}

async function handleRemoveSong() {
  showRemoveModal.value = false
  if (removingPS.value && playlist.value) {
    try {
      await playlistStore.removeSongFromPlaylist(playlist.value.$id, removingPS.value.$id)
      toastStore.showToast('Song removed from playlist.', 'success')
      removingPS.value = null
    } catch (error) {
      console.error('Remove song from playlist error:', error)
      toastStore.showToast('Failed to remove song from playlist.', 'error')
    }
  }
}
</script>
