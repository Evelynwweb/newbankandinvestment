import { useState, useEffect } from 'react';
import Navbar from '../components/home/Navbar.jsx';
import Footer from '../components/home/Footer.jsx';
import { Reveal } from '../components/ui/motion.jsx';

/* ============================================================
   Shell for the marketing/info pages — masthead, a plain paper
   hero with a rule under it, and the colophon. No blobs, no glow.
   ============================================================ */
export default function PageShell({ eyebrow, title, lede, icon: Icon, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen">
      <Navbar open={open} setOpen={setOpen} />

      <header className="paper-grain border-b border-[color:var(--rule)]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-6 pt-14 md:pt-20 pb-12 md:pb-16">
          <Reveal>
            <div className="max-w-3xl">
              {Icon && <Icon size={26} strokeWidth={1.5} className="text-[color:var(--accent)] mb-6" />}
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="font-display text-[38px] sm:text-[52px] leading-[1.06] font-semibold tracking-tight mt-5">
                {title}
              </h1>
              {lede && (
                <p className="mt-6 text-[16.5px] leading-[1.65] max-w-xl text-[color:var(--muted)]">{lede}</p>
              )}
            </div>
          </Reveal>
        </div>
      </header>

      <main>{children}</main>
      <Footer />
    </div>
  );
}

/* Shared section heading, matching the landing page's editorial rhythm. */
export function SectionHead({ eyebrow, title, lede }) {
  return (
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-[28px] sm:text-[36px] leading-[1.14] font-semibold max-w-2xl mt-4">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 text-[15.5px] leading-relaxed max-w-xl text-[color:var(--muted)]">{lede}</p>
      )}
    </Reveal>
  );
}
