import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, PiggyBank, CandlestickChart, Download, Upload,
  Clock, Settings, Search, X, Users, ShieldCheck,
} from 'lucide-react';

const SEARCHABLE = [
  { label: 'Cash Management', icon: Wallet, to: '/dashboard/account' },
  { label: 'Positions & holdings', icon: CandlestickChart, to: '/dashboard/account' },
  { label: 'Invest', icon: PiggyBank, to: '/dashboard/invest' },
  { label: 'Fund with crypto', icon: Download, to: '/dashboard/funding' },
  { label: 'Withdraw', icon: Upload, to: '/dashboard/withdrawal' },
  { label: 'Activity', icon: Clock, to: '/dashboard/activity' },
  { label: 'Referral', icon: Users, to: '/dashboard/referral' },
  { label: 'Payout wallet', icon: Wallet, to: '/dashboard/settings' },
  { label: 'Identity verification', icon: ShieldCheck, to: '/dashboard/kyc' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
];

/* ============================================================
   Search overlay — the mobile search button opens this, not the nav
   ============================================================ */
export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      // Double-rAF instead of a fixed timeout: focuses as soon as the input
      // has actually painted, without guessing at a delay that may race
      // the slide-in transition on slower devices.
      let raf1, raf2;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => inputRef.current?.focus());
      });
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }
  }, [open]);

  const results = query.trim()
    ? SEARCHABLE.filter((s) => s.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const go = (to) => { onClose(); navigate(to); };

  return (
    <div className="fixed inset-0 z-[60] md:hidden" style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <div
        className="absolute inset-0 bg-black/70"
        style={{ opacity: open ? 1 : 0, transition: 'opacity 0.25s ease' }}
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 top-0 card rounded-b-3xl px-4 pt-8 pb-5"
        style={{ transform: open ? 'translateY(0)' : 'translateY(-24px)', opacity: open ? 1 : 0, transition: 'transform 0.35s cubic-bezier(.16,1,.3,1), opacity 0.3s ease' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="dash-search flex items-center gap-2.5 rounded-2xl px-4 py-3 flex-1">
            <Search size={16} className="text-[color:var(--muted-2)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search accounts, activity, settings..."
              className="bg-transparent outline-none text-[14px] w-full text-[color:var(--ink)] placeholder:text-[color:var(--muted-2)]"
            />
          </div>
          <button onClick={onClose} aria-label="Close search" className="text-[color:var(--muted-2)] shrink-0">
            <X size={22} />
          </button>
        </div>

        {query.trim() && (
          <div className="flex flex-col mt-3 max-h-[46vh] overflow-y-auto">
            {results.length ? results.map((r) => (
              <button key={r.label} onClick={() => go(r.to)} className="dash-row flex items-center gap-3 text-left px-3 py-2.5 rounded-xl -mx-1">
                <r.icon size={15} className="text-[color:var(--accent)]" />
                <span className="text-[13.5px] text-[color:var(--ink)]">{r.label}</span>
              </button>
            )) : (
              <p className="text-[13px] text-[color:var(--muted-2)] px-3 py-6 text-center">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
