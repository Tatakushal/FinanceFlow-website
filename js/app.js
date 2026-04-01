// ─── FINANCE FLOW – STATE & UTILITIES ───

const FF = {
  // Fresh blank data for a new user – NO sample transactions
  freshData(name, email, income) {
    return {
      name: name || '',
      email: email || '',
      mobile: '',
      income: income || 0,
      txs: [],
      budgets: [
        {cat:'Food',      ico:'&#x1F355;', spent:0, lim:6000,  clr:'#FF6B35'},
        {cat:'Shopping',  ico:'&#x1F6CD;', spent:0, lim:8000,  clr:'#3D7FFF'},
        {cat:'Travel',    ico:'&#x1F695;', spent:0, lim:4000,  clr:'#A855F7'},
        {cat:'Health',    ico:'&#x1F48A;', spent:0, lim:5000,  clr:'#00E5A0'},
        {cat:'Leisure',   ico:'&#x1F3AE;', spent:0, lim:3000,  clr:'#FFB800'},
        {cat:'Bills',     ico:'&#x1F4A1;', spent:0, lim:5000,  clr:'#3D7FFF'},
      ],
      goals: [],
      subscriptions: [],
      wealth: { assets: [], liabilities: [] },
      notifications: {budget_exceeded:true,pct80:true,income_received:true,large_expense:true,recurring_due:true,daily_tip:true,weekly_summary:false,monthly_report:true},
      security: {biometric:true,twofa:false,auto_lock:true,screenshot:false},
      appearance: {theme:'dark',accent:'#00E5A0',currency:'\u20B9 INR',language:'English'},
    };
  },

  ensureDataShape(d) {
    if (!d || typeof d !== 'object') return null;
    if (!Array.isArray(d.txs)) d.txs = [];
    if (!Array.isArray(d.budgets)) d.budgets = [];
    if (!Array.isArray(d.goals)) d.goals = [];
    if (!Array.isArray(d.subscriptions)) d.subscriptions = [];
    if (!d.wealth || typeof d.wealth !== 'object') d.wealth = { assets: [], liabilities: [] };
    if (!Array.isArray(d.wealth.assets)) d.wealth.assets = [];
    if (!Array.isArray(d.wealth.liabilities)) d.wealth.liabilities = [];
    if (!d.appearance || typeof d.appearance !== 'object') {
      d.appearance = { theme:'dark', accent:'#00E5A0', currency:'\u20B9 INR', language:'English' };
    }
    if (typeof d.appearance.currency !== 'string' || !d.appearance.currency.trim()) {
      d.appearance.currency = '\u20B9 INR';
    }
    // Auto-repair older mojibake currency text saved in localStorage.
    if (d.appearance.currency.includes('\u00e2\u0082\u00b9')) {
      d.appearance.currency = '\u20B9 INR';
    }
    // Migrate old native-script language names to ASCII keys
    const _lm = {
      '\u0939\u093F\u0928\u094D\u0926\u0940': 'Hindi',
      '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD': 'Tamil',
      '\u09AC\u09BE\u0982\u09B2\u09BE': 'Bengali',
      '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41': 'Telugu',
      '\u092E\u0930\u093E\u0920\u0940': 'Marathi'
    };
    if (d.appearance.language && _lm[d.appearance.language]) {
      d.appearance.language = _lm[d.appearance.language];
    }
    return d;
  },

  getDataKey() {
    const u = this.getUser();
    return u?.email ? `ff_data_${u.email.toLowerCase()}` : 'ff_data';
  },

  get data() {
    const key = this.getDataKey();
    const s = localStorage.getItem(key);
    if (!s) {
  const u = this.getUser();
  if (!u) return null;

  const fresh = this.freshData(u.name, u.email, 0);
  this.save(fresh);
  return fresh;
}
    try {
      return this.ensureDataShape(JSON.parse(s));
    } catch (_err) {
      return null;
    }
  },

  save(d) {
    const safe = this.ensureDataShape(d);
    if (!safe) return;
    const key = this.getDataKey();
    localStorage.setItem(key, JSON.stringify(safe));
  },

  isLoggedIn() { return !!this.getUser(); },

  // Called on signup – wipes everything and starts fresh for this user
  signup(name, email, income) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    if (!lowerEmail) throw new Error("Email is required.");

    const key = `ff_data_${lowerEmail}`;
    if (localStorage.getItem(key)) {
      throw new Error("An account with this email already exists. Please sign in.");
    }

    localStorage.setItem("ff_user", JSON.stringify({ name, email }));
    const d = this.freshData(name, email, income);
    this.save(d);
  },

  // Called on sign in – uses existing data or creates fresh
  login(name, email) {
    const lowerEmail = email.toLowerCase();
    const newKey = `ff_data_${lowerEmail}`;
    
    // Migration: If legacy 'ff_data' exists but user-specific doesn't, migrate it.
    const legacy = localStorage.getItem('ff_data');
    if (legacy && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, legacy);
        // Clear legacy once migrated to avoid confusion
        localStorage.removeItem('ff_data');
    }
    
    localStorage.setItem('ff_user', JSON.stringify({name, email}));
    if (!this.data) {
      this.save(this.freshData(name, email, 0));
    }
  },

  authKey(email) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    return lowerEmail ? `ff_auth_${lowerEmail}` : "ff_auth";
  },

  async _sha256Hex(input) {
    const text = String(input ?? "");

    // Prefer Web Crypto when available (secure contexts like https/localhost)
    try {
      if (globalThis.crypto?.subtle?.digest && globalThis.TextEncoder) {
        const bytes = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest("SHA-256", bytes);
        return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (_err) {
      // fall through to non-crypto fallback
    }

    // Fallback (not cryptographically secure, but avoids plain-text storage)
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return `fnv1a_${(h >>> 0).toString(16)}`;
  },

  async setPassword(email, password) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    const pass = String(password || "");
    if (!lowerEmail || !pass) return false;

    const hash = await this._sha256Hex(`${lowerEmail}:${pass}`);
    localStorage.setItem(this.authKey(lowerEmail), hash);
    return true;
  },

  hasPassword(email) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    if (!lowerEmail) return false;
    return !!localStorage.getItem(this.authKey(lowerEmail));
  },

  async verifyPassword(email, password, { enrollIfMissing = false } = {}) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    const pass = String(password || "");
    if (!lowerEmail || !pass) return false;

    const key = this.authKey(lowerEmail);
    const stored = String(localStorage.getItem(key) || "");
    if (!stored) {
      if (enrollIfMissing) {
        await this.setPassword(lowerEmail, pass);
        return true;
      }
      return true;
    }

    const hash = await this._sha256Hex(`${lowerEmail}:${pass}`);
    return hash === stored;
  },

  logout() {
    localStorage.removeItem('ff_user');
  },

  checkAccount(email) {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return !!localStorage.getItem(`ff_data_${lowerEmail}`);
  },

  getUser() {
    const u = localStorage.getItem('ff_user');
    if (!u) return null;
    try {
      return JSON.parse(u);
    } catch (_err) {
      return null;
    }
  },

  getAccountDataByEmail(email) {
    const lowerEmail = String(email || "").trim().toLowerCase();
    if (!lowerEmail) return null;

    const s = localStorage.getItem(`ff_data_${lowerEmail}`);
    if (!s) return null;
    try {
      return this.ensureDataShape(JSON.parse(s));
    } catch (_err) {
      return null;
    }
  },

  getAccountNameByEmail(email) {
    const d = this.getAccountDataByEmail(email);
    const name = String(d?.name || "").trim();
    return name || null;
  },

  addTx(tx) {
    const d = this.data;
    tx.id = Date.now();
    tx.date = 'Today';
    d.txs.unshift(tx);
    if (tx.type === 'expense') {
      const b = d.budgets.find(b => b.cat === tx.cat);
      if (b) b.spent += tx.amt;
    }
    this.save(d);
  },

  getTotals() {
    const d = this.data;
    if (!d) return {income:0, spent:0, saved:0, rate:'0.0'};
    const income = d.txs.filter(t => t.type === 'income').reduce((a,t) => a+t.amt, 0);
    const spent  = d.txs.filter(t => t.type === 'expense').reduce((a,t) => a+t.amt, 0);
    const saved  = income - spent;
    return {income, spent, saved, rate: income > 0 ? (saved/income*100).toFixed(1) : '0.0'};
  },

  fmt(n) {
    const d = this.data;
    const sym = (d?.appearance?.currency || '\u20B9 INR').split(' ')[0];
    if (n >= 100000) return sym + (n/100000).toFixed(1) + 'L';
    if (n >= 1000)   return sym + (n/1000).toFixed(1) + 'K';
    return sym + Math.abs(n).toLocaleString('en-IN');
  },

  getNetWorth() {
    const d = this.data;
    if (!d) return { assets: 0, liabilities: 0, net: 0 };
    const assets = d.wealth.assets.reduce((sum, item) => sum + (Number(item?.value) || 0), 0);
    const liabilities = d.wealth.liabilities.reduce((sum, item) => {
      const outstanding = Number(item?.outstandingAmount ?? item?.amount ?? 0) || 0;
      return sum + outstanding;
    }, 0);
    return { assets, liabilities, net: assets - liabilities };
  },

  toggleSidebar(open) {
    const b = document.body;
    const overlay = document.getElementById('sidebar-overlay');
    if (open === undefined) open = !b.classList.contains('sidebar-open');
    
    if (open) {
      b.classList.add('sidebar-open');
      if (overlay) overlay.classList.add('on');
    } else {
      b.classList.remove('sidebar-open');
      if (overlay) overlay.classList.remove('on');
    }
  }
};

