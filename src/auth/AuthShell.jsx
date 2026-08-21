import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PiggyBank, Star } from 'lucide-react';
import { BRAND, BRAND_FULL } from '../dashboard/data.jsx';
import BrandMark from '../components/ui/BrandMark.jsx';
import { getPreferredTheme, watchSystemTheme } from '../lib/theme.js';
import LandingChatbot from '../components/home/LandingChatbot.jsx';
import '../index.css';
import './auth.css';

/* ============================================================
   Shared auth layout — brand/marketing panel + form panel.
   ============================================================ */
export default function AuthShell({ children }) {
  // Auth screens follow the device color scheme (or the user's saved
  // dashboard choice). Removed on unmount so the marketing site stays dark.
  useEffect(() => {
    const apply = (t) => document.documentElement.setAttribute('data-dash-theme', t);
    apply(getPreferredTheme());
    const unwatch = watchSystemTheme(apply);
    return () => { unwatch(); document.documentElement.removeAttribute('data-dash-theme'); };
  }, []);

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark size={34} />
          <span className="font-display text-[20px] tracking-tight font-bold text-[color:var(--ink)]">{BRAND}</span>
        </Link>

        <div >
          <h2 className="font-display text-[32px] leading-[1.12] font-semibold text-[color:var(--ink)]">
            Bank with intent.<br />Invest with clarity.
          </h2>
          <p className="text-[14px] mt-4 max-w-sm leading-relaxed text-[color:var(--muted)]">
            One account for everyday money and long-horizon wealth — with every rate, fee and
            holding shown before you commit.
          </p>
          <div className="flex flex-col gap-3 mt-8">
            {[
              { icon: ShieldCheck, text: 'Insured deposits & 24/7 fraud monitoring' },
              { icon: PiggyBank, text: '4.65% APY on Reserve Savings, no lock-up' },
              { icon: Star, text: '4.9 rating from 58,000+ clients' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--accent-wash)' }}>
                  <f.icon size={15} className="text-[color:var(--accent)]" />
                </div>
                <span className="text-[13px] text-[color:var(--muted)]">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] text-[color:var(--muted-2)]">&copy; 2026 {BRAND_FULL}. All rights reserved.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>

      <LandingChatbot />
    </div>
  );
}
