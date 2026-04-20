import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';

const XP_BOOST_THRESHOLD = 25;

export default function Transactions() {
  const { data, fmt, doDeleteTx, doUpdateTx } = useFinance();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [xpFilter, setXpFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amt: '' });
  const toTimestamp = (value) => {
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : 0;
  };

  function openEditTransaction(tx) {
    setEditingTx(tx);
    setEditForm({
      name: String(tx?.name || ''),
      amt: String(Number(tx?.amt) || ''),
    });
  }

  function closeEditTransaction() {
    setEditingTx(null);
    setEditForm({ name: '', amt: '' });
  }

  function saveEditedTransaction() {
    if (!editingTx) return;
    const nextAmount = Number(editForm.amt);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      showToast('⚠️ Enter a valid amount');
      return;
    }
    const updated = doUpdateTx(editingTx.id, {
      name: editForm.name.trim() || editingTx.cat,
      amt: nextAmount,
    });
    if (!updated) {
      showToast('⚠️ Unable to update transaction');
      return;
    }
    closeEditTransaction();
    showToast('✅ Transaction updated');
  }

  useEffect(() => {
    if (!editingTx) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeEditTransaction();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingTx]);

  const txs = (data?.txs || [])
    .filter(t => {
      if (filter === 'expense' && t.type !== 'expense') return false;
      if (filter === 'income' && t.type !== 'income') return false;
      const txXp = Number(t?.xp || 0);
      if (xpFilter === 'boost' && txXp < XP_BOOST_THRESHOLD) return false;
      if (xpFilter === 'basic' && (txXp < 1 || txXp >= XP_BOOST_THRESHOLD)) return false;
      if (xpFilter === 'none' && txXp > 0) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!String(t.name || '').toLowerCase().includes(q) && !String(t.cat || '').toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => toTimestamp(b?.date) - toTimestamp(a?.date));

  return (
    <AppLayout topbarActions={<Link to="/app/add" className="btn-tb-primary">+ Add Transaction</Link>}>
      <div className="page-header">
        <div className="page-title">Transactions</div>
        <div className="page-sub">All your income and expenses in one place</div>
      </div>

      <div className="tx-toolbar">
        <input
          className="finput"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or category…"
        />
        <div className="chip-row" style={{ marginBottom:0, gap:8 }}>
          {['all','expense','income'].map(f => (
            <div
              key={f}
              className={`chip${filter === f ? ' on' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'expense' ? 'Expenses' : 'Income'}
            </div>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom:0, gap:8 }}>
          {[
            { v: 'all', label: 'All XP' },
            { v: 'boost', label: 'XP Boost (25+)' },
            { v: 'basic', label: 'XP Earned' },
            { v: 'none', label: 'No XP' },
          ].map(item => (
            <div
              key={item.v}
              className={`chip${xpFilter === item.v ? ' on' : ''}`}
              onClick={() => setXpFilter(item.v)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {!txs.length ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)', fontSize:15 }}>
            No transactions found.{' '}
            <Link to="/app/add" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>Add your first one →</Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ width:'100%' }}>
              <thead>
                <tr>
                  <th>Transaction</th><th>Category</th><th>Date</th><th>Payment</th><th style={{ textAlign:'right' }}>Amount</th><th style={{ textAlign:'right' }}>XP</th><th />
                </tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:`${tx.clr || '#666'}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{tx.ico}</div>
                        <div style={{ fontWeight:600, color:'#fff' }}>{tx.name}</div>
                      </div>
                    </td>
                    <td><span className={`tag-${tx.type === 'income' ? 'green' : 'warn'}`}>{tx.cat}</span></td>
                    <td style={{ color:'var(--text-muted)' }}>{tx.date}</td>
                    <td style={{ color:'var(--text-muted)' }}>{tx.pay || '-'}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--fd)', fontSize:15, fontWeight:800, color: tx.type === 'income' ? 'var(--primary)' : 'var(--warn)' }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amt)}
                    </td>
                    <td style={{ textAlign:'right', color:'var(--accent)', fontWeight:700 }}>
                      {tx.xp ? `+${tx.xp}` : '—'}
                    </td>
                    <td style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                      <button
                        className="btn btn-s"
                        style={{ padding:'4px 10px', fontSize:11, marginRight:6 }}
                        onClick={() => openEditTransaction(tx)}
                      >✎</button>
                      <button
                        className="btn btn-s"
                        style={{ padding:'4px 10px', fontSize:11 }}
                        onClick={() => doDeleteTx(tx.id)}
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editingTx && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'grid', placeItems:'center', zIndex:90, padding:16 }}
          onClick={closeEditTransaction}
        >
          <div
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-edit-title"
            style={{ width:'100%', maxWidth:420 }}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedTransaction();
              }
            }}
          >
            <div id="tx-edit-title" style={{ fontFamily:'var(--fd)', fontSize:20, fontWeight:800, color:'#fff', marginBottom:14 }}>Edit Transaction</div>
            <div className="fw" style={{ marginBottom:12 }}>
              <label className="flbl" htmlFor="tx-name">Name</label>
              <input id="tx-name" className="finput" autoFocus value={editForm.name} onChange={e => setEditForm(v => ({ ...v, name: e.target.value }))} />
            </div>
            <div className="fw" style={{ marginBottom:20 }}>
              <label className="flbl" htmlFor="tx-amt">Amount</label>
              <input id="tx-amt" className="finput" type="number" min="0" step="0.01" value={editForm.amt} onChange={e => setEditForm(v => ({ ...v, amt: e.target.value }))} />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn-s" onClick={closeEditTransaction}>Cancel</button>
              <button className="btn btn-p btn-s" onClick={saveEditedTransaction}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
