import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';

export default function BudgetRings({ max = 6, manage = false }) {
  const { data, fmt, save } = useFinance();
  const { showToast } = useToast();
  const allBudgets = data?.budgets || [];
  const budgets = allBudgets.slice(0, max);
  const [editingCat, setEditingCat] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cat: '', ico: '💰', lim: '', clr: '#3D7FFF' });

  const decodeIcon = (value) => {
    if (typeof value !== 'string') return '';
    return value.replace(/&#(x?[0-9a-fA-F]+);/g, (match, code) => {
      const point = code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    });
  };

  const resetForm = () => {
    setEditingCat(null);
    setForm({ cat: '', ico: '💰', lim: '', clr: '#3D7FFF' });
    setShowForm(false);
  };

  const startAdd = () => {
    setEditingCat(null);
    setForm({ cat: '', ico: '💰', lim: '', clr: '#3D7FFF' });
    setShowForm(true);
  };

  const startEdit = (budget) => {
    setEditingCat(budget.cat);
    setForm({
      cat: String(budget.cat || ''),
      ico: decodeIcon(budget.ico) || '💰',
      lim: String(Number(budget.lim) || ''),
      clr: budget.clr || '#3D7FFF',
    });
    setShowForm(true);
  };

  const removeBudget = (cat) => {
    if (!data) return;
    save({ ...data, budgets: allBudgets.filter(b => b.cat !== cat) });
    showToast('Budget removed');
    if (editingCat === cat) resetForm();
  };

  const saveBudget = () => {
    if (!data) return;
    const cat = form.cat.trim();
    const lim = Number(form.lim);
    if (!cat) { showToast('Enter a budget category.'); return; }
    if (!Number.isFinite(lim) || lim <= 0) { showToast('Enter a valid budget limit.'); return; }

    const duplicate = allBudgets.some(b => b.cat === cat && b.cat !== editingCat);
    if (duplicate) { showToast('A budget with this category already exists.'); return; }

    const icon = form.ico.trim() || '💰';
    const color = form.clr || '#3D7FFF';

    let updatedBudgets;
    if (editingCat) {
      updatedBudgets = allBudgets.map(b => (b.cat === editingCat
        ? { ...b, cat, ico: icon, lim, clr: color }
        : b));
      showToast('Budget updated');
    } else {
      updatedBudgets = [{ cat, ico: icon, spent: 0, lim, clr: color }, ...allBudgets];
      showToast('Budget added');
    }

    save({ ...data, budgets: updatedBudgets });
    resetForm();
  };

  if (!budgets.length && !manage) return null;

  return (
    <div>
      {manage ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="btn btn-s" style={{ padding: '8px 12px', fontSize: 12 }} onClick={startAdd}>
            + Add Budget
          </button>
        </div>
      ) : null}

      {!budgets.length && manage ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No budget rings yet. Add one to start tracking.</div>
      ) : null}

      <div className="rings-grid">
        {budgets.map((b, idx) => {
          const pct = b.lim > 0 ? Math.min(b.spent / b.lim * 100, 100) : 0;
          const r = 36;
          const circ = 2 * Math.PI * r;
          const dash = (pct / 100) * circ;
          const over = b.spent > b.lim;
          const color = over ? 'var(--warn)' : b.clr || 'var(--primary)';

          return (
            <div key={`${b.cat}-${idx}`} className="ring-item">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="44" cy="44" r={r} fill="none"
                  stroke={color} strokeWidth="8"
                  strokeDasharray={`${dash} ${circ}`}
                  strokeLinecap="round"
                  transform="rotate(-90 44 44)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <text x="44" y="46" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="13" fontWeight="800" fontFamily="var(--fd)">
                  {Math.round(pct)}%
                </text>
              </svg>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{decodeIcon(b.ico)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{b.cat}</div>
              <div style={{ fontSize: 11, color: over ? 'var(--warn)' : 'var(--text-dim)' }}>
                {fmt(b.spent)} / {fmt(b.lim)}
              </div>
              {manage ? (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  <button className="btn btn-s" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => startEdit(b)}>Edit</button>
                  <button className="btn btn-s" style={{ padding: '6px 10px', fontSize: 11, color: 'var(--warn)' }} onClick={() => removeBudget(b.cat)}>Remove</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {manage && showForm ? (
        <div className="card-sm" style={{ marginTop: 14, padding: 14 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
            {editingCat ? 'Edit Budget Ring' : 'Add Budget Ring'}
          </div>
          <div className="form-row">
            <div className="fw">
              <label className="flbl">Category</label>
              <input className="finput" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))} placeholder="e.g. Food" />
            </div>
            <div className="fw">
              <label className="flbl">Icon</label>
              <input className="finput" value={form.ico} onChange={e => setForm(f => ({ ...f, ico: e.target.value }))} placeholder="🍕" />
            </div>
          </div>
          <div className="form-row">
            <div className="fw">
              <label className="flbl">Limit</label>
              <input className="finput" type="number" min="1" value={form.lim} onChange={e => setForm(f => ({ ...f, lim: e.target.value }))} placeholder="0" />
            </div>
            <div className="fw">
              <label className="flbl">Color</label>
              <input className="finput" type="color" value={form.clr} onChange={e => setForm(f => ({ ...f, clr: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-p" style={{ padding: '10px 14px', fontSize: 13 }} onClick={saveBudget}>
              {editingCat ? 'Save Changes' : 'Add Budget'}
            </button>
            <button className="btn btn-s" style={{ padding: '10px 14px', fontSize: 13 }} onClick={resetForm}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
