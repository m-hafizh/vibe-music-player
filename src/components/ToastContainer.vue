<template>
  <div class="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[240px] max-w-[360px] rounded-lg px-4 py-3 shadow-lg border text-sm flex items-start justify-between gap-3"
        :class="toastClass(toast.type)"
      >
        <span class="font-medium leading-snug">{{ toast.message }}</span>
        <button
          type="button"
          class="opacity-80 hover:opacity-100 transition-opacity"
          @click="toastStore.removeToast(toast.id)"
          aria-label="Dismiss notification"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToastStore, type ToastType } from '@/stores/toast'

const toastStore = useToastStore()

function toastClass(type: ToastType) {
  if (type === 'success') {
    return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
  }
  if (type === 'error') {
    return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
  }
  if (type === 'warning') {
    return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700'
  }

  return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
