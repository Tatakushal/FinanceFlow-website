/**
 * FinanceFlow Storage Service
 * Mirrors the FF object from js/app.js, now as ES module functions.
 * All localStorage access is isolated per user: ff_data_<email>
 */

export const SCHEMA_VERSION = 3;

const LEVEL_TITLES = [
  'Finance Apprentice',
  'Budget Builder',
  'Savings Strategist',
  'Cashflow Captain',
  'Money Master',
  'Wealth Architect',
  'Legendary Investor',
];

export const DEFAULT_BUDGETS = [
  { cat: 'Food',     ico: '🍕', spent: 0, lim: 6000, clr: '#FF6B35' },
  { cat: 'Shopping', ico: '🛍️', spent: 0, lim: 8000, clr: '#3D7FFF' },
  { cat: 'Travel',   ico: '🚕', spent: 0, lim: 4000, clr: '#A855F7' },
  { cat: 'Health',   ico: '💊', spent: 0, lim: 5000, clr: '#00E5A0' },
  { cat: 'Leisure',  ico: '🎮', spent: 0, lim: 3000, clr: '#FFB800' },
  { cat: 'Bills',    ico: '💡', spent: 0, lim: 5000, clr: '#3D7FFF' },
];

export function freshData(name, email, income = 0) {
  return {
    _v: SCHEMA_VERSION,
    name: name || '',
    email: email || '',
    mobile: '',
    income: income || 0,
    txs: [],
    budgets: JSON.parse(JSON.stringify(DEFAULT_BUDGETS)),
    goals: [],
    subscriptions: [],
    wealth: { assets: [], liabilities: [] },
    notifications: {
      budget_exceeded: true,
      pct80: true,
      income_received: true,
      large_expense: true,
      recurring_due: true,
      daily_tip: true,
      weekly_summary: false,
      monthly_report: true,
    },
    security: { biometric: true, twofa: false, auto_lock: true, screenshot: false },
    appearance: { theme: 'dark', accent: '#00E5A0', currency: '₹ INR', language: 'English' },
    cloud: { enabled: true },
    gamification: { xp: 0, xpLog: [] },
    social: { friends: [], incomingRequests: [], outgoingRequests: [] },
  };
}

export function ensureDataShape(d) {
  if (!d || typeof d !== 'object') return null;
  if (!Array.isArray(d.txs)) d.txs = [];
  if (!Array.isArray(d.budgets)) d.budgets = [];
  if (!Array.isArray(d.goals)) d.goals = [];
  if (!Array.isArray(d.subscriptions)) d.subscriptions = [];
  if (!d.wealth || typeof d.wealth !== 'object') d.wealth = { assets: [], liabilities: [] };
  if (!Array.isArray(d.wealth.assets)) d.wealth.assets = [];
  if (!Array.isArray(d.wealth.liabilities)) d.wealth.liabilities = [];
  if (!d.appearance || typeof d.appearance !== 'object') {
    d.appearance = { theme: 'dark', accent: '#00E5A0', currency: '₹ INR', language: 'English' };
  }
  if (typeof d.appearance.currency !== 'string' || !d.appearance.currency.trim()) {
    d.appearance.currency = '₹ INR';
  }
  if (!d.notifications || typeof d.notifications !== 'object') {
    d.notifications = {
      budget_exceeded: true, pct80: true, income_received: true,
      large_expense: true, recurring_due: true, daily_tip: true,
      weekly_summary: false, monthly_report: true,
    };
  }
  if (!d.security || typeof d.security !== 'object') {
    d.security = { biometric: true, twofa: false, auto_lock: true, screenshot: false };
  }
  if (!d.cloud || typeof d.cloud !== 'object') d.cloud = { enabled: true };
  if (!d.gamification || typeof d.gamification !== 'object') d.gamification = { xp: 0, xpLog: [] };
  if (!Number.isFinite(Number(d.gamification.xp)) || Number(d.gamification.xp) < 0) d.gamification.xp = 0;
  if (!Array.isArray(d.gamification.xpLog)) d.gamification.xpLog = [];
  if (!d.social || typeof d.social !== 'object') d.social = { friends: [], incomingRequests: [], outgoingRequests: [] };
  if (!Array.isArray(d.social.friends)) d.social.friends = [];
  if (!Array.isArray(d.social.incomingRequests)) d.social.incomingRequests = [];
  if (!Array.isArray(d.social.outgoingRequests)) d.social.outgoingRequests = [];
  d._v = SCHEMA_VERSION;
  return d;
}

