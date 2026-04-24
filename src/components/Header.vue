<template>
  <!-- Header -->
  <header id="header" class="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
    <nav class="container mx-auto flex justify-between items-center py-4 px-6">
      
      <!-- Left Side: App Name and Main Links -->
      <div class="flex items-center">
        <!-- App Name -->
        <router-link class="flex items-center text-green-500 font-bold uppercase text-xl mr-8 tracking-wider"
          to="/" exact-active-class="no-active">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mr-2">
            <i class="fas fa-music text-green-500"></i>
          </div>
          Vibe
        </router-link>

        <!-- Primary Navigation -->
        <ul class="flex flex-row items-center space-x-6">
          <li>
            <router-link class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium transition-colors" exact-active-class="!text-yellow-500 dark:!text-yellow-400" to="/about">
              About
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a class="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 font-medium transition-colors cursor-pointer" @click.prevent="toggleAuthModal">
              Login / Register
            </a>
          </li>
          <template v-else>
            <li>
              <router-link class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium transition-colors" exact-active-class="!text-yellow-500 dark:!text-yellow-400" to="/manage-music">
                Manage
              </router-link>
            </li>
            <li>
              <a class="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors cursor-pointer" @click.prevent="triggerLogout">
                Logout
              </a>
            </li>
          </template>
        </ul>
      </div>

      <!-- Right Side: Preferences -->
      <div class="flex items-center ml-auto space-x-1 sm:space-x-3">
        <!-- Theme Toggle -->
        <button @click.prevent="themeStore.toggleTheme()" 
          title="Toggle Theme Mode"
          class="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-400 hover:text-green-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
          <i class="fas text-lg" :class="{
            'fa-desktop text-gray-500 dark:text-gray-400': themeStore.themeMode === 'system',
            'fa-moon text-blue-500': themeStore.themeMode === 'dark',
            'fa-sun text-amber-500': themeStore.themeMode === 'light'
          }"></i>
        </button>

        <!-- Language Dropdown -->
        <div class="relative group pb-4 -mb-4 pt-4 -mt-4">
          <button class="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors px-2 py-2 rounded">
            <i class="fas fa-globe text-lg"></i>
            <span class="font-medium text-sm">{{ currentLocaleLabel }}</span>
            <i class="fas fa-chevron-down text-xs ml-0.5 transition-transform duration-200 group-hover:rotate-180"></i>
          </button>
          
          <div class="absolute right-0 top-full mt-0 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
            <ul class="py-2">
              <li>
                <a href="#" @click.prevent="setLocale('en')" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  :class="{ 'bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold': locale === 'en' }">
                  English
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="setLocale('fr')" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  :class="{ 'bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold': locale === 'fr' }">
                  Français
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </nav>

    <!-- Logout Confirmation Modal -->
    <ConfirmModal
      :visible="showLogoutModal"
      title="Confirm Logout"
      message="Are you sure you want to log out of your account?"
      confirmText="Logout"
      variant="warning"
      @confirm="handleLogoutConfirm"
      @cancel="handleLogoutCancel"
    />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ConfirmModal from '@/components/ConfirmModal.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();

const userLoggedIn = computed(() => authStore.userLoggedIn);
const currentLocaleLabel = computed(() => locale.value === 'fr' ? 'Français' : 'English');

const showLogoutModal = ref(false);

function toggleAuthModal() {
  authStore.toggleAuthModal();
}

function triggerLogout() {
  showLogoutModal.value = true;
}

function handleLogoutCancel() {
  showLogoutModal.value = false;
}

async function handleLogoutConfirm() {
  showLogoutModal.value = false;
  await authStore.signout();
  if (route.meta.requiresAuth) {
    router.push({ path: '/' });
  }
}

function setLocale(lang: string) {
  locale.value = lang;
}
</script>
