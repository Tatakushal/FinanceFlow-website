import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar({ showUser = false, actions }) {
  const { user } = useAuth();

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
