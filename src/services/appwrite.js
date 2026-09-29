// This file sets up the Appwrite client and exports ready-to-use service
// instances. Nothing outside src/services/ should import 'appwrite'
// directly — that keeps the SDK isolated to one layer of the app.
//
// TODO: once you have an Appwrite project, install the SDK:
//   npm install appwrite
// then uncomment the real client below and delete the placeholder.

// import { Client, Account, Databases, Storage } from 'appwrite'
//
// const client = new Client()
//   .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
//   .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
//
// export const account = new Account(client)
// export const databases = new Databases(client)
// export const storage = new Storage(client)
// export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID

export const APPWRITE_NOT_CONFIGURED = true
