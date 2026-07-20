import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          ScopeLock
        </Link>
        <div className="topbar-actions">
          <NotificationBell />
          <div className="user-chip" title={user?.name || ''}>
            <span className="user-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="user-name">{user?.name}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <div className="page">{children}</div>
    </div>
  );
}

export default AppShell;
