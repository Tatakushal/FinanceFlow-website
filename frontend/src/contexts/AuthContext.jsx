import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  getUser, setUser, login, logout, signup,
  setPassword, verifyPassword, checkAccount,
  getAccountName, getData, freshData,
} from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());

  const signIn = useCallback(async (email, password) => {
    const e = email.trim().toLowerCase();
    if (!checkAccount(e)) throw new Error('No account found. Create one first.');
    const ok = await verifyPassword(e, password, { enrollIfMissing: true });
    if (!ok) throw new Error('Incorrect password.');
    const name = getAccountName(e) || e.split('@')[0];
    login(name, e);
    setUserState({ name, email: e });
    return { name, email: e };
  }, []);

  const signUp = useCallback(async ({ name, email, password, mobile }) => {
    const e = email.trim().toLowerCase();
    if (checkAccount(e)) throw new Error('Account already exists. Please sign in.');
    signup(name, e, 0);
    // Persist mobile if provided
    if (mobile) {
      const { saveData } = await import('../services/storage');
      const d = getData(e);
      if (d) {
        d.mobile = mobile;
        saveData(e, d);
      }
    }
    await setPassword(e, password);
    setUserState({ name, email: e });
    return { name, email: e };
  }, []);

  const socialLogin = useCallback((provider) => {
    const name = 'Demo User';
    const email = 'demo@financeflow.app';
    login(name, email);
    setUserState({ name, email });
    return { name, email };
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUserState(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signUp, socialLogin, signOut }), [user, signIn, signUp, socialLogin, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
