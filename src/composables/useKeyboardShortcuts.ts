import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

export function useKeyboardShortcuts() {
  const playerStore = usePlayerStore()

  function handleKeydown(event: KeyboardEvent) {
    // Suppress if user is typing in form elements
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      const tagName = activeElement.tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return
      }
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault() // prevent page scrolling
        playerStore.toggleAudio()
        break
      case 'ArrowRight':
        playerStore.nextSong()
        break
      case 'ArrowLeft':
        playerStore.prevSong()
        break
      case 'ArrowUp':
        event.preventDefault() // prevent page scrolling
        playerStore.setVolume(playerStore.volume + 0.1)
        break
      case 'ArrowDown':
        event.preventDefault() // prevent page scrolling
        playerStore.setVolume(playerStore.volume - 0.1)
        break
      case 'KeyS':
        playerStore.toggleShuffle()
        break
      case 'KeyR':
        playerStore.toggleRepeat()
        break
      case 'KeyM':
        playerStore.toggleMute()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
