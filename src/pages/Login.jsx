import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      navigate(response.data.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card-surface rounded-3xl p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-fog">Single Login</p>
            <h1 className="mt-4 text-4xl font-semibold text-ink">Assignment Workflow Portal</h1>
            <p className="mt-4 text-base text-slate">
              Teachers manage assignment lifecycles. Students submit answers before deadlines. Sign in to continue.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">Teacher access</p>
                <p className="text-sm text-fog">Create, publish, and review submissions.</p>
              </div>
              <div className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">Student access</p>
                <p className="text-sm text-fog">View published assignments and submit answers.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="mt-6 rounded-xl border border-ink px-4 py-3 text-sm font-semibold text-ink"
            >
              Create an account
            </button>
          </section>
          <section className="card-surface rounded-3xl p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-ink">Sign in</h2>
            <p className="mt-2 text-sm text-fog">Use the same login for both roles.</p>
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm text-ink">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-ink">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                  placeholder="Your password"
                  required
                />
              </label>
              {error && <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
