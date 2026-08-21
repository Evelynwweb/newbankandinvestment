import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import BrandMark, { Wordmark } from '../ui/BrandMark.jsx';
import { usePageProgress, useScrolled } from '../ui/motion.jsx';

export const MENU = [
  {
    label: 'Invest', wide: true,
    children: [
      { label: 'High-Yield Cash Management', to: '/invest/cash-management' },
      { label: 'Money Market Funds', to: '/invest/money-market' },
      { label: 'Treasury-Backed Accounts', to: '/invest/treasury' },
      { label: 'Bond Ladders', to: '/invest/bond-ladders' },
      { label: 'Municipal Bonds', to: '/invest/municipal-bonds' },
      { label: 'Preferred Stock', to: '/invest/preferred-stock' },
      { label: 'Managed ETF Portfolios', to: '/invest/managed-portfolios' },
      { label: 'Self-Directed Brokerage', to: '/invest/self-directed' },
      { label: 'Fractional Shares', to: '/invest/fractional-shares' },
    ],
  },
  {
    label: 'Retirement', wide: true,
    children: [
      { label: 'Traditional & Roth IRAs', to: '/invest/iras' },
      { label: 'SEP & SIMPLE IRAs', to: '/invest/employer-plans' },
      { label: '401(k) Rollovers & Solo 401(k)', to: '/invest/rollovers' },
    ],
  },
  {
    label: 'Advanced', wide: true,
    children: [
      { label: 'Margin Lending', to: '/invest/margin-lending' },
      { label: 'Private Real Estate & Credit', to: '/invest/alternatives' },
      { label: 'Crypto Trading & Custody', to: '/invest/crypto' },
      { label: 'Estate Planning Tools', to: '/invest/estate-planning' },
      { label: 'Trust Account Services', to: '/invest/trust-services' },
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
    <nav ref={rootRef} className="hidden lg:flex items-center gap-8">
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
              <ChevronDown size={13} className={`transition-transform duration-300 ${openIdx === i ? 'rotate-180' : ''}`} />
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
      <Link to={item.to} onClick={onNavigate} className="font-display text-[24px] py-3.5 border-b border-[color:var(--rule)] block">
        {item.label}
      </Link>
    );
  }
  return (
    <div className="border-b border-[color:var(--rule)]">
      <button onClick={() => setOpen((v) => !v)} className="font-display text-[24px] py-3.5 w-full flex items-center justify-between">
        {item.label}
        <ChevronDown size={19} className={`text-[color:var(--muted-2)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="acc-body" style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .4s var(--ease-luxe)' }}>
        <div className="overflow-hidden">
          <div className="pb-4 flex flex-col">
            {item.children.map((c) => (
              <Link key={c.label} to={c.to} onClick={onNavigate} className="py-2.5 text-[15px] text-[color:var(--muted)]">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ open, setOpen, overHero = false }) {
  const navigate = useNavigate();
  const progress = usePageProgress();
  const stuck = useScrolled(20);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className={`${overHero ? 'fixed inset-x-0 top-0' : 'sticky top-0'} z-50`}>
        <div className={`masthead relative ${stuck ? 'stuck' : ''} ${overHero && !stuck ? 'over-dark' : ''}`}>
          <div className="max-w-[1180px] mx-auto px-5 sm:px-6 h-[74px] flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <BrandMark size={32} className="transition-transform duration-500 group-hover:rotate-[8deg]" />
              <Wordmark size={22} />
            </Link>

            <DesktopNav />

            <div className="hidden lg:flex items-center gap-5 shrink-0">
              <button onClick={() => navigate('/login')} className="nav-link">Sign in</button>
              <button onClick={() => navigate('/register')} className="btn-solid text-[13px] px-5 py-2.5">
                Open an account <ArrowRight size={14} />
              </button>
            </div>

            <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* reading progress for the whole page */}
          <div className="scroll-line" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </header>

      <div
        className="mobile-sheet fixed inset-0 z-[60] lg:hidden bg-[color:var(--paper)] overflow-y-auto px-5 pt-6 pb-14"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transform: open ? 'none' : 'translateY(-10px)' }}
      >
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <Wordmark size={21} />
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
        </div>
        {MENU.map((item) => (
          <MobileGroup key={item.label} item={item} onNavigate={() => setOpen(false)} />
        ))}
        <div className="flex flex-col gap-3 mt-8">
          <button onClick={() => { setOpen(false); navigate('/register'); }} className="btn-solid py-3.5 text-[14px]">
            Open an account <ArrowRight size={15} />
          </button>
          <button onClick={() => { setOpen(false); navigate('/login'); }} className="btn-outline py-3.5 text-[14px]">
            Sign in
          </button>
        </div>
      </div>
    </>
  );
}
