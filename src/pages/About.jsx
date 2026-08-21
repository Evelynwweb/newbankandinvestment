import { useNavigate } from 'react-router-dom';
import { Building2, Compass, Shield, Users, Globe, Award, ArrowRight, Sparkles } from 'lucide-react';
import PageShell, { SectionHead } from './PageShell.jsx';
import { Reveal, CountUp } from '../components/ui/motion.jsx';

const VALUES = [
  { icon: Shield, title: 'Safety before speed', body: 'Insured deposits, segregated client assets and round-the-clock fraud monitoring come before any new feature ships.' },
  { icon: Users, title: 'Clients first', body: 'We measure ourselves by balances that grow and debt that shrinks — not by fees extracted per account.' },
  { icon: Compass, title: 'Radical clarity', body: 'Plain-English products, every fee published, and a statement that always explains itself.' },
  { icon: Globe, title: 'Everywhere access', body: 'From Lagos to Zurich, the same standard of care for every client, at every balance.' },
];

const TIMELINE = [
  { year: '2019', title: 'The first account', body: 'Betamint opens with one conviction: private-bank quality shouldn’t require a private-bank balance.' },
  { year: '2021', title: 'Investing arrives', body: 'Managed mandates launch alongside deposits, so everyday money and long-horizon money finally live in one place.' },
  { year: '2023', title: 'Lending, honestly priced', body: 'Mortgages and personal credit launch with no origination fee and total cost quoted before signing.' },
  { year: 'Today', title: 'Sixty countries', body: 'Clients in 60+ countries hold $4.2 billion with us — and the number we watch is how many of them are ahead of where they started.' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <PageShell
      eyebrow="About Us"
      title="Built so ordinary people could bank extraordinarily well"
      lede="Betamint exists for one reason: to give everyone — first account or ninth figure — the same standard of banking, investing and advice."
      icon={Building2}
    >
      {/* mission */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-14">
        <Reveal>
          <div className="card rounded-md p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, var(--accent-deep) 0%, transparent 50%)' }} />
            <Sparkles size={22} className="text-[color:var(--accent)] relative" />
            <p className="font-display text-[22px] sm:text-[28px] leading-snug mt-5 max-w-3xl relative text-[color:var(--ink)]">
              &ldquo;We hold <span className="underline-amber">$4.2 billion</span> in client money &mdash; but the number we&rsquo;re
              proudest of has no currency sign. It&rsquo;s the share of clients whose net worth is higher
              than the day they joined.&rdquo;
            </p>
            <p className="text-[12.5px] mt-6 uppercase tracking-widest relative text-[color:var(--muted-2)]">The Betamint team</p>
          </div>
        </Reveal>
      </section>

      {/* values */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-14">
        <SectionHead eyebrow="What we stand for" title="Four values, zero compromises" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="card rounded-md p-6 h-full">
                <v.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[16.5px] font-medium mt-5 text-[color:var(--ink)]">{v.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--muted)]">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* timeline */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-14">
        <SectionHead eyebrow="The journey" title="From one desk to 60+ countries" />
        <div className="mt-10 flex flex-col gap-0">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year} delay={i * 90}>
              <div className="grid grid-cols-[70px_28px_1fr] sm:grid-cols-[110px_28px_1fr] gap-3 sm:gap-5">
                <p className="font-mono text-[14px] text-right pt-1 text-[color:var(--accent)]">{t.year}</p>
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))' }} />
                  {i < TIMELINE.length - 1 && <span className="w-px flex-1 bg-[color:var(--rule)]" />}
                </div>
                <div className="pb-10">
                  <h3 className="font-display text-[17px] font-medium text-[color:var(--ink)]">{t.title}</h3>
                  <p className="text-[13.5px] mt-1.5 leading-relaxed max-w-xl text-[color:var(--muted)]">{t.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* numbers */}
      <section className="border-y border-[color:var(--rule)]" style={{ background: 'linear-gradient(180deg, transparent, rgba(228,199,154,0.04), transparent)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { target: 1.4, decimals: 1, suffix: 'M+', label: 'Clients banking with us' },
            { target: 60, suffix: '+', label: 'Countries served' },
            { target: 6, suffix: '+', label: 'Years of trust' },
            { target: 98.6, decimals: 1, suffix: '%', label: 'Client satisfaction' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <p className="font-display text-[30px] sm:text-[38px] font-medium text-[color:var(--ink)]">
                <CountUp target={s.target} decimals={s.decimals || 0} suffix={s.suffix} />
              </p>
              <p className="text-[12.5px] mt-1 text-[color:var(--muted-2)]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-14 md:py-20 text-center">
        <Reveal>
          <Award size={26} className="mx-auto text-[color:var(--accent)]" />
          <h2 className="font-display text-[28px] sm:text-[36px] font-medium mt-5 text-[color:var(--ink)]">Write the next chapter with us</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button onClick={() => navigate('/register')} className="btn-solid text-[14px] px-8 py-3.5 flex items-center gap-2">
              Open an account <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate('/partners')} className="btn-outline text-[14px] px-8 py-3.5">Meet our partners</button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
