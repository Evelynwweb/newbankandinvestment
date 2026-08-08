import { useRef } from 'react';
import { useScrollProgress, Plate } from '../ui/motion.jsx';

/* ============================================================
   A horizontal rail driven by vertical scroll — five moments in a
   client's financial life, travelling past like carriages.

   Vertical scroll is the only input, so it behaves on trackpads,
   touch and keyboard alike, and never traps the page.
   ============================================================ */

const STOPS = [
  {
    yr: '01', title: 'The first account',
    body: 'A student account with $180 in it. Everyday Checking pays 0.75%, which on $180 is not life-changing — but it is the last account they will ever need to open.',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?fm=jpg&q=72&w=900&auto=format&fit=crop',
    alt: 'People working together at a shared table',
  },
  {
    yr: '02', title: 'The first surplus',
    body: 'Three years later there is money left over at the end of the month. An automatic sweep moves it into Reserve Savings at 4.65% without anyone having to remember.',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?fm=jpg&q=72&w=900&auto=format&fit=crop',
    alt: 'A calculator and financial documents on a desk',
  },
  {
    yr: '03', title: 'The keys',
    body: 'A 30-year fixed at 5.75% with no lender origination fee, and one named underwriter from application through to closing. The total cost was on the table before anything was signed.',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?fm=jpg&q=72&w=900&auto=format&fit=crop',
    alt: 'Handing over the keys to a new home',
  },
  {
    yr: '04', title: 'The long horizon',
    body: 'With the mortgage settled, the surplus moves up a tier — a Balanced mandate targeting 7.8%, rebalanced quarterly by a committee that publishes its reasoning.',
    img: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?fm=jpg&q=72&w=900&auto=format&fit=crop',
    alt: 'A quiet workspace with charts',
  },
  {
    yr: '05', title: 'What is left behind',
    body: 'Wills, trust structuring and beneficiary designations aligned across every account — so the plan still says what it was meant to say on the day it matters.',
    img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?fm=jpg&q=72&w=900&auto=format&fit=crop',
    alt: 'Three generations of a family together',
  },
];

export default function JourneyRail() {
  const ref = useRef(null);
  const p = useScrollProgress(ref);

  return (
    <section ref={ref} className="rail" style={{ height: '340vh' }}>
      <div className="rail-stage">
        <div className="w-full">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-6 mb-9">
            <p className="eyebrow">A life, in five moves</p>
            <h2 className="font-display text-[30px] sm:text-[42px] leading-[1.1] font-semibold max-w-2xl mt-5">
              One relationship, carried the whole way.
            </h2>
          </div>

          {/* Translate the track by the fraction of its overflow width. */}
          <div
            className="rail-track"
            style={{ transform: `translate3d(${-p * (STOPS.length - 1.6) * 30}vw, 0, 0)` }}
          >
            {STOPS.map((s) => (
              <article key={s.yr} className="rail-card">
                <Plate src={s.img} alt={s.alt} variant="plate-clip" drift />
                <div className="p-6">
                  <span className="section-no">{s.yr}</span>
                  <h3 className="font-display text-[21px] font-semibold mt-2.5">{s.title}</h3>
                  <p className="text-[13.5px] leading-[1.65] mt-3 text-[color:var(--muted)]">{s.body}</p>
                </div>
              </article>
            ))}
          </div>

          {/* progress hairline */}
          <div className="max-w-[1180px] mx-auto px-5 sm:px-6 mt-9">
            <div className="h-[2px] rounded" style={{ background: 'var(--rule)' }}>
              <div
                className="h-full rounded"
                style={{ width: `${p * 100}%`, background: 'var(--accent)', transition: 'width .1s linear' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
