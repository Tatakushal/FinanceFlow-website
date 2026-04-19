import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import AppLayout from '../../components/layout/AppLayout';

export default function Leaderboard() {
  const { data, leaderboard, doSendFriendRequest, doAcceptFriendRequest, doRejectFriendRequest } = useFinance();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const incoming = data?.social?.incomingRequests || [];
  const outgoing = data?.social?.outgoingRequests || [];

  function sendRequest() {
    const target = email.trim().toLowerCase();
    if (!target) { showToast('⚠️ Enter a friend email'); return; }
    try {
      doSendFriendRequest(target);
      setEmail('');
      showToast('✅ Friend request sent');
    } catch (err) {
      showToast(`⚠️ ${err?.message || 'Unable to send request'}`);
    }
  }

  function acceptRequest(fromEmail) {
    try {
      const gained = doAcceptFriendRequest(fromEmail);
      showToast(`✅ Friend request accepted${gained ? ` • +${gained} XP` : ''}`);
    } catch (err) {
      showToast(`⚠️ ${err?.message || 'Unable to accept request'}`);
    }
  }

  function rejectRequest(fromEmail) {
    try {
      doRejectFriendRequest(fromEmail);
      showToast('Request rejected');
    } catch (err) {
      showToast(`⚠️ ${err?.message || 'Unable to reject request'}`);
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Leaderboard 🏆</div>
        <div className="page-sub">Compare XP levels with friends</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Add Friend</div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <div className="fw">
            <input className="finput" value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@email.com" />
          </div>
          <button className="btn btn-p" style={{ minWidth: 170 }} onClick={sendRequest}>Send Request</button>
        </div>
        {!!outgoing.length && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            Pending: {outgoing.map(o => o.email).join(', ')}
          </div>
        )}
      </div>

      {!!incoming.length && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Incoming Requests</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {incoming.map(req => (
              <div key={req.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{req.name || req.email}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{req.email}</div>
                </div>
                <button className="btn btn-s" onClick={() => acceptRequest(req.email)}>Accept</button>
                <button className="btn btn-s" style={{ color: 'var(--warn)' }} onClick={() => rejectRequest(req.email)}>Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!leaderboard.length ? (
          <div style={{ textAlign: 'center', padding: '54px 20px', color: 'var(--text-muted)' }}>No leaderboard data yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rank</th><th>User</th><th>Title</th><th style={{ textAlign: 'right' }}>Level</th><th style={{ textAlign: 'right' }}>XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(row => (
                  <tr key={row.email}>
                    <td style={{ color: row.rank === 1 ? 'var(--primary)' : 'var(--text)' }}>#{row.rank}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        {row.name} {row.isYou ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>(You)</span> : null}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.email}</div>
                    </td>
                    <td>{row.title}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.level}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 800 }}>{row.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
