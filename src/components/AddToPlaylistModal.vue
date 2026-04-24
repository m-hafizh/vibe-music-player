<template>
  <div class="fixed z-[100] inset-0 overflow-y-auto" v-if="visible" @click.stop>
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" @click="emit('cancel')">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
      </div>

      <div class="relative inline-block bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-100 dark:border-gray-700">
        <div class="px-6 py-6 sm:p-8">
          <!-- Title -->
          <div class="flex justify-between items-center pb-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('playlist.add_to_playlist') }}</h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors focus:outline-none"
              @click="emit('cancel')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Song Info -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-5 flex items-center space-x-3 border border-gray-100 dark:border-gray-700 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <i class="fas fa-music text-green-500"></i>
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ songName }}</p>
            </div>
          </div>

          <!-- Alert -->
          <div v-if="alertMsg" class="text-sm font-medium p-3 mb-4 rounded-lg text-center" :class="alertVariant">
            {{ alertMsg }}
          </div>

          <!-- Create New Playlist -->
          <button @click="showCreateModal = true"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-all mb-4 group">
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-gray-400 group-hover:text-green-500 transition-colors"></i>
            </div>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{{ $t('playlist.create_new') }}</span>
          </button>

          <!-- Playlist List -->
          <div class="max-h-64 overflow-y-auto space-y-1 -mx-2 px-2" v-if="playlists.length">
            <button v-for="pl in playlists" :key="pl.$id"
              @click="togglePlaylist(pl.$id)"
              :disabled="applying"
              class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left disabled:opacity-50"
              :class="playlistRowClass(pl.$id)">
              <div class="w-8 h-8 rounded-md shrink-0 flex items-center justify-center" :style="{ background: pl.cover_color || '#1DB954' }">
                <i class="fas fa-music text-white/70 text-xs"></i>
              </div>
              <div class="flex-grow overflow-hidden">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ pl.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ pl.song_count || 0 }} songs</p>
              </div>

              <span v-if="pendingAction(pl.$id) === 'add'" class="text-[11px] font-semibold text-green-600 dark:text-green-400">Add</span>
              <span v-else-if="pendingAction(pl.$id) === 'remove'" class="text-[11px] font-semibold text-red-600 dark:text-red-400">Remove</span>

              <i v-if="isPlaylistSelected(pl.$id)" class="fas fa-check text-green-500"></i>
              <i v-else class="fas fa-plus text-gray-400"></i>
            </button>
          </div>

          <div v-if="playlists.length" class="mt-4">
            <button
              type="button"
              @click="applyChanges"
              :disabled="applying || !hasPendingChanges"
              class="w-full py-2.5 rounded-lg font-medium transition-colors focus:outline-none"
              :class="hasPendingChanges
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'"
            >
              <i v-if="applying" class="fas fa-spinner fa-spin mr-2"></i>
              Apply Changes
            </button>
          </div>

          <div v-else-if="!playlists.length && !loading" class="text-center py-6">
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('playlist.no_playlists') }}</p>
          </div>

          <div v-if="loading" class="text-center py-6">
            <i class="fas fa-spinner fa-spin text-gray-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Inline Create Playlist Modal -->
    <CreatePlaylistModal
      :visible="showCreateModal"
      @cancel="showCreateModal = false"
      @created="onPlaylistCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePlaylistStore, type Playlist } from '@/stores/playlist'
import { useToastStore } from '@/stores/toast'
import CreatePlaylistModal from '@/components/CreatePlaylistModal.vue'

const props = defineProps<{
  visible: boolean
  songId: string
  songName: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'added'): void
}>()

const playlistStore = usePlaylistStore()
const toastStore = useToastStore()

const playlists = computed(() => playlistStore.userPlaylists)
const loading = computed(() => playlistStore.loading)

const showCreateModal = ref(false)
const applying = ref(false)
const alertMsg = ref('')
const alertVariant = ref('bg-green-50 text-green-700')
const originalSelection = ref<Record<string, boolean>>({})
const selectedPlaylists = ref<Record<string, boolean>>({})

