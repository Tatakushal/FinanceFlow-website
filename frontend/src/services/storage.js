/**
 * FinanceFlow Storage Service
 * Mirrors the FF object from js/app.js, now as ES module functions.
 * All localStorage access is isolated per user: ff_data_<email>
 */

export const SCHEMA_VERSION = 2;

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
  const newTx = { ...tx, id: Date.now(), date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) };
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