// ─── TOAST ───
function toast(msg) {
  let t = document.getElementById('ff-toast');
  if (!t) { t = document.createElement('div'); t.id='ff-toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── BUILD SIDEBAR ───
function buildSidebar(active) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  // Setup Mobile Menu Button if not exists
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.classList.add('ff-has-sidebar');
    if (topbar.querySelector('.tb-title')) topbar.classList.add('ff-has-title');
  }

  if (topbar && !topbar.querySelector('.tb-menu')) {
    const menuBtn = document.createElement('div');
    menuBtn.className = 'tb-menu';
    menuBtn.innerHTML = '&#x2630;'; // Hamburger icon
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      FF.toggleSidebar();
    };
    topbar.prepend(menuBtn);
    
    // Setup Backdrop Overlay
    if (!document.getElementById('sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = () => FF.toggleSidebar(false);
      document.body.appendChild(overlay);
    }
  }

  const d = FF.data;
  const u = FF.getUser();
  const links = [
    {id:'home',    icon:'&#x1F3E0;', lbl:'Dashboard',    href:'dashboard.html'},
    {id:'tx',      icon:'&#x1F4B3;', lbl:'Transactions',  href:'transactions.html'},
    {id:'reports', icon:'&#x1F4CA;', lbl:'Reports',       href:'reports.html'},
    {id:'goals',   icon:'&#x1F3AF;', lbl:'Goals',         href:'goals.html'},
    {id:'subs',    icon:'&#x1F4F1;', lbl:'Subscriptions', href:'subscriptions.html'},
    {id:'wealth',  icon:'$',         lbl:'Wealth',         href:'wealth.html'},
    {id:'ai',      icon:'&#x1F916;', lbl:'FlowAI',        href:'ai-chat.html'},
  ];
  const settings = [
    {id:'profile', icon:'&#x2699;&#xFE0F;', lbl:'Settings', href:'settings.html'},
  ];
  el.innerHTML = `
    <div class="sidebar-section">Menu</div>
    ${links.map(l=>`<a href="${l.href}" class="s-link ${l.id===active?'active':''}"><span class="s-link-icon">${l.icon}</span><span data-translate="${l.lbl}">${FF.getTranslation(l.lbl)}</span></a>`).join('')}
    <div class="sidebar-section">Settings</div>
    ${settings.map(l=>`<a href="${l.href}" class="s-link ${l.id===active?'active':''}"><span class="s-link-icon">${l.icon}</span><span data-translate="${l.lbl}">${FF.getTranslation(l.lbl)}</span></a>`).join('')}
    <div class="sidebar-footer">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Signed in as<br><strong style="color:#fff;">${u?.name||''}</strong></div>
      <button onclick="FF.logout();location.href='../index.html';" style="width:100%;background:var(--warn-dim);border:1px solid rgba(255,107,53,.2);color:var(--warn);padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);">&#x1F6AA; Log Out</button>
    </div>`;

  // Close sidebar on link click (for mobile)
  el.querySelectorAll('.s-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 760) FF.toggleSidebar(false);
    });
  });
}

