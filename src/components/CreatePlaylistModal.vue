<template>
  <div class="fixed z-[100] inset-0 overflow-y-auto" v-if="visible">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" @click="emit('cancel')">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
      </div>

      <div class="relative inline-block bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-100 dark:border-gray-700">
        <div class="px-6 py-6 sm:p-8">
          <!-- Title -->
          <div class="flex justify-between items-center pb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {{ isEditMode ? $t('playlist.edit') : $t('playlist.create') }}
            </h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors focus:outline-none"
              @click="emit('cancel')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Alert -->
          <div v-if="showAlert" class="text-sm font-medium p-3 mb-6 rounded-lg text-center" :class="alertVariant">
            {{ alertMsg }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('playlist.name_label') }}</label>
              <input type="text" v-model="form.name" required maxlength="100"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                :placeholder="$t('playlist.name_placeholder')" />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('playlist.desc_label') }} <span class="text-gray-400 font-normal">({{ $t('playlist.desc_optional') }})</span></label>
              <textarea v-model="form.description" maxlength="300" rows="3"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                :placeholder="$t('playlist.desc_placeholder')"></textarea>
            </div>

            <!-- Color Picker -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('playlist.cover_color') }}</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="color in coverColors" :key="color" type="button"
                  class="w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none"
                  :style="{ backgroundColor: color }"
                  :class="form.cover_color === color ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-400' : 'border-transparent'"
                  @click="form.cover_color = color">
                </button>
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-2">
              <button type="submit" :disabled="submitting || !form.name.trim()"
                class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isEditMode ? $t('composition.save_changes') : $t('playlist.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { usePlaylistStore, type Playlist } from '@/stores/playlist'
import { useToastStore } from '@/stores/toast'

const props = withDefaults(defineProps<{
  visible: boolean
  editPlaylist?: Playlist | null
}>(), {
  editPlaylist: null,
})

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'created', playlist: Playlist): void
  (e: 'updated', playlist: Playlist): void
}>()

const playlistStore = usePlaylistStore()
const toastStore = useToastStore()

const coverColors = [
  '#1DB954', '#1E3A5F', '#E91E63', '#FF5722',
  '#9C27B0', '#3F51B5', '#009688', '#FF9800',
  '#795548', '#607D8B',
]

const isEditMode = ref(false)
const submitting = ref(false)
const showAlert = ref(false)
const alertVariant = ref('bg-blue-50 text-blue-700')
const alertMsg = ref('')

const form = reactive({
  name: '',
  description: '',
  cover_color: '#1DB954',
})

// Reset form when modal opens
watch(() => props.visible, (val) => {
  if (val) {
    showAlert.value = false
    submitting.value = false
    if (props.editPlaylist) {
      isEditMode.value = true
      form.name = props.editPlaylist.name
      form.description = props.editPlaylist.description || ''
      form.cover_color = props.editPlaylist.cover_color || '#1DB954'
    } else {
      isEditMode.value = false
      form.name = ''
      form.description = ''
      form.cover_color = coverColors[Math.floor(Math.random() * coverColors.length)]
    }
  }
})

async function handleSubmit() {
  if (!form.name.trim()) return

  submitting.value = true
  showAlert.value = true
  alertVariant.value = 'bg-blue-50 text-blue-700'
  alertMsg.value = isEditMode.value ? 'Saving changes...' : 'Creating playlist...'

  try {
    if (isEditMode.value && props.editPlaylist) {
      await playlistStore.updatePlaylist(props.editPlaylist.$id, {
        name: form.name.trim(),
        description: form.description.trim(),
        cover_color: form.cover_color,
      })
      alertVariant.value = 'bg-green-50 text-green-700'
      alertMsg.value = 'Playlist updated!'
      toastStore.showToast('Playlist updated successfully.', 'success')
      setTimeout(() => {
        emit('updated', { ...props.editPlaylist!, ...form } as Playlist)
      }, 500)
    } else {
      const playlist = await playlistStore.createPlaylist({
        name: form.name.trim(),
        description: form.description.trim(),
        cover_color: form.cover_color,
      })
      alertVariant.value = 'bg-green-50 text-green-700'
      alertMsg.value = 'Playlist created!'
      toastStore.showToast('Playlist created successfully.', 'success')
      setTimeout(() => {
        emit('created', playlist)
      }, 500)
    }
  } catch (error) {
    console.error('Playlist save error:', error)
    alertVariant.value = 'bg-red-50 text-red-700'
    alertMsg.value = 'Something went wrong. Please try again.'
    toastStore.showToast('Failed to save playlist. Please try again.', 'error')
    submitting.value = false
  }
}
</script>
