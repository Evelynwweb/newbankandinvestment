import { NavLink, useNavigate } from 'react-router-dom';
import { BadgeCheck, LogOut, X } from 'lucide-react';
import { NAV_ITEMS, BRAND, fmtUSD } from '../data.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { initials } from '../../lib/format.js';
import BrandMark from '../../components/ui/BrandMark.jsx';

/* ============================================================
   Mobile slide-in drawer — full route nav, triggered from the top bar
   ============================================================ */
export default function MobileNav({ open, onClose, balance }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const verified = user?.kyc?.status === 'verified';

  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/60"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}
        onClick={onClose}
      />
      <aside
        className="md:hidden fixed left-0 top-0 h-full w-[78%] max-w-[300px] z-50 card px-4 py-5 flex flex-col overflow-y-auto"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)',
          boxShadow: open ? '30px 0 60px -20px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-display text-[16px] tracking-tight font-medium text-[color:var(--ink)]">{BRAND}</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-[color:var(--muted-2)]">
            <X size={20} />
          </button>
        </div>

        <div className="card-inset mx-2 mb-5 rounded-2xl px-3.5 py-3">
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

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => { onClose(); logout(); navigate('/login'); }} className="dash-side-account flex items-center gap-2.5 px-2 py-2.5 mt-4 rounded-xl w-full">
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
    </>
  );
}
