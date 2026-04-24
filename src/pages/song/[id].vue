<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)">
      </div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button type="button" class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full
          focus:outline-none" @click.prevent="newSong(song)" id="play-button">
          <i class="fas fa-play"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
          <div class="song-price">{{ $n(1, 'currency', 'ja') }} </div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">
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
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
                duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button type="submit" class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission">
              Submit
            </button>
          </vee-form>
          <!-- Comment Sorting -->
          <select v-model="sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition
            duration-500 focus:outline-none focus:border-black rounded">
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
      <li class="p-6 bg-gray-50 border border-gray-200" v-for="comment in sortedComments"
        :key="comment.docID">
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.name }}</div>
          <time>{{ comment.datePosted }}</time>
        </div>

        <p>{{ comment.content }}</p>
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
const comment_alert_message = ref('Please wait! Your comment is being submitted');
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
  comment_alert_message.value = 'Please wait! Your comment is being submitted';

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
  comment_alert_message.value = 'Comment added!';

  resetForm();
}

function newSong(songData: any) {
  playerStore.newSong(songData);
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
