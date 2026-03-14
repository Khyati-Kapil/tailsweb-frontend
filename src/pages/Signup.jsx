import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const roles = [
  { key: 'student', title: 'Sign up as student', detail: 'Submit assignments and track your work.' },
  { key: 'teacher', title: 'Sign up as teacher', detail: 'Create assignments and review submissions.' }
];

const Signup = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      if (response.data?.token) {
        login(response.data);
        navigate(role === 'teacher' ? '/teacher' : '/student', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <section className="card-surface rounded-3xl p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-fog">Create account</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink">Choose your role</h1>
          <p className="mt-2 text-sm text-slate">Pick a role to tailor your dashboard experience.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roles.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRole(option.key)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${
                  role === option.key
                    ? 'border-ink bg-white/80 shadow-soft'
                    : 'border-slate/20 bg-white/60 hover:border-ink'
                }`}
              >
                <p className="text-sm font-semibold text-ink">{option.title}</p>
                <p className="mt-1 text-xs text-fog">{option.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 card-surface rounded-3xl p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-ink">Account details</h2>
          <p className="mt-2 text-sm text-fog">All fields are required.</p>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm text-ink">
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                placeholder="Your name"
                required
              />
            </label>
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
                placeholder="Create a password"
                minLength={6}
                required
              />
            </label>
            {error && <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate disabled:opacity-70"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="rounded-xl border border-slate/20 px-5 py-3 text-sm font-semibold text-slate"
              >
                Back to login
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Signup;