const hasPendingChanges = computed(() => {
  const playlistIds = playlists.value.map((p) => p.$id)
  return playlistIds.some((id) => {
    const original = !!originalSelection.value[id]
    const selected = !!selectedPlaylists.value[id]
    return original !== selected
  })
})

// Fetch playlists when modal opens
watch(() => props.visible, (val) => {
  if (val) {
    alertMsg.value = ''
    initSelections()
  }
})

async function initSelections() {
  await playlistStore.fetchUserPlaylists()

  if (!props.songId) {
    originalSelection.value = {}
    selectedPlaylists.value = {}
    return
  }

  const membership = await playlistStore.getSongPlaylistMembership(props.songId)
  const initial: Record<string, boolean> = {}

  playlists.value.forEach((pl) => {
    initial[pl.$id] = !!membership[pl.$id]
  })

  originalSelection.value = { ...initial }
  selectedPlaylists.value = { ...initial }
}

function onPlaylistCreated(playlist: Playlist) {
  showCreateModal.value = false
  originalSelection.value = {
    ...originalSelection.value,
    [playlist.$id]: false,
  }
  selectedPlaylists.value = {
    ...selectedPlaylists.value,
    [playlist.$id]: true,
  }
}

function isPlaylistSelected(playlistId: string) {
  return !!selectedPlaylists.value[playlistId]
}

function pendingAction(playlistId: string): 'add' | 'remove' | null {
  const original = !!originalSelection.value[playlistId]
  const selected = !!selectedPlaylists.value[playlistId]

  if (original === selected) return null
  return selected ? 'add' : 'remove'
}

function togglePlaylist(playlistId: string) {
  selectedPlaylists.value = {
    ...selectedPlaylists.value,
    [playlistId]: !selectedPlaylists.value[playlistId],
  }
}

function playlistRowClass(playlistId: string) {
  const action = pendingAction(playlistId)
  if (action === 'add') {
    return 'bg-green-50/60 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30'
  }
  if (action === 'remove') {
    return 'bg-red-50/60 dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30'
  }

  return 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
}

async function applyChanges() {
  if (!hasPendingChanges.value || applying.value) return
  applying.value = true
  alertMsg.value = ''

  let addedCount = 0
  let removedCount = 0

  try {
    for (const pl of playlists.value) {
      const action = pendingAction(pl.$id)
      if (!action) continue

      if (action === 'add') {
        const result = await playlistStore.addSongToPlaylist(pl.$id, props.songId)
        if (result) {
          addedCount += 1
        }
      } else {
        const removed = await playlistStore.removeSongFromPlaylistBySongId(pl.$id, props.songId)
        if (removed) {
          removedCount += 1
        }
      }
    }

    if (addedCount > 0 || removedCount > 0) {
  const parts: string[] = []
      if (addedCount > 0) parts.push(`${addedCount} added`)
      if (removedCount > 0) parts.push(`${removedCount} removed`)

      alertVariant.value = 'bg-green-50 text-green-700'
      alertMsg.value = `Updated playlists: ${parts.join(', ')}.`
      toastStore.showToast(`Playlist updates applied (${parts.join(', ')}).`, 'success')
    } else {
      alertVariant.value = 'bg-yellow-50 text-yellow-700'
      alertMsg.value = 'No changes were applied.'
      toastStore.showToast('No playlist changes to apply.', 'info')
    }

    originalSelection.value = { ...selectedPlaylists.value }

    const isInAnyPlaylist = Object.values(selectedPlaylists.value).some(Boolean)
    if (props.songId) {
      if (isInAnyPlaylist) {
        playlistStore.userPlaylistSongLookup = {
          ...playlistStore.userPlaylistSongLookup,
          [props.songId]: true,
        }
      } else {
        const { [props.songId]: _removed, ...rest } = playlistStore.userPlaylistSongLookup
        playlistStore.userPlaylistSongLookup = rest
      }
      playlistStore.userPlaylistSongLookupLoaded = true
    }

    emit('added')
  } catch (error) {
    console.error('Apply playlist changes error:', error)
    alertVariant.value = 'bg-red-50 text-red-700'
    alertMsg.value = 'Failed to apply playlist changes. Try again.'
    toastStore.showToast('Failed to apply playlist changes.', 'error')
  } finally {
    applying.value = false
  }
}
</script>
