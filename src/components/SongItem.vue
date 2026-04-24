<template>
  <li class="flex justify-between items-center p-3 pl-6 cursor-pointer transition
    duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50" :class="`song-id-${song.docID}`">
    <div>
      <router-link :to="{ name: '/song/[id]', params: { id: song.docID } }"
        class="font-bold block text-gray-600 dark:text-gray-200 transition-colors composition-name">
        {{ song.modified_name }}
      </router-link>
      <span class="text-gray-500 dark:text-gray-400 text-sm transition-colors">
        {{ song.display_name }}
      </span>
    </div>

    <div class="text-gray-600 dark:text-gray-300 text-lg transition-colors">
      <router-link custom
        :to="{ name: '/song/[id]', params: { id: song.docID }, hash: '#comments' }"
        v-slot="{ navigate }">
        <span class="comments hover:text-green-500 dark:hover:text-green-400 transition-colors inline-flex items-center space-x-1 border border-transparent dark:border-gray-700 dark:bg-gray-800 px-2 rounded" @click="navigate">
          <i class="fa fa-comments"></i>
          <span class="text-sm font-medium">{{ song.comment_count }}</span>
        </span>
      </router-link>
    </div>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  song: any
}>()
</script>
