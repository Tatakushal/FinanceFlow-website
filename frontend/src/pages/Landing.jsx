import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkAccount } from '../services/storage';

const TICKER = [
  'Zero Bank Linking','FlowAI Smart Insights','Auto Budget Rings',
  'Subscription Tracking','Total Privacy','Instant Expense Logging',
];

const FEATURES = [
  { icon:'🤖', title:'AI Financial Advisor', desc:'Get personalized insights from FlowAI that learns your spending patterns.' },
  { icon:'🔒', title:'Bank-Level Privacy', desc:'Your data stays on your device. Zero cloud storage, zero tracking, 100% private.' },
  { icon:'📊', title:'Smart Budget Rings', desc:'Visual budget tracking that adapts to your lifestyle.' },
  { icon:'⚡', title:'Lightning Fast', desc:'Log expenses in seconds. Works offline, syncs when ready.' },
  { icon:'💎', title:'Wealth Tracking', desc:'Track assets, liabilities, and net worth.' },
  { icon:'🎯', title:'Goal Planning', desc:'Set financial goals and track progress with AI guidance.' },
];

const TESTIMONIALS = [
  { stars: 5, text: '"Finally, a finance app that doesn\'t sell my data! The AI insights are genuinely helpful, and I\'ve saved 30% more since switching."', name: 'Priya Sharma', role: 'Software Engineer', grad: 'var(--primary),var(--accent)' },
  { stars: 5, text: '"The budget rings are genius! FlowAI caught a subscription I forgot about saving me ₹2000 per month."', name: 'Rahul Verma', role: 'Business Owner', grad: 'var(--warn),var(--gold)' },
  { stars: 5, text: '"Best finance app I\'ve used. Clean design, fast, and privacy-first. Highly recommend!"', name: 'Aisha Khan', role: 'Freelance Designer', grad: 'var(--accent),var(--purple)' },
];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const increment = target / (duration / 16);
        let cur = 0;
        const update = () => {
          cur += increment;
          if (cur < target) { setCount(Math.floor(cur)); requestAnimationFrame(update); }
          else setCount(target);
        };
        update();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const canvasRef = useRef(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      sx: Math.random() * 0.5 - 0.25, sy: Math.random() * 0.5 - 0.25,
      op: Math.random() * 0.5 + 0.2,
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.sx; p.y += p.sy;
        if (p.x > canvas.width) p.x = 0; if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0; if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = `rgba(0,229,160,${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  function handleSmartAuth(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) { alert('Please enter a valid email'); return; }
    const dest = checkAccount(trimmed) ? '/signin' : '/signup';
    navigate(`${dest}?email=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />
        <div className="float-icon icon-1">🪙</div>
        <div className="float-icon icon-2">📈</div>
        <div className="float-icon icon-3">🤖</div>
        <div className="float-icon icon-4">💎</div>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2 }} />

        <div className="auth-container">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:12 }}>
            <div className="auth-logo" style={{ marginBottom:0 }}>⚡</div>
            <div className="auth-badge" style={{ marginBottom:0 }}>✨ Smarter Wealth</div>
          </div>
          <h1>Finance<wbr /><span>Flow</span></h1>
          <p>The AI-powered personal finance app that actually knows your money.</p>

          <form onSubmit={handleSmartAuth}>
            <div className="smart-input-group">
              <input
                type="email"
                className="hero-input"
                placeholder="Enter your email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button type="submit" className="btn-smart">Continue →</button>
            </div>
          </form>
          <div style={{ fontSize:13, color:'var(--text-dim)', marginBottom:24 }}>
            Join <AnimatedCounter target={10000} />+ users saving more every day.
          </div>

          <div className="auth-actions">
            {user ? (
              <Link to="/app/dashboard" className="btn-auth-primary">Go to Dashboard →</Link>
            ) : (
              <Link to="/signup" className="btn-auth-primary">Get Started Free →</Link>
            )}
          </div>
          <div className="auth-footer" style={{ fontSize:14, marginTop:24 }}>
            Free forever · No credit card · Works offline
          </div>
        </div>

        <div className="ticker-overlay">
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((item, i) => (
              <div key={i} className="ticker-item"><span>✦</span> {item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'100px 20px', background:'linear-gradient(180deg,var(--bg) 0%,var(--surface) 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:80 }}>
            <div className="section-eyebrow">Why Finance Flow</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,5vw,48px)', fontWeight:800, color:'#fff', marginBottom:20, letterSpacing:'-1px' }}>Your Money, Your Rules</h2>
            <p style={{ fontSize:18, color:'var(--text-muted)', maxWidth:600, margin:'0 auto' }}>No bank linking. No data selling. Just pure financial intelligence powered by AI.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24, marginBottom:60 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,rgba(0,229,160,0.05),rgba(61,127,255,0.05))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40 }}>
              {[{ n: 10000, label:'Active Users', suffix:'+' }, { n:50000, label:'Transactions Logged', suffix:'+' }, { n:1000000, label:'Money Saved (₹)', suffix:'+' }].map(s => (
                <div key={s.label} className="stat-item">
                  <div className="stat-number"><AnimatedCounter target={s.n} />{s.suffix}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'100px 20px', background:'var(--surface)', position:'relative' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="section-eyebrow">Testimonials</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,5vw,48px)', fontWeight:800, color:'#fff', marginBottom:20, letterSpacing:'-1px' }}>Loved by Thousands</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div style={{ fontSize:24, marginBottom:16 }}>{'⭐'.repeat(t.stars)}</div>
                <p style={{ fontSize:15, color:'var(--text)', lineHeight:1.7, marginBottom:16 }}>{t.text}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${t.grad})` }} />
                  <div>
                    <div style={{ fontWeight:700, color:'#fff', fontSize:14 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'100px 20px', background:'linear-gradient(135deg,rgba(0,229,160,0.08),rgba(61,127,255,0.06))', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,6vw,56px)', fontWeight:800, color:'#fff', marginBottom:24, letterSpacing:'-2px' }}>Start Your Financial Journey Today</h2>
          <p style={{ fontSize:20, color:'var(--text-muted)', marginBottom:48, lineHeight:1.6 }}>Join thousands who've taken control of their money. No credit card required.</p>
          <Link to="/signup" className="btn-primary btn-large" style={{ display:'inline-block' }}>Get Started Free →</Link>
        </div>
      </section>
    </>
  );
}
