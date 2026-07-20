import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          ScopeLock
        </Link>
        <div className="topbar-actions">
          <span>{user?.name}</span>
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
