import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, push, onDisconnect, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let database;

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    return { success: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { success: false, error };
  }
};

export const getDb = () => database;

export { ref, set, onValue, remove, push, onDisconnect, get };