// ─── BUILD RINGS ───
function buildRings(id, budgets, href) {
  const el = document.getElementById(id); if (!el) return;
  el.innerHTML = budgets.map(b => {
    const p = b.lim > 0 ? Math.min(b.spent/b.lim, 1) : 0;
    const r = 36, c = 2*Math.PI*r, ov = b.spent > b.lim, col = ov ? '#FF6B35' : b.clr;
    return `<div class="ring-item" onclick="location.href='${href}'">
      <div style="position:relative;width:84px;height:84px;">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="9"/>
          <circle cx="42" cy="42" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-dasharray="${c*p} ${c}" stroke-linecap="round" transform="rotate(-90 42 42)"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;">${b.ico}</div>
      </div>
      <div class="ring-lbl">${b.cat}</div>
      <div class="ring-pct ${ov?'over':''}">${Math.round(p*100)}%</div>
    </div>`;
  }).join('');
}

// ─── BUILD TX LIST ───
function buildTxList(id, txs, limit) {
  const el = document.getElementById(id); if (!el) return;
  const list = limit ? txs.slice(0, limit) : txs;
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:15px;">No transactions yet \u2014 add your first one!</div>';
    return;
  }
  el.innerHTML = list.map(t => `
    <div class="tx-row">
      <div class="tx-ico" style="background:${t.clr}20;">${t.ico}</div>
      <div class="tx-info">
        <div class="tx-name">${t.name}</div>
        <div class="tx-meta">${t.cat} &middot; ${t.date}${t.pay?' &middot; '+t.pay:''}</div>
      </div>
      <div class="tx-amt ${t.type==='income'?'tx-pos':'tx-neg'}">${t.type==='income'?'+':'-'}${FF.fmt(t.amt)}</div>
    </div>`).join('');
}

