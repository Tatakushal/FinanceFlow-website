import { useFinance } from '../../contexts/FinanceContext';

export default function BudgetRings({ max = 6 }) {
  const { data, fmt } = useFinance();
  const budgets = (data?.budgets || []).slice(0, max);

  if (!budgets.length) return null;

  const decodeIcon = (value) => {
    if (typeof value !== 'string') return '';
    return value.replace(/&#(x?[0-9a-fA-F]+);/g, (match, code) => {
      const point = code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    });
  };

  return (
    <div className="rings-grid">
      {budgets.map(b => {
        const pct = b.lim > 0 ? Math.min(b.spent / b.lim * 100, 100) : 0;
        const r = 36;
        const circ = 2 * Math.PI * r;
        const dash = (pct / 100) * circ;
        const over = b.spent > b.lim;
        const color = over ? 'var(--warn)' : b.clr || 'var(--primary)';

        return (
          <div key={b.cat} className="ring-item">
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
          </div>
        );
      })}
    </div>
  );
}
