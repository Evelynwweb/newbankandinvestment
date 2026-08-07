import { useNavigate } from 'react-router-dom';
import { Gem, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import PageShell, { SectionHead } from './PageShell.jsx';
import { Reveal } from '../components/ui/motion.jsx';

/* The public rate card. Kept in sync with the plan catalogue the
   dashboard subscribes against (see lib/mockApi.js PLAN_CATALOGUE). */
const TIERS = [
  { name: 'Reserve Savings', duration: 'Flexible', rate: '4.65%', focus: 'Insured, no lock-up', bestFor: 'Emergency and near-term cash', popular: false },
  { name: 'Treasury Ladder', duration: '6 Months', rate: '5.10%', focus: 'Laddered government bills', bestFor: 'Cash you won’t need this quarter', popular: false },
  { name: 'Balanced Portfolio', duration: '12 Months', rate: '7.80%', focus: '60/40 equity and credit', bestFor: 'Medium-horizon growth', popular: true },
  { name: 'Growth Portfolio', duration: '24 Months', rate: '11.20%', focus: 'Equity-tilted mandate', bestFor: 'Long-horizon capital', popular: false },
  { name: 'Private Wealth', duration: '36 Months', rate: '14.50%', focus: 'Bespoke multi-asset', bestFor: 'Wealth-grade planning', popular: false },
];

const FEATURES = ['Insured deposit accounts', 'Named investment committee', 'Quarterly written reviews'];

const PROMISES = [
  { title: 'No monthly fees', body: 'No account fee, no minimum balance, no overdraft fee. The fee schedule is one page and published.' },
  { title: 'Switch anytime', body: 'Move between plans whenever your goals change. Flexible products carry no exit penalty.' },
  { title: 'Support included', body: 'Every client gets 24/7 human support — not just the ones with the largest balances.' },
];

const TERMS = [
  ['Getting started', 'Open to every experience level'],
  ['Plan changes', 'Upgrade or switch anytime'],
  ['Funding', 'Free by transfer, wire or direct deposit'],
  ['Minimums', 'From $100 on Reserve Savings'],
  ['Withdrawals', 'Free after identity verification'],
  ['Customer support', '24/7 available'],
];

export default function PricingPage() {
  const navigate = useNavigate();
  return (
    <PageShell
      eyebrow="Plans & Rates"
      title="Rates that grow with your ambition"
      lede="Pick the horizon that matches your goals. Every plan includes the full platform — the difference is term, risk and depth of guidance."
      icon={Gem}
    >
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div>
                <div className={t.popular ? 'rounded-md p-[1px] h-full' : 'h-full flex flex-col'} style={t.popular ? { background: 'linear-gradient(160deg, var(--accent), var(--accent-deep))' } : undefined}>
                  <div className={t.popular ? 'rounded p-6 h-full flex flex-col' : 'h-full flex flex-col'} style={t.popular ? { background: 'var(--surface)' } : undefined}>
                    {t.popular && <span className="text-[10px] font-semibold uppercase tracking-wide w-fit px-2.5 py-1 rounded-full mb-4 text-[color:var(--on-accent)]" style={{ background: 'var(--accent)' }}>Most popular</span>}
                    <p className="font-display text-[18px] font-medium text-[color:var(--ink)]">{t.name}</p>
                    <p className="text-[11.5px] mt-1 text-[color:var(--muted-2)]">{t.duration}</p>

                    <p className="font-display text-[32px] font-semibold mt-4 leading-none text-[color:var(--accent)]">{t.rate}</p>
                    <p className="text-[10.5px] mt-1 text-[color:var(--muted-2)]">
                      {t.duration === 'Flexible' ? 'APY, variable' : 'target over term'}
                    </p>

                    <div className="mt-5 flex flex-col gap-3">
                      <div>
                        <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">Holds</p>
                        <p className="text-[14px] mt-0.5 leading-snug text-[color:var(--ink)]">{t.focus}</p>
                      </div>
                      <div>
                        <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">Best for</p>
                        <p className="text-[14px] mt-0.5 leading-snug text-[color:var(--up)]">{t.bestFor}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-6 mb-7">
                      {FEATURES.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <Check size={13} className="text-[color:var(--up)] shrink-0" />
                          <span className="text-[12px] text-[color:var(--muted)]">{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate('/register')} className={`mt-auto text-[13px] font-semibold px-5 py-3 rounded-full ${t.popular ? 'btn-solid' : 'btn-outline'}`}>Get started</button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <SectionHead eyebrow="The promise" title="Priced for trust, not for traps" />
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {PROMISES.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="card rounded-md p-6 h-full">
                <ShieldCheck size={18} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[16px] font-medium mt-4 text-[color:var(--ink)]">{p.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--muted)]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="card rounded-md p-8 mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {TERMS.map(([label, val]) => (
              <div key={label}>
                <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">{label}</p>
                <p className="text-[14.5px] mt-1 text-[color:var(--ink)]">{val}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-[12px] mt-8 max-w-3xl leading-relaxed text-[color:var(--muted-2)]">
            Deposit rates are variable and may change. Target rates on market-linked mandates are
            objectives, not guarantees — those products are not deposits, are not insured, and may
            lose value. Your rate on a fixed-term product is set at the moment you subscribe.
          </p>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-12 md:py-16 text-center">
        <Reveal>
          <h2 className="font-display text-[26px] sm:text-[34px] font-medium text-[color:var(--ink)]">Not sure where to start?</h2>
          <p className="mt-3 text-[14px] max-w-md mx-auto text-[color:var(--muted)]">Open a free account, park cash at 4.65%, and move up when you&rsquo;re ready.</p>
          <div className="flex justify-center mt-7">
            <button onClick={() => navigate('/register')} className="btn-solid text-[14px] px-8 py-3.5 flex items-center gap-2">
              Open an account <ArrowRight size={15} />
            </button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
