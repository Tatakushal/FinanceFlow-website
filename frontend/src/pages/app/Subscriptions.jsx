import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';

function toNum(v) { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; }

function monthlyEq(amount, cycle) {
  const a = toNum(amount), c = String(cycle || 'monthly').toLowerCase();
  if (c === 'yearly') return a / 12;
  if (c === 'quarterly') return a / 3;
  if (c === 'weekly') return (a * 52) / 12;
  return a;
}

function fmtDate(v) {
  if (!v) return '-';
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export default function Subscriptions() {
  const { data, save, fmt } = useFinance();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name:'', category:'Streaming', amount:'', cycle:'monthly', nextDate:'', renew:'yes', note:'' });

  const subs = data?.subscriptions || [];
  const active = subs.filter(s => s.status !== 'inactive');
  const totalMonthly = active.reduce((s, x) => s + monthlyEq(x.amount, x.cycle), 0);
  const dueNext = [...active].filter(s => s.nextBillingDate).sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))[0];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function addSub() {
    if (!form.name.trim() || toNum(form.amount) <= 0) { showToast('Enter subscription name and amount.'); return; }
    const newSub = { id:Date.now(), name:form.name.trim(), category:form.category, amount:toNum(form.amount), cycle:form.cycle, monthlyCost:monthlyEq(toNum(form.amount), form.cycle), nextBillingDate:form.nextDate||'', autoRenew:form.renew==='yes', status:'active', note:form.note.trim(), createdAt:new Date().toISOString() };
    save({ ...data, subscriptions: [newSub, ...subs] });
    setForm({ name:'', category:'Streaming', amount:'', cycle:'monthly', nextDate:'', renew:'yes', note:'' });
    showToast('Subscription added.');
  }

  function removeSub(id) { save({ ...data, subscriptions: subs.filter(s => s.id !== id) }); }
  function toggleStatus(id) { save({ ...data, subscriptions: subs.map(s => s.id === id ? { ...s, status: s.status === 'inactive' ? 'active' : 'inactive' } : s) }); }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Subscriptions</div>
        <div className="page-sub">Track all recurring subscriptions and optimize monthly spend.</div>
      </div>

      <div className="grid-4" style={{ marginBottom:22 }}>
        <div className="card-sm" style={{ textAlign:'center' }}><div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Active</div><div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--primary)' }}>{active.length}</div></div>
        <div className="card-sm" style={{ textAlign:'center' }}><div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Monthly Cost</div><div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--warn)' }}>{fmt(totalMonthly)}</div></div>
        <div className="card-sm" style={{ textAlign:'center' }}><div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Yearly Cost</div><div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:'var(--accent)' }}>{fmt(totalMonthly * 12)}</div></div>
        <div className="card-sm" style={{ textAlign:'center' }}><div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Next Due</div><div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#fff' }}>{dueNext ? `${dueNext.name} · ${fmtDate(dueNext.nextBillingDate)}` : '-'}</div></div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:14 }}>Add Subscription</div>
        <div className="form-row">
          <div className="fw"><label className="flbl">Subscription Name</label><input className="finput" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix, Spotify" /></div>
          <div className="fw"><label className="flbl">Category</label>
            <select className="finput" value={form.category} onChange={e => set('category', e.target.value)}>
              {['Streaming','Music','Cloud','Software','Learning','Utilities','Gaming','Fitness','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="fw"><label className="flbl">Amount</label><input className="finput" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" step="0.01" /></div>
          <div className="fw"><label className="flbl">Billing Cycle</label>
            <select className="finput" value={form.cycle} onChange={e => set('cycle', e.target.value)}>
              <option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="quarterly">Quarterly</option><option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="fw"><label className="flbl">Next Billing Date (optional)</label><input className="finput" type="date" value={form.nextDate} onChange={e => set('nextDate', e.target.value)} /></div>
          <div className="fw"><label className="flbl">Auto Renew</label>
            <select className="finput" value={form.renew} onChange={e => set('renew', e.target.value)}>
              <option value="yes">Yes</option><option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="fw"><label className="flbl">Notes (optional)</label><input className="finput" value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. Family plan" /></div>
        <button className="btn btn-p btn-full" onClick={addSub}>Add Subscription</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)', fontFamily:'var(--fd)', fontSize:16, fontWeight:800 }}>Your Subscriptions</div>
        {!subs.length ? (
          <div style={{ padding:28, color:'var(--text-muted)', textAlign:'center' }}>No subscriptions added yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table"><thead><tr><th>Name</th><th>Category</th><th>Cycle</th><th>Next Due</th><th style={{ textAlign:'right' }}>Amount</th><th style={{ textAlign:'right' }}>Monthly Eq.</th><th /></tr></thead>
              <tbody>
                {subs.map(s => {
                  const isActive = s.status !== 'inactive';
                  return (
                    <tr key={s.id} style={{ opacity: isActive ? 1 : 0.5 }}>
                      <td>
                        <div style={{ fontWeight:700, color:'#fff' }}>{s.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.autoRenew ? 'Auto-renew' : 'Manual renew'} · {isActive ? 'Active' : 'Inactive'}</div>
                        {s.note && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{s.note}</div>}
                      </td>
                      <td style={{ color:'var(--text-muted)' }}>{s.category || 'Other'}</td>
                      <td style={{ color:'var(--text-muted)', textTransform:'capitalize' }}>{s.cycle || 'monthly'}</td>
                      <td style={{ color:'var(--text-muted)' }}>{fmtDate(s.nextBillingDate)}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'#fff' }}>{fmt(toNum(s.amount))}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'var(--primary)' }}>{fmt(monthlyEq(s.amount, s.cycle))}</td>
                      <td style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                        <button className="btn btn-s" style={{ padding:'6px 10px', fontSize:11, marginRight:6 }} onClick={() => toggleStatus(s.id)}>{isActive ? 'Pause' : 'Activate'}</button>
                        <button className="btn btn-s" style={{ padding:'6px 10px', fontSize:11 }} onClick={() => removeSub(s.id)}>Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
