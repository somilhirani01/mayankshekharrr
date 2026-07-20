import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import LoadingState from '../components/shared/LoadingState';

function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setErrors({});
    setFormError('');
  }, [mode]);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const next = {};

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        next.name = 'Name must be at least 2 characters';
      }
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }

    if (!password || password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password };

      const { data } = await api.post(path, body);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to sign in'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>ScopeLock</h1>
        <p className="subtitle">
          {mode === 'login'
            ? 'Sign in to manage locked project scope.'
            : 'Create an account to start locking scope.'}
        </p>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {formError && <div className="form-error">{formError}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <LoadingState label={mode === 'login' ? 'Signing in...' : 'Creating account...'} />
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? (
            <>
              Need an account?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
