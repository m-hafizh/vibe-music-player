<template>
  <main>
    <!-- Introduction -->
    <section class="mb-8 py-20 text-white text-center relative z-0 overflow-hidden bg-gray-900">
      <div class="absolute inset-0 w-full h-full bg-cover introduction-bg"
        style="background-image: url(/assets/img/header.png)"></div>
      <div class="container mx-auto relative z-10 px-5">
        <div class="text-white main-header-content">
          <!-- Introducting Heading -->
          <h1 class="font-bold text-5xl mb-5">
            {{ $t('home.listen') }}
          </h1>
          <p class="w-full md:w-8/12 mx-auto px-10">
          {{ $t('home.description') }}

          </p>
        </div>
      </div>

      <img class="relative z-10 block mx-auto mt-5 -mb-20 w-auto max-w-full px-5"
        src="/assets/img/introduction-music.png" />
    </section>

    <!-- Playlists -->
    <section class="container mx-auto mb-6 px-4 lg:px-0" v-if="userPlaylists.length">
      <PlaylistGrid
        :title="playlistSectionTitle"
        :playlists="userPlaylists"
        :max-items="6"
        :show-see-all="userPlaylists.length > 6"
      />
    </section>

    <!-- Main Content -->
    <section class="container mx-auto px-4 lg:px-0 mb-16 sm:mb-24">
      <div class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-none relative flex flex-col transition-colors duration-300">
        <div class="px-6 pt-6 pb-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 transition-colors duration-300 z-20">
          <div class="font-bold text-xl mb-4 sm:mb-0" v-icon-secondary="{ icon: 'headphones-alt', right: true }">
            <span class="card-title mr-3 dark:text-white transition-colors">{{ $t('songs.title') }}</span>
          </div>
          
          <!-- Search UI -->
          <div class="relative w-full sm:max-w-sm sm:ml-4 font-normal flex-shrink-0 transition-colors">
            <i class="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
            <input type="text" v-model="searchQuery"
              class="w-full py-2 pl-11 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 transition text-sm shadow-sm"
              :placeholder="$t('songs.search_placeholder')" />
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

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
          <button @click.prevent="changePage(currentPage - 1)" :disabled="currentPage <= 1"
            aria-label="Previous page"
            class="w-10 h-10 inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none text-sm font-medium">
            <i class="fa fa-chevron-left text-xs" aria-hidden="true"></i>
          </button>
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button @click.prevent="changePage(currentPage + 1)" :disabled="currentPage >= totalPages"
            aria-label="Next page"
            class="w-10 h-10 inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none text-sm font-medium">
            <i class="fa fa-chevron-right text-xs" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { databases, databaseId, songsCollectionId } from '@/includes/appwrite';
import { Query } from 'appwrite';
import AppSongItem from '@/components/SongItem.vue';
import PlaylistGrid from '@/components/PlaylistGrid.vue';
import IconSecondary from '@/directives/icon-secondary';
import { usePlayerStore } from '@/stores/player';
import { usePlaylistStore } from '@/stores/playlist';
import { useAuthStore } from '@/stores/auth';

const vIconSecondary = IconSecondary;
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const userLoggedIn = computed(() => authStore.userLoggedIn);
const userPlaylists = computed(() => playlistStore.userPlaylists);
const playlistSectionTitle = computed(() => (
  userLoggedIn.value ? t('playlist.your_playlists') : t('playlist.library')
));

const songs = ref<any[]>([]);
const maxPerPage = 10;
const pendingRequest = ref(false);

const currentPage = ref(Number(route.query.page) || 1);
const totalSongs = ref(0);
const totalPages = computed(() => Math.ceil(totalSongs.value / maxPerPage) || 1);

const searchQuery = ref((route.query.q as string) || '');
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newVal) => {
  // Sync to URL
  router.replace({ query: { ...route.query, q: newVal || undefined, page: undefined } });
  
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    pendingRequest.value = false; // Reset lock to allow fresh query
    getSongs();
  }, 300);
});

onMounted(() => {
  getSongs();
  playlistStore.fetchUserPlaylists();
});

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || pendingRequest.value) return;
  currentPage.value = page;
  router.replace({ query: { ...route.query, page: page.toString() } });
  getSongs();
}

async function getSongs() {
  if (pendingRequest.value) {
    return;
  }

  pendingRequest.value = true;

  const queries = [
    Query.orderAsc('modified_name'),
    Query.limit(maxPerPage),
    Query.offset((currentPage.value - 1) * maxPerPage),
  ];

  // Apply search filter if query text exists
  if (searchQuery.value) {
    queries.push(Query.startsWith('modified_name', searchQuery.value));
  }

  try {
    const response = await databases.listDocuments(
      databaseId,
      songsCollectionId,
      queries,
    );

    songs.value = response.documents.map((document) => ({
      docID: document.$id,
      ...document,
    }));
    
    totalSongs.value = response.total;

    // Update the player playlist with all loaded songs
    playerStore.setPlaylist(songs.value);
  } catch (error) {
    // console.log(error);
  }

  pendingRequest.value = false;
}
</script>
