import { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollProgress } from '../ui/motion.jsx';
import GoldDust from './GoldDust.jsx';

/* ============================================================
   The cinematic sequence.

   Six acts pinned across six viewport-heights. Each act owns a
   full-bleed plate that cross-fades and pushes in, and a block of
   copy that rises with it and leaves before the next arrives — so
   the words and the picture always belong to each other.

   Scroll is the only input. The stage releases cleanly at both ends,
   so the page never feels hijacked.
   ============================================================ */

const SCENES = [
  {
    id: 'open',
    chapter: 'Act I',
    label: 'The beginning',
    eyebrow: 'A first account',
    head: 'Everyone starts with a number that feels too small.',
    body: 'One hundred and eighty dollars. It is not the amount that matters — it is that the amount finally has somewhere to sit where it grows instead of shrinking.',
    stat: ['$100', 'minimum to begin'],
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'A quiet desk with paperwork and a calculator',
  },
  {
    id: 'patience',
    chapter: 'Act II',
    label: 'The quiet years',
    eyebrow: 'Compounding',
    head: 'Then nothing happens, for a long time.',
    body: 'Interest is credited every month, calculated on a slightly larger number than the month before. There is no drama in it. That is precisely why it works.',
    stat: ['4.65%', 'APY, insured, no lock-up'],
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'Mist rolling slowly across a valley at dawn',
  },
  {
    id: 'keys',
    chapter: 'Act III',
    label: 'The door',
    eyebrow: 'Lending',
    head: 'One morning the saving turns into a set of keys.',
    body: 'A thirty-year fixed at 5.75% with no lender origination fee, and one named underwriter from the application through to the closing table. The full cost was on the table first.',
    stat: ['5.75%', '30-year fixed APR'],
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'Keys being handed over in a new home',
  },
  {
    id: 'horizon',
    chapter: 'Act IV',
    label: 'The wider view',
    eyebrow: 'Investing',
    head: 'With the roof settled, the horizon moves further out.',
    body: 'A balanced mandate targeting 7.8%, rebalanced quarterly by a committee that publishes its reasoning. Every holding and every fee, disclosed before a dollar moves.',
    stat: ['7.80%', 'balanced mandate target'],
    img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'A city skyline at blue hour',
  },
  {
    id: 'legacy',
    chapter: 'Act V',
    label: 'What outlives you',
    eyebrow: 'Estate',
    head: 'Eventually the plan stops being about you.',
    body: 'Wills, trust structuring and beneficiary designations aligned across every account — so the plan still says what it was meant to say on the day it finally matters.',
    stat: ['60+', 'countries served'],
    img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'Three generations of a family together',
  },
  {
    id: 'now',
    chapter: 'Act VI',
    label: 'Today',
    eyebrow: 'Begin',
    head: 'All of it starts with one afternoon.',
    body: 'Three minutes to open. Checking, savings and an investment account, together, with no monthly fee and no minimum balance holding anything hostage.',
    stat: ['3 min', 'to open an account'],
    cta: true,
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fm=jpg&q=76&w=1900&auto=format&fit=crop',
    alt: 'A team meeting around a table',
  },
];

function Scene({ scene, on }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`cine-scene ${on ? 'on' : ''}`} aria-hidden={!on}>
      {failed ? (
        <div className="w-full h-full" style={{ background: 'linear-gradient(150deg, #241C13, #100D0A 60%, #1C1710)' }} />
      ) : (
        <img src={scene.img} alt="" loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export default function CinemaScroll({ onNavigate }) {
  const ref = useRef(null);
  const p = useScrollProgress(ref);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Split the travel evenly across the acts; hold each one for most of its slot.
  const n = SCENES.length;
  const raw = p * n;
  const active = Math.min(n - 1, Math.max(0, Math.floor(raw)));
  const within = raw - active;               // 0→1 inside the current act
  const railFill = Math.min(1, within / 0.82);

  return (
    <section ref={ref} className="cinema" style={{ height: `${n * 100}vh` }}>
      <div className="cinema-stage">
        {/* the plates */}
        {SCENES.map((s, i) => (
          <Scene key={s.id} scene={s} on={i === active} />
        ))}

        <div className="cine-scrim" />
        <GoldDust tone="gold" density={13000} intensity={0.85} link={false} />

        {/* the copy */}
        <div className="relative h-full max-w-[1180px] mx-auto px-5 sm:px-6 flex items-center">
          <div className="relative w-full lg:w-[62%] min-h-[380px]">
            {SCENES.map((s, i) => (
              <div key={s.id} className={`cine-copy ${i === active ? 'on' : ''}`}>
                <p className="eyebrow eyebrow-gold">{s.eyebrow}</p>

                <h2 className="display-lg mt-6" style={{ color: '#FBF7EF' }}>
                  {s.head}
                </h2>

                <p className="mt-6 max-w-xl" style={{ color: 'rgba(251,247,239,.66)', fontSize: 16.5, lineHeight: 1.72 }}>
                  {s.body}
                </p>

                <div className="flex items-center gap-8 mt-9">
                  <div>
                    <p className="num text-[30px] font-semibold" style={{ color: 'var(--gold-hi)' }}>{s.stat[0]}</p>
                    <p className="text-[12.5px] mt-1" style={{ color: 'rgba(251,247,239,.5)' }}>{s.stat[1]}</p>
                  </div>
                  {s.cta && (
                    <button onClick={() => onNavigate?.('/register')} className="btn-gold px-7 py-3.5">
                      Open an account <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* chapter rail */}
          <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 cine-rail">
            {SCENES.map((s, i) => (
              <div key={s.id} className={`cine-rail-item ${i === active ? 'on' : ''}`}>
                <span className="cine-rail-bar">
                  <span
                    className="cine-rail-fill"
                    style={{
                      transform: `scaleX(${i < active ? 1 : i === active ? railFill : 0})`,
                      transition: i === active ? 'none' : 'transform .4s ease',
                    }}
                  />
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* act marker, bottom-left */}
        <div className="absolute bottom-8 left-0 right-0 max-w-[1180px] mx-auto px-5 sm:px-6 flex items-end justify-between pointer-events-none">
          <p className="num text-[11px] tracking-[0.22em]" style={{ color: 'rgba(251,247,239,.42)' }}>
            {SCENES[active].chapter} — {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </p>
          {reduced && (
            <p className="text-[11px]" style={{ color: 'rgba(251,247,239,.35)' }}>
              Scroll to advance
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
