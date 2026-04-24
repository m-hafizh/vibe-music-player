<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed z-50 inset-0 overflow-y-auto" @click.self="cancel">
      <div class="flex items-center justify-center min-h-screen px-4">
        <!-- Overlay -->
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>

        <!-- Modal Panel -->
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all
          sm:max-w-md sm:w-full border border-gray-100 dark:border-gray-700">
          <div class="px-6 py-5">
            <!-- Header -->
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="iconBgClass">
                <i class="fas transition-colors" :class="iconClass"></i>
              </div>
              <h3 class="ml-3 text-lg font-bold text-gray-900 dark:text-white transition-colors">{{ title }}</h3>
            </div>

            <!-- Message -->
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-5 transition-colors">{{ message }}</p>

            <!-- Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button"
                class="py-2 px-4 rounded text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 focus:outline-none"
                @click="cancel">
                Cancel
              </button>
              <button type="button"
                class="py-2 px-4 rounded text-sm font-medium text-white transition duration-200
                  focus:outline-none shadow-sm"
                :class="confirmBtnClass"
                @click="confirm">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ModalVariant = 'danger' | 'success' | 'info'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  variant?: ModalVariant
}>(), {
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  variant: 'danger',
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const iconBgClass = computed(() => ({
  'bg-red-100 dark:bg-red-900/30': props.variant === 'danger' || props.variant === 'warning',
  'bg-green-100 dark:bg-green-900/30': props.variant === 'success',
  'bg-blue-100 dark:bg-blue-900/30': props.variant === 'info',
}))

const iconClass = computed(() => ({
  'fa-trash-alt text-red-600 dark:text-red-400': props.variant === 'danger',
  'fa-sign-out-alt text-red-600 dark:text-red-400': props.variant === 'warning',
  'fa-check text-green-600 dark:text-green-400': props.variant === 'success',
  'fa-info text-blue-600 dark:text-blue-400': props.variant === 'info',
}))

const confirmBtnClass = computed(() => ({
  'bg-red-600 hover:bg-red-700': props.variant === 'danger' || props.variant === 'warning',
  'bg-green-600 hover:bg-green-700': props.variant === 'success',
  'bg-blue-600 hover:bg-blue-700': props.variant === 'info',
}))

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>
