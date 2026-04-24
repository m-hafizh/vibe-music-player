import { Client, Databases, Storage } from 'node-appwrite';
import 'dotenv/config'

const client = new Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY || ''); // Needs API key? We can just use standard fetching if bucket is public

// We can just print the URLs from the app by reading the local DB? We don't have the node sdk. 
