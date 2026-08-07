import { NavLink, useNavigate } from 'react-router-dom';
import { BadgeCheck, Plus, LogOut } from 'lucide-react';
import { NAV_ITEMS, BRAND, fmtUSD } from '../data.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { initials } from '../../lib/format.js';
import BrandMark from '../../components/ui/BrandMark.jsx';

/* ============================================================
   Sidebar (desktop) — brand, balance snapshot, route nav, account
   ============================================================ */
export default function Sidebar({ balance }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const verified = user?.kyc?.status === 'verified';

  return (
    <aside className="dash-sidebar px-4 py-5 hidden md:flex">
      <div className="flex items-center gap-2.5 px-2">
        <BrandMark size={28} />
        <span className="font-display text-[17px] tracking-tight font-medium text-[color:var(--ink)]">{BRAND}</span>
      </div>

      <div className="dash-side-stat mx-2 mt-5 mb-2 rounded-2xl px-3.5 py-3">
        <p className="text-[10px] uppercase tracking-widest text-[color:var(--muted-2)]">Available balance</p>
        <div className="flex items-center justify-between mt-1">
          <p className="font-mono text-[16px] font-semibold text-[color:var(--ink)]">{fmtUSD(balance, { maximumFractionDigits: 0 })}</p>
          {verified && (
            <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 bg-[color:var(--up)]/10 text-[color:var(--up)]">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
        </div>
      </div>

      <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)] px-3 mt-5 mb-2">Menu</p>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/dashboard'}
            data-tour={`nav:${item.path}`}
            className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={17} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button onClick={() => navigate('/dashboard/deposit')} data-tour="deposit-btn" className="btn-gold text-[13px] px-4 py-2.5 flex items-center justify-center gap-1.5 my-4">
        <Plus size={15} /> Deposit
      </button>

      <button onClick={() => { logout(); navigate('/login'); }} className="dash-side-account flex items-center gap-2.5 px-2 py-2.5 rounded-xl w-full">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-[color:var(--on-accent)] shrink-0" style={{ background: 'var(--accent)' }}>
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[12.5px] text-[color:var(--ink)] truncate">{user?.name}</p>
          <p className="text-[10.5px] text-[color:var(--muted-2)] truncate">{verified ? 'Verified client' : 'Client'}</p>
        </div>
        <LogOut size={15} className="text-[color:var(--muted-2)] shrink-0" />
      </button>
    </aside>
  );
}
