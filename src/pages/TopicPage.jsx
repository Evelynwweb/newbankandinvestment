import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageShell, { SectionHead } from './PageShell.jsx';
import { Reveal } from '../components/ui/motion.jsx';

/* ============================================================
   Generic topic page for Banking and Investing subjects —
   driven entirely by the topics data map.
   ============================================================ */
export default function TopicPage({ topics, base, eyebrow }) {
  const { topic } = useParams();
  const navigate = useNavigate();
  const data = topics[topic];
  if (!data) return <Navigate to="/" replace />;

  const siblings = Object.entries(topics).filter(([slug]) => slug !== topic);

  return (
    <PageShell key={topic} eyebrow={eyebrow} title={data.label} lede={data.tagline} icon={data.icon}>
      {/* overview */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-14">
        <Reveal>
          <div className="card rounded-md p-8 md:p-10 max-w-4xl">
            <p className="text-[15.5px] leading-relaxed text-[color:var(--muted)]">{data.description}</p>
          </div>
        </Reveal>
      </section>

      {/* feature grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <SectionHead eyebrow="What you get" title={`${data.label}, done properly`} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {data.points.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="card rounded-md p-6 h-full">
                <p.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[16.5px] font-medium mt-5 text-[color:var(--ink)]">{p.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--muted)]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* explore more */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <Reveal>
          <p className="text-[12px] tracking-widest uppercase text-[color:var(--accent-soft)] mb-4">Explore more</p>
        </Reveal>
        <div className="flex flex-wrap gap-3">
          {siblings.map(([slug, s], i) => (
            <Reveal key={slug} delay={i * 50}>
              <Link to={`${base}/${slug}`} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[color:var(--rule)] text-[13px] text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--accent-soft)] transition-colors">
                <s.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" /> {s.label}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-12 md:py-16">
        <Reveal>
          <div className="card rounded-md p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, var(--accent) 0%, transparent 55%)' }} />
            <h2 className="font-display text-[26px] sm:text-[34px] font-medium relative text-[color:var(--ink)]">
              Ready to put {data.label.toLowerCase()} to work?
            </h2>
            <p className="mt-3 text-[14px] max-w-md mx-auto relative text-[color:var(--muted)]">
              Opening an account takes about three minutes. No monthly fee, no minimum balance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-7 relative">
              <button onClick={() => navigate('/register')} className="btn-solid text-[14px] px-7 py-3.5 flex items-center gap-2">
                Open an account <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/pricing')} className="btn-outline text-[14px] px-7 py-3.5">See rates</button>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
