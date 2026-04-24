import {
  Client, Account, Databases, Storage, Query, ID, Permission, Role,
} from 'appwrite';

const client = new Client();
client
  .setEndpoint(process.env.VUE_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.VUE_APP_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const databaseId = process.env.VUE_APP_APPWRITE_DATABASE_ID;
const usersCollectionId = process.env.VUE_APP_APPWRITE_USERS_COLLECTION_ID;
const songsCollectionId = process.env.VUE_APP_APPWRITE_SONGS_COLLECTION_ID;
const commentsCollectionId = process.env.VUE_APP_APPWRITE_COMMENTS_COLLECTION_ID;
const storageBucketId = process.env.VUE_APP_APPWRITE_BUCKET_ID;

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
  Query,
  ID,
  Permission,
  Role,
};
