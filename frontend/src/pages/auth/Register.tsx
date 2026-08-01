import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      showToast('Account created successfully. Please login to continue.', 'success');
      navigate('/login');
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : 'Unable to create account right now.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-16 px-4">
      <div className="max-w-md mx-auto bg-bg-secondary border border-border-subtle rounded-lg p-8 shadow-xl">
        <p className="text-[#090909] text-xs font-bold uppercase tracking-[0.25em] mb-3">Join OUTLOOX</p>
        <h1 className="font-display text-4xl font-bold uppercase mb-2">Create Account</h1>
        <p className="text-text-muted mb-8">Save addresses, track orders, and enjoy faster checkout.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Username</label>
            <input
              type="text"
              required
              minLength={3}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full bg-text-primary/5 border border-border-subtle rounded-lg px-4 py-3 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
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
            <p className="text-xs text-text-muted mt-2">Use at least 8 characters with uppercase, lowercase, number, and special character.</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#090909] hover:bg-[#242424] disabled:opacity-70 text-white py-3.5 rounded-lg font-semibold uppercase text-sm tracking-wider"
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-text-muted mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#090909] hover:text-[#111111] font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
