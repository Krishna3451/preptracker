import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firebase with persistence - immediately invoked function expression (IIFE)
(async () => {
  try {
    // Set persistence to LOCAL (survives browser restarts)
    await setPersistence(auth, browserLocalPersistence);
    console.log('Firebase persistence set to LOCAL');
    
    // Force refresh the token to ensure it's valid
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.getIdToken(true);
      console.log('User token refreshed during initialization');
    }

    // Initialize auth state listener
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Refresh token on auth state change
        await user.getIdToken(true);
        console.log('User authenticated and token refreshed');
      } else {
        console.log('User is signed out');
      }
    });
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
})();
