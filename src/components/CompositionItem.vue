<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!showForm">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
        @click.prevent="showDeleteModal = true">
        <i class="fa fa-times"></i>
      </button>
      <button class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
        @click.prevent="showForm = !showForm">
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div v-show="showForm">
      <div class="text-white text-center font-bold p-4 mb-4" v-if="show_alert"
        :class="alert_variant">
        {{ alert_message }}
      </div>
      <vee-form :validation-schema="schema" :initial-values="song"
        @submit="onSubmitForm">
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field type="text" name="modified_name"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300
              transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true)" />
          <ErrorMessage class="text-red-600" name="modified_name" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field type="text" name="genre"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300
              transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true)" />
          <ErrorMessage class="text-red-600" name="genre" />
        </div>
        <button type="submit" class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="in_submission">
          Submit
        </button>
        <button type="button" class="py-1.5 px-3 rounded text-white bg-gray-600"
          :disabled="in_submission" @click.prevent="showForm = false">
          Go Back
        </button>
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
const alert_variant = ref('bg-blue-500')
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
  alert_variant.value = 'bg-blue-500'
  alert_message.value = 'Please wait! Updating song info.'

  try {
    await databases.updateDocument(databaseId, songsCollectionId, props.song.docID, values)
  } catch (error) {
    in_submission.value = false
    alert_variant.value = 'bg-red-500'
    alert_message.value = 'Something went wrong! Try again later'
    return
  }

  props.updateSong(props.index, values)
  props.updateUnsavedFlag(false)

  in_submission.value = false
  alert_variant.value = 'bg-green-500'
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
