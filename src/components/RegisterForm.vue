<template>
  <div>
    <div class="text-sm font-medium p-3 mb-6 rounded-lg text-center" v-if="reg_show_alert" :class="reg_alert_variant">
      {{ reg_alert_msg }}
    </div>
    <vee-form :validation-schema="schema" @submit="register" :initial-values="userData" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.name_label') }}</label>
        <vee-field type="text" name="name"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          :placeholder="$t('register.name_placeholder')" />
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="name" />
      </div>
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.email_label') }}</label>
        <vee-field type="email" name="email"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          :placeholder="$t('register.email_placeholder')" />
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="email" />
      </div>
      <!-- Age -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.age_label') }}</label>
        <vee-field type="number" name="age"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          :placeholder="$t('register.age_placeholder')" />
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="age" />
      </div>
      <!-- Password & Confirm -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.password_label') }}</label>
          <vee-field name="password" :bails="false" v-slot="{ field, errors }">
            <input type="password" v-bind="field" placeholder="••••••••"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500" />
            <div class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" v-for="error in errors" :key="error">
              {{ error }}
            </div>
          </vee-field>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.confirm_label') }}</label>
          <vee-field type="password" name="confirm_password"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="••••••••" />
          <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="confirm_password" />
        </div>
      </div>
      <!-- Country -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('register.country_label') }}</label>
        <!-- Replaced generic <select> standard UI with dynamic styling -->
        <vee-field as="select" name="country"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none bg-no-repeat">
          <option value="USA">USA</option>
          <option value="Mexico">Mexico</option>
          <option value="Germany">Germany</option>
          <option value="Antarctica">Antarctica</option>
        </vee-field>
        <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 block" name="country" />
      </div>
      <!-- TOS -->
      <div class="flex items-start mb-2 pt-2">
        <div class="flex items-center h-5">
          <vee-field type="checkbox" name="tos" value="1"
            class="w-4 h-4 text-green-500 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-green-500 outline-none transition shadow-sm" />
        </div>
        <div class="ml-2 text-sm">
          <i18n-t keypath="register.accept" tag="label" class="font-medium text-gray-700 dark:text-gray-300">
            <a href="#" class="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 hover:underline">{{ $t('register.TOS') }}</a>
          </i18n-t>
          <ErrorMessage class="text-red-500 dark:text-red-400 text-xs font-medium mt-1 block" name="tos" />
        </div>
      </div>

      <div class="pt-2">
        <button type="submit" :disabled="reg_in_submission"
          class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('register.create_account') }}
        </button>
      </div>
    </vee-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();

const schema = {
  name: 'required|min:3|max:100|alpha_spaces',
  email: 'required|min:3|max:100|email',
  age: 'required|min_value:18|max_value:100',
  password: 'required|min:3|max:100',
  confirm_password: 'passwords_mismatch:@password',
  country: 'required|country_excluded:Antarctica',
  tos: 'tos',
};

const userData = {
  country: 'USA',
};

const reg_in_submission = ref(false);
const reg_show_alert = ref(false);
const reg_alert_variant = ref('bg-blue-50 text-blue-700');
const reg_alert_msg = ref('');

async function register(values: any) {
  reg_show_alert.value = true;
  reg_in_submission.value = true;
  reg_alert_variant.value = 'bg-blue-50 text-blue-700';
  reg_alert_msg.value = t('register.creating');

  try {
    await authStore.register(values);
  } catch (error) {
    console.error('Appwrite Registration Error:', error);
    reg_in_submission.value = false;
    reg_alert_variant.value = 'bg-red-50 text-red-700';
    reg_alert_msg.value = t('register.error');
    return;
  }

  reg_alert_variant.value = 'bg-green-50 text-green-700';
  reg_alert_msg.value = t('register.success');
  window.location.reload();
}
</script>
