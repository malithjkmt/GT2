import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration - hardcoded as requested
export const firebaseConfig = {
  apiKey: "AIzaSyDEMO_API_KEY_12345678901234567890",
  authDomain: "garbage-truck-tracker.firebaseapp.com",
  projectId: "garbage-truck-tracker",
  storageBucket: "garbage-truck-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef1234567890",
  databaseURL: "https://garbage-truck-tracker.firebaseio.com",
};

// Google Maps API Key - hardcoded
export const GOOGLE_MAPS_API_KEY = "AIzaSyDEMO_MAPS_API_KEY_1234567890";

// Firebase service instances
export const Auth = auth;
export const Firestore = firestore;
export const Storage = storage;
export const Messaging = messaging;

// Firestore collections
export const Collections = {
  ROUTES: 'routes',
  TRUCKS: 'trucks',
  DRIVERS: 'drivers',
  TOWNSPEOPLE: 'townspeople',
  ADMINS: 'admins',
  FEEDBACK: 'feedback',
  NOTIFICATIONS: 'notifications',
  MARKERS: 'markers',
  USERS: 'users',
};

export default {
  firebaseConfig,
  Auth,
  Firestore,
  Storage,
  Messaging,
  Collections,
  GOOGLE_MAPS_API_KEY,
};
