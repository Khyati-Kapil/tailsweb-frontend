import { useAuth } from '../context/AuthContext';

const TopBar = ({ title }) => {
  const { user, role, logout } = useAuth();

  return (
    <header className="grid-surface mt-6 rounded-[28px] px-6 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.35em] text-slate-700">Assignment Portal</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="badge">
            <span className="font-semibold text-slate-950">{user?.name || 'User'}</span>
            <span className="mx-2 text-slate-500">|</span>
            <span className="capitalize text-slate-600">{role}</span>
          </div>
          <button type="button" onClick={logout} className="button-ghost">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
