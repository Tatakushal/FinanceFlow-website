import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  getData, saveData, addTx, deleteTx, getTotals, getNetWorth, fmtCurrency,
  getUserGamification, getFriendsLeaderboard, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, awardXp,
} from '../services/storage';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);
const FRIEND_ACCEPT_XP = 20;

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [rev, setRev] = useState(0);

  // Load/reload data whenever the logged-in user changes
  useEffect(() => {
    if (user?.email) {
      setData(getData(user.email));
    } else {
      setData(null);
    }
  }, [user, rev]);

  const refresh = useCallback(() => setRev(r => r + 1), []);

  const save = useCallback((updated) => {
    if (!user?.email) return;
    saveData(user.email, updated);
    setData({ ...updated });
  }, [user]);

  const doAddTx = useCallback((tx) => {
    if (!user?.email) return;
    const addedTx = addTx(user.email, tx);
    refresh();
    return addedTx;
  }, [user, refresh]);

  const doDeleteTx = useCallback((txId) => {
    if (!user?.email) return;
    deleteTx(user.email, txId);
    refresh();
  }, [user, refresh]);

  const totals = useMemo(() => {
    if (!user?.email) return { income: 0, spent: 0, saved: 0, rate: '0.0' };
    return getTotals(user.email);
  }, [user, data]);  // eslint-disable-line react-hooks/exhaustive-deps

  const netWorth = useMemo(() => {
    if (!user?.email) return { assets: 0, liabilities: 0, net: 0 };
    return getNetWorth(user.email);
  }, [user, data]);  // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = useCallback((n) => {
    const currency = data?.appearance?.currency || '₹ INR';
    return fmtCurrency(n, currency);
  }, [data]);

  const gamification = useMemo(() => {
    if (!user?.email) return getUserGamification();
    return getUserGamification(user.email);
  }, [user, data]);  // eslint-disable-line react-hooks/exhaustive-deps

  const leaderboard = useMemo(() => {
    if (!user?.email) return [];
    return getFriendsLeaderboard(user.email);
  }, [user, data]);  // eslint-disable-line react-hooks/exhaustive-deps

  const doSendFriendRequest = useCallback((toEmail) => {
    if (!user?.email) return;
    sendFriendRequest(user.email, toEmail);
    refresh();
  }, [user, refresh]);

  const doAcceptFriendRequest = useCallback((fromEmail) => {
    if (!user?.email) return;
    acceptFriendRequest(user.email, fromEmail);
    const gained = awardXp(user.email, FRIEND_ACCEPT_XP, 'Friend request accepted');
    refresh();
    return gained;
  }, [user, refresh]);

  const doRejectFriendRequest = useCallback((fromEmail) => {
    if (!user?.email) return;
    rejectFriendRequest(user.email, fromEmail);
    refresh();
  }, [user, refresh]);

  const doAwardXp = useCallback((amount, reason) => {
    if (!user?.email) return 0;
    const gained = awardXp(user.email, amount, reason);
    refresh();
    return gained;
  }, [user, refresh]);

  const value = useMemo(() => ({
    data, save, refresh, totals, netWorth, fmt, doAddTx, doDeleteTx,
    gamification, leaderboard, doSendFriendRequest, doAcceptFriendRequest, doRejectFriendRequest, doAwardXp,
  }), [
    data, save, refresh, totals, netWorth, fmt, doAddTx, doDeleteTx,
    gamification, leaderboard, doSendFriendRequest, doAcceptFriendRequest, doRejectFriendRequest, doAwardXp,
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider');
  return ctx;
}
