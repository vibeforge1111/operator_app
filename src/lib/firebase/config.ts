/**
 * Firebase Configuration
 *
 * This file contains the Firebase app configuration and initialization.
 * Environment variables are used to keep credentials secure.
 *
 * @fileoverview Firebase setup and configuration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration object
// These should be moved to environment variables in production
const firebaseConfig = {
  // For demo purposes, we'll use placeholder values
  // In production, these should come from environment variables
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

// Development mode: Connect to emulators
if (import.meta.env.DEV && !import.meta.env.VITE_USE_FIREBASE_PROD) {
  try {
    // Only connect to emulators if not already connected
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(functions, 'localhost', 5001);

    console.log('🔥 Connected to Firebase emulators for development');
  } catch (error) {
    // Emulators already connected or not available
    console.log('⚠️ Firebase emulators not available, using production');
  }
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