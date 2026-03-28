// â”€â”€â”€ FINANCE FLOW â€” STATE & UTILITIES â”€â”€â”€

const FF = {
  // Fresh blank data for a new user â€” NO sample transactions
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
    if (d.appearance.currency.includes('â‚¹')) {
      d.appearance.currency = '\u20B9 INR';
    }
    return d;
  },

  get data() {
    const s = localStorage.getItem('ff_data');
    if (!s) return null;
    try {
      return this.ensureDataShape(JSON.parse(s));
    } catch (_err) {
      return null;
    }
  },

  save(d) {
    const safe = this.ensureDataShape(d);
    if (!safe) return;
    localStorage.setItem('ff_data', JSON.stringify(safe));
  },

  isLoggedIn() { return !!localStorage.getItem('ff_user'); },

  // Called on signup â€” wipes everything and starts fresh
  signup(name, email, income) {
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_data');
    const d = this.freshData(name, email, income);
    this.save(d);
    localStorage.setItem('ff_user', JSON.stringify({name, email}));
  },

  // Called on sign in â€” uses existing data or creates fresh
  login(name, email) {
    localStorage.setItem('ff_user', JSON.stringify({name, email}));
    if (!this.data) {
      this.save(this.freshData(name, email, 0));
    }
  },

  logout() {
    localStorage.removeItem('ff_user');
    // Keep data so they can sign back in
  },

  getUser() {
    const u = localStorage.getItem('ff_user');
    return u ? JSON.parse(u) : null;
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
  }
};

