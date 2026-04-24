<template>
  <div class="text-white text-center font-bold p-4 mb-4"
    v-if="reg_show_alert" :class="reg_alert_variant">
    {{ reg_alert_msg }}
  </div>
  <vee-form :validation-schema="schema"
    @submit="register" :initial-values="userData">
    <!-- Name -->
    <div class="mb-3">
      <label class="inline-block mb-2">Name</label>
      <vee-field type="text" name="name"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
          duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Name" />
      <ErrorMessage class="text-red-600" name="name" />
    </div>
    <!-- Email -->
    <div class="mb-3">
      <label class="inline-block mb-2">Email</label>
      <vee-field type="email" name="email"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
          duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Email" />
      <ErrorMessage class="text-red-600" name="email" />
    </div>
    <!-- Age -->
    <div class="mb-3">
      <label class="inline-block mb-2">Age</label>
      <vee-field type="number" name="age"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
          duration-500 focus:outline-none focus:border-black rounded" />
      <ErrorMessage class="text-red-600" name="age" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field name="password" :bails="false" v-slot="{ field, errors }">
        <input class="block w-full py-1.5 px-3 text-gray-800 border
          border-gray-300 transition duration-500 focus:outline-none
          focus:border-black rounded" type="password"
          placeholder="Password" v-bind="field" />
        <div class="text-red-600" v-for="error in errors" :key="error">
          {{ error }}
        </div>
      </vee-field>
    </div>
    <!-- Confirm Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Confirm Password</label>
      <vee-field type="password" name="confirm_password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
          duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Confirm Password" />
      <ErrorMessage class="text-red-600" name="confirm_password" />
    </div>
    <!-- Country -->
    <div class="mb-3">
      <label class="inline-block mb-2">Country</label>
      <vee-field as="select" name="country"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
          duration-500 focus:outline-none focus:border-black rounded">
        <option value="USA">USA</option>
        <option value="Mexico">Mexico</option>
        <option value="Germany">Germany</option>
        <option value="Antarctica">Antarctica</option>
      </vee-field>
      <ErrorMessage class="text-red-600" name="country" />
    </div>
    <!-- TOS -->
    <div class="mb-3 pl-6">
      <vee-field type="checkbox" name="tos" value="1"
        class="w-4 h-4 float-left -ml-6 mt-1 rounded inline-block" />
      <i18n-t class="inline-block" keypath="register.accept" tag="label">
        <a href="#">{{ $t('register.TOS') }}</a>
      </i18n-t>
      <ErrorMessage class="text-red-600 block" name="tos" />
    </div>
    <button type="submit" :disabled="reg_in_submission"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition
        hover:bg-purple-700">
      Submit
    </button>
  </vee-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

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
const reg_alert_variant = ref('bg-blue-500');
const reg_alert_msg = ref('Please wait! Your account is being created.');

async function register(values: any) {
  reg_show_alert.value = true;
  reg_in_submission.value = true;
  reg_alert_variant.value = 'bg-blue-500';
  reg_alert_msg.value = 'Please wait! Your account is being created.';

  try {
    await authStore.register(values);
  } catch (error) {
    console.error('Appwrite Registration Error:', error);
    reg_in_submission.value = false;
    reg_alert_variant.value = 'bg-red-500';
    reg_alert_msg.value = 'An unexpected error occured. Please try again later.';
    return;
  }

  reg_alert_variant.value = 'bg-green-500';
  reg_alert_msg.value = 'Success! Your account has been created.';
  window.location.reload();
}
</script>
