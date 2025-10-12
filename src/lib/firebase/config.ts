/**
 * Firebase Configuration
 *
 * This file contains the Firebase app configuration and initialization.
 * Environment variables are used to keep credentials secure.
 *
 * @fileoverview Firebase setup and configuration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Check if we should use mock data mode
export const USE_MOCK_DATA = import.meta.env.VITE_USE_FIREBASE_PROD === 'false' ||
                             import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

// Firebase configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "operator-network-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "operator-network-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "operator-network-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "demo-measurement-id"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Handle connection based on configuration
if (USE_MOCK_DATA) {
  console.log('🎭 Running in MOCK DATA mode - Firebase connection disabled');
  console.log('💡 To use Firebase, set VITE_USE_FIREBASE_PROD=true and provide real credentials in .env');

  // Disable network to prevent connection attempts
  disableNetwork(db).catch(() => {
    // Ignore errors if already disabled
  });
} else {
  // Development mode: Try to connect to emulators
  if (import.meta.env.DEV) {
    try {
      // Check if emulators are already connected
      const isEmulatorConnected = (db as any)._settings?.host?.includes('localhost');

      if (!isEmulatorConnected) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('🔥 Connected to Firebase emulators for development');
      }
    } catch (error) {
      console.log('⚠️ Firebase emulators not available, using production');
    }
  }

  // Enable network for Firebase connection
  enableNetwork(db).catch(() => {
    console.warn('⚠️ Could not connect to Firebase. Check your internet connection.');
  });
}

// Export configuration for debugging
export const config = firebaseConfig;

/**
 * Check if Firebase is properly configured
 * @returns {boolean} True if Firebase is configured with real credentials
 */
export function isFirebaseConfigured(): boolean {
  return !firebaseConfig.apiKey.includes('demo') &&
         !firebaseConfig.projectId.includes('demo');
}

/**
 * Get the current Firebase project ID
 * @returns {string} The project ID
 */
export function getProjectId(): string {
  return firebaseConfig.projectId;
}