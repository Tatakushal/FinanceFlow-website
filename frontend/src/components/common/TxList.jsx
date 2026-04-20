import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';

export default function TxList({ limit, onDelete }) {
  const { data, fmt, doDeleteTx } = useFinance();
  const { showToast } = useToast();

  const toTimestamp = (value) => {
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : 0;
  };

  const allTxs = (data?.txs || [])
    .slice()
    .sort((a, b) => toTimestamp(b?.date) - toTimestamp(a?.date));
  const txs = limit ? allTxs.slice(0, limit) : allTxs;

  if (!txs.length) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 15 }}>
        No transactions yet.
      </div>
    );
  }

  function handleDelete(tx) {
    doDeleteTx(tx.id);
    showToast(`Deleted: ${tx.name}`);
    onDelete?.();
  }

  return (
    <div className="tx-list">
      {txs.map(tx => (
        <div key={tx.id} className="tx-row">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `${tx.clr || '#666'}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>{tx.ico}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              <span className={`tag-${tx.type === 'income' ? 'green' : 'warn'}`} style={{ padding: '2px 8px' }}>{tx.cat}</span>
              {' · '}{tx.date}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontFamily: 'var(--fd)', fontWeight: 800, fontSize: 15,
              color: tx.type === 'income' ? 'var(--primary)' : 'var(--warn)',
            }}>
              {tx.type === 'income' ? '+' : '-'}{fmt(tx.amt)}
            </div>
            {onDelete !== false && (
              <button
                onClick={() => handleDelete(tx)}
                style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}
              >×</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
