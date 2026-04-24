<template>
  <section class="container mx-auto mt-8 mb-20 px-4">
    <div class="md:grid md:grid-cols-3 md:gap-8">
      <!-- Upload Sidebar -->
      <div class="col-span-1 mb-8 md:mb-0">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <!-- Song List -->
      <div class="col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
            <span class="font-bold text-xl text-gray-800 dark:text-white">{{ $t('manage.my_songs') }}</span>
            <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 flex items-center justify-center text-green-500 dark:text-green-400 transition-colors duration-300">
              <i class="fa fa-compact-disc text-xl"></i>
            </div>
          </div>
          <div class="px-6 pt-5">
            <div class="relative w-full font-normal transition-colors">
              <i class="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
              <input
                type="text"
                v-model="searchQuery"
                class="w-full py-2 pl-11 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 transition text-sm shadow-sm"
                :placeholder="$t('songs.search_placeholder')"
              />
              <button
                v-show="searchQuery"
                @click.prevent="searchQuery = ''"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          <div class="p-6 space-y-3">
            <!-- Composition Items -->
            <composition-item v-for="item in paginatedSongs" :key="item.song.docID"
              :song="item.song"
              :updateSong="updateSong"
              :index="item.sourceIndex"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag" />

            <div v-if="!paginatedSongs.length" class="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No songs found.
            </div>
          </div>

          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
            <button
              @click.prevent="changePage(currentPage - 1)"
              :disabled="currentPage <= 1"
              aria-label="Previous page"
              class="w-10 h-10 inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none text-sm font-medium"
            >
              <i class="fa fa-chevron-left text-xs" aria-hidden="true"></i>
            </button>

            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button
              @click.prevent="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              aria-label="Next page"
              class="w-10 h-10 inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none text-sm font-medium"
            >
              <i class="fa fa-chevron-right text-xs" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import AppUpload from '@/components/Upload.vue';
import CompositionItem from '@/components/CompositionItem.vue';
import { databases, databaseId, songsCollectionId, account } from '@/includes/appwrite';
import { Query } from 'appwrite';

const songs = ref<any[]>([]);
const unsavedFlag = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const songsPerPage = 5;

const filteredSongsWithIndex = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return songs.value.map((song, index) => ({ song, sourceIndex: index }));
  }

  return songs.value
    .map((song, index) => ({ song, sourceIndex: index }))
    .filter(({ song }) => {
      const title = (song.modified_name || '').toLowerCase();
      const genre = (song.genre || '').toLowerCase();
      const owner = (song.display_name || '').toLowerCase();
      return title.includes(query) || genre.includes(query) || owner.includes(query);
    });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredSongsWithIndex.value.length / songsPerPage));
});

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * songsPerPage;
  const end = start + songsPerPage;
  return filteredSongsWithIndex.value.slice(start, end);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal;
  }
});

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

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
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
