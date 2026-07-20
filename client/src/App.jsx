import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ScopeBuilder from './pages/ScopeBuilder';
import ChangeOrderReview from './pages/ChangeOrderReview';
import ClientPortal from './pages/ClientPortal';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/portal/:token" element={<ClientPortal />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <PrivateRoute>
            <ProjectDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:id/scope"
        element={
          <PrivateRoute>
            <ScopeBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/change-orders/:id"
        element={
          <PrivateRoute>
            <ChangeOrderReview />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
