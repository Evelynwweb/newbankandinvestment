import { Link } from 'react-router-dom';
import BrandMark from '../ui/BrandMark.jsx';

/* Colophon — the small print at the foot of the page, set like one. */
const COLS = [
  {
    h: 'Banking',
    items: [
      { label: 'Checking', to: '/banking/checking' },
      { label: 'Savings & CDs', to: '/banking/savings' },
      { label: 'Cards', to: '/banking/cards' },
      { label: 'Transfers', to: '/banking/transfers' },
      { label: 'Loans & Credit', to: '/banking/loans' },
    ],
  },
  {
    h: 'Investing',
    items: [
      { label: 'Managed Portfolios', to: '/investing/managed-portfolios' },
      { label: 'Bonds & Treasuries', to: '/investing/bonds-treasuries' },
      { label: 'Retirement & IRAs', to: '/investing/retirement' },
      { label: 'Wealth Management', to: '/investing/wealth-management' },
    ],
  },
  {
    h: 'Company',
    items: [
      { label: 'About us', to: '/about' },
      { label: 'Rates', to: '/pricing' },
      { label: 'Our Partners', to: '/partners' },
    ],
  },
  {
    h: 'Support',
    items: [
      { label: 'Help Center', to: '/resources/help-center' },
      { label: 'Security Center', to: '/resources/security-center' },
      { label: 'FAQs', to: '/resources/faqs' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--rule)] bg-[color:var(--paper-2)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-display text-[19px] font-semibold">Aurivest</span>
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed max-w-[260px] text-[color:var(--muted)]">
            Everyday banking and long-horizon investing, held to the same standard of care.
          </p>
          <p className="num mt-5 text-[11px] text-[color:var(--muted-2)]">EST. 2019 · 60+ COUNTRIES</p>
        </div>

        {COLS.map((c) => (
          <div key={c.h}>
            <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[color:var(--muted-2)] mb-4">{c.h}</p>
            <div className="flex flex-col gap-2.5">
              {c.items.map((i) => (
                <Link key={i.label} to={i.to} className="text-[13.5px] text-[color:var(--ink-2)] hover:text-[color:var(--accent)] transition-colors">
                  {i.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[color:var(--rule)]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-7 text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
            <span>&copy; 2026 Aurivest Bank &amp; Trust. All rights reserved.</span>
            <span>Deposits insured to the applicable statutory limit &middot; Equal Housing Lender</span>
          </div>
          <p className="max-w-3xl">
            Investment products are not deposits, are not insured, and may lose value. Rates shown are
            illustrative and vary by balance, term and eligibility. Past performance does not guarantee
            future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
