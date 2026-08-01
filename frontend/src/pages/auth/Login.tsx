import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ApiClientError } from '../../api/apiClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/profile';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      showToast('Welcome back to OUTLOOX.', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Unable to login right now.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-md mx-auto bg-bg-secondary border border-border-subtle rounded-lg p-8 shadow-xl">
        <p className="text-[#090909] text-xs font-bold uppercase tracking-[0.25em] mb-3">OUTLOOX Account</p>
        <h1 className="font-display text-4xl font-bold uppercase mb-2">Login</h1>
        <p className="text-text-muted mb-8">Access your profile, orders, and secure checkout.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Username or Email</label>
            <input
              type="text"
              required
              value={form.usernameOrEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, usernameOrEmail: e.target.value }))}
              className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 text-text-primary"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#090909] hover:bg-[#242424] disabled:opacity-70 text-white py-3.5 rounded-lg font-semibold uppercase text-sm tracking-wider"
          >
            {submitting ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-text-muted mt-6 text-center">
          New to OUTLOOX?{' '}
          <Link to="/register" className="text-[#090909] hover:text-[#111111] font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
