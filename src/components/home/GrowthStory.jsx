import { useRef, useMemo } from 'react';
import { useScrollProgress } from '../ui/motion.jsx';
import GoldDust from './GoldDust.jsx';

/* ============================================================
   The scroll story: "what patience does to $10,000".

   A tall section pins its stage for four viewport-heights. As you
   scroll, one continuous curve inks itself across the frame, the
   figure climbs with it, year markers light up as they're passed,
   and four captions hand over to one another.

   It argues the product instead of decorating around it — the shape
   on screen is literally the compounding the bank sells.
   ============================================================ */

const PRINCIPAL = 10000;
const RATE = 0.0465;      // Reserve Savings APY
const YEARS = 20;

const CHAPTERS = [
  { at: 0.00, year: 0,  head: 'You open an account.', body: 'Ten thousand dollars, sitting where it can earn. No monthly fee taking bites out of it, no minimum balance holding it hostage.' },
  { at: 0.30, year: 5,  head: 'Five years in.', body: 'Interest has been credited every month, and each month it was calculated on a slightly larger number than the month before. Nothing was done. That is the point.' },
  { at: 0.58, year: 12, head: 'Twelve years in.', body: 'The interest earned this year alone is larger than the interest earned across the first three combined. This is the part people underestimate.' },
  { at: 0.82, year: 20, head: 'Twenty years in.', body: 'The original deposit has more than doubled without a single additional contribution — and every dollar of it stayed insured the whole way.' },
];

const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export default function GrowthStory() {
  const ref = useRef(null);
  const p = useScrollProgress(ref);

  const W = 1000, H = 340, PAD = 20;

  /* The compounding curve, sampled once. */
  const { points, path, area, maxV } = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= YEARS * 4; i++) {
      const t = i / 4;
      pts.push({ t, v: PRINCIPAL * Math.pow(1 + RATE, t) });
    }
    const max = pts[pts.length - 1].v;
    const x = (t) => PAD + (t / YEARS) * (W - PAD * 2);
    const y = (v) => H - PAD - ((v - PRINCIPAL) / (max - PRINCIPAL)) * (H - PAD * 2);
    const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${x(pt.t).toFixed(1)},${y(pt.v).toFixed(1)}`).join(' ');
    return { points: pts, path: d, area: `${d} L${x(YEARS)},${H} L${x(0)},${H} Z`, maxV: max };
  }, []);

  // The curve inks in across the first 85% of the scroll, then holds.
  const draw = Math.min(1, p / 0.85);
  const value = PRINCIPAL + (maxV - PRINCIPAL) * draw;
  const yearNow = YEARS * draw;

  const active = CHAPTERS.reduce((acc, c, i) => (p >= c.at ? i : acc), 0);

  return (
    <section ref={ref} className="story noir" style={{ height: '420vh' }}>
      <div className="story-stage">
        <GoldDust tone="gold" density={26000} link={false} />

        <div className="relative w-full max-w-[1180px] mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-center">
            {/* ---- the words ---- */}
            <div className="relative min-h-[290px] lg:min-h-[330px]">
              <p className="eyebrow eyebrow-gold">The case for patience</p>

              <div className="relative mt-6 h-[240px]">
                {CHAPTERS.map((c, i) => (
                  <div key={c.head} className={`story-caption ${i === active ? 'on' : ''}`}>
                    <p className="num text-[12px] tracking-[0.2em]" style={{ color: 'var(--gold-leaf)' }}>
                      YEAR {String(c.year).padStart(2, '0')}
                    </p>
                    <h3 className="font-display text-[30px] sm:text-[38px] leading-[1.12] font-semibold mt-3">
                      {c.head}
                    </h3>
                    <p className="text-[15px] leading-[1.7] mt-4 max-w-md" style={{ color: 'rgba(244,237,224,.62)' }}>
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* chapter pips */}
              <div className="flex items-center gap-2 mt-2">
                {CHAPTERS.map((c, i) => (
                  <span
                    key={c.head}
                    className="h-[2px] rounded transition-all duration-500"
                    style={{
                      width: i === active ? 30 : 14,
                      background: i === active ? 'var(--gold-leaf)' : 'rgba(216,180,117,.28)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ---- the curve ---- */}
            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase" style={{ color: 'rgba(240,231,214,.45)' }}>
                    Balance
                  </p>
                  <p className="num text-[38px] sm:text-[46px] font-semibold leading-none mt-1.5" style={{ color: 'var(--gold-hi)' }}>
                    {fmt(value)}
                  </p>
                </div>
                <p className="num text-[13px]" style={{ color: 'rgba(240,231,214,.45)' }}>
                  YR {yearNow.toFixed(1)}
                </p>
              </div>

              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'clamp(190px, 30vh, 300px)' }}>
                <defs>
                  <linearGradient id="storyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D8B475" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#D8B475" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="storyLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#B98D46" />
                    <stop offset="60%" stopColor="#F0DCAE" />
                    <stop offset="100%" stopColor="#F0DCAE" />
                  </linearGradient>
                  {/* Reveals the curve left-to-right in step with scroll. */}
                  <clipPath id="storyClip">
                    <rect x="0" y="0" width={W * draw} height={H} />
                  </clipPath>
                </defs>

                {/* baseline grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                  <line
                    key={g}
                    x1={PAD} x2={W - PAD}
                    y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
                    stroke="rgba(216,180,117,.12)" strokeWidth="1"
                  />
                ))}

                <g clipPath="url(#storyClip)">
                  <path d={area} fill="url(#storyFill)" />
                  <path d={path} fill="none" stroke="url(#storyLine)" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* the head of the curve */}
                {draw > 0.01 && draw < 0.995 && (() => {
                  const idx = Math.min(points.length - 1, Math.round(draw * (points.length - 1)));
                  const pt = points[idx];
                  const cx = PAD + (pt.t / YEARS) * (W - PAD * 2);
                  const cy = H - PAD - ((pt.v - PRINCIPAL) / (maxV - PRINCIPAL)) * (H - PAD * 2);
                  return (
                    <>
                      <circle cx={cx} cy={cy} r="10" fill="#F0DCAE" opacity="0.18" />
                      <circle cx={cx} cy={cy} r="4" fill="#F0DCAE" />
                    </>
                  );
                })()}

                {/* year ticks */}
                {[0, 5, 10, 15, 20].map((yr) => {
                  const cx = PAD + (yr / YEARS) * (W - PAD * 2);
                  const passed = yearNow >= yr;
                  return (
                    <g key={yr} className="story-tick" opacity={passed ? 1 : 0.32}>
                      <line x1={cx} x2={cx} y1={H - PAD} y2={H - PAD + 7} stroke={passed ? '#D8B475' : 'rgba(216,180,117,.4)'} strokeWidth="1" />
                      <text x={cx} y={H - 1} textAnchor="middle" fontSize="16" fill={passed ? '#D8B475' : 'rgba(216,180,117,.4)'} fontFamily="JetBrains Mono, monospace">
                        {yr}y
                      </text>
                    </g>
                  );
                })}
              </svg>

              <p className="text-[11.5px] leading-relaxed mt-5" style={{ color: 'rgba(240,231,214,.38)' }}>
                Illustration: $10,000 at 4.65% APY, compounded monthly, no further deposits, over
                20 years. The rate is variable and the figure is not a projection of your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
