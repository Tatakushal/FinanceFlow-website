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
import {
  freshData,
  saveData,
  logout,
  getData,
  getUser,
  signup as localSignup,
  login as localLogin,
  setPassword,
  verifyPassword,
  getAccountName,
} from '../services/storage';

const AuthContext = createContext(null);
const INITIAL_INCOME = 0;
const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_LIMIT_STORAGE_KEY = 'ff_auth_rate_limit_v1';

class AuthRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthRateLimitError';
  }
}

function readRateLimitState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(AUTH_RATE_LIMIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRateLimitState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUTH_RATE_LIMIT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

function getAuthRateKey(action, identity = '') {
  return `${action}:${String(identity || '').trim().toLowerCase() || 'default'}`;
}

function cleanupRateLimitState(state, now) {
  const next = {};
  for (const [key, value] of Object.entries(state)) {
    if (!value || typeof value !== 'object') continue;
    if (Number(value.resetAt) > now) next[key] = value;
  }
  return next;
}

function ensureAuthNotRateLimited(action, identity) {
  const now = Date.now();
  const key = getAuthRateKey(action, identity);
  const cleaned = cleanupRateLimitState(readRateLimitState(), now);
  const current = cleaned[key];
  writeRateLimitState(cleaned);

  if (!current || current.count < AUTH_RATE_LIMIT_MAX_ATTEMPTS) return;

  const retryMs = Math.max(1, current.resetAt - now);
  const retryMin = Math.ceil(retryMs / 60000);
  throw new AuthRateLimitError(`Too many attempts. Try again in ${retryMin} minute(s).`);
}

function registerAuthFailedAttempt(action, identity) {
  const now = Date.now();
  const key = getAuthRateKey(action, identity);
  const cleaned = cleanupRateLimitState(readRateLimitState(), now);
  const current = cleaned[key];
  if (!current) {
    cleaned[key] = { count: 1, resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS };
    writeRateLimitState(cleaned);
    return;
  }
  current.count += 1;
  cleaned[key] = current;
  writeRateLimitState(cleaned);
}

function clearAuthRateLimit(action, identity) {
  const now = Date.now();
  const key = getAuthRateKey(action, identity);
  const cleaned = cleanupRateLimitState(readRateLimitState(), now);
  if (!(key in cleaned)) {
    writeRateLimitState(cleaned);
    return;
  }
  delete cleaned[key];
  writeRateLimitState(cleaned);
}

function sanitizeTextInput(value, { maxLength, fieldName }) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${fieldName} is required.`);
  if (text.length > maxLength) throw new Error(`${fieldName} is too long.`);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    const isInvalidControl = (code >= 0 && code <= 31 && code !== 9 && code !== 10 && code !== 13) || code === 127;
    if (isInvalidControl) throw new Error(`${fieldName} contains invalid characters.`);
  }
  return text;
}

function sanitizeEmail(value) {
  const email = sanitizeTextInput(value, { maxLength: 254, fieldName: 'Email' }).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) throw new Error('Enter a valid email.');
  return email;
}

function sanitizePassword(value) {
  const password = String(value ?? '');
  if (!password.trim()) throw new Error('Password is required.');
  for (let i = 0; i < password.length; i += 1) {
    const code = password.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) {
      throw new Error('Password contains invalid characters.');
    }
  }
  if (password.length < 6) throw new Error('Password needs at least 6 characters.');
  if (password.length > 128) throw new Error('Password is too long.');
  return password;
}

function sanitizeName(value) {
  const name = sanitizeTextInput(value, { maxLength: 80, fieldName: 'Name' }).replace(/\s+/g, ' ');
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .,'-]*$/u.test(name)) {
    throw new Error('Name contains invalid characters.');
  }
  return name;
}

function sanitizeMobile(value) {
  const mobile = String(value ?? '').trim();
  if (!mobile) return '';
  if (mobile.length > 20) throw new Error('Mobile number is too long.');
  if (!/^\+?[0-9()\-\s]{7,20}$/.test(mobile)) throw new Error('Enter a valid mobile number.');
  return mobile;
}

function getInitialLocalUser() {
  if (auth) return null;
  const localUser = getUser();
  if (!localUser?.email) return null;
  const email = String(localUser.email).trim().toLowerCase();
  const name = String(localUser.name || '').trim() || email.split('@')[0];
  return { name, email };
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getInitialLocalUser());
  const [authLoading, setAuthLoading] = useState(() => Boolean(auth));

  // Track whether an explicit sign-in/up/out already handled the state update
  // so the onAuthStateChanged listener skips re-loading on those events.
  const skipNext = useRef(false);

  useEffect(() => {
    if (!auth) {
      return;
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
    const e = sanitizeEmail(email);
    const safePassword = sanitizePassword(password);
    ensureAuthNotRateLimited('signin', e);
    try {
      if (!auth) {
        const name = getAccountName(e);
        if (!name) throw new Error('Invalid email or password.');
        const ok = await verifyPassword(e, safePassword, { enrollIfMissing: false });
        if (!ok) throw new Error('Invalid email or password.');
        localLogin(name, e);
        const u = { name, email: e };
        setUserState(u);
        setAuthLoading(false);
        clearAuthRateLimit('signin', e);
        return u;
      }
      const cred = await signInWithEmailAndPassword(auth, e, safePassword);
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
      clearAuthRateLimit('signin', e);
      return u;
    } catch (err) {
      if (!(err instanceof AuthRateLimitError)) {
        registerAuthFailedAttempt('signin', e);
      }
      throw err;
    }
  }, []);

  const signUp = useCallback(async ({ name, email, password, mobile }) => {
    const safeName = sanitizeName(name);
    const e = sanitizeEmail(email);
    const safePassword = sanitizePassword(password);
    const safeMobile = sanitizeMobile(mobile);
    ensureAuthNotRateLimited('signup', e);
    try {
      if (!auth) {
        localSignup(safeName, e, INITIAL_INCOME);
        await setPassword(e, safePassword);
        if (safeMobile) {
          const localData = getData(e);
          if (localData) {
            localData.mobile = safeMobile;
            saveData(e, localData);
          }
        }
        const u = { name: safeName, email: e };
        setUserState(u);
        setAuthLoading(false);
        clearAuthRateLimit('signup', e);
        return u;
      }
      const cred = await createUserWithEmailAndPassword(auth, e, safePassword);
      await updateProfile(cred.user, { displayName: safeName });
      const uid = cred.user.uid;
      skipNext.current = true;
      const newData = freshData(safeName, e, INITIAL_INCOME);
      if (safeMobile) newData.mobile = safeMobile;
      saveData(e, newData);
      await saveUserData(uid, newData);
      const u = { name: safeName, email: e, uid };
      setUserState(u);
      setAuthLoading(false);
      clearAuthRateLimit('signup', e);
      return u;
    } catch (err) {
      if (!(err instanceof AuthRateLimitError)) {
        registerAuthFailedAttempt('signup', e);
      }
      throw err;
    }
  }, []);

  const socialLogin = useCallback(async (provider) => {
    const providerLabel = String(provider || '').trim();
    if (providerLabel.length > 20) throw new Error('Invalid sign-in provider.');
    const providerKey = providerLabel.toLowerCase() || 'social';
    ensureAuthNotRateLimited('signin', providerKey);
    try {
      if (!auth) throw new Error('Social login is currently unavailable. Please try again later.');
      if (providerLabel !== 'Google') throw new Error('Apple sign-in is not yet supported.');
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
      clearAuthRateLimit('signin', providerKey);
      return u;
    } catch (err) {
      if (!(err instanceof AuthRateLimitError)) {
        registerAuthFailedAttempt('signin', providerKey);
      }
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    skipNext.current = true;
    logout();
    if (auth) {
      await firebaseSignOut(auth);
    }
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
