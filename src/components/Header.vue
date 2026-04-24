<template>
  <!-- Header -->
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link class="text-white font-bold uppercase text-2xl mr-4"
        to="/" exact-active-class="no-active">
        Music
      </router-link>

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link class="px-2 text-white" to="/about">
              About
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal">
              Login / Register
            </a>
          </li>
          <template v-else>
            <li>
              <router-link class="px-2 text-white" to="/manage-music">
                Manage
              </router-link>
            </li>
            <li>
              <a class="px-2 text-white" href="#"
                @click.prevent="signout">Logout</a>
            </li>
          </template>
        </ul>
        <ul class="flex flex-row mt-1 ml-auto">
          <li>
            <a class="px-2 text-white" href="#" @click.prevent="changeLocale">
              {{ currentLocale }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();

const userLoggedIn = computed(() => authStore.userLoggedIn);
const currentLocale = computed(() => locale.value === 'fr' ? 'French' : 'English');

function toggleAuthModal() {
  authStore.toggleAuthModal();
}

async function signout() {
  await authStore.signout();
  if (route.meta.requiresAuth) {
    router.push({ path: '/' });
  }
}

function changeLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr';
}
</script>
