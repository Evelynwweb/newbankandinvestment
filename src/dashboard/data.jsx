import { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid, Wallet, PiggyBank, CreditCard, Send, Download, Upload,
  Clock, Users, Settings, Landmark,
} from 'lucide-react';

/* ============================================================
   Shared dashboard constants + primitives.
   Account data (balances, cards, investments, transactions…)
   comes from the API — see src/lib/api.js and useApi.js.
   ============================================================ */
export const BRAND = 'Aurivest';

/* Sidebar / drawer navigation — maps 1:1 to the dashboard routes in App.jsx */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid, path: '/dashboard' },
  { id: 'accounts', label: 'Accounts', icon: Wallet, path: '/dashboard/accounts' },
  { id: 'transfers', label: 'Transfers', icon: Send, path: '/dashboard/transfers' },
  { id: 'cards', label: 'Cards', icon: CreditCard, path: '/dashboard/cards' },
  { id: 'invest', label: 'Invest', icon: PiggyBank, path: '/dashboard/invest' },
  { id: 'portfolio', label: 'Portfolio', icon: Landmark, path: '/dashboard/portfolio' },
  { id: 'deposit', label: 'Deposit', icon: Download, path: '/dashboard/deposit' },
  { id: 'withdrawal', label: 'Withdrawal', icon: Upload, path: '/dashboard/withdrawal' },
  { id: 'loans', label: 'Loans & Credit', icon: Landmark, path: '/dashboard/loans' },
  { id: 'transactions', label: 'Transactions', icon: Clock, path: '/dashboard/transactions' },
  { id: 'referrals', label: 'Referrals', icon: Users, path: '/dashboard/referrals' },
  { id: 'settings', label: 'Account Settings', icon: Settings, path: '/dashboard/settings' },
];

/* Mobile bottom bar — 4 icon-only tabs, capped per fintech nav conventions */
export const TAB_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: LayoutGrid, path: '/dashboard' },
  { id: 'accounts', label: 'Accounts', icon: Wallet, path: '/dashboard/accounts' },
  { id: 'transfers', label: 'Move', icon: Send, path: '/dashboard/transfers' },
  { id: 'invest', label: 'Invest', icon: PiggyBank, path: '/dashboard/invest' },
  { id: 'settings', label: 'Account', icon: Settings, path: '/dashboard/settings' },
];

export const RANGE_LABELS = { '1D': 'Daily', '1W': 'Weekly', '1M': 'Monthly', '1Y': 'Yearly' };

export const RISK_COLOR = {
  Insured: 'var(--up)',
  'Very low': 'var(--up)',
  Moderate: 'var(--accent)',
  Elevated: 'var(--accent-deep)',
  High: 'var(--down)',
};

export const ACCOUNT_META = {
  checking: { label: 'Checking', color: 'var(--accent)' },
  savings: { label: 'Savings', color: 'var(--accent-deep)' },
  investment: { label: 'Investment', color: 'var(--accent-warm)' },
};

export const SPARK_PATHS = {
  up: 'M0,20 L10,17 L20,18.5 L30,12 L40,14 L50,7 L60,10 L70,3',
  flat: 'M0,12 L10,13 L20,10 L30,12 L40,9 L50,11 L60,8 L70,10',
};

export const fmtUSD = (n, opts = {}) => {
  const o = { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts };
  // Intl throws if min > max — clamp so callers can pass maximumFractionDigits alone.
  if (o.minimumFractionDigits > o.maximumFractionDigits) o.minimumFractionDigits = o.maximumFractionDigits;
  return (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', ...o });
};

/* ============================================================
   Small local primitives (self-contained, no external deps)
   ============================================================ */
export function useCountUp(target, { duration = 1200, decimals = 2 } = {}) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(from + (target - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val.toFixed(decimals);
}

export function useInViewReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export function DashReveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInViewReveal();
  return (
    <div ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export function buildAreaPath(points, w, h, pad = 6) {
  const max = Math.max(...points), min = Math.min(...points);
  const span = max - min || 1;
  const stepX = w / (points.length - 1);
  const coords = points.map((p, i) => [i * stepX, h - pad - ((p - min) / span) * (h - pad * 2)]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return { line, area };
}
