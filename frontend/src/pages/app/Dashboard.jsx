import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import AppLayout from '../../components/layout/AppLayout';
import BudgetRings from '../../components/common/BudgetRings';
import TxList from '../../components/common/TxList';

const SAVINGS_RATE_RED_THRESHOLD = 10;
const SAVINGS_RATE_ORANGE_THRESHOLD = 20;

export default function Dashboard() {
  const { user } = useAuth();
  const { totals, fmt, gamification } = useFinance();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const savingsRate = Number.parseFloat(totals.rate || 0);
  const savingsRateColor = totals.income <= 0
    ? 'var(--text-muted)'
    : savingsRate < SAVINGS_RATE_RED_THRESHOLD
      ? 'var(--red)'
      : savingsRate < SAVINGS_RATE_ORANGE_THRESHOLD
        ? 'var(--warn)'
        : 'var(--primary)';

  return (
    <AppLayout
      topbarActions={
        <div className="tb-user">
          <span>{firstName}</span>
          <Link to="/app/profile" className="tb-avatar">😊</Link>
        </div>
      }
    >
      {/* Balance Hero */}
      <div className="balance-hero">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">{fmt(Math.max(0, totals.saved || 0))}</div>
        <div className="balance-growth" style={{ color: savingsRateColor }}>
          {totals.income > 0
            ? `↑ Saving ${totals.rate}% of income this month`
            : 'Start adding transactions to see insights'}
        </div>
        <div className="balance-cols">
          <div className="balance-col">
            <div className="balance-col-label">Income This Month</div>
            <div className="balance-col-value" style={{ color:'var(--primary)' }}>{fmt(totals.income)}</div>
          </div>
          <div className="balance-col">
            <div className="balance-col-label">Spent This Month</div>
            <div className="balance-col-value" style={{ color:'var(--warn)' }}>{fmt(totals.spent)}</div>
          </div>
          <div className="balance-col">
            <div className="balance-col-label">Balance</div>
            <div className="balance-col-value" style={{ color:'var(--accent)' }}>{fmt(totals.saved)}</div>
          </div>
        </div>
      </div>

      <div className="card-sm" style={{ marginBottom: 22, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Level {gamification.level}</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 800, color: '#fff' }}>{gamification.title}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{gamification.xp} XP</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{gamification.xpToNextLevel} XP to next level</div>
          </div>
        </div>
        <div className="pbar" style={{ height: 10 }}>
          <div className="pfill" style={{ width: `${gamification.progressPct}%`, background: 'linear-gradient(90deg,var(--primary),var(--accent))' }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/app/add?type=expense" style={{ flex:1, background:'var(--primary)', borderRadius:14, padding:'18px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 20px var(--primary-glow)' }}>
          <div className="icon-box icon-box-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#000' }}>Add Expense</div>
            <div style={{ fontSize:12, color:'rgba(0,0,0,.6)' }}>Track what you spend</div>
          </div>
        </Link>

        <Link to="/app/add?type=income" style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
          <div className="icon-box icon-box-surface">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#fff' }}>Add Income</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Log salary or earnings</div>
          </div>
        </Link>

        <Link to="/app/reports" style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
          <div className="icon-box icon-box-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#fff' }}>Reports</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Charts &amp; analysis</div>
          </div>
        </Link>

        <Link to="/app/ai-chat" style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:12 }}>
          <div className="icon-box icon-box-ai">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1 2"/><path d="m19 21 1-2"/><path d="m5 21 1-2"/><path d="m19 3 1-2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#fff' }}>FlowAI</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Ask your AI advisor</div>
          </div>
        </Link>
      </div>

      <div className="grid-2" style={{ gap:28 }}>
        {/* Recent Transactions */}
        <div>
          <div className="sec-hdr">
            <span className="sec-ttl">Recent Transactions</span>
            <Link to="/app/transactions" className="sec-lnk">See all →</Link>
          </div>
          <div className="card-sm">
            <TxList limit={6} onDelete={false} />
          </div>
        </div>

        {/* Budgets + AI Insight */}
        <div>
          <div className="sec-hdr">
            <span className="sec-ttl">Budget Rings</span>
            <Link to="/app/reports" className="sec-lnk">View all →</Link>
          </div>
          <div className="card-sm">
            <BudgetRings max={6} manage />
          </div>

          <Link to="/app/ai-chat" id="ai-insight-card" style={{ display:'block', marginTop:16, background:'linear-gradient(135deg,rgba(61,127,255,0.1),rgba(0,229,160,0.05))', border:'1px solid rgba(61,127,255,.2)', borderRadius:14, padding:16, textDecoration:'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'.08em' }}>FlowAI Insight</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'var(--accent)' }}>Ask more →</span>
            </div>
            <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.65 }}>
              {totals.income > 0 && totals.spent > 0
                ? `You've spent ${fmt(totals.spent)} and saved ${totals.rate}% this month. Keep it up! 🎉`
                : 'Add your first transactions to get personalised AI insights ✨'}
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
