import { useFinance } from '../../contexts/FinanceContext';
import AppLayout from '../../components/layout/AppLayout';
import { Link } from 'react-router-dom';

export default function HealthScore() {
  const { data, totals } = useFinance();

  const rate = parseFloat(totals.rate || 0);
  const budgets = data?.budgets || [];
  const goals = data?.goals || [];
  const hasTxData = totals.income > 0;

  const s1 = hasTxData ? Math.min(10, Math.round(rate / 10)) : null;
  const overBudgets = budgets.filter(b => b.spent > b.lim).length;
  const s2 = Math.max(0, 10 - overBudgets * 2);
  const s3 = goals.length > 0
    ? Math.round(goals.reduce((a, g) => a + Math.min(g.saved / g.target, 1), 0) / goals.length * 10)
    : null;

  const score = s1 !== null ? Math.round(((s1 ?? 0) + s2 + (s3 ?? 5)) / 3 * 10) : null;

  const R = 70;
  const circ = 2 * Math.PI * R;
  const dash = score !== null ? (circ * score / 100) : 0;

  const label = score === null ? 'Calculate' : score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
  const msg = score === null ? 'Add transactions to get your score' : score >= 80 ? '🏆 You\'re in the top tier of financial health!' : '💡 Keep building good habits to improve your score.';
  const tip = score === null ? 'Add income, track expenses, and set goals to see your personalised health score and AI tips.'
    : rate < 20 ? 'Aim to save 20%+ of your income each month. Start by reducing your largest expense category.'
    : overBudgets > 0 ? `You exceeded ${overBudgets} budget(s). Review your spending in those categories.`
    : 'Great job! Keep contributing to your goals monthly to accelerate your score.';

  return (
    <AppLayout topbarActions={<Link to="/app/reports" className="tb-back">← Reports</Link>}>
      <div className="page-header">
        <div className="page-title">Finance Health Score 💯</div>
        <div className="page-sub">Your overall financial fitness based on real data</div>
      </div>

      <div className="grid-2" style={{ gap:28, alignItems:'start' }}>
        <div>
          <div className="card" style={{ textAlign:'center', marginBottom:20 }}>
            <div className="score-inner">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00E5A0" />
                    <stop offset="100%" stopColor="#3D7FFF" />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
                <circle cx="90" cy="90" r={R} fill="none" stroke="url(#sg)" strokeWidth="18"
                  strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                  style={{ transition:'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div className="score-center">
                <div className="score-num">{score !== null ? score : '—'}</div>
                <div className="score-lbl">{label}</div>
              </div>
            </div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:8 }}>{msg}</div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily:'var(--fd)', fontSize:16, fontWeight:800, color:'#fff', marginBottom:16 }}>Score Breakdown</div>

          {[
            { label:'💰 Savings Rate', score:s1, bar:'var(--primary)', tip:`Savings rate: ${rate}%` },
            { label:'🎯 Budget Adherence', score:s2, bar:'var(--gold)', tip: overBudgets > 0 ? `${overBudgets} budget(s) exceeded` : 'All budgets on track ✓' },
            { label:'🚀 Goal Progress', score:s3, bar:'var(--accent)', tip: s3 !== null ? `${goals.length} goal(s) tracked` : 'Set goals to improve this score' },
          ].map(item => (
            <div key={item.label} className="card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:14, color:'var(--text)' }}>{item.label}</span>
                <span style={{ fontSize:16, fontWeight:800, color:item.bar }}>{item.score !== null ? `${item.score}/10` : '—'}</span>
              </div>
              <div className="pbar">
                <div className="pfill" style={{ background:item.bar, width:`${(item.score ?? 0) * 10}%`, transition:'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{item.tip}</div>
            </div>
          ))}

          <div className="card" style={{ background:'var(--accent-dim)', borderColor:'rgba(61,127,255,.2)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', marginBottom:6 }}>🤖 FlowAI Tip</div>
            <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.65 }}>{tip}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
