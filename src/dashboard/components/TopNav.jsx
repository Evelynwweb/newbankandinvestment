import { useNavigate } from 'react-router-dom';
import { Menu, X, Search, Plus, RefreshCcw, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { initials } from '../../lib/format.js';

/* ============================================================
   Top navigation bar — page title, search, quick actions, account
   ============================================================ */
export default function TopNav({ activeLabel, mobileNavOpen, setMobileNavOpen, theme, onToggleTheme, onRefresh }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="dash-topbar px-4 md:px-8 py-3 flex items-center gap-4">
      <button className="md:hidden text-[color:var(--ink)]" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
        {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <h1 className="font-display text-[16px] md:text-[19px] font-semibold text-[color:var(--ink)] hidden sm:block">{activeLabel}</h1>

      <div className="dash-search hidden md:flex items-center gap-2.5 rounded-2xl px-4 py-2.5 flex-1 max-w-sm ml-6">
        <Search size={15} className="text-[color:var(--muted-2)]" />
        <input placeholder="Search accounts, activity, docs..." className="bg-transparent outline-none text-[13.5px] w-full text-[color:var(--ink)] placeholder:text-[color:var(--muted-2)]" />
        <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-[color:var(--rule)] text-[color:var(--muted-2)] font-mono">/</span>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <button onClick={() => navigate('/dashboard/deposit')} data-tour="deposit-btn" className="btn-gold hidden sm:flex items-center gap-1.5 text-[13px] px-4 py-2.5">
          <Plus size={14} /> Deposit
        </button>

        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="dash-icon-btn dash-icon-cluster"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="hidden sm:flex items-center gap-1 dash-icon-cluster rounded-full px-1 py-1">
          <button onClick={onRefresh} aria-label="Refresh" className="dash-icon-btn">
            <RefreshCcw size={14} />
          </button>
          <button aria-label="Notifications" className="dash-icon-btn relative">
            <Bell size={15} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[color:var(--accent-deep)]" />
          </button>
        </div>

        <button onClick={() => navigate('/dashboard/settings')} className="dash-account-btn">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-[color:var(--on-accent)] shrink-0" style={{ background: 'var(--accent)' }}>
            {initials(user?.name)}
          </div>
          <ChevronDown size={13} className="text-[color:var(--muted-2)] hidden md:block" />
        </button>
      </div>
    </header>
  );
}
