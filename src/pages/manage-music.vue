<template>
  <section class="container mx-auto mt-8 mb-20 px-4">
    <div class="md:grid md:grid-cols-3 md:gap-8">
      <!-- Upload Sidebar -->
      <div class="col-span-1 mb-8 md:mb-0">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <!-- Song List -->
      <div class="col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
            <span class="font-bold text-xl text-gray-800 dark:text-white">{{ $t('manage.my_songs') }}</span>
            <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 flex items-center justify-center text-green-500 dark:text-green-400 transition-colors duration-300">
              <i class="fa fa-compact-disc text-xl"></i>
            </div>
          </div>
          <div class="p-6 space-y-3">
            <!-- Composition Items -->
            <composition-item v-for="(song, i) in songs" :key="song.docID"
              :song="song"
              :updateSong="updateSong"
              :index="i"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import AppUpload from '@/components/Upload.vue';
import CompositionItem from '@/components/CompositionItem.vue';
import { databases, databaseId, songsCollectionId, account } from '@/includes/appwrite';
import { Query } from 'appwrite';

const songs = ref<any[]>([]);
const unsavedFlag = ref(false);

onMounted(async () => {
  try {
    const user = await account.get();
    const response = await databases.listDocuments(
      databaseId,
      songsCollectionId,
      [Query.equal('uid', user.$id)],
    );

    response.documents.forEach((doc) => {
      addSong({
        id: doc.$id,
        data: () => doc,
      });
    });
  } catch (e) {
    // Not logged in or error
  }
});

function updateSong(i: number, values: any) {
  songs.value[i].modified_name = values.modified_name;
  songs.value[i].genre = values.genre;
}

function removeSong(i: number) {
  songs.value.splice(i, 1);
}

function addSong(document: any) {
  const song = {
    ...document.data(),
    docID: document.id,
  };

  songs.value.push(song);
}

function updateUnsavedFlag(value: boolean) {
  unsavedFlag.value = value;
}

onBeforeRouteLeave((to, from, next) => {
  if (!unsavedFlag.value) {
    next();
  } else {
    const leave = confirm('You have unsaved changes. Are you sure you want to leave?');
    next(leave);
  }
});
</script>

<route lang="yaml">
meta:
  requiresAuth: true
</route>
