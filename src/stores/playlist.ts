import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  databases, databaseId, playlistsCollectionId, playlistSongsCollectionId,
  songsCollectionId, account, ID, Query,
} from '@/includes/appwrite'

export interface Playlist {
  $id: string
  name: string
  description: string
  uid: string
  display_name: string
  cover_color: string
  song_count: number
}

export interface PlaylistSong {
  $id: string
  playlist_id: string
  song_id: string
  position: number
  added_at: string
  // Populated after fetch
  song?: any
}

const COVER_COLORS = [
  '#1DB954', '#1E3A5F', '#E91E63', '#FF5722',
  '#9C27B0', '#3F51B5', '#009688', '#FF9800',
  '#795548', '#607D8B',
]

function randomCoverColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)]
}

export const usePlaylistStore = defineStore('playlist', () => {
  const userPlaylists = ref<Playlist[]>([])
  const currentPlaylist = ref<Playlist | null>(null)
  const currentPlaylistSongs = ref<PlaylistSong[]>([])
  const loading = ref(false)
  const userPlaylistSongLookup = ref<Record<string, true>>({})
  const userPlaylistSongLookupLoaded = ref(false)

  function resetUserPlaylistSongLookup() {
    userPlaylistSongLookup.value = {}
    userPlaylistSongLookupLoaded.value = false
  }

  // ─── Fetch All User Playlists ────────────────────────────────
  async function fetchUserPlaylists(uid?: string) {
    loading.value = true
    try {
      let userId = uid
      if (!userId) {
        try {
          const user = await account.get()
          userId = user.$id
        } catch {
          // Guest mode: fall back to public playlists query.
          userId = undefined
        }
      }

      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]

      if (userId) {
        queries.unshift(Query.equal('uid', userId))
      }

      const response = await databases.listDocuments(
        databaseId,
        playlistsCollectionId,
        queries,
      )

      userPlaylists.value = response.documents as unknown as Playlist[]
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      loading.value = false
    }
  }

  // ─── User Playlist Song Lookup (for fast membership checks) ───────
  async function refreshUserPlaylistSongLookup() {
    try {
      if (userPlaylists.value.length === 0) {
        await fetchUserPlaylists()
      }

      const playlistIds = userPlaylists.value.map((p) => p.$id)
      if (!playlistIds.length) {
        userPlaylistSongLookup.value = {}
        userPlaylistSongLookupLoaded.value = true
        return
      }

      const response = await databases.listDocuments(
        databaseId,
        playlistSongsCollectionId,
        [
          Query.equal('playlist_id', playlistIds),
          Query.limit(500),
        ],
      )

      const lookup: Record<string, true> = {}
      response.documents.forEach((doc) => {
        const songId = (doc as any).song_id
        if (songId) {
          lookup[songId] = true
        }
      })

      userPlaylistSongLookup.value = lookup
      userPlaylistSongLookupLoaded.value = true
    } catch (error) {
      console.error('Failed to refresh playlist song lookup:', error)
      userPlaylistSongLookup.value = {}
      userPlaylistSongLookupLoaded.value = true
    }
  }

  async function checkSongInAnyUserPlaylist(songId: string) {
    if (!songId) return false
    if (!userPlaylistSongLookupLoaded.value) {
      await refreshUserPlaylistSongLookup()
    }

    return !!userPlaylistSongLookup.value[songId]
  }

  async function getSongPlaylistMembership(songId: string) {
    if (!songId) return {}

    if (userPlaylists.value.length === 0) {
      await fetchUserPlaylists()
    }

    const playlistIds = userPlaylists.value.map((p) => p.$id)
    if (!playlistIds.length) {
      return {} as Record<string, string>
    }

    const response = await databases.listDocuments(
      databaseId,
      playlistSongsCollectionId,
      [
        Query.equal('playlist_id', playlistIds),
        Query.equal('song_id', songId),
        Query.limit(500),
      ],
    )

    const membership: Record<string, string> = {}
    response.documents.forEach((doc) => {
      const playlistId = (doc as any).playlist_id as string
      if (playlistId) {
        membership[playlistId] = doc.$id
      }
    })

    return membership
  }

  // ─── Fetch Single Playlist ───────────────────────────────────
  async function fetchPlaylist(playlistId: string) {
    try {
      const doc = await databases.getDocument(
        databaseId,
        playlistsCollectionId,
        playlistId,
      )
      currentPlaylist.value = doc as unknown as Playlist
      return doc
    } catch (error) {
      console.error('Failed to fetch playlist:', error)
      return null
    }
  }

  // ─── Fetch Songs in a Playlist ───────────────────────────────
  async function fetchPlaylistSongs(playlistId: string) {
    loading.value = true
    try {
      const response = await databases.listDocuments(
        databaseId,
        playlistSongsCollectionId,
        [
          Query.equal('playlist_id', playlistId),
          Query.orderAsc('position'),
          Query.limit(500),
        ],
      )

      const playlistSongDocs = response.documents as unknown as PlaylistSong[]

      // Fetch full song data for each entry
      const songsWithData: PlaylistSong[] = []
      for (const ps of playlistSongDocs) {
        try {
          const songDoc = await databases.getDocument(
            databaseId,
            songsCollectionId,
            ps.song_id,
          )
          songsWithData.push({
            ...ps,
            song: { docID: songDoc.$id, ...songDoc },
          })
        } catch {
          // Song may have been deleted — skip it
        }
      }

      currentPlaylistSongs.value = songsWithData
    } catch (error) {
      console.error('Failed to fetch playlist songs:', error)
    } finally {
      loading.value = false
    }
  }

  // ─── Create Playlist ─────────────────────────────────────────
  async function createPlaylist(data: { name: string; description?: string; cover_color?: string }) {
    const user = await account.get()

    const doc = await databases.createDocument(
      databaseId,
      playlistsCollectionId,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        uid: user.$id,
        display_name: user.name,
        cover_color: data.cover_color || randomCoverColor(),
        song_count: 0,
      },
    )

    const playlist = doc as unknown as Playlist
    userPlaylists.value.unshift(playlist)
    resetUserPlaylistSongLookup()
    return playlist
  }

  // ─── Update Playlist ─────────────────────────────────────────
  async function updatePlaylist(
    playlistId: string,
    data: { name?: string; description?: string; cover_color?: string },
  ) {
    const doc = await databases.updateDocument(
      databaseId,
      playlistsCollectionId,
      playlistId,
      data,
    )

    // Update local state
    const idx = userPlaylists.value.findIndex((p) => p.$id === playlistId)
    if (idx !== -1) {
      userPlaylists.value[idx] = { ...userPlaylists.value[idx], ...data } as Playlist
    }
    if (currentPlaylist.value?.$id === playlistId) {
      currentPlaylist.value = { ...currentPlaylist.value, ...data } as Playlist
    }

    return doc
  }

  // ─── Delete Playlist ─────────────────────────────────────────
  async function deletePlaylist(playlistId: string) {
    // First delete all playlist_songs entries
    try {
      const response = await databases.listDocuments(
        databaseId,
        playlistSongsCollectionId,
        [Query.equal('playlist_id', playlistId), Query.limit(500)],
      )
      for (const doc of response.documents) {
        await databases.deleteDocument(databaseId, playlistSongsCollectionId, doc.$id)
      }
    } catch {
      // Ignore cleanup errors
    }

    // Delete the playlist itself
    await databases.deleteDocument(databaseId, playlistsCollectionId, playlistId)

    // Update local state
    userPlaylists.value = userPlaylists.value.filter((p) => p.$id !== playlistId)
    if (currentPlaylist.value?.$id === playlistId) {
      currentPlaylist.value = null
      currentPlaylistSongs.value = []
    }
    resetUserPlaylistSongLookup()
  }

  // ─── Add Song to Playlist ────────────────────────────────────
  async function addSongToPlaylist(playlistId: string, songId: string) {
    // Check if already in playlist
    const existing = await databases.listDocuments(
      databaseId,
      playlistSongsCollectionId,
      [
        Query.equal('playlist_id', playlistId),
        Query.equal('song_id', songId),
        Query.limit(1),
      ],
    )

    if (existing.total > 0) {
      return null // Already exists
    }

    // Get current max position
    const posResponse = await databases.listDocuments(
      databaseId,
      playlistSongsCollectionId,
      [
        Query.equal('playlist_id', playlistId),
        Query.orderDesc('position'),
        Query.limit(1),
      ],
    )

    const nextPosition = posResponse.total > 0
      ? Math.trunc(Number((posResponse.documents[0] as any).position) + 1)
      : 0

    const doc = await databases.createDocument(
      databaseId,
      playlistSongsCollectionId,
      ID.unique(),
      {
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition,
        added_at: new Date().toISOString(),
      },
    )

    // Increment song_count on the playlist
    const playlist = userPlaylists.value.find((p) => p.$id === playlistId)
    if (playlist) {
      const newCount = (playlist.song_count || 0) + 1
      await databases.updateDocument(databaseId, playlistsCollectionId, playlistId, {
        song_count: newCount,
      })
      playlist.song_count = newCount
    }

    userPlaylistSongLookup.value = {
      ...userPlaylistSongLookup.value,
      [songId]: true,
    }
    userPlaylistSongLookupLoaded.value = true

    return doc
  }

  // ─── Remove Song from Playlist ───────────────────────────────
  async function removeSongFromPlaylist(playlistId: string, playlistSongDocId: string) {
    await databases.deleteDocument(databaseId, playlistSongsCollectionId, playlistSongDocId)

    // Remove from local state
    currentPlaylistSongs.value = currentPlaylistSongs.value.filter(
      (ps) => ps.$id !== playlistSongDocId,
    )

    // Decrement song_count
    const playlist = userPlaylists.value.find((p) => p.$id === playlistId)
    if (playlist && playlist.song_count > 0) {
      const newCount = playlist.song_count - 1
      await databases.updateDocument(databaseId, playlistsCollectionId, playlistId, {
        song_count: newCount,
      })
      playlist.song_count = newCount
    }
    if (currentPlaylist.value?.$id === playlistId && currentPlaylist.value.song_count > 0) {
      currentPlaylist.value.song_count -= 1
    }

    // This song may still exist in other playlists; mark lookup stale for safe re-checks.
    userPlaylistSongLookupLoaded.value = false
  }

  async function removeSongFromPlaylistBySongId(playlistId: string, songId: string) {
    const existing = await databases.listDocuments(
      databaseId,
      playlistSongsCollectionId,
      [
        Query.equal('playlist_id', playlistId),
        Query.equal('song_id', songId),
        Query.limit(1),
      ],
    )

    if (existing.total === 0) {
      return false
    }

    const playlistSongDocId = existing.documents[0].$id
    await removeSongFromPlaylist(playlistId, playlistSongDocId)
    return true
  }

  return {
    userPlaylists,
    currentPlaylist,
    currentPlaylistSongs,
    loading,
    userPlaylistSongLookup,
    userPlaylistSongLookupLoaded,
    fetchUserPlaylists,
    fetchPlaylist,
    fetchPlaylistSongs,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    removeSongFromPlaylistBySongId,
    refreshUserPlaylistSongLookup,
    checkSongInAnyUserPlaylist,
    getSongPlaylistMembership,
  }
})
