<template>
  <div class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300 font-sans flex flex-col pt-0 pb-28">
    <app-header />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component"></component>
      </transition>
    </router-view>

    <app-player v-if="playerStore.currentSong.modified_name" />

    <auth-modal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppPlayer from '@/components/Player.vue';
import AppHeader from '@/components/Header.vue';
import AuthModal from '@/components/Auth.vue';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { useThemeStore } from '@/stores/theme';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

const authStore = useAuthStore();
const playerStore = usePlayerStore();
const themeStore = useThemeStore(); // Initializes global root theme listener

useKeyboardShortcuts();

onMounted(() => {
  authStore.init_login();
});
</script>

<style>
.fade-enter-from {
  opacity: 0;
}

.fade-enter-active {
  transition: all 0.5s linear;
}

.fade-leave-to {
  transition: all 0.5s linear;
  opacity: 0;
}
</style>
