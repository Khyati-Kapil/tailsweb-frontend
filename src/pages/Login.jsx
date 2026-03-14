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
      <div className="mx-auto max-w-5xl">
        

        <div className="mt-10 grid gap-8">
          <div className="flex flex-wrap justify-center gap-4">
           
            <span className="block-title bg-lime-200">Assignment Workflow</span>
          </div>

          <div className="block-primary rounded-[26px] px-8 py-10 text-center">
            <h1 className="text-4xl font-bold uppercase tracking-[0.2em]">Assignment Workflow Portal</h1>
            
          </div>

          

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="grid-surface rounded-[26px] p-7">
              <h2 className="text-2xl font-semibold text-slate-950">Why use this portal</h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border-2 border-slate-950 bg-white p-4">
                  <p className="mono text-xs uppercase tracking-[0.18em] text-slate-600">Teacher flow</p>
                  <p className="mt-2 text-sm text-slate-700">Draft, publish, review, complete.</p>
                </div>
                <div className="rounded-2xl border-2 border-slate-950 bg-white p-4">
                  <p className="mono text-xs uppercase tracking-[0.18em] text-slate-600">Student flow</p>
                  <p className="mt-2 text-sm text-slate-700">Submit once and track status.</p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/signup')} className="button-neo mt-6">
                Register
              </button>
            </section>

            <section className="grid-surface rounded-[26px] p-7">
              <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
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
                    placeholder="Your password"
                    required
                  />
                </label>
                {error && <p className="rounded-xl border-2 border-slate-950 bg-white px-4 py-3 text-sm text-slate-700">{error}</p>}
                <button type="submit" disabled={loading} className="button-neo">
                  {loading ? 'Signing in...' : 'Proceed to dashboard'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
