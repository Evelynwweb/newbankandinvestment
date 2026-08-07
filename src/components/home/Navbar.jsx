import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import BrandMark from '../ui/BrandMark.jsx';

/* ============================================================
   Masthead — a newspaper header, not a floating pill.

   A thin published-rates band sits above a bordered nav. Dropdowns
   are plain bordered sheets with numbered entries; no icon chips,
   no blur theatre, no scrolled-state morphing.
   ============================================================ */

const RATES = [
  ['Reserve Savings', '4.65%'],
  ['Checking', '0.75%'],
  ['6-mo Treasury', '5.10%'],
  ['30-yr Mortgage', '5.75%'],
  ['Personal Loan', '8.90%'],
];

export const MENU = [
  {
    label: 'Banking', wide: true,
    children: [
      { label: 'Checking Accounts', to: '/banking/checking' },
      { label: 'Savings & CDs', to: '/banking/savings' },
      { label: 'Debit & Credit Cards', to: '/banking/cards' },
      { label: 'Transfers & Payments', to: '/banking/transfers' },
      { label: 'Mortgages', to: '/banking/mortgages' },
      { label: 'Loans & Credit', to: '/banking/loans' },
      { label: 'Business Banking', to: '/banking/business' },
      { label: 'Private Banking', to: '/banking/private-banking' },
    ],
  },
  {
    label: 'Investing', wide: true,
    children: [
      { label: 'Managed Portfolios', to: '/investing/managed-portfolios' },
      { label: 'Bonds & Treasuries', to: '/investing/bonds-treasuries' },
      { label: 'Mutual Funds & ETFs', to: '/investing/funds-etfs' },
      { label: 'Retirement & IRAs', to: '/investing/retirement' },
      { label: 'Wealth Management', to: '/investing/wealth-management' },
      { label: 'Estate Planning', to: '/investing/estate-planning' },
      { label: 'Education Savings', to: '/investing/education-savings' },
      { label: 'Financial Planning', to: '/investing/financial-planning' },
    ],
  },
  { label: 'Rates', to: '/pricing' },
  { label: 'About', to: '/about' },
  {
    label: 'Help',
    children: [
      { label: 'Help Center', to: '/resources/help-center' },
      { label: 'Security Center', to: '/resources/security-center' },
      { label: 'FAQs', to: '/resources/faqs' },
      { label: 'Our Partners', to: '/partners' },
    ],
  },
];

function RateBand() {
  return (
    <div className="rate-strip hidden md:block">
      <div className="max-w-[1180px] mx-auto px-6 flex items-stretch">
        <span className="rate-item flex items-center pr-4 mr-4 text-[10px] uppercase tracking-[0.18em] opacity-60 py-2">
          Today&rsquo;s rates
        </span>
        {RATES.map(([label, value]) => (
          <span key={label} className="rate-item flex items-baseline gap-2 px-4 py-2 whitespace-nowrap">
            <span className="text-[11px] opacity-60">{label}</span>
            <span className="num text-[11.5px] font-semibold">{value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DesktopNav() {
  const [openIdx, setOpenIdx] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenIdx(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <nav ref={rootRef} className="hidden lg:flex items-center gap-7">
      {MENU.map((item, i) =>
        item.children ? (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setOpenIdx(i)}
            onMouseLeave={() => setOpenIdx((v) => (v === i ? null : v))}
          >
            <button
              onClick={() => setOpenIdx((v) => (v === i ? null : i))}
              aria-expanded={openIdx === i}
              className="nav-link flex items-center gap-1.5"
            >
              {item.label}
              <ChevronDown size={13} className={`transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
            </button>
            <div className={`nav-sheet ${item.wide ? 'wide' : ''} ${openIdx === i ? 'open' : ''}`}>
              <div className="nav-sheet-grid">
                {item.children.map((c, j) => (
                  <Link key={c.label} to={c.to} className="nav-sheet-item" onClick={() => setOpenIdx(null)}>
                    <span className="idx">{String(j + 1).padStart(2, '0')}</span>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Link key={item.label} to={item.to} className="nav-link">{item.label}</Link>
        )
      )}
    </nav>
  );
}

function MobileGroup({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  if (!item.children) {
    return (
      <Link
        to={item.to}
        onClick={onNavigate}
        className="font-display text-[22px] py-3 border-b border-[color:var(--rule)] block"
      >
        {item.label}
      </Link>
    );
  }
  return (
    <div className="border-b border-[color:var(--rule)]">
      <button onClick={() => setOpen((v) => !v)} className="font-display text-[22px] py-3 w-full flex items-center justify-between">
        {item.label}
        <ChevronDown size={18} className={`text-[color:var(--muted-2)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-3 flex flex-col">
          {item.children.map((c) => (
            <Link key={c.label} to={c.to} onClick={onNavigate} className="py-2 text-[14.5px] text-[color:var(--muted)]">
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ open, setOpen }) {
  const navigate = useNavigate();

  // Lock the page behind the mobile sheet so the body doesn't scroll under it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50">
        <RateBand />
        <div className="masthead">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <BrandMark size={30} />
              <span className="font-display text-[21px] font-semibold tracking-tight">Aurivest</span>
            </Link>

            <DesktopNav />

            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <button onClick={() => navigate('/login')} className="nav-link">Sign in</button>
              <button onClick={() => navigate('/register')} className="btn-solid text-[13px] px-5 py-2.5">
                Open an account
              </button>
            </div>

            <button
              className="lg:hidden p-2 -mr-2"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className="mobile-sheet fixed inset-0 z-[60] lg:hidden bg-[color:var(--paper)] overflow-y-auto px-5 pt-6 pb-12"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'none' : 'translateY(-8px)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-[20px] font-semibold">Aurivest</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
        </div>
        {MENU.map((item) => (
          <MobileGroup key={item.label} item={item} onNavigate={() => setOpen(false)} />
        ))}
        <div className="flex flex-col gap-3 mt-7">
          <button onClick={() => { setOpen(false); navigate('/register'); }} className="btn-solid py-3.5 text-[14px]">
            Open an account
          </button>
          <button onClick={() => { setOpen(false); navigate('/login'); }} className="btn-outline py-3.5 text-[14px]">
            Sign in
          </button>
        </div>
      </div>
    </>
  );
}
