import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { Howl } from 'howler'
import helper from '@/includes/helper'

export type RepeatMode = 'off' | 'all' | 'one'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<any>({})
  const sound = shallowRef<InstanceType<typeof Howl> | null>(null)
  const seek = ref('00:00')
  const duration = ref('00:00')
  const playerProgress = ref('0%')
  const playing = ref(false)

  // Playlist state
  const playlist = ref<any[]>([])
  const currentIndex = ref(-1)

  // Playback modifiers
  const shuffle = ref(false)
  const repeat = ref<RepeatMode>('off')
  const volume = ref(parseFloat(localStorage.getItem('player_volume') || '1'))
  const muted = ref(false)

  // Computed
  const hasNext = computed(() => {
    if (repeat.value === 'all' || shuffle.value) return playlist.value.length > 1
    return currentIndex.value < playlist.value.length - 1
  })
  const hasPrev = computed(() => {
    if (repeat.value === 'all') return playlist.value.length > 1
    return currentIndex.value > 0
  })

  function toggleShuffle() {
    shuffle.value = !shuffle.value
  }

  function toggleRepeat() {
    if (repeat.value === 'off') repeat.value = 'all'
    else if (repeat.value === 'all') repeat.value = 'one'
    else repeat.value = 'off'
  }

  function setVolume(val: number) {
    val = Math.max(0, Math.min(1, val))
    volume.value = val
    if (sound.value) {
      sound.value.volume(muted.value ? 0 : val)
    }
    localStorage.setItem('player_volume', val.toString())
  }

  function toggleMute() {
    muted.value = !muted.value
    if (sound.value) {
      sound.value.volume(muted.value ? 0 : volume.value)
    }
  }

  function setPlaylist(songs: any[]) {
    playlist.value = songs
  }

  function playIndex(index: number) {
    if (index < 0 || index >= playlist.value.length) return
    currentIndex.value = index
    newSong(playlist.value[index])
  }

  function getNextIndex() {
    if (shuffle.value && playlist.value.length > 1) {
      let nextIdx
      do {
        nextIdx = Math.floor(Math.random() * playlist.value.length)
      } while (nextIdx === currentIndex.value)
      return nextIdx
    }
    return currentIndex.value + 1
  }

  function nextSong(isAuto = false) {
    // If auto-advance and repeat 'one' is on, replay the current song
    if (isAuto && repeat.value === 'one') {
      playIndex(currentIndex.value)
      return
    }

    const nextIdx = getNextIndex()
    if (nextIdx < playlist.value.length) {
      playIndex(nextIdx)
    } else {
      if (repeat.value === 'all' && playlist.value.length > 0) {
        playIndex(0) // loop to start
      }
    }
  }

  function prevSong() {
    if (sound.value) {
      const currentSeek = sound.value.seek() as number
      if (currentSeek > 3) {
        sound.value.seek(0)
        updatePosition()
        if (playing.value) {
          requestAnimationFrame(progress)
        }
        return
      }
    }

    if (currentIndex.value > 0) {
      playIndex(currentIndex.value - 1)
    } else if (repeat.value === 'all' && playlist.value.length > 0) {
      playIndex(playlist.value.length - 1)
    }
  }

  async function newSong(payload: any) {
    if (sound.value instanceof Howl) {
      sound.value.unload()
    }

    currentSong.value = payload
    sound.value = new Howl({
      src: [payload.url],
      html5: true,
      format: ['mp3', 'wav', 'ogg'],
      volume: muted.value ? 0 : volume.value, // apply volume
    })

    // Auto-detect index in playlist
    if (playlist.value.length) {
      const songId = payload.docID || payload.$id
      const idx = playlist.value.findIndex(
        (s) => (s.docID || s.$id) === songId
      )
      if (idx !== -1) {
        currentIndex.value = idx
      }
    }

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
      nextSong(true) // trigger auto-next
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

  function updateSeek(percentage: number) {
    if (!sound.value) return

    const seconds = sound.value.duration() * percentage

    if (!isNaN(seconds) && seconds >= 0) {
      // Immediately update visual position
      seek.value = helper.formatTime(seconds)
      playerProgress.value = `${percentage * 100}%`

      // Pause-seek-play workaround for un-cached HTML5 audio stream restarts
      const wasPlaying = playing.value
      if (wasPlaying) {
        sound.value.pause()
      }

      // Important: only restart the UI progress loop AFTER seek succeeds
      sound.value.once('seek', () => {
        if (wasPlaying) {
          sound.value!.play()
          requestAnimationFrame(progress)
        }
      })

      sound.value.seek(seconds)
    }
  }

  return {
    currentSong,
    sound,
    seek,
    duration,
    playerProgress,
    playing,
    playlist,
    currentIndex,
    shuffle,
    repeat,
    volume,
    muted,
    hasNext,
    hasPrev,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleMute,
    setPlaylist,
    playIndex,
    nextSong,
    prevSong,
    newSong,
    toggleAudio,
    updatePosition,
    progress,
    updateSeek,
  }
})
