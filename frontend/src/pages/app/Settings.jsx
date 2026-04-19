import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { setPassword, verifyPassword, getData, saveData } from '../../services/storage';
import AppLayout from '../../components/layout/AppLayout';

const ACCENT_COLOURS = [
  '#00E5A0','#3D7FFF','#A855F7','#FF6B35','#FFB800','#FF3B5E','#00D4FF','#22C55E',
];

const TABS = [
  { id:'profile', icon:'👤', label:'Profile' },
  { id:'appearance', icon:'🎨', label:'Appearance' },
  { id:'notifications', icon:'🔔', label:'Notifications' },
  { id:'security', icon:'🔒', label:'Security' },
  { id:'privacy', icon:'🛡️', label:'Data & Privacy' },
];

const THEMES_LIST = [
  { id:'dark', label:'Dark', bg:'linear-gradient(135deg,#060A12,#0C1520)' },
  { id:'light', label:'Light', bg:'linear-gradient(135deg,#F0F4FB,#fff)' },
  { id:'ocean', label:'Ocean', bg:'linear-gradient(135deg,#0A1628,#1A3A52)' },
];

const CURRENCIES = ['₹ INR','$ USD','€ EUR','£ GBP','¥ JPY','₩ KRW','A$ AUD','C$ CAD'];
const LANGUAGES = ['English','हिंदी','தமிழ்','বাংলা','తెలుగు','ਪੰਜਾਬੀ','मराठी','ગુજરાતી'];

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();
  const { data, save, totals, fmt } = useFinance();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: data?.name || user?.name || '', mobile: data?.mobile || '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const score = totals.income > 0 ? Math.min(99, Math.round(50 + parseFloat(totals.rate) * 0.5)) : null;

  function saveProfile() {
    if (!form.name.trim()) { showToast('Name cannot be empty.'); return; }
    const updated = { ...data, name: form.name.trim(), mobile: form.mobile };
    save(updated);
    showToast('✅ Profile saved!');
  }

  return (
    <div className="settings-profile-grid">
      {/* Avatar + stats */}
      <div>
        <div className="card" style={{ textAlign:'center' }}>
          <div className="avatar-wrap">😊</div>
          <div className="profile-name">{data?.name || user?.name || '—'}</div>
          <div className="profile-email">{data?.email || user?.email || '—'}</div>
          <span className="tag-green">✓ Verified Member</span>
          <div className="stat-pill" style={{ marginTop:20 }}>
            {[
              { val:(data?.txs||[]).length, label:'Transactions', color:'var(--primary)' },
              { val:(data?.goals||[]).length, label:'Goals', color:'var(--warn)' },
              { val:(data?.budgets||[]).length, label:'Budgets', color:'var(--accent)' },
              { val:score||'—', label:'Health Score', color:'var(--gold)' },
            ].map(s => (
              <div key={s.label} className="sp-item">
                <div className="sp-val" style={{ color:s.color }}>{s.val}</div>
                <div className="sp-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div>
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:20 }}>Edit Profile</div>
          <div className="edit-row">
            <div className="fw"><label className="flbl">Full Name</label><input className="finput" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="fw"><label className="flbl">Mobile</label><input className="finput" value={form.mobile} onChange={e => set('mobile', e.target.value)} type="tel" placeholder="+91 …" /></div>
          </div>
          <div className="fw" style={{ marginBottom:20 }}><label className="flbl">Email</label><input className="finput" value={data?.email || user?.email || ''} readOnly style={{ opacity:0.6 }} /></div>
          <button className="btn btn-p btn-full" onClick={saveProfile}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const { appearance, setTheme, setAccent, setCurrency, setLanguage } = useTheme();
  const { showToast } = useToast();

  return (
    <div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:20 }}>Theme</div>
        <div className="theme-grid">
          {THEMES_LIST.map(t => (
            <div key={t.id} className={`theme-opt${appearance.theme === t.id ? ' active' : ''}`} onClick={() => { setTheme(t.id); showToast(`Theme set to ${t.label}`); }}>
              <div className="theme-preview" style={{ background: t.bg }} />
              <div className="theme-label">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:16 }}>Accent Colour</div>
        <div className="colour-dots">
          {ACCENT_COLOURS.map(c => (
            <div key={c} className={`colour-dot${appearance.accent === c ? ' on' : ''}`} style={{ background:c }} onClick={() => { setAccent(c); showToast('Accent updated!'); }} />
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div className="form-row">
          <div className="fw"><label className="flbl">Currency</label>
            <select className="finput" value={appearance.currency} onChange={e => { setCurrency(e.target.value); showToast('Currency updated!'); }}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fw"><label className="flbl">Language</label>
            <select className="finput" value={appearance.language} onChange={e => { setLanguage(e.target.value); showToast('Language updated!'); }}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const { data, save } = useFinance();
  const { showToast } = useToast();
  const notifs = data?.notifications || {};

  const NOTIF_ITEMS = [
    { key:'budget_exceeded', label:'Budget Exceeded', desc:'When any budget goes over the limit' },
    { key:'pct80', label:'80% Budget Alert', desc:'When spending reaches 80% of a budget' },
    { key:'income_received', label:'Income Received', desc:'When a salary or income transaction is added' },
    { key:'large_expense', label:'Large Expense Alert', desc:'When an unusually large expense is logged' },
    { key:'recurring_due', label:'Recurring Due', desc:'Reminders for subscriptions and EMIs' },
    { key:'daily_tip', label:'Daily Financial Tips', desc:'A daily financial insight from FlowAI' },
    { key:'weekly_summary', label:'Weekly Summary', desc:'Weekly spending and savings recap' },
    { key:'monthly_report', label:'Monthly Report', desc:'Detailed monthly financial report' },
  ];

  function toggle(key) {
    const updated = { ...data, notifications: { ...notifs, [key]: !notifs[key] } };
    save(updated);
    showToast(notifs[key] ? 'Notification disabled' : 'Notification enabled');
  }

  return (
    <div className="card">
      {NOTIF_ITEMS.map(item => (
        <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{item.label}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{item.desc}</div>
          </div>
          <button className={`tog${notifs[item.key] ? ' on' : ' off'}`} onClick={() => toggle(item.key)} />
        </div>
      ))}
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const { user } = useAuth();
  const { data, save } = useFinance();
  const { showToast } = useToast();
  const security = data?.security || {};
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' });

  const SEC_ITEMS = [
    { key:'biometric', label:'Biometric Lock', desc:'Use fingerprint or Face ID to access the app' },
    { key:'twofa', label:'Two-Factor Authentication', desc:'Extra layer of security on sign-in' },
    { key:'auto_lock', label:'Auto-Lock', desc:'Lock the app when inactive for 5 minutes' },
    { key:'screenshot', label:'Screenshot Protection', desc:'Block screenshots of sensitive screens' },
  ];

  function toggleSec(key) {
    const updated = { ...data, security: { ...security, [key]: !security[key] } };
    save(updated);
  }

  async function changePassword() {
    if (!pwForm.current.trim()) { showToast('Enter your current password.'); return; }
    if (pwForm.newPw.length < 6) { showToast('New password must be at least 6 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { showToast('New passwords do not match.'); return; }
    const email = user?.email || data?.email || '';
    const ok = await verifyPassword(email, pwForm.current, { enrollIfMissing: false });
    if (!ok) { showToast('Current password is incorrect.'); return; }
    await setPassword(email, pwForm.newPw);
    showToast('✅ Password changed successfully!');
    setPwForm({ current:'', newPw:'', confirm:'' });
  }

  const set = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="card" style={{ marginBottom:20 }}>
        {SEC_ITEMS.map(item => (
          <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{item.label}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{item.desc}</div>
            </div>
            <button className={`tog${security[item.key] ? ' on' : ' off'}`} onClick={() => toggleSec(item.key)} />
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:16 }}>Change Password</div>
        <div className="fw"><label className="flbl">Current Password</label><input className="finput" type="password" value={pwForm.current} onChange={e => set('current', e.target.value)} placeholder="••••••••" autoComplete="current-password" /></div>
        <div className="fw"><label className="flbl">New Password</label><input className="finput" type="password" value={pwForm.newPw} onChange={e => set('newPw', e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" /></div>
        <div className="fw"><label className="flbl">Confirm New Password</label><input className="finput" type="password" value={pwForm.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat new password" autoComplete="new-password" /></div>
        <button className="btn btn-p btn-full" onClick={changePassword}>Change Password</button>
      </div>
    </div>
  );
}

// ─── Privacy Tab ──────────────────────────────────────────────────────────────
function PrivacyTab() {
  const { user } = useAuth();
  const { data, save } = useFinance();
  const { showToast } = useToast();

  function exportData() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `financeflow-export-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('✅ Data exported!');
  }

  function clearTransactions() {
    if (!window.confirm('Delete all transactions? This cannot be undone.')) return;
    save({ ...data, txs: [], budgets: (data?.budgets || []).map(b => ({ ...b, spent: 0 })) });
    showToast('All transactions deleted.');
  }

  function deleteAccount() {
    if (!window.confirm('Delete your account? All data will be permanently erased.')) return;
    const email = user?.email || data?.email || '';
    if (email) localStorage.removeItem(`ff_data_${email}`);
    localStorage.removeItem('ff_user');
    window.location.href = '/';
  }

  const cloud = data?.cloud || {};

  return (
    <div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:16 }}>Data Management</div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Cloud Sync</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Sync your data securely across devices</div>
          </div>
          <button
            className={`tog${cloud.enabled ? ' on' : ' off'}`}
            onClick={() => { save({ ...data, cloud: { ...cloud, enabled: !cloud.enabled } }); showToast(cloud.enabled ? 'Cloud sync disabled' : 'Cloud sync enabled'); }}
          />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <button className="btn btn-p" onClick={exportData}>📦 Export Data</button>
          <button className="btn btn-s" style={{ color:'var(--warn)', borderColor:'rgba(255,107,53,.3)' }} onClick={clearTransactions}>🗑 Clear Transactions</button>
        </div>
      </div>

      <div className="card" style={{ borderColor:'rgba(255,59,94,0.2)', background:'rgba(255,59,94,0.04)' }}>
        <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'var(--red)', marginBottom:12 }}>⚠️ Danger Zone</div>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:16 }}>Deleting your account is permanent and cannot be undone. All your financial data will be erased.</p>
        <button className="btn btn-full" style={{ background:'var(--red)', color:'#fff', boxShadow:'0 4px 16px rgba(255,59,94,0.3)' }} onClick={deleteAccount}>Delete My Account</button>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const TAB_CONTENT = { profile: <ProfileTab />, appearance: <AppearanceTab />, notifications: <NotificationsTab />, security: <SecurityTab />, privacy: <PrivacyTab /> };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">⚙️ Settings</div>
        <div className="page-sub">Manage your account, appearance, and preferences</div>
      </div>

      <div className="settings-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`s-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div>{TAB_CONTENT[activeTab]}</div>
    </AppLayout>
  );
}
