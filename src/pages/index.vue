<template>
  <main>
    <!-- Introduction -->
    <section class="mb-8 py-20 text-white text-center relative z-0 overflow-hidden bg-gray-900">
      <div class="absolute inset-0 w-full h-full bg-cover introduction-bg"
        style="background-image: url(/assets/img/header.png)"></div>
      <div class="container mx-auto relative z-10">
        <div class="text-white main-header-content">
          <!-- Introducting Heading -->
          <h1 class="font-bold text-5xl mb-5">
            {{ $t('home.listen') }}
          </h1>
          <p class="w-full md:w-8/12 mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Phasellus et dolor mollis, congue augue non, venenatis elit.
            Nunc justo eros, suscipit ac aliquet imperdiet, venenatis et
            sapien. Duis sed magna pulvinar, fringilla lorem eget,
            ullamcorper urna.
          </p>
        </div>
      </div>

      <img class="relative z-10 block mx-auto mt-5 -mb-20 w-auto max-w-full"
        src="/assets/img/introduction-music.png" />
    </section>

    <!-- Main Content -->
    <section class="container mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 relative flex flex-col transition-colors duration-300">
        <div class="px-6 pt-6 pb-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 transition-colors duration-300 z-20">
          <div class="font-bold text-xl" v-icon-secondary="{ icon: 'headphones-alt', right: true }">
            <span class="card-title mr-3 dark:text-white transition-colors">Songs</span>
          </div>
          
          <!-- Search UI -->
          <div class="relative w-full max-w-sm ml-4 font-normal flex-shrink-0 transition-colors">
            <i class="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
            <input type="text" v-model="searchQuery"
              class="w-full py-2 pl-11 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 transition text-sm shadow-sm"
              placeholder="Search songs by title..." />
            <button v-show="searchQuery" @click.prevent="searchQuery = ''" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <!-- Playlist -->
        <ol id="playlist">
          <app-song-item v-for="song in songs" :key="song.docID"
            :song="song" />
        </ol>
        <!-- .. end Playlist -->
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { databases, databaseId, songsCollectionId } from '@/includes/appwrite';
import { Query } from 'appwrite';
import AppSongItem from '@/components/SongItem.vue';
import IconSecondary from '@/directives/icon-secondary';
import { usePlayerStore } from '@/stores/player';

const vIconSecondary = IconSecondary;
const playerStore = usePlayerStore();
const route = useRoute();
const router = useRouter();

const songs = ref<any[]>([]);
const maxPerPage = 25;
const pendingRequest = ref(false);

const searchQuery = ref((route.query.q as string) || '');
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newVal) => {
  // Sync to URL
  router.replace({ query: { ...route.query, q: newVal || undefined } });
  
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    songs.value = [];
    pendingRequest.value = false; // Reset lock to allow fresh query
    getSongs();
  }, 300);
});

onMounted(() => {
  getSongs();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function handleScroll() {
  const { scrollTop, offsetHeight } = document.documentElement;
  const { innerHeight } = window;
  const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

  if (bottomOfWindow) {
    getSongs();
  }
}

async function getSongs() {
  if (pendingRequest.value) {
    return;
  }

  pendingRequest.value = true;

  const queries = [
    Query.orderAsc('modified_name'),
    Query.limit(maxPerPage),
  ];

  // Apply search filter if query text exists
  if (searchQuery.value) {
    queries.push(Query.startsWith('modified_name', searchQuery.value));
  }

  if (songs.value.length) {
    queries.push(Query.cursorAfter(songs.value[songs.value.length - 1].docID));
  }

  try {
    const response = await databases.listDocuments(
      databaseId,
      songsCollectionId,
      queries,
    );

    response.documents.forEach((document) => {
      songs.value.push({
        docID: document.$id,
        ...document,
      });
    });

    // Update the player playlist with all loaded songs
    playerStore.setPlaylist(songs.value);
  } catch (error) {
    // console.log(error);
  }

  pendingRequest.value = false;
}
</script>
