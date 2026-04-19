import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const NAV = [
  { to: '/app/dashboard',      icon: '🏠', label: 'Home' },
  { to: '/app/transactions',   icon: '💳', label: 'Transactions' },
  { to: '/app/reports',        icon: '📊', label: 'Reports' },
  { to: '/app/goals',          icon: '🎯', label: 'Goals' },
  { to: '/app/wealth',         icon: '💎', label: 'Wealth' },
  { to: '/app/subscriptions',  icon: '🔁', label: 'Subscriptions' },
  { to: '/app/ai-chat',        icon: '✨', label: 'FlowAI' },
  { to: '/app/leaderboard',    icon: '🏆', label: 'Leaderboard' },
];

const SETTINGS_NAV = [
  { to: '/app/profile',   icon: '👤', label: 'Profile' },
  { to: '/app/settings',  icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    showToast('Signed out!');
    navigate('/');
  }

  return (
    <>
      <div className="sidebar-overlay" id="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-open')} />
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-section">Main</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `s-link${isActive ? ' active' : ''}`}
          >
            <span className="s-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section">Account</div>
        {SETTINGS_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `s-link${isActive ? ' active' : ''}`}
          >
            <span className="s-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <button
            className="s-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warn)', textAlign: 'left' }}
            onClick={handleLogout}
          >
            <span className="s-link-icon">🚪</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
