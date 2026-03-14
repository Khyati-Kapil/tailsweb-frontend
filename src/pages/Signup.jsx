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
        <div className="grid gap-8">
          <div className="flex flex-wrap justify-center gap-4">
            <span className="block-title">Register / Login</span>
            <span className="block-title">Overclock Portal</span>
          </div>

          <section className="grid-surface rounded-[26px] p-8">
            <p className="mono text-xs uppercase tracking-[0.3em] text-slate-700">Choose your role</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Sign up as student or teacher</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {roles.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRole(option.key)}
                  className={`rounded-2xl border-2 px-5 py-4 text-left transition ${
                    role === option.key ? 'border-slate-950 bg-white card-shadow' : 'border-slate-950/40 bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-950">{option.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{option.detail}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid-surface rounded-[26px] p-8">
            <h2 className="text-2xl font-semibold text-slate-950">Account details</h2>
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm text-slate-900">
                Full name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input-neo"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-900">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-neo"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-900">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-neo"
                  placeholder="Create a password"
                  minLength={6}
                  required
                />
              </label>
              {error && <p className="rounded-xl border-2 border-slate-950 bg-white px-4 py-3 text-sm text-slate-700">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={loading} className="button-neo">
                  {loading ? 'Creating...' : 'Create account'}
                </button>
                <button type="button" onClick={() => navigate('/')} className="button-ghost">
                  Back to login
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Signup;
