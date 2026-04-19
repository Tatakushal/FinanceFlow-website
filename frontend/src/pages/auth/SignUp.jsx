import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SignUp() {
  const { user, signUp, socialLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: '', email: params.get('email') ? decodeURIComponent(params.get('email')) : '',
    mobile: '', password: '', confirm: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/app/dashboard', { replace: true });
  }, [user, navigate]);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function doSignUp(e) {
    e.preventDefault();
    const { name, email, mobile, password, confirm } = form;
    if (!name.trim()) { showToast('Enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { showToast('Enter a valid email.'); return; }
    if (password.length < 6) { showToast('Password needs at least 6 characters.'); return; }
    if (password !== confirm) { showToast('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), mobile, password });
      showToast(`Welcome to Finance Flow, ${name.trim()}!`);
      setTimeout(() => navigate('/app/dashboard'), 800);
    } catch (err) {
      showToast(err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  function doSocialSignUp(provider) {
    const n = form.name.trim() || 'New User';
    const e = form.email.trim() || `user.${provider.toLowerCase()}@financeflow.app`;
    socialLogin(provider);
    showToast(`Welcome via ${provider}!`);
    setTimeout(() => navigate('/app/dashboard'), 800);
  }

  return (
    <>
      <div className="topbar">
        <Link to="/" className="tb-logo">
          <div className="tb-logo-icon">⚡</div>
          <div className="tb-logo-text">Finance<span>Flow</span></div>
        </Link>
        <div style={{ fontSize:14, color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color:'var(--accent)', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
        </div>
      </div>

      <div className="auth-wrap" style={{ alignItems:'flex-start', paddingTop:48 }}>
        <div className="auth-card" style={{ maxWidth:760 }}>
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">One-step signup (no OTP)</div>

          <form onSubmit={doSignUp}>
            <div className="form-row">
              <div className="fw">
                <label className="flbl">Full Name</label>
                <input className="finput" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" autoComplete="name" />
              </div>
              <div className="fw">
                <label className="flbl">Email Address</label>
                <input className="finput" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>
            <div className="form-row">
              <div className="fw">
                <label className="flbl">Mobile Number</label>
                <input className="finput" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              <div className="fw">
                <label className="flbl">Password</label>
                <input className="finput" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" />
              </div>
            </div>
            <div className="form-row">
              <div className="fw">
                <label className="flbl">Confirm Password</label>
                <input className="finput" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
              </div>
              <div className="fw" />
            </div>

            <button className="btn btn-p btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <div className="divider">
            <div className="div-line" />
            <span className="div-txt">or sign up with</span>
            <div className="div-line" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <button className="btn-social" onClick={() => doSocialSignUp('Apple')}>🍎 Apple</button>
            <button className="btn-social" onClick={() => doSocialSignUp('Google')}>🔵 Google</button>
          </div>
        </div>
      </div>
    </>
  );
}
