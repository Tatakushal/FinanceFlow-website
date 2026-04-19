import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Topbar({ showUser = false, actions }) {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    showToast('Signed out. See you soon!');
    navigate('/');
  }

  return (
    <div className="topbar">
      <Link to="/" className="tb-logo">
        <div className="tb-logo-icon">⚡</div>
        <div className="tb-logo-text">Finance<span>Flow</span></div>
      </Link>

      <div className="tb-right">
        {actions}
        {showUser && user && (
          <div className="tb-user">
            <span id="greet-name">{user.name?.split(' ')[0] || 'there'}</span>
            <Link to="/app/profile" className="tb-avatar">😊</Link>
          </div>
        )}
      </div>
    </div>
  );
}
