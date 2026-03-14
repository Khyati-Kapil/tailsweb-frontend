import { useAuth } from '../context/AuthContext';

const TopBar = ({ title }) => {
  const { user, role, logout } = useAuth();

  return (
    <header className="card-surface mt-6 rounded-3xl px-6 py-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fog">Assignment Portal</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-full border border-slate/10 bg-white/70 px-4 py-2 text-sm text-slate">
            <span className="font-medium text-ink">{user?.name || 'User'}</span>
            <span className="mx-2 text-fog">|</span>
            <span className="capitalize text-fog">{role}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
