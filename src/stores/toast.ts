import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function showToast(
    message: string,
    type: ToastType = 'info',
    duration = 3000,
  ) {
    const id = Date.now() + Math.floor(Math.random() * 1000)

    toasts.value.push({
      id,
      message,
      type,
    })

    if (duration > 0) {
      window.setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
  }
})
