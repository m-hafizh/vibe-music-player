<template>
  <div class="group border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-md transition-all duration-300 mb-4">
    <!-- Read View -->
    <div v-show="!showForm" class="flex items-center justify-between">
      <div class="flex-grow pr-4 overflow-hidden">
        <h4 class="text-lg font-semibold text-gray-800 dark:text-white truncate transition-colors duration-300" :title="song.modified_name">{{ song.modified_name }}</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors duration-300">{{ song.genre || 'No genre' }} &bull; {{ song.display_name }}</p>
      </div>
      <div class="flex items-center space-x-1 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="w-9 h-9 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors focus:outline-none flex items-center justify-center"
          @click.prevent="showForm = !showForm" title="Edit">
          <i class="fa fa-pencil-alt"></i>
        </button>
        <button class="w-9 h-9 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors focus:outline-none flex items-center justify-center"
          @click.prevent="showDeleteModal = true" title="Delete">
          <i class="fa fa-trash-alt"></i>
        </button>
      </div>
    </div>
    
    <!-- Edit Form -->
    <div v-show="showForm" class="pt-2">
      <div class="text-sm text-center font-medium p-3 mb-4 rounded-lg" v-if="show_alert"
        :class="alert_variant">
        {{ alert_message }}
      </div>
      <vee-form :validation-schema="schema" :initial-values="song"
        @submit="onSubmitForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Song Title</label>
          <vee-field type="text" name="modified_name"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-300"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true)" />
          <ErrorMessage class="text-red-500 dark:text-red-400 text-xs mt-1 block" name="modified_name" />
        </div>
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Genre</label>
          <vee-field type="text" name="genre"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-300"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true)" />
          <ErrorMessage class="text-red-500 dark:text-red-400 text-xs mt-1 block" name="genre" />
        </div>
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2 transition-colors duration-300">
          <button type="button" class="py-2 px-4 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
            :disabled="in_submission" @click.prevent="showForm = false">
            Cancel
          </button>
          <button type="submit" class="py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors focus:outline-none shadow-sm"
            :disabled="in_submission">
            Save Changes
          </button>
        </div>
      </vee-form>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :visible="showDeleteModal"
      title="Delete Song"
      :message="`Are you sure you want to delete '${song.modified_name}'? This will permanently remove the song and its file.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Submit Confirmation Modal -->
    <ConfirmModal
      :visible="showSubmitModal"
      title="Save Changes"
      :message="`Save your changes to '${pendingValues?.modified_name || song.modified_name}'?`"
      confirm-text="Save"
      variant="success"
      @confirm="confirmSubmit"
      @cancel="showSubmitModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  databases, databaseId, songsCollectionId, storage, storageBucketId,
} from '@/includes/appwrite'

const props = defineProps<{
  song: any
  updateSong: (i: number, values: any) => void
  index: number
  removeSong: (i: number) => void
  updateUnsavedFlag: (value: boolean) => void
}>()

const showForm = ref(false)
const showDeleteModal = ref(false)
const showSubmitModal = ref(false)
const pendingValues = ref<any>(null)

const schema = {
  modified_name: 'required',
  genre: 'alpha_spaces',
}

const in_submission = ref(false)
const show_alert = ref(false)
const alert_variant = ref('bg-blue-50 text-blue-700')
const alert_message = ref('Please wait! Updating song info.')

function onSubmitForm(values: any) {
  pendingValues.value = values
  showSubmitModal.value = true
}

async function confirmSubmit() {
  showSubmitModal.value = false
  const values = pendingValues.value
  if (!values) return

  in_submission.value = true
  show_alert.value = true
  alert_variant.value = 'bg-blue-50 text-blue-700'
  alert_message.value = 'Please wait! Updating song info.'

  try {
    await databases.updateDocument(databaseId, songsCollectionId, props.song.docID, values)
  } catch (error) {
    in_submission.value = false
    alert_variant.value = 'bg-red-50 text-red-700'
    alert_message.value = 'Something went wrong! Try again later'
    return
  }

  props.updateSong(props.index, values)
  props.updateUnsavedFlag(false)

  in_submission.value = false
  alert_variant.value = 'bg-green-50 text-green-700'
  alert_message.value = 'Success!'
  pendingValues.value = null
}

async function confirmDelete() {
  showDeleteModal.value = false

  if (props.song.file_id) {
    try {
      await storage.deleteFile(storageBucketId, props.song.file_id)
    } catch (e) {
      // File might not exist or be corrupted, continue to delete document
    }
  }

  await databases.deleteDocument(databaseId, songsCollectionId, props.song.docID)
  props.removeSong(props.index)
}
</script>