function dataKey(email) {
  const e = String(email || '').trim().toLowerCase();
  return e ? `ff_data_${e}` : 'ff_data';
}

function authKey(email) {
  const e = String(email || '').trim().toLowerCase();
  return e ? `ff_auth_${e}` : 'ff_auth';
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('ff_user') || 'null');
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('ff_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('ff_user');
  }
}

export function isLoggedIn() {
  return !!getUser();
}

export function getData(email) {
  const key = dataKey(email);
  const raw = localStorage.getItem(key);
  if (!raw) {
    const u = getUser();
    if (!u) return null;
    const d = freshData(u.name, u.email, 0);
    saveData(email, d);
    return d;
  }
  try {
    return ensureDataShape(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveData(email, data) {
  const safe = ensureDataShape(data);
  if (!safe) return;
  localStorage.setItem(dataKey(email), JSON.stringify(safe));
}

export function checkAccount(email) {
  if (!email) return false;
  return !!localStorage.getItem(dataKey(email));
}

export function getAccountData(email) {
  const raw = localStorage.getItem(dataKey(email));
  if (!raw) return null;
  try { return ensureDataShape(JSON.parse(raw)); } catch { return null; }
}

export function getAccountName(email) {
  const d = getAccountData(email);
  return String(d?.name || '').trim() || null;
}

// ─── AUTH ───

async function sha256Hex(input) {
  const text = String(input ?? '');
  try {
    if (globalThis.crypto?.subtle?.digest && globalThis.TextEncoder) {
      const bytes = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* fall through */ }
  // Non-crypto fallback (avoids plain-text storage)
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `fnv1a_${(h >>> 0).toString(16)}`;
}

export async function setPassword(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  if (!e || !p) return false;
  const hash = await sha256Hex(`${e}:${p}`);
  localStorage.setItem(authKey(e), hash);
  return true;
}

export function hasPassword(email) {
  return !!localStorage.getItem(authKey(String(email || '').trim().toLowerCase()));
}

export async function verifyPassword(email, password, { enrollIfMissing = false } = {}) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  if (!e || !p) return false;
  const stored = String(localStorage.getItem(authKey(e)) || '');
  if (!stored) {
    if (enrollIfMissing) { await setPassword(e, p); return true; }
    return true;
  }
  const hash = await sha256Hex(`${e}:${p}`);
  return hash === stored;
}

export function signup(name, email, income = 0) {
  const lowerEmail = String(email || '').trim().toLowerCase();
  if (!lowerEmail) throw new Error('Email is required.');
  if (checkAccount(lowerEmail)) throw new Error('Account already exists. Please sign in.');
  setUser({ name, email: lowerEmail });
  saveData(lowerEmail, freshData(name, lowerEmail, income));
}

export function login(name, email) {
  const lowerEmail = String(email || '').trim().toLowerCase();
  // Legacy key migration
  const legacy = localStorage.getItem('ff_data');
  if (legacy && !localStorage.getItem(dataKey(lowerEmail))) {
    localStorage.setItem(dataKey(lowerEmail), legacy);
    localStorage.removeItem('ff_data');
  }
  setUser({ name, email: lowerEmail });
  if (!getData(lowerEmail)) saveData(lowerEmail, freshData(name, lowerEmail, 0));
}

export function logout() {
  localStorage.removeItem('ff_user');
}

// ─── FINANCE HELPERS ───

export function getTotals(email) {
  const d = getData(email);
  if (!d) return { income: 0, spent: 0, saved: 0, rate: '0.0' };
  const income = d.txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amt, 0);
  const spent = d.txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amt, 0);
  const saved = income - spent;
  return { income, spent, saved, rate: income > 0 ? (saved / income * 100).toFixed(1) : '0.0' };
}

export function addTx(email, tx) {
  const d = getData(email);
  if (!d) return;
  const hasDate = tx?.date !== null && tx?.date !== undefined;
  const dateLabel = hasDate ? formatDateLabel(tx.date) : formatDateLabel(new Date());
  const newTx = { ...tx, id: Date.now(), date: dateLabel };
  const awardedXp = calculateTransactionXP(d, newTx);
  if (awardedXp > 0) {
    newTx.xp = awardedXp;
    applyXp(d, awardedXp, `Transaction: ${newTx.name || newTx.cat || 'Entry'}`);
  }
  d.txs.unshift(newTx);
  if (newTx.type === 'expense') {
    const b = d.budgets.find(b => b.cat === newTx.cat);
    if (b) b.spent += newTx.amt;
  }
  saveData(email, d);
  return newTx;
}

export function deleteTx(email, txId) {
  const d = getData(email);
  if (!d) return;
  const tx = d.txs.find(t => t.id === txId);
  if (tx?.type === 'expense') {
    const b = d.budgets.find(b => b.cat === tx.cat);
    if (b) b.spent = Math.max(0, b.spent - tx.amt);
  }
  d.txs = d.txs.filter(t => t.id !== txId);
  saveData(email, d);
}

export function getNetWorth(email) {
  const d = getData(email);
  if (!d) return { assets: 0, liabilities: 0, net: 0 };
  const assets = d.wealth.assets.reduce((sum, a) => sum + (Number(a?.value) || 0), 0);
  const liabilities = d.wealth.liabilities.reduce((sum, l) => {
    return sum + (Number(l?.outstandingAmount ?? l?.amount ?? 0) || 0);
  }, 0);
  return { assets, liabilities, net: assets - liabilities };
}

export function fmtCurrency(n, currency = '₹ INR') {
  const sym = (currency || '₹ INR').split(' ')[0];
  const abs = Math.abs(n);
  if (abs >= 100000) return sym + (abs / 100000).toFixed(1) + 'L';
  if (abs >= 1000) return sym + (abs / 1000).toFixed(1) + 'K';
  return sym + abs.toLocaleString('en-IN');
}

function calculateTransactionXP(data, tx) {
  const amount = Number(tx?.amt) || 0;
  const base = tx?.type === 'income' ? 14 : 10;
  const volumeBonus = Math.min(20, Math.floor(amount / 1000) * 2);
  let bonus = 0;

  if (tx?.type === 'expense') {
    const budget = (data?.budgets || []).find(b => b.cat === tx.cat);
    if (budget && (Number(budget.spent) + amount) <= Number(budget.lim || 0)) bonus += 8;
  }

  if (tx?.type === 'income') {
    const currentIncome = (data?.txs || []).filter(t => t.type === 'income').reduce((a, t) => a + (Number(t.amt) || 0), 0);
    const currentSpent = (data?.txs || []).filter(t => t.type === 'expense').reduce((a, t) => a + (Number(t.amt) || 0), 0);
    if ((currentIncome + amount - currentSpent) > 0) bonus += 6;
  }

  return Math.max(5, Math.round(base + volumeBonus + bonus));
}

function formatDateLabel(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function applyXp(data, amount, reason = 'Activity') {
  const gain = Math.max(0, Math.floor(Number(amount) || 0));
  if (!gain) return 0;
  const current = Number(data?.gamification?.xp || 0);
  if (!data.gamification || typeof data.gamification !== 'object') data.gamification = { xp: 0, xpLog: [] };
  if (!Array.isArray(data.gamification.xpLog)) data.gamification.xpLog = [];
  data.gamification.xp = current + gain;
  data.gamification.xpLog.unshift({
    id: Date.now(),
    amount: gain,
    reason,
    createdAt: new Date().toISOString(),
  });
  data.gamification.xpLog = data.gamification.xpLog.slice(0, 200);
  return gain;
}

export function awardXp(email, amount, reason = 'Bonus') {
  const d = getData(email);
  if (!d) return 0;
  const gained = applyXp(d, amount, reason);
  saveData(email, d);
  return gained;
}

export function getLevelInfo(xp = 0) {
  let totalXp = Math.max(0, Math.floor(Number(xp) || 0));
  let level = 1;
  let threshold = 120;

  while (totalXp >= threshold) {
    totalXp -= threshold;
    level += 1;
    threshold = Math.round(threshold * 1.22);
  }

  const progressPct = Math.max(0, Math.min(100, (totalXp / threshold) * 100));
  return {
    level,
    currentLevelXp: totalXp,
    nextLevelXp: threshold,
    xpToNextLevel: threshold - totalXp,
    progressPct,
  };
}

export function getLevelTitle(level = 1) {
  const numLevel = Number(level);
  if (!Number.isFinite(numLevel)) return LEVEL_TITLES[0];
  const idx = Math.max(0, Math.min(LEVEL_TITLES.length - 1, numLevel - 1));
  return LEVEL_TITLES[idx];
}

export function getUserGamification(email) {
  const d = getData(email);
  if (!d) return { xp: 0, level: 1, title: LEVEL_TITLES[0], currentLevelXp: 0, nextLevelXp: 120, xpToNextLevel: 120, progressPct: 0 };
  const xp = Number(d?.gamification?.xp || 0);
  const levelInfo = getLevelInfo(xp);
  return { xp, ...levelInfo, title: getLevelTitle(levelInfo.level) };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function userLiteByEmail(email) {
  const d = getAccountData(email);
  if (!d) return null;
  return { email: normalizeEmail(email), name: String(d?.name || '').trim() || normalizeEmail(email) };
}

export function sendFriendRequest(fromEmail, toEmailRaw) {
  const from = normalizeEmail(fromEmail);
  const to = normalizeEmail(toEmailRaw);
  if (!from || !to) throw new Error('Both email addresses are required.');
  if (from === to) throw new Error('You cannot send a friend request to yourself.');

  const fromData = getData(from);
  const targetAccount = getAccountData(to);
  if (!fromData || !targetAccount) throw new Error('Account not found for that email.');

  ensureDataShape(fromData);
  ensureDataShape(targetAccount);

  if (fromData.social.friends.some(f => normalizeEmail(f.email) === to)) throw new Error('Already connected.');
  if (fromData.social.outgoingRequests.some(f => normalizeEmail(f.email) === to)) throw new Error('Request already sent.');
  if (fromData.social.incomingRequests.some(f => normalizeEmail(f.email) === to)) throw new Error('This user has already requested you.');

  const fromLite = userLiteByEmail(from);
  const toLite = userLiteByEmail(to);
  if (!fromLite || !toLite) throw new Error('Unable to load account data.');

  fromData.social.outgoingRequests.unshift(toLite);
  targetAccount.social.incomingRequests.unshift(fromLite);

  saveData(from, fromData);
  saveData(to, targetAccount);
}

export function acceptFriendRequest(userEmail, fromEmailRaw) {
  const user = normalizeEmail(userEmail);
  const from = normalizeEmail(fromEmailRaw);
  const userData = getData(user);
  const fromData = getAccountData(from);
  if (!userData || !fromData) throw new Error('Account not found.');

  ensureDataShape(userData);
  ensureDataShape(fromData);

  const incoming = userData.social.incomingRequests.find(r => normalizeEmail(r.email) === from);
  if (!incoming) throw new Error('Friend request not found.');

  const userLite = userLiteByEmail(user);
  const fromLite = userLiteByEmail(from);
  if (!userLite || !fromLite) throw new Error('Unable to load account data.');

  userData.social.incomingRequests = userData.social.incomingRequests.filter(r => normalizeEmail(r.email) !== from);
  fromData.social.outgoingRequests = fromData.social.outgoingRequests.filter(r => normalizeEmail(r.email) !== user);

  if (!userData.social.friends.some(f => normalizeEmail(f.email) === from)) userData.social.friends.unshift(fromLite);
  if (!fromData.social.friends.some(f => normalizeEmail(f.email) === user)) fromData.social.friends.unshift(userLite);

  saveData(user, userData);
  saveData(from, fromData);
}

export function rejectFriendRequest(userEmail, fromEmailRaw) {
  const user = normalizeEmail(userEmail);
  const from = normalizeEmail(fromEmailRaw);
  const userData = getData(user);
  const fromData = getAccountData(from);
  if (!userData || !fromData) throw new Error('Account not found.');

  ensureDataShape(userData);
  ensureDataShape(fromData);

  userData.social.incomingRequests = userData.social.incomingRequests.filter(r => normalizeEmail(r.email) !== from);
  fromData.social.outgoingRequests = fromData.social.outgoingRequests.filter(r => normalizeEmail(r.email) !== user);

  saveData(user, userData);
  saveData(from, fromData);
}

export function getFriendsLeaderboard(email) {
  const userEmail = normalizeEmail(email);
  const d = getData(userEmail);
  if (!d) return [];
  ensureDataShape(d);

  const currentUser = { email: userEmail, name: d.name || userEmail, isYou: true };
  const participants = [currentUser, ...(d.social.friends || []).map(f => ({ ...f, isYou: false }))];

  const unique = [];
  const seen = new Set();
  participants.forEach(p => {
    const e = normalizeEmail(p.email);
    if (!e || seen.has(e)) return;
    seen.add(e);
    unique.push({ ...p, email: e });
  });

  return unique.map(p => {
    const account = getAccountData(p.email);
    const xp = Number(account?.gamification?.xp || 0);
    const levelInfo = getLevelInfo(xp);
    return {
      ...p,
      name: String(account?.name || p.name || p.email),
      xp,
      level: levelInfo.level,
      title: getLevelTitle(levelInfo.level),
    };
  }).sort((a, b) => b.xp - a.xp).map((row, idx) => ({ ...row, rank: idx + 1 }));
}
