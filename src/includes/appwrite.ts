import {
  Client, Account, Databases, Storage, Query, ID, Permission, Role,
} from 'appwrite'

const client = new Client()
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string)

const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

const databaseId: string = import.meta.env.VITE_APPWRITE_DATABASE_ID
const usersCollectionId: string = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID
const songsCollectionId: string = import.meta.env.VITE_APPWRITE_SONGS_COLLECTION_ID
const commentsCollectionId: string = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID
const storageBucketId: string = import.meta.env.VITE_APPWRITE_BUCKET_ID
const playlistsCollectionId: string = import.meta.env.VITE_APPWRITE_PLAYLISTS_COLLECTION_ID
const playlistSongsCollectionId: string = import.meta.env.VITE_APPWRITE_PLAYLIST_SONGS_COLLECTION_ID

export {
  client,
  account,
  databases,
  storage,
  databaseId,
  usersCollectionId,
  songsCollectionId,
  commentsCollectionId,
  storageBucketId,
  playlistsCollectionId,
  playlistSongsCollectionId,
  Query,
  ID,
  Permission,
  Role,
}
