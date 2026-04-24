<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed z-50 inset-0 overflow-y-auto" @click.self="cancel">
      <div class="flex items-center justify-center min-h-screen px-4">
        <!-- Overlay -->
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>

        <!-- Modal Panel -->
        <div class="relative bg-white rounded-lg shadow-xl transform transition-all
          sm:max-w-md sm:w-full">
          <div class="px-6 py-5">
            <!-- Header -->
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="iconBgClass">
                <i class="fas" :class="iconClass"></i>
              </div>
              <h3 class="ml-3 text-lg font-bold text-gray-900">{{ title }}</h3>
            </div>

            <!-- Message -->
            <p class="text-gray-600 text-sm mb-5">{{ message }}</p>

            <!-- Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button"
                class="py-2 px-4 rounded text-sm font-medium text-gray-700 bg-gray-100
                  hover:bg-gray-200 transition duration-200 focus:outline-none"
                @click="cancel">
                Cancel
              </button>
              <button type="button"
                class="py-2 px-4 rounded text-sm font-medium text-white transition duration-200
                  focus:outline-none"
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
  'bg-red-100': props.variant === 'danger',
  'bg-green-100': props.variant === 'success',
  'bg-blue-100': props.variant === 'info',
}))

const iconClass = computed(() => ({
  'fa-trash-alt text-red-600': props.variant === 'danger',
  'fa-check text-green-600': props.variant === 'success',
  'fa-info text-blue-600': props.variant === 'info',
}))

const confirmBtnClass = computed(() => ({
  'bg-red-600 hover:bg-red-700': props.variant === 'danger',
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
