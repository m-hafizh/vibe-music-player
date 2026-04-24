<template>
  <div>
    <div class="text-sm font-medium p-3 mb-6 rounded-lg text-center" v-if="login_show_alert"
      :class="login_alert_variant">
      {{ login_alert_msg }}
    </div>
    <vee-form :validation-schema="loginSchema" @submit="login" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
        <vee-field type="email" name="email"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="you@example.com" />
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="email" />
      </div>
      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
        <vee-field type="password" name="password"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="••••••••" />
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="password" />
      </div>
      
      <div class="pt-2">
        <button type="submit" :disabled="login_in_submission"
          class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Sign in
        </button>
      </div>
    </vee-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const loginSchema = {
  email: 'required|email',
  password: 'required|min:3|max:32',
};

const login_in_submission = ref(false);
const login_show_alert = ref(false);
const login_alert_variant = ref('bg-blue-50 text-blue-700');
const login_alert_msg = ref('Please wait! We are logging you in.');

async function login(values: any) {
  login_in_submission.value = true;
  login_show_alert.value = true;
  login_alert_variant.value = 'bg-blue-50 text-blue-700';
  login_alert_msg.value = 'Please wait! We are logging you in.';

  try {
    await authStore.login(values);
  } catch (error) {
    login_in_submission.value = false;
    login_alert_variant.value = 'bg-red-50 text-red-700';
    login_alert_msg.value = 'Invalid login details.';
    return;
  }

  login_alert_variant.value = 'bg-green-50 text-green-700';
  login_alert_msg.value = 'Success! You are now logged in.';
  window.location.reload();
}
</script>
