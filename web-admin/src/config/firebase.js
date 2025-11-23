import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration - hardcoded as requested
const firebaseConfig = {
  apiKey: "AIzaSyDEMO_API_KEY_12345678901234567890",
  authDomain: "garbage-truck-tracker.firebaseapp.com",
  projectId: "garbage-truck-tracker",
  storageBucket: "garbage-truck-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  databaseURL: "https://garbage-truck-tracker.firebaseio.com",
};

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = "AIzaSyDEMO_MAPS_API_KEY_1234567890";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collections
export const COLLECTIONS = {
  ROUTES: 'routes',
  TRUCKS: 'trucks',
  DRIVERS: 'drivers',
  TOWNSPEOPLE: 'townspeople',
  USERS: 'users',
  FEEDBACK: 'feedback',
  NOTIFICATIONS: 'notifications',
};

export default app;
