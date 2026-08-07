import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { buildAreaPath } from '../data.jsx';

/* ============================================================
   Self-contained rate widgets — no third-party embed, so nothing
   phones home from a banking dashboard.

   RatesTape:   the published deposit & lending rates, scrolling.
   YieldCurve:  the reference curve behind our fixed-term products.
   ============================================================ */

const RATES = [
  { label: 'Reserve Savings APY', value: '4.65%', up: true },
  { label: 'Everyday Checking APY', value: '0.75%', up: true },
  { label: '6-Mo Treasury Ladder', value: '5.10%', up: true },
  { label: 'Balanced Portfolio (tgt)', value: '7.80%', up: true },
  { label: 'Growth Portfolio (tgt)', value: '11.20%', up: true },
  { label: '30-Yr Fixed Mortgage', value: '5.75%', up: false },
  { label: 'Auto Loan from', value: '6.40%', up: false },
  { label: 'Personal Loan from', value: '8.90%', up: false },
];

export function RatesTape() {
  const row = [...RATES, ...RATES];
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="ticker-track flex items-center gap-8 py-3 whitespace-nowrap">
        {row.map((r, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0 px-1">
            <span className="text-[11px] text-[color:var(--muted-2)]">{r.label}</span>
            <span className={`font-mono text-[12px] font-semibold flex items-center gap-0.5 ${r.up ? 'text-[color:var(--up)]' : 'text-[color:var(--muted)]'}`}>
              {r.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Reference yield curve — the shape our fixed-term pricing follows. */
const TENORS = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];
const YIELDS = [4.32, 4.48, 4.71, 4.86, 4.94, 5.02, 5.18, 5.31, 5.44, 5.62, 5.71];

export function YieldCurve() {
  const W = 600, H = 150;
  const { line, area } = useMemo(() => buildAreaPath(YIELDS, W, H, 14), []);
  const latest = YIELDS[YIELDS.length - 1];
  const spread = (latest - YIELDS[0]).toFixed(2);

  return (
    <div className="card rounded-3xl p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12.5px] text-[color:var(--muted-2)]">Reference yield curve</p>
          <p className="font-display text-[19px] font-semibold mt-0.5 text-[color:var(--ink)]">
            Fixed-term pricing basis
          </p>
        </div>
        <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-[color:var(--up)]/10 text-[color:var(--up)]">
          <TrendingUp size={12} /> +{spread}% 1M→30Y
        </span>
      </div>

      <div className="relative mt-5" style={{ height: 140 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#curveFill)" />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-draw" />
        </svg>
      </div>

      <div className="flex justify-between mt-3 text-[10px] font-mono text-[color:var(--muted-2)]">
        {TENORS.filter((_, i) => i % 2 === 0).map((t) => <span key={t}>{t}</span>)}
      </div>

      <p className="text-[11.5px] mt-4 leading-relaxed text-[color:var(--muted-2)]">
        Illustrative reference rates used to price term deposits and fixed-income mandates.
        Your actual rate is fixed at the moment you subscribe.
      </p>
    </div>
  );
}
