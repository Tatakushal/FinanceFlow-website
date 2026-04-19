import { useFinance } from '../../contexts/FinanceContext';
import AppLayout from '../../components/layout/AppLayout';
import BudgetRings from '../../components/common/BudgetRings';
import { Link } from 'react-router-dom';

export default function Reports() {
  const { data, totals, fmt } = useFinance();

  const txs = data?.txs || [];
  const budgets = data?.budgets || [];

  // Spending by category
  const catMap = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.cat] = (catMap[t.cat] || 0) + t.amt;
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxSpend = catEntries[0]?.[1] || 1;

  // Monthly totals (last 6 months)
  const monthlyMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    monthlyMap[key] = { income: 0, expense: 0 };
  }
  txs.forEach(t => {
    const parts = String(t.date || '').split(' ');
    if (parts.length < 3) return;
    const key = `${parts[1]} ${parts[2].slice(-2)}`;
    if (monthlyMap[key]) {
      if (t.type === 'income') monthlyMap[key].income += t.amt;
      else monthlyMap[key].expense += t.amt;
    }
  });
  const months = Object.entries(monthlyMap);
  const maxMonth = Math.max(...months.map(([, v]) => Math.max(v.income, v.expense)), 1);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Reports 📊</div>
        <div className="page-sub">Charts, trends, and spending insights</div>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        <div className="card-sm" style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Total Income</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--primary)' }}>{fmt(totals.income)}</div>
        </div>
        <div className="card-sm" style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Total Spent</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--warn)' }}>{fmt(totals.spent)}</div>
        </div>
        <div className="card-sm" style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Net Saved</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--accent)' }}>{fmt(totals.saved)}</div>
        </div>
        <div className="card-sm" style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Savings Rate</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--gold)' }}>{totals.rate}%</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap:28, marginBottom:28 }}>
        {/* Budget Rings */}
        <div className="card">
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:20 }}>Budget Rings</div>
          <BudgetRings max={6} />
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:20 }}>Spending by Category</div>
          {!catEntries.length ? (
            <div style={{ color:'var(--text-muted)', padding:'20px 0' }}>No expenses yet.</div>
          ) : catEntries.slice(0, 8).map(([cat, amt]) => (
            <div key={cat} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'var(--text)' }}>{cat}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--warn)' }}>{fmt(amt)}</span>
              </div>
              <div className="pbar">
                <div className="pfill" style={{ width:`${(amt / maxSpend) * 100}%`, background:'var(--warn)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="card">
        <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:20 }}>Monthly Overview (Last 6 Months)</div>
        {!txs.length ? (
          <div style={{ color:'var(--text-muted)' }}>Add transactions to see monthly trends.</div>
        ) : (
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, height:160, padding:'0 8px' }}>
            {months.map(([label, v]) => {
              const incH = (v.income / maxMonth) * 120;
              const expH = (v.expense / maxMonth) * 120;
              return (
                <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:130 }}>
                    <div title={`Income: ${fmt(v.income)}`} style={{ width:14, height:Math.max(incH, 2), background:'var(--primary)', borderRadius:'4px 4px 0 0', transition:'height .5s' }} />
                    <div title={`Expense: ${fmt(v.expense)}`} style={{ width:14, height:Math.max(expH, 2), background:'var(--warn)', borderRadius:'4px 4px 0 0', transition:'height .5s' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center' }}>{label}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display:'flex', gap:16, marginTop:12 }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}><span style={{ display:'inline-block', width:10, height:10, background:'var(--primary)', borderRadius:2, marginRight:4 }} />Income</span>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}><span style={{ display:'inline-block', width:10, height:10, background:'var(--warn)', borderRadius:2, marginRight:4 }} />Expenses</span>
        </div>
      </div>
    </AppLayout>
  );
}
