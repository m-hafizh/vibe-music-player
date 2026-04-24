<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-10 sm:py-14 text-center text-white relative">
      <div class="absolute inset-0 w-full h-full box-border border-none music-bg bg-cover bg-center"
        style="background-image: url(/assets/img/song-header.png)">
      </div>
      <div class="container mx-auto flex flex-col sm:flex-row items-center px-4 lg:px-0 relative z-10">
        <!-- Play/Pause Button -->
        <button type="button" class="h-16 w-16 sm:h-24 sm:w-24 text-xl sm:text-3xl bg-white text-black rounded-full shadow-lg
          focus:outline-none shrink-0 mb-4 sm:mb-0" @click.prevent="newSong(song)" id="play-button">
          <i class="fas fa-play ml-1"></i>
        </button>
        <div class="text-center sm:text-left sm:ml-8 w-full max-w-full overflow-hidden">
          <!-- Song Info -->
          <div class="text-2xl sm:text-3xl font-bold truncate leading-tight mb-1">{{ song.modified_name }}</div>
          <div class="text-sm sm:text-base opacity-90">{{ song.genre }}</div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto px-4 lg:px-0 mt-6 mb-8" id="comments">
      <div class="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 relative flex flex-col shadow-md dark:shadow-none transition-colors duration-300">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
          <!-- Comment Count -->
          <span class="card-title text-xl text-gray-800 dark:text-gray-100 transition-colors">
            {{ $t('song.comment_count', song.comment_count, {
              count: song.comment_count
            }) }}
          </span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div class="text-white text-center font-bold p-4 mb-4" v-if="comment_show_alert"
            :class="comment_alert_variant">
            {{ comment_alert_message }}
          </div>
          <vee-form :validation-schema="schema" @submit="addComment"
            v-if="userLoggedIn">
            <vee-field as="textarea" name="comment"
              class="block w-full py-2 px-4 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors
                duration-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg mb-4 resize-none"
              :placeholder="$t('song.comment_placeholder')" rows="3"></vee-field>
            <ErrorMessage class="text-red-600 dark:text-red-400 text-sm font-medium block mb-3" name="comment" />
            <button type="submit" class="py-2 px-6 rounded-full text-white font-medium bg-green-600 hover:bg-green-700 shadow-sm transition-colors duration-300 disabled:opacity-50"
              :disabled="comment_in_submission">
              {{ $t('song.submit') }}
            </button>
          </vee-form>
          <!-- Comment Sorting -->
          <select v-model="sort"
            class="block mt-6 py-2 px-4 w-32 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors
            duration-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg cursor-pointer">
            <option value="1">{{ $t('song.sort_latest') }}</option>
            <option value="2">{{ $t('song.sort_oldest') }}</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto px-4 lg:px-0 space-y-4 mb-16 sm:mb-24 pt-6">
      <li class="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl transition-colors duration-300" 
        v-for="comment in sortedComments"
        :key="comment.docID">
        <!-- Comment Author -->
        <div class="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 dark:border-gray-700 pb-3 transition-colors duration-300">
          <div class="font-bold text-gray-900 dark:text-gray-100 transition-colors">{{ comment.name }}</div>
          <time class="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors mt-1 sm:mt-0">{{ formatDate(comment.datePosted) }}</time>
        </div>

        <p class="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">{{ comment.content }}</p>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { databases, databaseId, songsCollectionId, commentsCollectionId, account } from '@/includes/appwrite';
import { Query, ID } from 'appwrite';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const playerStore = usePlayerStore();

const song = ref<any>({});
const schema = {
  comment: 'required|min:3',
};
const comment_in_submission = ref(false);
const comment_show_alert = ref(false);
const comment_alert_variant = ref('bg-blue-500');
const comment_alert_message = ref('');
const comments = ref<any[]>([]);
const sort = ref('1');

const userLoggedIn = computed(() => authStore.userLoggedIn);
const sortedComments = computed(() => {
  return comments.value.slice().sort((a, b) => {
    if (sort.value === '1') {
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    }
    return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
  });
});

async function getComments() {
  const response = await databases.listDocuments(
    databaseId,
    commentsCollectionId,
    [Query.equal('sid', route.params.id as string)],
  );

  comments.value = response.documents.map((doc) => ({
    docID: doc.$id,
    ...doc,
  }));
}

async function addComment(values: any, { resetForm }: any) {
  comment_in_submission.value = true;
  comment_show_alert.value = true;
  comment_alert_variant.value = 'bg-blue-500';
  comment_alert_message.value = t('song.commenting');

  const user = await account.get();
  const comment = {
    content: values.comment,
    datePosted: new Date().toString(),
    sid: route.params.id as string,
    name: user.name,
    uid: user.$id,
  };

  await databases.createDocument(databaseId, commentsCollectionId, ID.unique(), comment);

  song.value.comment_count += 1;
  await databases.updateDocument(databaseId, songsCollectionId, route.params.id as string, {
    comment_count: song.value.comment_count,
  });

  await getComments();

  comment_in_submission.value = false;
  comment_alert_variant.value = 'bg-green-500';
  comment_alert_message.value = t('song.comment_success');

  resetForm();
}

function newSong(songData: any) {
  playerStore.newSong(songData);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

onMounted(async () => {
  try {
    const docSnapshot = await databases.getDocument(databaseId, songsCollectionId, route.params.id as string);
    song.value = docSnapshot;
  } catch (e) {
    router.push({ path: '/' });
    return;
  }

  const { sort: querySort } = route.query;
  sort.value = querySort === '1' || querySort === '2' ? (querySort as string) : '1';

  await getComments();
});

watch(sort, (newVal) => {
  if (newVal === route.query.sort) {
    return;
  }

  router.push({
    query: {
      sort: newVal,
    },
  });
});
</script>
