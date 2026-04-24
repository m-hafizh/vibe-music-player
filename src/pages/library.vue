<template>
  <main class="container mx-auto px-6 pt-10 pb-16">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">{{ $t('playlist.library') }}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">
          {{ playlists.length }} {{ playlists.length === 1 ? 'playlist' : 'playlists' }}
        </p>
      </div>
      <button v-if="userLoggedIn" @click="showCreateModal = true"
        class="inline-flex items-center px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm
          hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-lg focus:outline-none">
        <i class="fas fa-plus mr-2 text-xs"></i>
        {{ $t('playlist.create') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
    </div>

    <!-- Playlist Grid -->
    <div v-else-if="playlists.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <playlist-card
        v-for="pl in playlists"
        :key="pl.$id"
        :playlist="pl"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-24">
      <div class="w-24 h-24 mx-auto mb-6 rounded-[1.5rem] bg-gradient-to-br from-green-400 to-green-500 shadow-xl shadow-green-200/50 dark:shadow-green-900/30 flex items-center justify-center transform -rotate-3 hover:rotate-3 transition-transform duration-500">
        <i class="fas fa-list-ul text-white text-4xl rotate-3"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">{{ $t('playlist.create_first') }}</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm transition-colors">
        {{ $t('playlist.no_playlists_desc') }}
      </p>
      <button v-if="userLoggedIn" @click="showCreateModal = true"
        class="inline-flex items-center px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium
          hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 duration-200 focus:outline-none">
        <i class="fas fa-plus mr-2"></i>
        {{ $t('playlist.create') }}
      </button>

      <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
        Login to create and manage playlists.
      </p>
    </div>

    <!-- Create Playlist Modal -->
    <CreatePlaylistModal
      :visible="showCreateModal"
      @cancel="showCreateModal = false"
      @created="onPlaylistCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlaylistStore, type Playlist } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import PlaylistCard from '@/components/PlaylistCard.vue'
import CreatePlaylistModal from '@/components/CreatePlaylistModal.vue'

const playlistStore = usePlaylistStore()
const authStore = useAuthStore()

const playlists = computed(() => playlistStore.userPlaylists)
const loading = computed(() => playlistStore.loading)
const userLoggedIn = computed(() => authStore.userLoggedIn)
const showCreateModal = ref(false)

onMounted(() => {
  playlistStore.fetchUserPlaylists()
})

function onPlaylistCreated(playlist: Playlist) {
  showCreateModal.value = false
}
</script>

<route lang="yaml">
meta:
  requiresAuth: false
</route>
