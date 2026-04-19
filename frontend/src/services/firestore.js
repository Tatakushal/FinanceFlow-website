import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ensureDataShape } from './storage';

/**
 * Load user data document from Firestore.
 * Returns the shaped data object, or null if the document doesn't exist.
 */
export async function loadUserData(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return ensureDataShape(snap.data());
  } catch (err) {
    console.error('[Firestore] load error:', err);
    return null;
  }
}

/**
 * Persist user data document to Firestore (fire-and-forget safe).
 */
export async function saveUserData(uid, data) {
  if (!uid || !data) return;
  try {
    const safe = ensureDataShape(data);
    if (safe) await setDoc(doc(db, 'users', uid), safe);
  } catch (err) {
    console.error('[Firestore] save error:', err);
  }
}
