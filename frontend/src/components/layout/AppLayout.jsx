import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children, topbarActions }) {
  function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.toggle('on');
  }

  return (
    <>
      <div className="topbar">
        <a href="/" className="tb-logo" onClick={e => { e.preventDefault(); window.history.back(); }}>
          <div className="tb-logo-icon">⚡</div>
          <div className="tb-logo-text" style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(16px,2vw,20px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Finance<span style={{ color: 'var(--primary)', marginLeft: 2 }}>Flow</span>
          </div>
        </a>
        <button className="tb-menu" onClick={toggleSidebar} aria-label="Toggle menu">☰</button>
        <div className="tb-right">{topbarActions}</div>
      </div>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content page-in">
          {children}
        </main>
      </div>
    </>
  );
}
