<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">{{ $t('manage.my_songs') }}</span>
            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
          </div>
          <div class="p-6">
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
