<template>
  <!-- Auth Modal -->
  <div class="fixed z-[100] inset-0 overflow-y-auto" id="modal"
    :class="{ hidden: !authModalShow }">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" @click="toggleAuthModal">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
      </div>

      <div class="relative inline-block bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-100 dark:border-gray-700">
        
        <div class="px-6 py-6 sm:p-8">
          <!--Title-->
          <div class="flex justify-between items-center pb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome</h3>
            <!-- Modal Close Button -->
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors focus:outline-none" 
              @click.prevent="toggleAuthModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Tabs -->
          <div class="p-1 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl mb-6 flex">
            <button class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none"
              @click.prevent="tab = 'login'"
              :class="tab === 'login' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'">
              Login
            </button>
            <button class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none"
              @click.prevent="tab = 'register'"
              :class="tab === 'register' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'">
              Register
            </button>
          </div>

          <transition name="fade" mode="out-in">
            <app-login-form v-if="tab === 'login'" />
            <app-register-form v-else />
          </transition>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppLoginForm from './LoginForm.vue';
import AppRegisterForm from './RegisterForm.vue';

const authStore = useAuthStore();
const tab = ref('login');
const authModalShow = computed(() => authStore.authModalShow);

function toggleAuthModal() {
  authStore.toggleAuthModal();
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