// â”€â”€â”€ TOAST â”€â”€â”€
function toast(msg) {
  let t = document.getElementById('ff-toast');
  if (!t) { t = document.createElement('div'); t.id='ff-toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// â”€â”€â”€ BUILD SIDEBAR â”€â”€â”€
function buildSidebar(active) {
  const el = document.getElementById('sidebar');
  if (!el) return;
  const d = FF.data;
  const u = FF.getUser();
  const links = [
    {id:'home',    icon:'&#x1F3E0;', lbl:'Dashboard',    href:'dashboard.html'},
    {id:'tx',      icon:'&#x1F4B3;', lbl:'Transactions',  href:'transactions.html'},
    {id:'reports', icon:'&#x1F4CA;', lbl:'Reports',       href:'reports.html'},
    {id:'goals',   icon:'&#x1F3AF;', lbl:'Goals',         href:'goals.html'},
    {id:'subs',    icon:'&#x1F4F1;', lbl:'Subscriptions', href:'subscriptions.html'},
    {id:'wealth',  icon:'$',  lbl:'Wealth',         href:'wealth.html'},
    {id:'ai',      icon:'&#x1F916;', lbl:'FlowAI',        href:'ai-chat.html'},
  ];
  const settings = [
    {id:'profile',      icon:'&#x1F464;', lbl:'Profile',        href:'profile.html'},
    {id:'notifications',icon:'&#x1F514;', lbl:'Notifications',   href:'notifications.html'},
    {id:'security',     icon:'&#x1F512;', lbl:'Security',       href:'security.html'},
    {id:'appearance',   icon:'&#x1F3A8;', lbl:'Appearance',      href:'appearance.html'},
  ];
  el.innerHTML = `
    <div class="sidebar-section">Menu</div>
    ${links.map(l=>`<a href="${l.href}" class="s-link ${l.id===active?'active':''}"><span class="s-link-icon">${l.icon}</span>${FF.getTranslation(l.lbl)}</a>`).join('')}
    <div class="sidebar-section">Settings</div>
    ${settings.map(l=>`<a href="${l.href}" class="s-link ${l.id===active?'active':''}"><span class="s-link-icon">${l.icon}</span>${FF.getTranslation(l.lbl)}</a>`).join('')}
    <div class="sidebar-footer">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Signed in as<br><strong style="color:#fff;">${u?.name||''}</strong></div>
      <button onclick="FF.logout();location.href='../index.html';" style="width:100%;background:var(--warn-dim);border:1px solid rgba(255,107,53,.2);color:var(--warn);padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);">&#x1F6AA; Log Out</button>
    </div>`;
}

// â”€â”€â”€ BUILD RINGS â”€â”€â”€
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

// â”€â”€â”€ BUILD TX LIST â”€â”€â”€
function buildTxList(id, txs, limit) {
  const el = document.getElementById(id); if (!el) return;
  const list = limit ? txs.slice(0, limit) : txs;
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:14px;">No transactions yet â€” add your first one!</div>';
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
// â”€â”€â”€ THEME & APPEARANCE MANAGEMENT â”€â”€â”€
FF.applyTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
};

FF.translations = {
  'English': {
    'Dashboard': 'Dashboard', 'Transactions': 'Transactions', 'Reports': 'Reports', 'Goals': 'Goals', 'Subscriptions': 'Subscriptions', 'Wealth': 'Wealth', 'FlowAI': 'FlowAI',
    'Profile': 'Profile', 'Notifications': 'Notifications', 'Security': 'Security', 'Appearance': 'Appearance', 'Data & Privacy': 'Data & Privacy',
    'Add Expense': 'Add Expense', 'Add Income': 'Add Income', 'Export': 'Export', 'View details': 'View details'
  },
  'à¤¹à¤¿à¤¨à¥à¤¦à¥€': {
    'Dashboard': 'à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡', 'Transactions': 'à¤²à¥‡à¤¨à¤¦à¥‡à¤¨', 'Reports': 'à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ', 'Goals': 'à¤²à¤•à¥à¤·à¥à¤¯', 'FlowAI': 'FlowAI',
    'Profile': 'à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²', 'Notifications': 'à¤¸à¥‚à¤šà¤¨à¤¾à¤à¤‚', 'Security': 'à¤¸à¥à¤°à¤•à¥à¤·à¤¾', 'Appearance': 'à¤¦à¤¿à¤–à¤¾à¤µà¤Ÿ', 'Data & Privacy': 'à¤¡à¥‡à¤Ÿà¤¾ à¤”à¤° à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾',
    'Add Expense': 'à¤–à¤°à¥à¤š à¤œà¥‹à¤¡à¤¼à¥‡à¤‚', 'Add Income': 'à¤†à¤¯ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚', 'Export': 'à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¤°à¥‡à¤‚', 'View details': 'à¤µà¤¿à¤µà¤°à¤£ à¤¦à¥‡à¤–à¥‡à¤‚'
  },
  'à®¤à®®à®¿à®´à¯': {
    'Dashboard': 'à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯', 'Transactions': 'à®ªà®°à®¿à®µà®°à¯à®¤à¯à®¤à®©à¯ˆà®•à®³à¯', 'Reports': 'à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à¯', 'Goals': 'à®‡à®²à®•à¯à®•à¯à®•à®³à¯', 'FlowAI': 'FlowAI',
    'Profile': 'à®šà¯à®¯à®µà®¿à®µà®°à®®à¯', 'Notifications': 'à®…à®±à®¿à®µà®¿à®ªà¯à®ªà¯à®•à®³à¯', 'Security': 'à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà¯', 'Appearance': 'à®¤à¯‹à®±à¯à®±à®®à¯', 'Data & Privacy': 'à®¤à®°à®µà¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®©à®¿à®¯à¯à®°à®¿à®®à¯ˆ',
    'Add Expense': 'à®šà¯†à®²à®µà¯ˆà®šà¯ à®šà¯‡à®°à¯à®•à¯à®•à®µà¯à®®à¯', 'Add Income': 'à®µà®°à¯à®®à®¾à®©à®¤à¯à®¤à¯ˆà®šà¯ à®šà¯‡à®°à¯à®•à¯à®•à®µà¯à®®à¯', 'Export': 'à®à®±à¯à®±à¯à®®à®¤à®¿', 'View details': 'à®µà®¿à®µà®°à®™à¯à®•à®³à¯ˆà®•à¯ à®•à®¾à®£à¯à®•'
  },
  'à¦¬à¦¾à¦‚à¦²à¦¾': {
    'Dashboard': 'à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡', 'Transactions': 'à¦²à§‡à¦¨à¦¦à§‡à¦¨', 'Reports': 'à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ', 'Goals': 'à¦²à¦•à§à¦·à§à¦¯', 'FlowAI': 'FlowAI',
    'Profile': 'à¦ªà§à¦°à§‹à¦«à¦¾à¦‡à¦²', 'Notifications': 'à¦¬à¦¿à¦œà§à¦žà¦ªà§à¦¤à¦¿', 'Security': 'à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾', 'Appearance': 'à¦šà§‡à¦¹à¦¾à¦°à¦¾', 'Data & Privacy': 'à¦¡à§‡à¦Ÿà¦¾ à¦à¦¬à¦‚ à¦—à§‹à¦ªà¦¨à§€à¦¯à¦¼à¦¤à¦¾',
    'Add Expense': 'à¦–à¦°à¦š à¦¯à§‹à¦— à¦•à¦°à§à¦¨', 'Add Income': 'à¦†à¦¯à¦¼ à¦¯à§‹à¦— à¦•à¦°à§à¦¨', 'Export': 'à¦°à¦ªà§à¦¤à¦¾à¦¨à¦¿', 'View details': 'à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¦à§‡à¦–à§à¦¨'
  },
  'à°¤à±†à°²à±à°—à±': {
    'Dashboard': 'à°¡à±à°¯à°¾à°·à±â€Œà°¬à±‹à°°à±à°¡à±', 'Transactions': 'à°²à°¾à°µà°¾à°¦à±‡à°µà±€à°²à±', 'Reports': 'à°¨à°¿à°µà±‡à°¦à°¿à°•à°²à±', 'Goals': 'à°²à°•à±à°·à±à°¯à°¾à°²à±', 'FlowAI': 'FlowAI',
    'Profile': 'à°ªà±à°°à±Šà°«à±ˆà°²à±', 'Notifications': 'à°¨à±‹à°Ÿà°¿à°«à°¿à°•à±‡à°·à°¨à±â€Œà°²à±', 'Security': 'à°¸ecurity', 'Appearance': 'à°°à±‚à°ªà°¾à°¨à±à°¨à°¿', 'Data & Privacy': 'à°¡à±‡à°Ÿà°¾ à°®à°°à°¿à°¯à± à°—à±‹à°ªà±à°¯à°¤',
    'Add Expense': 'à°–à°°à±à°šà± à°œà±‹à°¡à°¿à°‚à°šà°‚à°¡à°¿', 'Add Income': 'à°†à°¦à°¾à°¯à°‚ à°œà±‹à°¡à°¿à°‚à°šà°‚à°¡à°¿', 'Export': 'à°Žà°—à±à°®à°¤à°¿', 'View details': 'à°µà°¿à°µà°°à°¾à°²à± à°šà±‚à°¡à°‚à°¡à°¿'
  },
  'à¤®à¤°à¤¾à¤ à¥€': {
    'Dashboard': 'à¤¡à¥…à¤¶à¥à¤¬à¥‹à¤°à¥à¤¡', 'Transactions': 'à¤µà¥à¤¯à¤µà¤¹à¤¾à¤°', 'Reports': 'à¤…à¤¹à¤µà¤¾à¤²', 'Goals': 'à¤²à¤•à¥à¤·à¥à¤¯', 'FlowAI': 'FlowAI',
    'Profile': 'à¤ªà¥à¤°à¥‹à¤«à¤¾à¤ˆà¤²', 'Notifications': 'à¤¸à¥‚à¤šà¤¨à¤¾', 'Security': 'à¤¸à¥à¤°à¤•à¥à¤·à¤¾', 'Appearance': 'à¤¦à¤¿à¤¸à¤¾à¤µà¤Ÿ', 'Data & Privacy': 'à¤¡à¥‡à¤Ÿà¤¾ à¤†à¤£à¤¿ à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾',
    'Add Expense': 'à¤–à¤°à¥à¤š à¤œà¥‹à¤¡à¤¾', 'Add Income': 'à¤‰à¤¤à¥à¤ªà¤¨à¥à¤¨ à¤œà¥‹à¤¡à¤¾', 'Export': 'à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¤°à¤¾', 'View details': 'à¤¤à¤ªà¤¶à¥€à¤² à¤ªà¤¹à¤¾'
  }
};

FF.applyLanguage = function(lang) {
  FF.currentLanguage = lang;
  localStorage.setItem('ff_language', lang);
  
  // Update sidebar text immediately
  const links = document.querySelectorAll('.s-link');
  const translations = FF.translations[lang] || FF.translations['English'];
  
  links.forEach(link => {
    let text = link.textContent.trim();
    if (translations[text]) {
      // Keep the icon and update only the text
      const icon = link.querySelector('.s-link-icon');
      if (icon) {
        link.textContent = '';
        link.appendChild(icon);
        link.appendChild(document.createTextNode(translations[text]));
      }
    }
  });
  
  // Update any other UI text that might be visible
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[key]) {
      el.textContent = translations[key];
    }
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
    // Apply theme
    FF.applyTheme(d.appearance.theme);
    // Apply accent color
    document.documentElement.style.setProperty('--primary', d.appearance.accent);
    // Apply language
    if (d.appearance.language) {
      FF.applyLanguage(d.appearance.language);
    }
  }
};
