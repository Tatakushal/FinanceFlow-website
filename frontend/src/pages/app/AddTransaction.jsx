import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';
import NumPad from '../../components/common/NumPad';

const EXPENSE_CATS = [
  {n:'Food',i:'🍕'},{n:'Travel',i:'🚕'},{n:'Shopping',i:'🛍️'},{n:'Bills',i:'💡'},
  {n:'Health',i:'💊'},{n:'Leisure',i:'🎮'},{n:'Education',i:'📚'},{n:'Fuel',i:'⛽'},
  {n:'Entertainment',i:'🎬'},{n:'Personal',i:'✂️'},{n:'Fitness',i:'🏋️'},{n:'Other',i:'💫'},
];

const INCOME_CATS = [
  {n:'Salary',i:'💼'},{n:'Freelance',i:'💻'},{n:'Investment',i:'📈'},
  {n:'Rental',i:'🏠'},{n:'Business',i:'🏪'},{n:'Gift',i:'🎁'},
  {n:'Bonus',i:'🎯'},{n:'Other',i:'💫'},
];

export default function AddTransaction() {
  const [params] = useSearchParams();
  const defaultType = params.get('type') === 'income' ? 'income' : 'expense';

  const [type, setType] = useState(defaultType);
  const [amt, setAmt] = useState('0');
  const [cat, setCat] = useState(null);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pay, setPay] = useState('UPI');
  const [recurring, setRecurring] = useState(false);

  const { doAddTx, fmt } = useFinance();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  function handleAdd() {
    const v = parseFloat(amt);
    if (!v || v <= 0) { showToast('⚠️ Enter an amount first'); return; }
    if (!cat) { showToast('⚠️ Select a category'); return; }
    const txName = desc.trim() || cat.n;
    const created = doAddTx({
      type,
      amt: v,
      cat: cat.n,
      ico: cat.i,
      name: txName,
      date,
      pay: type === 'expense' ? pay : 'Bank',
      clr: type === 'expense' ? '#FF6B35' : '#00E5A0',
    });
    const xpLine = created?.xp ? ` • +${created.xp} XP` : '';
    showToast(`✅ ${fmt(v)} ${type === 'expense' ? 'expense' : 'income'} added to ${cat.n}${xpLine}`);
    setTimeout(() => navigate('/app/dashboard'), 700);
  }

  return (
    <AppLayout
      topbarActions={
        <Link to="/app/dashboard" className="tb-back">← Dashboard</Link>
      }
    >
      {/* Type toggle */}
      <div style={{ display:'flex', gap:12, marginBottom:28 }}>
        <div
          style={{ flex:1, maxWidth:200, padding:'12px 20px', cursor:'pointer',
            background: type === 'expense' ? 'var(--warn-dim)' : 'var(--surface2)',
            border: type === 'expense' ? '2px solid var(--warn)' : '2px solid var(--border)',
            borderRadius:12, textAlign:'center', fontSize:14, fontWeight:700,
            color: type === 'expense' ? 'var(--warn)' : 'var(--text-muted)',
          }}
          onClick={() => { setType('expense'); setCat(null); }}
        >💸 Expense</div>
        <div
          style={{ flex:1, maxWidth:200, padding:'12px 20px', cursor:'pointer',
            background: type === 'income' ? 'var(--primary-dim)' : 'var(--surface2)',
            border: type === 'income' ? '2px solid var(--primary)' : '2px solid var(--border)',
            borderRadius:12, textAlign:'center', fontSize:14, fontWeight:700,
            color: type === 'income' ? 'var(--primary)' : 'var(--text-muted)',
          }}
          onClick={() => { setType('income'); setCat(null); }}
        >💰 Income</div>
      </div>

      <div className="add-tx-layout">
        <NumPad value={amt} onChange={setAmt} accentColor={type === 'income' ? 'var(--primary)' : 'var(--warn)'} />

        <div>
          <div style={{ fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color:'#fff', marginBottom:12 }}>
            {type === 'income' ? 'Income Source' : 'Category'}
          </div>
          <div className="cat-grid">
            {cats.map(c => (
              <div
                key={c.n}
                className={`cat-item${cat?.n === c.n ? (type === 'income' ? ' sel-i' : ' sel-e') : ''}`}
                onClick={() => setCat(c)}
              >
                <div className="cat-emoji">{c.i}</div>
                <div className="cat-name">{c.n}</div>
              </div>
            ))}
          </div>

          <div className="card-sm">
            <div className="fw">
              <label className="flbl">Description</label>
              <input className="finput" value={desc} onChange={e => setDesc(e.target.value)} placeholder={type === 'income' ? 'e.g. May Salary, Project payment…' : 'e.g. Lunch, Amazon order…'} />
            </div>
            {type === 'expense' && (
              <div className="form-row">
                <div className="fw">
                  <label className="flbl">Date</label>
                  <input className="finput" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="fw">
                  <label className="flbl">Payment</label>
                  <select className="finput" value={pay} onChange={e => setPay(e.target.value)}>
                    <option>UPI</option><option>Cash</option><option>Card</option>
                    <option>Net Banking</option><option>Wallet</option>
                  </select>
                </div>
              </div>
            )}
            {type === 'income' && (
              <div className="fw" style={{ marginBottom:16 }}>
                <label className="flbl">Date</label>
                <input className="finput" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            )}
            {type === 'expense' && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:12, background:'var(--surface3)', borderRadius:10, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>🔁 Recurring</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Repeat monthly (EMI / subscription)</div>
                </div>
                <button
                  className={`tog${recurring ? ' on' : ' off'}`}
                  onClick={() => setRecurring(r => !r)}
                />
              </div>
            )}
            <button
              className="btn btn-p btn-full"
              onClick={handleAdd}
              style={type === 'income' ? { background:'var(--primary)', color:'#000', boxShadow:'0 4px 16px var(--primary-glow)' } : {}}
            >
              ✓ Add {type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
