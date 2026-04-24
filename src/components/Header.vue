<template>
  <!-- Header -->
  <header id="header" class="bg-white dark:bg-gray-900 shadow-md dark:shadow-none sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
    <nav class="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:px-6">
      
      <!-- Left Side: App Name and Main Links -->
      <div class="flex items-center justify-between w-full sm:w-auto">
        <!-- App Name -->
        <router-link class="flex items-center text-green-500 font-bold uppercase text-xl sm:mr-8 tracking-wider shrink-0"
          to="/" exact-active-class="no-active">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mr-2">
            <i class="fas fa-music text-green-500"></i>
          </div>
          Vibe
        </router-link>

        <!-- Right Side: Preferences (Mobile Only) -->
        <div class="flex sm:hidden items-center ml-auto space-x-1">
          <!-- Theme Toggle mobile -->
          <button @click.prevent="themeStore.toggleTheme()" 
            class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-400 focus:outline-none">
            <i class="fas" :class="{ 'fa-desktop': themeStore.themeMode === 'system', 'fa-moon text-blue-500': themeStore.themeMode === 'dark', 'fa-sun text-amber-500': themeStore.themeMode === 'light' }"></i>
          </button>
          
          <!-- Language Dropdown mobile (simplified) -->
          <div class="relative">
            <button @click="showLocaleMobile = !showLocaleMobile" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none">
              <i class="fas fa-globe"></i>
            </button>
            <div v-show="showLocaleMobile" class="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-64 overflow-y-auto">
              <a href="#" v-for="lang in languages" :key="lang.code" 
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors"
                :class="{ 'bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold': locale === lang.code }"
                @click.prevent="setLocale(lang.code); showLocaleMobile = false">
                {{ lang.label }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary Navigation -->
      <ul class="flex flex-row items-center space-x-6 mt-4 sm:mt-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <li>
            <router-link class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium transition-colors" exact-active-class="!text-yellow-500 dark:!text-yellow-400" to="/about">
              {{ $t('nav.about') }}
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a class="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 font-medium transition-colors cursor-pointer" @click.prevent="toggleAuthModal">
              {{ $t('nav.login_register') }}
            </a>
          </li>
          <template v-else>
            <li>
              <router-link class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium transition-colors" exact-active-class="!text-yellow-500 dark:!text-yellow-400" to="/library">
                {{ $t('nav.library') }}
              </router-link>
            </li>
            <li>
              <router-link class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium transition-colors" exact-active-class="!text-yellow-500 dark:!text-yellow-400" to="/manage-music">
                {{ $t('nav.manage') }}
              </router-link>
            </li>
            <li>
              <a class="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors cursor-pointer" @click.prevent="triggerLogout">
                {{ $t('nav.logout') }}
              </a>
            </li>
          </template>
        </ul>

      <!-- Right Side: Preferences (Desktop) -->
      <div class="hidden sm:flex items-center ml-auto space-x-1 sm:space-x-3">
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
          
          <div class="absolute right-0 top-full mt-0 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 max-h-80 overflow-y-auto">
            <ul class="py-2">
              <li v-for="lang in languages" :key="lang.code">
                <a href="#" @click.prevent="setLocale(lang.code)" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  :class="{ 'bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold': locale === lang.code }">
                  {{ lang.label }}
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
      :title="$t('confirm.logout_title')"
      :message="$t('confirm.logout_message')"
      :confirmText="$t('confirm.logout_btn')"
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

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ja', label: '日本語' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
];

const currentLocaleLabel = computed(() => {
  const lang = languages.find((l) => l.code === locale.value);
  return lang ? lang.label : 'English';
});

const showLogoutModal = ref(false);
const showLocaleMobile = ref(false);

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
