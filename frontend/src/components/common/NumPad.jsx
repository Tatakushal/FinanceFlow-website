/**
 * NumPad — shared numeric input for Add Expense / Add Income
 */
export default function NumPad({ value, onChange, accentColor }) {
  const accent = accentColor || 'var(--warn)';

  function press(k) {
    let v = value;
    if (k === '.' && v.includes('.')) return;
    if (k !== '.' && v === '0') v = '';
    if (v.length >= 9) return;
    v += k;
    if (!v || v === '.') v = '0';
    onChange(v);
  }

  function del() {
    const v = value.slice(0, -1) || '0';
    onChange(v);
  }

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  const amountLength = String(value || '0').length;
  const amountSizeClass = amountLength >= 8 ? ' long' : amountLength >= 6 ? ' mid' : '';

  return (
    <div className="numpad-section">
      <div className="amt-display">
        <span className="amt-cur" style={{ color: accent }}>₹</span>
        <span className={`amt-val${amountSizeClass}`} style={{ color: accent }}>{value || '0'}</span>
      </div>
      <div className="numpad">
        {keys.map(k => (
          <div
            key={k}
            className={`nkey${k === '⌫' ? ' del' : ''}`}
            onClick={() => k === '⌫' ? del() : press(k)}
          >{k}</div>
        ))}
      </div>
    </div>
  );
}
