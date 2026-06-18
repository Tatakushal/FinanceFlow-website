import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function fetchRuntimeFirebaseConfig() {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.cloudSync?.enabled || !data?.firebase || typeof data.firebase !== 'object') {
      return null;
    }
    return data.firebase;
  } catch {
    return null;
  }
}

const firebaseConfig = await fetchRuntimeFirebaseConfig();

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const hasRequiredConfig = Boolean(firebaseConfig) && requiredKeys.every((key) => {
  const value = firebaseConfig?.[key];
  return typeof value === 'string' && value.trim().length > 0;
});

let auth = null;
let db = null;

if (hasRequiredConfig) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('[Firebase] Initialization failed. Running without cloud auth/sync.', err);
  }
} else {
  console.warn('[Firebase] Missing config. Running without cloud auth/sync.');
}

export { auth, db };
