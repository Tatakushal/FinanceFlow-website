import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SignIn() {
  const { user, signIn, socialLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState(params.get('email') ? decodeURIComponent(params.get('email')) : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in with the same email, redirect
  useEffect(() => {
    if (user) navigate('/app/dashboard', { replace: true });
  }, [user, navigate]);

  async function doSignIn(e) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { showToast('⚠️ Enter your email'); return; }
    if (!password) { showToast('⚠️ Enter your password'); return; }
    setLoading(true);
    try {
      const result = await signIn(trimmedEmail, password);
      showToast(`✅ Welcome back, ${result.name}!`);
      setTimeout(() => navigate('/app/dashboard'), 700);
    } catch (err) {
      showToast(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function doSocialLogin(provider) {
    setLoading(true);
    try {
      await socialLogin(provider);
      showToast(`✅ Signed in with ${provider}`);
      setTimeout(() => navigate('/app/dashboard'), 700);
    } catch (err) {
      showToast(err.message || `${provider} sign-in failed`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <Link to="/" className="tb-logo">
          <div className="tb-logo-icon">⚡</div>
          <div className="tb-logo-text">Finance<span>Flow</span></div>
        </Link>
        <div style={{ fontSize:14, color:'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color:'var(--accent)', fontWeight:700, textDecoration:'none' }}>Sign up free →</Link>
        </div>
      </div>

      <div className="auth-wrap">
        <div className="auth-card">
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,var(--primary),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 16px', boxShadow:'0 8px 28px var(--primary-glow)' }}>⚡</div>
            <div className="auth-title">Welcome back 👋</div>
            <div className="auth-sub">Sign in to your Finance Flow account</div>
          </div>

          <form onSubmit={doSignIn}>
            <div className="fw">
              <label className="flbl">Email Address</label>
              <input className="finput" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="fw" style={{ marginBottom:10 }}>
              <label className="flbl">Password</label>
              <input className="finput" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div style={{ textAlign:'right', marginBottom:24 }}>
              <button type="button" style={{ fontSize:13, color:'var(--accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }} onClick={() => showToast('Reset link sent to your email!')}>
                Forgot password?
              </button>
            </div>
            <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:16 }}>
              Your account syncs across devices via Firebase.
            </div>
            <button className="btn btn-p btn-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="divider">
            <div className="div-line" />
            <span className="div-txt">or continue with</span>
            <div className="div-line" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button className="btn-social" onClick={() => doSocialLogin('Apple')}>🍎 Apple</button>
            <button className="btn-social" onClick={() => doSocialLogin('Google')}>🔵 Google</button>
          </div>

          <div style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-muted)' }}>
            No account yet?{' '}
            <Link to="/signup" style={{ color:'var(--accent)', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
          </div>
        </div>
      </div>
    </>
  );
}