// ─── THEME & APPEARANCE MANAGEMENT ───
FF.applyTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
};

FF.translations = {
  'English': {
    'Dashboard':'Dashboard','Transactions':'Transactions','Reports':'Reports','Goals':'Goals',
    'Subscriptions':'Subscriptions','Wealth':'Wealth','FlowAI':'FlowAI',
    'Profile':'Profile','Notifications':'Notifications','Security':'Security',
    'Appearance':'Appearance','Data & Privacy':'Data & Privacy',
    'Add Expense':'Add Expense','Add Income':'Add Income','Export':'Export','View details':'View details'
  },
  'Hindi': {
    'Dashboard':'\u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921','Transactions':'\u0932\u0947\u0928\u0926\u0947\u0928',
    'Reports':'\u0930\u093F\u092A\u094B\u0930\u094D\u091F','Goals':'\u0932\u0915\u094D\u0937\u094D\u092F',
    'Subscriptions':'\u0938\u0926\u0938\u094D\u092F\u0924\u093E','Wealth':'\u0938\u0902\u092A\u0926\u093E','FlowAI':'FlowAI',
    'Profile':'\u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932','Notifications':'\u0938\u0942\u091A\u0928\u093E\u090F\u0902',
    'Security':'\u0938\u0941\u0930\u0915\u094D\u0937\u093E','Appearance':'\u0926\u093F\u0916\u093E\u0935\u091F',
    'Data & Privacy':'\u0921\u0947\u091F\u093E \u0914\u0930 \u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E',
    'Add Expense':'\u0916\u0930\u094D\u091A \u091C\u094B\u0921\u093C\u0947\u0902','Add Income':'\u0906\u092F \u091C\u094B\u0921\u093C\u0947\u0902',
    'Export':'\u0928\u093F\u0930\u094D\u092F\u093E\u0924 \u0915\u0930\u0947\u0902','View details':'\u0935\u093F\u0935\u0930\u0923 \u0926\u0947\u0916\u0947\u0902'
  },
  'Tamil': {
    'Dashboard':'\u0B9F\u0BBE\u0BB7\u0BCD\u0BAA\u0BCB\u0BB0\u0BCD\u0B9F\u0BC1','Transactions':'\u0BAA\u0BB0\u0BBF\u0BB5\u0BB0\u0BCD\u0BA4\u0BCD\u0BA4\u0BA9\u0BC8\u0B95\u0BB3\u0BCD',
    'Reports':'\u0A85\u0BB1\u0BBF\u0B95\u0BCD\u0B95\u0BC8\u0B95\u0BB3\u0BCD','Goals':'\u0C07\u0BB2\u0B95\u0BCD\u0B95\u0BC1\u0B95\u0BB3\u0BCD',
    'Subscriptions':'\u0B9A\u0BA8\u0BA4\u0BBE','Wealth':'\u0B9A\u0BC6\u0BB2\u0BCD\u0BB5\u0BAE\u0BCD','FlowAI':'FlowAI',
    'Profile':'\u0B9A\u0BC1\u0BAF\u0BB5\u0BBF\u0BB5\u0BB0\u0BAE\u0BCD','Notifications':'\u0A85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD',
    'Security':'\u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BC1','Appearance':'\u0BA4\u0BCB\u0BB1\u0BCD\u0BB1\u0BAE\u0BCD',
    'Data & Privacy':'\u0BA4\u0BB0\u0BB5\u0BC1 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BA4\u0BA9\u0BBF\u0BAF\u0BC1\u0BB0\u0BBF\u0BAE\u0BC8',
    'Add Expense':'\u0B9A\u0BC6\u0BB2\u0BB5\u0BC8\u0B9A\u0BCD \u0B9A\u0BC7\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD','Add Income':'\u0BB5\u0BB0\u0BC1\u0BAE\u0BBE\u0BA9\u0BA4\u0BCD\u0BA4\u0BC8\u0B9A\u0BCD \u0B9A\u0BC7\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD',
    'Export':'\u0B8F\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BA4\u0BBF','View details':'\u0BB5\u0BBF\u0BB5\u0BB0\u0B99\u0BCD\u0B95\u0BB3\u0BC8\u0B95\u0BCD \u0B95\u0BBE\u0BA3\u0BCD\u0B95'
  },
  'Bengali': {
    'Dashboard':'\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1','Transactions':'\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8',
    'Reports':'\u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F','Goals':'\u09B2\u0995\u09CD\u09B7\u09CD\u09AF',
    'Subscriptions':'\u09B8\u09A6\u09B8\u09CD\u09AF\u09AA\u09A6','Wealth':'\u09B8\u09AE\u09CD\u09AA\u09A6','FlowAI':'FlowAI',
    'Profile':'\u09AA\u09CD\u09B0\u09CB\u09AB\u09BE\u0987\u09B2','Notifications':'\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF',
    'Security':'\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE','Appearance':'\u099A\u09C7\u09B9\u09BE\u09B0\u09BE',
    'Data & Privacy':'\u09A1\u09C7\u099F\u09BE \u098F\u09AC\u0982 \u0997\u09CB\u09AA\u09A8\u09C0\u09AF\u09BC\u09A4\u09BE',
    'Add Expense':'\u09AC\u09CD\u09AF\u09AF\u09BC \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8','Add Income':'\u0986\u09AF\u09BC \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8',
    'Export':'\u09B0\u09AA\u09CD\u09A4\u09BE\u09A8\u09BF','View details':'\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A6\u09C7\u0996\u09C1\u09A8'
  },
  'Telugu': {
    'Dashboard':'\u0C21\u0C4D\u0C2F\u0C3E\u0C37\u0C4D\u200C\u0C2C\u0C4B\u0C30\u0C4D\u0C21\u0C41','Transactions':'\u0C32\u0C3E\u0C35\u0C3E\u0C26\u0C47\u0C35\u0C40\u0C32\u0C41',
    'Reports':'\u0C28\u0C3F\u0C35\u0C47\u0C26\u0C3F\u0C15\u0C32\u0C41','Goals':'\u0C32\u0C15\u0C4D\u0C37\u0C4D\u0C2F\u0C3E\u0C32\u0C41',
    'Subscriptions':'\u0C1A\u0C02\u0C26\u0C3E\u0C32\u0C41','Wealth':'\u0C38\u0C02\u0C2A\u0C26','FlowAI':'FlowAI',
    'Profile':'\u0C2A\u0C4D\u0C30\u0C4A\u0C2B\u0C48\u0C32\u0C4D','Notifications':'\u0C28\u0C4B\u0C1F\u0C3F\u0C2B\u0C3F\u0C15\u0C47\u0C37\u0C28\u0C4D\u200C\u0C32\u0C41',
    'Security':'\u0C38\u0C41\u0C30\u0C15\u0C4D\u0C37','Appearance':'\u0C30\u0C42\u0C2A\u0C3E\u0C28\u0C4D\u0C28\u0C3F',
    'Data & Privacy':'\u0C21\u0C47\u0C1F\u0C3E \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C17\u0C4B\u0C2A\u0C4D\u0C2F\u0C24',
    'Add Expense':'\u0C16\u0C30\u0C4D\u0C1A\u0C41 \u0C1C\u0C4B\u0C21\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F','Add Income':'\u0C06\u0C26\u0C3E\u0C2F\u0C02 \u0C1C\u0C4B\u0C21\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F',
    'Export':'\u0C0E\u0C17\u0C41\u0C2E\u0C24\u0C3F','View details':'\u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41 \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F'
  },
  'Marathi': {
    'Dashboard':'\u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921','Transactions':'\u0935\u094D\u092F\u0935\u0939\u093E\u0930',
    'Reports':'\u0905\u0939\u0935\u093E\u0932','Goals':'\u0932\u0915\u094D\u0937\u094D\u092F',
    'Subscriptions':'\u0938\u0926\u0938\u094D\u092F\u0924\u093E','Wealth':'\u0938\u0902\u092A\u0924\u094D\u0924\u0940','FlowAI':'FlowAI',
    'Profile':'\u092A\u094D\u0930\u094B\u092B\u093E\u0908\u0932','Notifications':'\u0938\u0942\u091A\u0928\u093E',
    'Security':'\u0938\u0941\u0930\u0915\u094D\u0937\u093E','Appearance':'\u0926\u093F\u0938\u093E\u0935\u091F',
    'Data & Privacy':'\u0921\u0947\u091F\u093E \u0906\u0923\u093F \u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E',
    'Add Expense':'\u0916\u0930\u094D\u091A \u091C\u094B\u0921\u093E','Add Income':'\u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u091C\u094B\u0921\u093E',
    'Export':'\u0928\u093F\u0930\u094D\u092F\u093E\u0924 \u0915\u0930\u093E','View details':'\u0924\u092A\u0936\u0940\u0932 \u092A\u0939\u093E'
  }
};

FF.applyLanguage = function(lang) {
  FF.currentLanguage = lang;
  localStorage.setItem('ff_language', lang);
  const translations = FF.translations[lang] || FF.translations['English'];
  // Update all elements tagged with data-translate
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    el.textContent = translations[key] || key;
  });
};

FF.getTranslation = function(key) {
  const lang = FF.data?.appearance?.language || 'English';
  const translations = FF.translations[lang] || FF.translations['English'];
  return translations[key] || key;
};

FF.initializeAppearance = function() {
  const d = FF.data;
  if (d && d.appearance) {
    FF.applyTheme(d.appearance.theme);
    document.documentElement.style.setProperty('--primary', d.appearance.accent);
    if (d.appearance.language) {
      FF.applyLanguage(d.appearance.language);
    }
  }
};
