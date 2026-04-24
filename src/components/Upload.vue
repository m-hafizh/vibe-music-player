<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300">
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
      <span class="font-bold text-xl text-gray-800 dark:text-white">Upload</span>
      <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-blue-500 dark:text-blue-400 transition-colors duration-300">
        <i class="fas fa-upload text-xl"></i>
      </div>
    </div>
    <div class="p-6">
      <!-- Upload Dropzone -->
      <div
        class="w-full px-10 py-12 rounded-xl text-center cursor-pointer border-2 border-dashed
          transition-all duration-300 ease-in-out flex flex-col items-center justify-center group"
        :class="{ 'bg-green-50 dark:bg-gray-700 border-green-400 dark:border-green-500': is_dragover, 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500': !is_dragover }"
        @drag.prevent.stop=""
        @dragstart.prevent.stop=""
        @dragend.prevent.stop="is_dragover = false"
        @dragover.prevent.stop="is_dragover = true"
        @dragenter.prevent.stop="is_dragover = true"
        @dragleave.prevent.stop="is_dragover = false"
        @drop.prevent.stop="handleFileDrop($event)"
        @click="$refs.fileInput.click()">
        
        <div class="w-16 h-16 rounded-full mb-3 flex items-center justify-center transition-colors duration-300"
          :class="is_dragover ? 'bg-green-100 dark:bg-gray-600 text-green-600 dark:text-green-400' : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 shadow-sm'">
          <i class="fas fa-cloud-upload-alt text-3xl"></i>
        </div>
        <h5 class="text-lg font-semibold transition-colors duration-300" :class="is_dragover ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'">Drop your files here</h5>
        <p class="text-sm mt-1 transition-colors duration-300" :class="is_dragover ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">or click to browse</p>
      </div>
      <input type="file" multiple @change="handleFileDrop($event)" class="hidden" ref="fileInput" />
      
      <hr class="my-6 border-gray-100 dark:border-gray-700 transition-colors duration-300" v-if="uploads.length" />
      
      <!-- Progress Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-medium text-sm mb-1.5 flex items-center" :class="upload.text_class">
          <i :class="upload.icon" class="mr-2 text-lg"></i> <span class="truncate dark:text-gray-300">{{ upload.name }}</span>
        </div>
        <div class="flex h-2 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-full transition-colors duration-300">
          <!-- Inner Progress Bar -->
          <div class="transition-all duration-300 ease-out rounded-full"
            :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Upload Confirmation Modal -->
    <ConfirmModal
      :visible="showUploadModal"
      title="Confirm Upload"
      :message="uploadMessage"
      confirm-text="Start Upload"
      variant="success"
      @confirm="confirmUpload"
      @cancel="cancelUploadPrompt"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue';
import {
  storage, databases, databaseId, songsCollectionId, storageBucketId, account, ID,
} from '@/includes/appwrite';

export default {
  name: 'Upload',
  components: { ConfirmModal },
  data() {
    return {
      is_dragover: false,
      uploads: [],
      showUploadModal: false,
      pendingFiles: [],
    };
  },
  props: ['addSong'],
  computed: {
    uploadMessage() {
      if (this.pendingFiles.length === 1) {
        return `Are you sure you want to upload '${this.pendingFiles[0].name}'?`;
      }
      return `Are you sure you want to upload ${this.pendingFiles.length} files?`;
    }
  },
  methods: {
    handleFileDrop($event) {
      this.is_dragover = false;

      const files = $event.dataTransfer
        ? [...$event.dataTransfer.files]
        : [...$event.target.files];

      // Only allow MP3 format
      const validFiles = files.filter(file => file.type === 'audio/mpeg');

      if (validFiles.length === 0) {
        if (files.length > 0) alert('Please select a valid MP3 file.');
        return;
      }

      this.pendingFiles = validFiles;
      this.showUploadModal = true;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    cancelUploadPrompt() {
      this.showUploadModal = false;
      this.pendingFiles = [];
    },
    confirmUpload() {
      this.showUploadModal = false;
      const filesToUpload = this.pendingFiles;
      this.pendingFiles = [];

      filesToUpload.forEach((file) => {
        if (!navigator.onLine) {
          this.uploads.push({
            task: {},
            current_progress: 100,
            name: file.name,
            variant: 'bg-red-500',
            icon: 'fas fa-times-circle',
            text_class: 'text-red-500',
          });
          return;
        }

        const uploadIndex = this.uploads.push({
          task: { cancel: () => {} },
          current_progress: 0,
          name: file.name,
          variant: 'bg-blue-500',
          icon: 'fas fa-spinner fa-spin',
          text_class: 'text-gray-600',
        }) - 1;

        const uploadFile = async () => {
          try {
            const user = await account.get();
            const documentId = ID.unique();
            const fileId = ID.unique();

            const response = await storage.createFile(
              storageBucketId,
              fileId,
              file,
              undefined,
              (progressInfo) => {
                this.uploads[uploadIndex].current_progress = progressInfo.progress;
              },
            );

            const resultUrl = storage.getFileView(storageBucketId, response.$id);

            const song = {
              uid: user.$id,
              display_name: user.name,
              original_name: response.name,
              modified_name: response.name,
              genre: '',
              comment_count: 0,
              url: resultUrl.href || resultUrl,
              file_id: response.$id,
            };

            const songDocument = await databases.createDocument(
              databaseId,
              songsCollectionId,
              documentId,
              song,
            );

            const songSnapshot = {
              id: songDocument.$id,
              data: () => songDocument,
            };

            this.addSong(songSnapshot);

            this.uploads[uploadIndex].variant = 'bg-green-500';
            this.uploads[uploadIndex].icon = 'fas fa-check-circle';
            this.uploads[uploadIndex].text_class = 'text-green-600';
          } catch (error) {
            console.error('Appwrite Upload Error:', error);
            this.uploads[uploadIndex].variant = 'bg-red-500';
            this.uploads[uploadIndex].icon = 'fas fa-times-circle';
            this.uploads[uploadIndex].text_class = 'text-red-500';
          }
        };

        uploadFile();
      });
    },
    cancelUploads() {
      this.uploads.forEach((upload) => {
        upload.task.cancel();
      });
    },
  },
  beforeUnmount() {
    this.uploads.forEach((upload) => {
      upload.task.cancel();
    });
  },
};
</script>
