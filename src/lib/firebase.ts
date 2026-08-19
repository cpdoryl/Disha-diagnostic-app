import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);

// TEMP (local verification only, not for commit): route to the local emulator
// suite instead of production when VITE_USE_EMULATOR=1 is set.
const useEmulator = import.meta.env.VITE_USE_EMULATOR === '1';

// Initialize Firestore with the specific database ID
export const db = getFirestore(app, useEmulator ? '(default)' : config.firestoreDatabaseId);
export const auth = getAuth(app);

if (useEmulator) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
