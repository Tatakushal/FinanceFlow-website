import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';

function toNum(v) { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; }

function LoanProgress({ loan }) {
  const { fmt } = useFinance();
  const outstanding = toNum(loan?.outstandingAmount ?? loan?.amount ?? 0);
  const original = toNum(loan?.originalAmount ?? outstanding);
  const paid = toNum(loan?.paidAmount ?? Math.max(original - outstanding, 0));
  const progress = original > 0 ? Math.min(100, Math.round((paid / original) * 100)) : 0;
  return (
    <div style={{ marginTop:6 }}>
      <div className="pbar-sm">
        <div className="pfill-sm" style={{ width:`${progress}%`, background:'linear-gradient(90deg,var(--primary),var(--accent))' }} />
      </div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{progress}% repaid · Original {fmt(original)}</div>
    </div>
  );
}

export default function Wealth() {
  const { data, save, netWorth, fmt } = useFinance();
  const { showToast } = useToast();

  const [assetForm, setAssetForm] = useState({ name:'', type:'Stocks', value:'', qty:'', note:'' });
  const [liabForm, setLiabForm] = useState({ name:'', type:'Home Loan', linked:'', lender:'', original:'', outstanding:'', emi:'', rate:'', start:'', tenure:'', note:'' });

  const sa = (k, v) => setAssetForm(f => ({ ...f, [k]: v }));
  const sl = (k, v) => setLiabForm(f => ({ ...f, [k]: v }));

  const wealth = data?.wealth || { assets:[], liabilities:[] };
  const paidTotal = wealth.liabilities.reduce((s, l) => s + toNum(l?.paidAmount ?? Math.max(toNum(l?.originalAmount) - toNum(l?.outstandingAmount ?? l?.amount), 0)), 0);

  function addAsset() {
    if (!assetForm.name.trim() || toNum(assetForm.value) <= 0) { showToast('Enter asset name and value.'); return; }
    const updated = { ...data, wealth: { ...wealth, assets: [{ id:Date.now(), name:assetForm.name.trim(), type:assetForm.type, value:toNum(assetForm.value), quantity:toNum(assetForm.qty), note:assetForm.note.trim(), createdAt:new Date().toISOString() }, ...wealth.assets] } };
    save(updated);
    setAssetForm({ name:'', type:'Stocks', value:'', qty:'', note:'' });
    showToast('Asset added.');
  }

  function addLiability() {
    if (!liabForm.name.trim() || toNum(liabForm.original) <= 0) { showToast('Enter liability name and original loan amount.'); return; }
    const orig = toNum(liabForm.original), outstanding = toNum(liabForm.outstanding);
    if (outstanding > orig) { showToast('Outstanding cannot exceed original.'); return; }
    const paid = Math.max(orig - outstanding, 0);
    const updated = { ...data, wealth: { ...wealth, liabilities: [{ id:Date.now(), name:liabForm.name.trim(), type:liabForm.type, linkedTo:liabForm.linked.trim(), lender:liabForm.lender.trim(), originalAmount:orig, outstandingAmount:outstanding, paidAmount:paid, amount:outstanding, emi:toNum(liabForm.emi), rate:toNum(liabForm.rate), startDate:liabForm.start, tenureMonths:toNum(liabForm.tenure), note:liabForm.note.trim(), createdAt:new Date().toISOString() }, ...wealth.liabilities] } };
    save(updated);
    setLiabForm({ name:'', type:'Home Loan', linked:'', lender:'', original:'', outstanding:'', emi:'', rate:'', start:'', tenure:'', note:'' });
    showToast('Liability added.');
  }

  function removeAsset(id) { save({ ...data, wealth: { ...wealth, assets: wealth.assets.filter(a => a.id !== id) } }); }
  function removeLiability(id) { save({ ...data, wealth: { ...wealth, liabilities: wealth.liabilities.filter(l => l.id !== id) } }); }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Wealth &amp; Portfolio</div>
        <div className="page-sub">Track assets, loans, stocks, mutual funds, gold, and total net worth.</div>
      </div>

      <div className="grid-4" style={{ marginBottom:22 }}>
        {[{ label:'Total Assets', val:netWorth.assets, color:'var(--primary)' }, { label:'Loans Left', val:netWorth.liabilities, color:'var(--warn)' }, { label:'Loans Paid', val:paidTotal, color:'var(--primary)' }, { label:'Net Worth', val:netWorth.net, color:'var(--accent)' }].map(c => (
          <div key={c.label} className="card-sm" style={{ textAlign:'center' }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>{c.label}</div>
            <div style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:800, color:c.color }}>{fmt(c.val)}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:20, marginBottom:22 }}>
        {/* Add Asset */}
        <div className="card">
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:14 }}>Add Asset</div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Asset Name</label><input className="finput" value={assetForm.name} onChange={e => sa('name', e.target.value)} placeholder="e.g. SBI Stock, Gold Coins" /></div>
            <div className="fw"><label className="flbl">Type</label>
              <select className="finput" value={assetForm.type} onChange={e => sa('type', e.target.value)}>
                {['Stocks','Mutual Funds','Gold','Cash','Property','Crypto','Fixed Deposit','Bonds','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Current Value</label><input className="finput" type="number" value={assetForm.value} onChange={e => sa('value', e.target.value)} placeholder="0" min="0" /></div>
            <div className="fw"><label className="flbl">Quantity (optional)</label><input className="finput" type="number" value={assetForm.qty} onChange={e => sa('qty', e.target.value)} placeholder="0" min="0" /></div>
          </div>
          <div className="fw"><label className="flbl">Notes (optional)</label><input className="finput" value={assetForm.note} onChange={e => sa('note', e.target.value)} placeholder="e.g. Long term holding" /></div>
          <button className="btn btn-p btn-full" onClick={addAsset}>Add Asset</button>
        </div>

        {/* Add Liability */}
        <div className="card">
          <div style={{ fontFamily:'var(--fd)', fontSize:18, fontWeight:800, color:'#fff', marginBottom:14 }}>Add Liability</div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Liability Name</label><input className="finput" value={liabForm.name} onChange={e => sl('name', e.target.value)} placeholder="e.g. Education Loan" /></div>
            <div className="fw"><label className="flbl">Type</label>
              <select className="finput" value={liabForm.type} onChange={e => sl('type', e.target.value)}>
                {['Home Loan','Personal Loan','Education Loan','Car Loan','Credit Card Due','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Original Loan Amount</label><input className="finput" type="number" value={liabForm.original} onChange={e => sl('original', e.target.value)} placeholder="0" min="0" /></div>
            <div className="fw"><label className="flbl">Outstanding Amount</label><input className="finput" type="number" value={liabForm.outstanding} onChange={e => sl('outstanding', e.target.value)} placeholder="0" min="0" /></div>
          </div>
          <div className="form-row">
            <div className="fw"><label className="flbl">EMI (optional)</label><input className="finput" type="number" value={liabForm.emi} onChange={e => sl('emi', e.target.value)} placeholder="0" min="0" /></div>
            <div className="fw"><label className="flbl">Interest % (optional)</label><input className="finput" type="number" value={liabForm.rate} onChange={e => sl('rate', e.target.value)} placeholder="0" min="0" step="0.01" /></div>
          </div>
          <div className="form-row">
            <div className="fw"><label className="flbl">Lender / Bank</label><input className="finput" value={liabForm.lender} onChange={e => sl('lender', e.target.value)} placeholder="e.g. HDFC Bank" /></div>
            <div className="fw"><label className="flbl">Start Date (optional)</label><input className="finput" type="date" value={liabForm.start} onChange={e => sl('start', e.target.value)} /></div>
          </div>
          <div className="fw"><label className="flbl">Notes (optional)</label><input className="finput" value={liabForm.note} onChange={e => sl('note', e.target.value)} placeholder="e.g. Prepay in 18 months" /></div>
          <button className="btn btn-p btn-full" onClick={addLiability}>Add Liability</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap:20 }}>
        {/* Assets list */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)', fontFamily:'var(--fd)', fontSize:16, fontWeight:800 }}>Assets</div>
          {!wealth.assets.length ? (
            <div style={{ padding:28, color:'var(--text-muted)', textAlign:'center' }}>No assets added yet.</div>
          ) : (
            <div className="table-scroll">
              <table className="data-table"><thead><tr><th>Name</th><th>Type</th><th style={{ textAlign:'right' }}>Value</th><th /></tr></thead>
                <tbody>
                  {wealth.assets.map(a => (
                    <tr key={a.id}>
                      <td><div style={{ fontWeight:600, color:'#fff' }}>{a.name}</div>{a.note && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{a.note}</div>}</td>
                      <td style={{ color:'var(--text-muted)' }}>{a.type}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'var(--primary)' }}>{fmt(a.value)}</td>
                      <td style={{ textAlign:'right' }}><button className="btn btn-s" style={{ padding:'6px 10px', fontSize:11 }} onClick={() => removeAsset(a.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Liabilities list */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)', fontFamily:'var(--fd)', fontSize:16, fontWeight:800 }}>Liabilities</div>
          {!wealth.liabilities.length ? (
            <div style={{ padding:28, color:'var(--text-muted)', textAlign:'center' }}>No liabilities added yet.</div>
          ) : (
            <div className="table-scroll">
              <table className="data-table"><thead><tr><th>Loan</th><th>Linked Asset</th><th style={{ textAlign:'right' }}>Paid</th><th style={{ textAlign:'right' }}>Left</th><th /></tr></thead>
                <tbody>
                  {wealth.liabilities.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight:700, color:'#fff' }}>{l.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{l.type}{l.lender ? ` · ${l.lender}` : ''}</div>
                        <LoanProgress loan={l} />
                      </td>
                      <td style={{ color:'var(--text-muted)' }}>{l.linkedTo || '-'}<br />{l.startDate ? <small>Start: {l.startDate}</small> : null}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'var(--primary)' }}>{fmt(toNum(l?.paidAmount ?? 0))}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'var(--warn)' }}>{fmt(toNum(l?.outstandingAmount ?? l?.amount ?? 0))}</td>
                      <td style={{ textAlign:'right' }}><button className="btn btn-s" style={{ padding:'6px 10px', fontSize:11 }} onClick={() => removeLiability(l.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
