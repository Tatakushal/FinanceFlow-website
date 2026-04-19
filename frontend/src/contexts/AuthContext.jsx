import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { loadUserData, saveUserData } from '../services/firestore';
import { freshData, saveData, logout, getData } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(auth));

  // Track whether an explicit sign-in/up/out already handled the state update
  // so the onAuthStateChanged listener skips re-loading on those events.
  const skipNext = useRef(false);

  useEffect(() => {
    if (!auth) {
      return () => {};
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (skipNext.current) {
        skipNext.current = false;
        setAuthLoading(false);
        return;
      }
      // Session restoration on page reload, or sign-out from another tab
      if (fbUser) {
        const email = (fbUser.email || '').toLowerCase();
        const name = fbUser.displayName || email.split('@')[0] || fbUser.uid;
        const fsData = await loadUserData(fbUser.uid);
        if (fsData) saveData(email, fsData);
        setUserState({ name, email, uid: fbUser.uid });
      } else {
        setUserState(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!auth) throw new Error('Authentication is unavailable. Firebase is not configured.');
    const e = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, e, password);
    const name = cred.user.displayName || e.split('@')[0];
    const uid = cred.user.uid;
    skipNext.current = true;
    // Sync Firestore → localStorage; upload local data if first cloud login
    const fsData = await loadUserData(uid);
    if (fsData) {
      saveData(e, fsData);
    } else {
      const local = getData(e);
      if (local) saveUserData(uid, local).catch(() => {});
    }
    const u = { name, email: e, uid };
    setUserState(u);
    setAuthLoading(false);
    return u;
  }, []);

  const signUp = useCallback(async ({ name, email, password, mobile }) => {
    if (!auth) throw new Error('Authentication is unavailable. Firebase is not configured.');
    const e = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, e, password);
    await updateProfile(cred.user, { displayName: name });
    const uid = cred.user.uid;
    skipNext.current = true;
    const newData = freshData(name, e, 0);
    if (mobile) newData.mobile = mobile;
    saveData(e, newData);
    await saveUserData(uid, newData);
    const u = { name, email: e, uid };
    setUserState(u);
    setAuthLoading(false);
    return u;
  }, []);

  const socialLogin = useCallback(async (provider) => {
    if (!auth) throw new Error('Social login is unavailable. Firebase is not configured.');
    if (provider !== 'Google') throw new Error('Apple sign-in is not yet supported.');
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const email = (cred.user.email || '').toLowerCase();
    const name = cred.user.displayName || email.split('@')[0] || cred.user.uid;
    const uid = cred.user.uid;
    skipNext.current = true;
    const fsData = await loadUserData(uid);
    if (fsData) {
      saveData(email, fsData);
    } else {
      const newData = freshData(name, email, 0);
      saveData(email, newData);
      await saveUserData(uid, newData);
    }
    const u = { name, email, uid };
    setUserState(u);
    setAuthLoading(false);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    skipNext.current = true;
    logout();
    if (!auth) {
      setUserState(null);
      setAuthLoading(false);
      return;
    }
    await firebaseSignOut(auth);
    setUserState(null);
    setAuthLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, signIn, signUp, socialLogin, signOut }),
    [user, authLoading, signIn, signUp, socialLogin, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
