import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import { callFlowAI } from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';

const QUICK = [
  'How am I doing this month?', 'Where am I overspending?',
  'Which subscriptions should I cancel?', 'Give me a weekly saving plan',
  'Am I on track with my goals?',
];

function buildProfile(user, data, totals) {
  const txs = (data?.txs || []).slice(0, 40);
  const budgets = (data?.budgets || []).slice(0, 10);
  const goals = (data?.goals || []).slice(0, 5);
  return { name: user?.name || '', income: totals.income, spent: totals.spent, saved: totals.saved, rate: totals.rate, txs, budgets, goals };
}

export default function AIChat() {
  const { user } = useAuth();
  const { data, totals, fmt } = useFinance();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([
    { role:'ai', text:'FlowAI is in training — answers may be incomplete. Ask me anything about your finances! ✨' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const chatRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' });
  }, [messages]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || busy) return;
    setInput('');
    setMessages(m => [...m, { role:'user', text: msg }]);
    setBusy(true);

    historyRef.current.push({ role:'user', content: msg.slice(0,800) });
    if (historyRef.current.length > 12) historyRef.current.splice(0, historyRef.current.length - 12);

    try {
      const profile = buildProfile(user, data, totals);
      const res = await callFlowAI({ message: msg, profile, history: historyRef.current.slice(0,-1) });
      const reply = res?.reply || res?.message || 'I was unable to generate a response. Please try again.';
      historyRef.current.push({ role:'assistant', content: String(reply).slice(0,800) });
      setMessages(m => [...m, { role:'ai', text: reply }]);
    } catch (err) {
      const code = err?.status;
      let errMsg = '⚠️ Could not reach FlowAI. Please check your connection.';
      if (code === 429) errMsg = '⚠️ Too many requests. Please wait a moment.';
      else if (code >= 500) errMsg = '⚠️ Server error. Please try again later.';
      setMessages(m => [...m, { role:'ai', text: errMsg }]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, user, data, totals]);

  return (
    <AppLayout
      topbarActions={
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:12, color:'var(--primary)', fontWeight:800 }}>FlowAI</div>
          <span className="tag-warn" style={{ padding:'4px 10px', fontSize:11 }}>In Training</span>
        </div>
      }
    >
      <div className="chip-row" style={{ marginBottom:16 }}>
        {QUICK.map(q => (
          <div key={q} className="chip" onClick={() => send(q)}>{q}</div>
        ))}
      </div>

      <div className="chat-layout ai-chat-layout">
        <div className="chat-box ai-chat-box">
          <div className="chat-area" ref={chatRef}>
            {messages.map((m, i) => (
              m.role === 'ai' ? (
                <div key={i} className="msg-ai">
                  <div className="ai-avatar">AI</div>
                  <div className="bubble-ai">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="msg-user">
                  <div className="bubble-user">{m.text}</div>
                </div>
              )
            ))}
            {busy && (
              <div className="msg-ai">
                <div className="ai-avatar">AI</div>
                <div className="bubble-ai">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-in"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask FlowAI anything…"
              disabled={busy}
            />
            <button className="chat-send" onClick={() => send()} disabled={busy}>Go</button>
          </div>
        </div>

        {/* Snapshot */}
        <div className="card-sm">
          <div style={{ fontFamily:'var(--fd)', fontSize:13, fontWeight:800, color:'#fff', marginBottom:10 }}>Snapshot</div>
          <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.9 }}>
            <div>💰 Income: <strong style={{ color:'var(--primary)' }}>{fmt(totals.income)}</strong></div>
            <div>💸 Spent: <strong style={{ color:'var(--warn)' }}>{fmt(totals.spent)}</strong></div>
            <div>💚 Saved: <strong style={{ color:'var(--accent)' }}>{fmt(totals.saved)}</strong></div>
            <div>📈 Rate: <strong style={{ color:'var(--gold)' }}>{totals.rate}%</strong></div>
            <div style={{ marginTop:8 }}>🔢 Transactions: {(data?.txs || []).length}</div>
            <div>🎯 Goals: {(data?.goals || []).length}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
