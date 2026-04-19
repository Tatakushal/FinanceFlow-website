import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import AppLayout from '../../components/layout/AppLayout';

export default function Profile() {
  const { user } = useAuth();
  const { data, totals, fmt } = useFinance();

  const score = totals.income > 0 ? Math.min(99, Math.round(50 + parseFloat(totals.rate) * 0.5)) : null;

  return (
    <AppLayout topbarActions={<Link to="/app/settings" className="btn-tb-primary">✏️ Edit Profile</Link>}>
      <div className="grid-2" style={{ gap:28 }}>
        {/* Profile card */}
        <div>
          <div className="card" style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--primary))', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, boxShadow:'0 0 0 4px rgba(0,229,160,0.15)' }}>😊</div>
            <div style={{ fontFamily:'var(--fd)', fontSize:24, fontWeight:800, color:'#fff', marginBottom:4 }}>{data?.name || user?.name || '—'}</div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:12 }}>{data?.email || user?.email || '—'}</div>
            <span className="tag-green">✓ Verified Member</span>
          </div>

          <div className="grid-2" style={{ gap:12, marginBottom:20 }}>
            {[
              { val:(data?.txs||[]).length, label:'Transactions', color:'var(--primary)' },
              { val:(data?.goals||[]).length, label:'Goals', color:'var(--warn)' },
              { val:(data?.budgets||[]).length, label:'Budgets', color:'var(--accent)' },
              { val:score||'—', label:'Health Score', color:'var(--gold)' },
            ].map(s => (
              <div key={s.label} className="card-sm" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--fd)', fontSize:24, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <div className="menu-section">
            <div className="menu-section-title">Account</div>
            <Link to="/app/settings" className="menu-row">
              <div className="menu-ico" style={{ background:'var(--accent-dim)' }}>✏️</div>
              <div className="menu-info"><div className="menu-lbl">Edit Profile</div><div className="menu-sub">Name, mobile, income target</div></div>
              <span className="menu-chev">›</span>
            </Link>
            <Link to="/app/goals" className="menu-row">
              <div className="menu-ico" style={{ background:'var(--primary-dim)' }}>🎯</div>
              <div className="menu-info"><div className="menu-lbl">Financial Goals</div><div className="menu-sub">{(data?.goals||[]).length} active goal{(data?.goals||[]).length !== 1 ? 's' : ''}</div></div>
              <span className="menu-chev">›</span>
            </Link>
            <Link to="/app/health-score" className="menu-row">
              <div className="menu-ico" style={{ background:'rgba(255,184,0,.12)' }}>💯</div>
              <div className="menu-info"><div className="menu-lbl">Health Score</div><div className="menu-sub">Your financial fitness</div></div>
              <span className="menu-chev">›</span>
            </Link>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Preferences</div>
            <Link to="/app/settings?tab=notifications" className="menu-row">
              <div className="menu-ico" style={{ background:'rgba(255,184,0,.12)' }}>🔔</div>
              <div className="menu-info"><div className="menu-lbl">Notifications</div></div>
              <span className="menu-chev">›</span>
            </Link>
            <Link to="/app/settings?tab=security" className="menu-row">
              <div className="menu-ico" style={{ background:'var(--purple-dim)' }}>🔒</div>
              <div className="menu-info"><div className="menu-lbl">Security</div></div>
              <span className="menu-chev">›</span>
            </Link>
            <Link to="/app/settings?tab=appearance" className="menu-row">
              <div className="menu-ico" style={{ background:'rgba(0,180,216,.1)' }}>🎨</div>
              <div className="menu-info"><div className="menu-lbl">Appearance</div></div>
              <span className="menu-chev">›</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
