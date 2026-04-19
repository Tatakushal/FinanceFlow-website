import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';

export default function Goals() {
  const { data, save, fmt, doAwardXp } = useFinance();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', emoji:'🎯', target:'', saved:'0' });

  const goals = data?.goals || [];

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function addGoal() {
    if (!form.name.trim() || !form.target) { showToast('⚠️ Enter a name and target amount'); return; }
    const tgt = parseInt(form.target);
    const sv = parseInt(form.saved) || 0;
    if (isNaN(tgt) || tgt <= 0) { showToast('⚠️ Enter a valid target amount'); return; }
    const updated = { ...data, goals: [...goals, { id: Date.now(), name: form.name.trim(), emoji: form.emoji || '🎯', saved: sv, target: tgt }] };
    save(updated);
    showToast(`🎯 Goal "${form.name}" created!`);
    setForm({ name:'', emoji:'🎯', target:'', saved:'0' });
    setShowForm(false);
  }

  function deleteGoal(id) {
    save({ ...data, goals: goals.filter(g => g.id !== id) });
    showToast('Goal removed');
  }

  function addSavings(id) {
    const amt = parseFloat(prompt('How much have you saved towards this goal?') || '0');
    if (!amt || isNaN(amt)) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const wasComplete = goal.saved >= goal.target;
    const updated = { ...data, goals: goals.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g) };
    save(updated);
    const refreshedGoal = updated.goals.find(g => g.id === id);
    const isNowComplete = refreshedGoal && refreshedGoal.saved >= refreshedGoal.target;
    let gained = doAwardXp(Math.max(8, Math.min(40, Math.round(amt / 200))), `Saved toward goal: ${goal.name}`);
    if (!wasComplete && isNowComplete) {
      gained += doAwardXp(60, `Goal completed: ${goal.name}`);
    }
    showToast(`Added ${fmt(amt)} to goal${gained ? ` • +${gained} XP` : ''}!`);
  }

  return (
    <AppLayout topbarActions={<button className="btn-tb-primary" onClick={() => setShowForm(v => !v)}>＋ New Goal</button>}>
      <div className="page-header">
        <div className="page-title">Goals 🎯</div>
        <div className="page-sub">Track your financial dreams</div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:20 }}>Create New Goal</div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Goal Name</label><input className="finput" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emergency Fund, New Car" /></div>
            <div className="fw"><label className="flbl">Emoji</label><input className="finput" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🎯" maxLength={2} style={{ fontSize:24 }} /></div>
          </div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Target Amount (₹)</label><input className="finput" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="e.g. 100000" min="1" /></div>
            <div className="fw"><label className="flbl">Already Saved (₹)</label><input className="finput" type="number" value={form.saved} onChange={e => set('saved', e.target.value)} placeholder="0" min="0" /></div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-s" style={{ flex:1 }} onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-p" style={{ flex:2 }} onClick={addGoal}>✓ Create Goal</button>
          </div>
        </div>
      )}

      {!goals.length ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-muted)' }}>
          <div style={{ fontSize:64, marginBottom:20 }}>🎯</div>
          <div style={{ fontFamily:'var(--fd)', fontSize:22, fontWeight:800, color:'#fff', marginBottom:10 }}>No goals yet</div>
          <div style={{ fontSize:15, marginBottom:24 }}>Set a financial goal and track your progress</div>
          <button className="btn btn-p" style={{ maxWidth:200, margin:'0 auto' }} onClick={() => setShowForm(true)}>＋ Create First Goal</button>
        </div>
      ) : (
        <div className="grid-2">
          {goals.map(g => {
            const pct = Math.min(g.saved / g.target * 100, 100).toFixed(0);
            const on = g.saved >= g.target * 0.5;
            const col = on ? 'var(--primary)' : 'var(--warn)';
            return (
              <div key={g.id} className="goal-card" style={{ background: `linear-gradient(135deg,${on ? 'rgba(0,229,160,0.06)' : 'rgba(255,107,53,0.06)'},rgba(61,127,255,0.03))`, borderColor: on ? 'rgba(0,229,160,0.2)' : 'rgba(255,107,53,0.2)' }}>
                <div className="goal-hdr">
                  <span className="goal-emoji">{g.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div className="goal-title">{g.name}</div>
                    <div className="goal-status" style={{ color:col }}>{pct}% complete · {on ? 'On track ✓' : 'Needs attention'}</div>
                  </div>
                  <div style={{ fontFamily:'var(--fd)', fontSize:20, fontWeight:800, color:col }}>{pct}%</div>
                </div>
                <div className="pbar" style={{ marginBottom:10 }}>
                  <div className="pfill" style={{ width:`${pct}%`, background: `linear-gradient(90deg,${on ? 'var(--primary),var(--accent)' : 'var(--warn),var(--purple)'})` }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)' }}>
                  <span>{fmt(g.saved)} saved</span>
                  <span>{fmt(g.target - g.saved)} remaining</span>
                  <span>{fmt(g.target)} goal</span>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button className="btn btn-s" style={{ flex:1, fontSize:12 }} onClick={() => addSavings(g.id)}>+ Add savings</button>
                  <button className="btn btn-s" style={{ fontSize:12, color:'var(--warn)' }} onClick={() => deleteGoal(g.id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
