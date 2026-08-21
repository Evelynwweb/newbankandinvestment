import { useNavigate } from 'react-router-dom';
import { Handshake, Shield, Globe, Zap, ArrowRight, BadgeCheck } from 'lucide-react';
import PageShell, { SectionHead } from './PageShell.jsx';
import { Reveal } from '../components/ui/motion.jsx';

const PARTNERS = [
  { name: 'Northmark Custody', role: 'Asset custody', body: 'Client securities are held by an independent custodian, segregated from our own balance sheet.' },
  { name: 'Veridian Clearing', role: 'Settlement', body: 'Trade settlement and reconciliation run on infrastructure trusted by institutional desks.' },
  { name: 'Halcyon Data', role: 'Market data', body: 'Reference pricing and valuations feed every statement and portfolio view on the platform.' },
  { name: 'Sentinel Risk', role: 'Fraud & AML', body: 'Real-time transaction screening and sanctions checks on every payment leaving the bank.' },
  { name: 'Cedar Actuarial', role: 'Insurance & annuities', body: 'Protection and annuity products underwritten by a regulated life carrier, not by us.' },
  { name: 'Orrin & Vale', role: 'Legal & estate', body: 'Estate structuring and trust drafting handled by an independent legal practice.' },
];

const PILLARS = [
  { icon: Shield, title: 'Security-first alliances', body: 'Every partner is vetted against the same security and controls bar we hold ourselves to.' },
  { icon: Globe, title: 'Global reach', body: 'Partnerships that keep payments fast and compliant across 60+ countries.' },
  { icon: Zap, title: 'Best-in-class rails', body: 'From custody to screening, each layer is run by the specialist in its field.' },
];

export default function Partners() {
  const navigate = useNavigate();
  return (
    <PageShell
      eyebrow="Our Partners"
      title="The institutions behind the platform"
      lede="Betament is built on partnerships with specialists in custody, settlement, risk and law — so no single point of failure sits inside one company."
      icon={Handshake}
    >
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PARTNERS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90}>
              <div className="card rounded-md p-7 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="partner-mark font-display text-[21px] tracking-tight text-[color:var(--ink)]">{p.name}</span>
                  <BadgeCheck size={16} className="text-[color:var(--accent)]" />
                </div>
                <p className="text-[11px] uppercase tracking-widest mt-2 text-[color:var(--accent-soft)]">{p.role}</p>
                <p className="text-[13.5px] mt-3 leading-relaxed flex-1 text-[color:var(--muted)]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <SectionHead eyebrow="Why it matters" title="Partnerships you can feel in every transaction" />
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="card rounded-md p-6 h-full">
                <p.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[16px] font-medium mt-5 text-[color:var(--ink)]">{p.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--muted)]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-12 md:py-16">
        <Reveal>
          <div className="card rounded-md p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, var(--accent) 0%, transparent 55%)' }} />
            <h2 className="font-display text-[26px] sm:text-[34px] font-medium relative text-[color:var(--ink)]">Want to partner with us?</h2>
            <p className="mt-3 text-[14px] max-w-md mx-auto relative text-[color:var(--muted)]">
              We&rsquo;re always open to alliances that make banking safer, faster and fairer for the people who use it.
            </p>
            <div className="flex justify-center mt-7 relative">
              <button onClick={() => navigate('/resources/help-center')} className="btn-solid text-[14px] px-8 py-3.5 flex items-center gap-2">
                Get in touch <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
