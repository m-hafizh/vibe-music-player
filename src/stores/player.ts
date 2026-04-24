import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { Howl } from 'howler'
import helper from '@/includes/helper'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<any>({})
  const sound = shallowRef<InstanceType<typeof Howl> | null>(null)
  const seek = ref('00:00')
  const duration = ref('00:00')
  const playerProgress = ref('0%')
  const playing = ref(false)

  async function newSong(payload: any) {
    if (sound.value instanceof Howl) {
      sound.value.unload()
    }

    currentSong.value = payload
    sound.value = new Howl({
      src: [payload.url],
      html5: true,
      format: ['mp3', 'wav', 'ogg'],
    })

    sound.value.play()

    sound.value.on('play', () => {
      playing.value = true
      requestAnimationFrame(progress)
    })

    sound.value.on('pause', () => {
      playing.value = false
    })

    sound.value.on('stop', () => {
      playing.value = false
    })

    sound.value.on('end', () => {
      playing.value = false
    })
  }

  async function toggleAudio() {
    if (!sound.value) return

    if (playing.value) {
      sound.value.pause()
    } else {
      sound.value.play()
    }
  }

  function updatePosition() {
    if (!sound.value) return
    const currentSeek = sound.value.seek() as number
    const totalDuration = sound.value.duration()
    seek.value = helper.formatTime(currentSeek)
    duration.value = helper.formatTime(totalDuration)
    if (totalDuration > 0) {
      playerProgress.value = `${(currentSeek / totalDuration) * 100}%`
    }
  }

  function progress() {
    updatePosition()
    if (sound.value && playing.value) {
      requestAnimationFrame(progress)
    }
  }

  function updateSeek(event: any) {
    if (!sound.value) return

    const { left, width } = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - left
    const percentage = clickX / width
    const seconds = sound.value.duration() * percentage

    if (!isNaN(seconds) && seconds >= 0) {
      sound.value.seek(seconds)
      // Immediately update the UI position
      updatePosition()
      // Restart the progress loop if currently playing
      if (playing.value) {
        requestAnimationFrame(progress)
      }
    }
  }

  return {
    currentSong,
    sound,
    seek,
    duration,
    playerProgress,
    playing,
    newSong,
    toggleAudio,
    updatePosition,
    progress,
    updateSeek,
  }
})
