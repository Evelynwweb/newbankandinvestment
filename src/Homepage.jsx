import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Plus, Minus, Star, Quote,
  Wallet, Layers, PieChart, Target, Bitcoin, Gem,
  ShieldCheck, Lock, FileText, Users, Building2, Percent,
} from 'lucide-react';
import { Reveal, MaskLines, CountUp, Plate, useInView } from './components/ui/motion.jsx';
import Navbar from './components/home/Navbar.jsx';
import Footer from './components/home/Footer.jsx';
import LandingChatbot from './components/home/LandingChatbot.jsx';
import GoldDust from './components/home/GoldDust.jsx';
import CinemaScroll from './components/home/CinemaScroll.jsx';
import './index.css';

/* Unsplash — free for commercial use. Everything renders through <Plate>,
   which falls back to a warm gradient if the CDN ever fails. */
const IMG = {
  hero: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?fm=jpg&q=78&w=2100&auto=format&fit=crop',
  cash: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  portfolio: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  retirement: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  portraitA: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?fm=jpg&q=74&w=500&auto=format&fit=crop',
  portraitB: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=74&w=500&auto=format&fit=crop',
  portraitC: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=jpg&q=74&w=500&auto=format&fit=crop',
};

function Section({ no, eyebrow, title, lede, children, className = '', id }) {
  return (
    <section id={id} className={className}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-[150px_1fr] gap-5 md:gap-12">
          <Reveal><p className="section-no md:pt-2">{no}</p></Reveal>
          <div>
            <Reveal><p className="eyebrow">{eyebrow}</p></Reveal>
            <Reveal delay={80}><h2 className="display-md mt-5 max-w-2xl">{title}</h2></Reveal>
            {lede && <Reveal delay={140}><p className="lede mt-6 max-w-xl">{lede}</p></Reveal>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   HERO
   ============================================================ */
const HERO_RATES = [
  ['Cash Management', '4.65%'],
  ['Treasury-backed', '5.18%'],
  ['Core ETF Portfolio', '7.80%'],
  ['Private Credit', '13.8%'],
];

function Hero() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden" style={{ background: 'var(--noir)' }}>
      <div className="absolute inset-0">
        {failed ? (
          <div className="w-full h-full" style={{ background: 'linear-gradient(150deg, #261D13, #100D0A 58%, #1D1811)' }} />
        ) : (
          <img src={IMG.hero} alt="" onError={() => setFailed(true)}
            className="w-full h-full object-cover"
            style={{ animation: 'plateDrift 26s ease-in-out infinite alternate' }} />
        )}
        <div className="absolute inset-0" style={{
          background:
            'linear-gradient(180deg, rgba(16,13,10,.84) 0%, rgba(16,13,10,.36) 30%, rgba(16,13,10,.64) 66%, rgba(16,13,10,.96) 100%),' +
            'linear-gradient(94deg, rgba(16,13,10,.9) 0%, rgba(16,13,10,.42) 55%, rgba(16,13,10,.1) 100%)',
        }} />
      </div>

      <GoldDust tone="gold" density={9000} intensity={1.1} />

      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-6 w-full pt-36 pb-12">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 px-4 py-2 glass text-[12px]"
            style={{ color: 'rgba(251,247,239,.85)', borderRadius: 999 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-leaf)' }} />
            Investment management &middot; $4.2B under administration
          </span>
        </Reveal>

        <h1 className="display-xl mt-8 max-w-4xl" style={{ color: '#FDFAF5' }}>
          <MaskLines lines={['Every dollar you own', 'should have a job.']} />
          <span className="block foil mt-1">
            <MaskLines lines={['Give it one.']} delay={260} />
          </span>
        </h1>

        <Reveal delay={640}>
          <p className="mt-8 max-w-xl" style={{ color: 'rgba(251,247,239,.72)', fontSize: 17.5, lineHeight: 1.72 }}>
            Treasuries, bond ladders, ETF portfolios, IRAs, private credit and digital assets —
            one shelf, every holding and every fee published before you commit.
          </p>
        </Reveal>

        <Reveal delay={720}>
          <div className="flex flex-wrap items-center gap-3.5 mt-10">
            <button onClick={() => navigate('/register')} className="btn-gold px-8 py-4">
              Start investing <ArrowRight size={17} />
            </button>
            <Link to="/pricing" className="btn-ghost-light px-8 py-4">See every rate</Link>
          </div>
        </Reveal>
      </div>

      <Reveal delay={820}>
        <div className="relative max-w-[1180px] mx-auto px-5 sm:px-6 w-full pb-10">
          <div className="glass px-6 py-5 flex flex-wrap items-center gap-x-10 gap-y-4">
            <span className="text-[10.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(251,247,239,.45)' }}>
              Target returns
            </span>
            {HERO_RATES.map(([label, value]) => (
              <span key={label} className="flex items-baseline gap-2.5">
                <span className="text-[12.5px]" style={{ color: 'rgba(251,247,239,.6)' }}>{label}</span>
                <span className="num text-[16px] font-semibold" style={{ color: 'var(--gold-hi)' }}>{value}</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   Seals
   ============================================================ */
function Seals() {
  const seals = [
    'Independent Custody', 'SOC 2 Type II Audited', 'ISO 27001 Certified',
    'Segregated Client Assets', 'AML / KYC Compliant', 'Published Holdings',
    'One All-In Advisory Fee', 'Quarterly Committee Notes',
  ];
  const row = [...seals, ...seals];
  return (
    <div className="border-b border-[color:var(--rule)] bg-[color:var(--paper-2)] py-6">
      <div className="seal-strip">
        <div className="seal-track">
          {row.map((s, i) => (
            <span key={i} className="flex items-center gap-2.5 shrink-0 text-[12.5px] text-[color:var(--muted)]">
              <ShieldCheck size={14} className="text-[color:var(--accent)]" strokeWidth={1.7} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   The shelf — six families
   ============================================================ */
const FAMILIES = [
  { icon: Wallet, no: '01', title: 'Cash & Liquidity', rate: '4.65 – 5.18%',
    body: 'High-yield cash management, government money market funds and treasury-backed accounts. Where money waits without going backwards.',
    items: ['Cash management', 'Money market funds', 'Treasury-backed'], to: '/invest/cash-management' },
  { icon: Layers, no: '02', title: 'Fixed Income', rate: '4.28 – 6.60%',
    body: 'Bond ladders with a rung due every quarter, investment-grade municipals, and preferred stock for a stated dividend.',
    items: ['Bond ladders', 'Municipal bonds', 'Preferred stock'], to: '/invest/bond-ladders' },
  { icon: PieChart, no: '03', title: 'Portfolios', rate: '7.80 – 11.2%',
    body: 'ETF-built mandates run by a named committee — or run them yourself, commission-free, down to five-dollar fractional slices.',
    items: ['Managed ETF portfolios', 'Self-directed brokerage', 'Fractional shares'], to: '/invest/managed-portfolios' },
  { icon: Target, no: '04', title: 'Retirement', rate: 'Tax-advantaged',
    body: 'Traditional and Roth IRAs, SEP and SIMPLE for the self-employed, 401(k) rollovers chased on your behalf, and Solo 401(k).',
    items: ['Traditional & Roth IRA', 'SEP & SIMPLE IRA', '401(k) rollover · Solo 401(k)'], to: '/invest/iras' },
  { icon: Bitcoin, no: '05', title: 'Higher-Yield Add-Ons', rate: '8.75 – 13.8%',
    body: 'Margin lending against eligible positions, private real estate and credit, and major digital assets in segregated custody.',
    items: ['Margin lending', 'Private real estate & credit', 'Crypto trading & custody'], to: '/invest/alternatives' },
  { icon: Gem, no: '06', title: 'Private Access', rate: 'Premium tier',
    body: 'For situations that have outgrown a product sheet: estate planning tools and trust formation with a named officer.',
    items: ['Estate planning tools', 'Trust account services'], to: '/invest/trust-services' },
];

function Shelf() {
  return (
    <Section
      no="I"
      eyebrow="The shelf"
      title="Six families. Everything from a treasury bill to private credit."
      lede="One account reaches all of it. You can hold cash at 4.65% and private credit at 13.8% side by side, and see both on the same statement."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
        {FAMILIES.map((f, i) => (
          <Reveal key={f.title} delay={i * 90}>
            <Link to={f.to} className="card-soft lift h-full p-7 flex flex-col group">
              <div className="flex items-start justify-between">
                <f.icon size={21} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <span className="section-no">{f.no}</span>
              </div>
              <h3 className="display-sm mt-5 text-[22px]">{f.title}</h3>
              <p className="num text-[13px] mt-1.5" style={{ color: 'var(--accent)' }}>{f.rate}</p>
              <p className="text-[14px] leading-[1.7] mt-4 flex-1 text-[color:var(--muted)]">{f.body}</p>
              <ul className="flex flex-col gap-2 mt-6 pt-5 border-t border-[color:var(--rule-soft)]">
                {f.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-2)]">
                    <Check size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" /> {it}
                  </li>
                ))}
              </ul>
              <span className="link-rule text-[13px] mt-6 w-fit">Explore <ArrowUpRight size={14} /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================
   Numbers
   ============================================================ */
function Numbers() {
  const stats = [
    { target: 4.2, decimals: 1, prefix: '$', suffix: 'B', label: 'Client assets under administration' },
    { target: 22, label: 'Products across six families' },
    { target: 60, suffix: '+', label: 'Countries served' },
    { target: 98.6, decimals: 1, suffix: '%', label: 'Client satisfaction' },
  ];
  return (
    <section className="noir noir-2">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <p className="display-md foil" style={{ fontSize: 'clamp(32px, 3.4vw, 46px)' }}>
              <CountUp target={s.target} decimals={s.decimals || 0} prefix={s.prefix || ''} suffix={s.suffix || ''} />
            </p>
            <p className="text-[12.5px] mt-3" style={{ color: 'rgba(246,241,231,.55)' }}>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   How a portfolio gets built
   ============================================================ */
const BUILD = [
  { no: '01', title: 'Fund the cash account', body: 'Wire in using the details on your dashboard. Cash earns 4.65% from the day it lands, so nothing sits idle while you decide.', img: IMG.cash },
  { no: '02', title: 'Set the floor', body: 'Treasuries and bond ladders take the part of the portfolio that must not surprise you. Rates are fixed the moment you subscribe.', img: IMG.retirement },
  { no: '03', title: 'Add the engine', body: 'ETF mandates run by the committee, or your own positions in the brokerage. Every holding and the single all-in fee, published first.', img: IMG.portfolio },
];

function HowBuilt() {
  return (
    <Section no="II" eyebrow="How a portfolio gets built"
      title="Floor first, engine second, extras last."
      lede="The order matters more than the picks. We build from the bottom up so the risky sleeve is always a slice you chose, never a position you drifted into.">
      <div className="flex flex-col gap-6 mt-14">
        {BUILD.map((s, i) => (
          <Reveal key={s.no} delay={i * 90}>
            <div className={`card-soft overflow-hidden grid md:grid-cols-2 ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
              <Plate src={s.img} alt="" ratio="16/10" drift className="h-full min-h-[220px]" />
              <div className="p-8 md:p-10 flex flex-col justify-center [direction:ltr]">
                <span className="section-no">{s.no}</span>
                <h3 className="display-sm text-[24px] mt-3">{s.title}</h3>
                <p className="text-[15px] leading-[1.72] mt-4 text-[color:var(--muted)]">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================
   Fees
   ============================================================ */
function Costs() {
  const rows = [
    ['Account fee', 'None', true],
    ['Minimum to open', 'None', true],
    ['US equity & ETF trades', 'Commission-free', true],
    ['Fractional orders', 'From $5', true],
    ['Deposits by wire or ACH', 'Free', true],
    ['Managed portfolio advisory', 'One all-in rate, shown first', false],
    ['Margin interest', 'From 8.75% on drawn balance', false],
    ['Outbound international wire', '$25', false],
  ];
  return (
    <Section no="III" eyebrow="What it costs"
      title="One page. No second page."
      lede="Nothing is deducted quietly from a return before you see it. The advisory rate on a managed mandate is stated in full before you subscribe.">
      <Reveal delay={100}>
        <div className="card-soft overflow-hidden mt-14 max-w-3xl">
          <table className="ledger">
            <tbody>
              {rows.map(([label, value, free]) => (
                <tr key={label}>
                  <td className="text-[14.5px]">{label}</td>
                  <td className="text-right">
                    <span className="num text-[14px] font-semibold" style={{ color: free ? 'var(--up)' : 'var(--ink)' }}>{value}</span>
                  </td>
                  <td className="w-10 text-right">
                    {free ? <Minus size={14} className="text-[color:var(--up)] inline" />
                          : <Plus size={14} className="text-[color:var(--muted-2)] inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
   Safeguards
   ============================================================ */
function Safeguards() {
  const [ref, inView] = useInView(0.3);
  const items = [
    { icon: Building2, title: 'Independent custody', body: 'Client securities and digital assets sit with an independent custodian, segregated and never on our balance sheet.' },
    { icon: FileText, title: 'Published holdings', body: 'Every mandate discloses its full position list and its single all-in fee before you subscribe.' },
    { icon: Users, title: 'A committee that signs its work', body: 'Allocation changes come with written reasoning, published every quarter.' },
    { icon: Lock, title: 'Two-factor on every movement', body: 'Sign-in, subscriptions and withdrawals are all confirmed on a second device.' },
  ];
  return (
    <Section no="IV" eyebrow="Safeguards" title="Custody, disclosure, and someone accountable."
      lede="An investment platform earns trust in three places: where the assets actually sit, what it tells you it owns, and who signs the decisions.">
      <div className="grid lg:grid-cols-[1fr_300px] gap-14 items-center mt-14">
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-9">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent-wash)' }}>
                  <it.icon size={18} className="text-[color:var(--accent)]" strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="display-sm">{it.title}</h3>
                  <p className="text-[13.5px] leading-[1.7] mt-2 text-[color:var(--muted)]">{it.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div ref={ref} className="hidden lg:flex justify-center">
          <svg viewBox="0 0 200 220" className="w-[230px]">
            <path d="M100 12 L182 46 V116 c0 44-34 72-82 90 C52 188 18 160 18 116 V46 Z"
              fill="none" stroke="var(--accent)" strokeWidth="1.5"
              className={`ink-path ${inView ? 'in' : ''}`} style={{ '--len': 700 }} />
            <path d="M68 116 L92 142 L136 86" fill="none" stroke="var(--accent)" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              className={`ink-path ${inView ? 'in' : ''}`} style={{ '--len': 140, transitionDelay: '620ms' }} />
          </svg>
        </div>
      </div>
      <Reveal delay={240}>
        <div className="flex flex-wrap gap-2.5 mt-12 pt-9 border-t border-[color:var(--rule)]">
          {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'AML / KYC', 'Independent Custody', 'Segregated Assets'].map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
   Voices
   ============================================================ */
function Voices() {
  const quotes = [
    { quote: 'I could finally see the treasuries, the ETF mandate and my own stock picks on one statement. That single view changed how I size everything.', name: 'Sarah Thompson', role: 'Managed + self-directed · 3 years', img: IMG.portraitA },
    { quote: 'They talked me out of putting more into private credit than I should. A firm earning a fee on it told me to take less. That is why I stayed.', name: 'Michael Chen', role: 'Private access · 2 years', img: IMG.portraitB },
    { quote: 'The 401(k) rollover took one signature. My old provider had been quietly charging me for eleven years and nobody had ever mentioned it.', name: 'Amara Okonkwo', role: 'Retirement · 1 year', img: IMG.portraitC },
  ];
  return (
    <Section no="V" eyebrow="In their words" title="What investors actually say.">
      <div className="grid md:grid-cols-3 gap-7 mt-14">
        {quotes.map((q, i) => (
          <Reveal key={q.name} delay={i * 110}>
            <figure className="card-soft lift h-full p-7 flex flex-col">
              <Quote size={22} className="text-[color:var(--accent)] opacity-40" />
              <blockquote className="text-[17px] leading-[1.62] mt-5 flex-1 font-medium">{q.quote}</blockquote>
              <figcaption className="flex items-center gap-3.5 mt-7 pt-6 border-t border-[color:var(--rule-soft)]">
                <Plate src={q.img} alt="" className="w-11 h-11 rounded-full shrink-0" ratio="1/1" />
                <div>
                  <p className="text-[13.5px] font-semibold">{q.name}</p>
                  <p className="text-[12px] text-[color:var(--muted-2)] mt-0.5">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <Reveal delay={260}>
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-9 border-t border-[color:var(--rule)]">
          <span className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} className="text-[color:var(--accent)]" fill="currentColor" />)}
            <span className="num text-[17px] font-semibold ml-1.5">4.9</span>
          </span>
          <span className="text-[13px] text-[color:var(--muted-2)]">across 1.4M accounts · surveyed annually</span>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
const FAQS = [
  { q: 'What is the minimum to start?', a: 'Nothing to open the account, and five dollars to buy your first fractional position. Cash Management starts at $100, managed ETF portfolios at $2,500, and private credit at $25,000 — each product states its own minimum before you subscribe.' },
  { q: 'Are the target returns guaranteed?', a: 'No. Cash and treasury products pay a stated rate that can move. Everything market-linked — ETF mandates, preferred stock, private credit, crypto — carries a target, not a promise, and can lose value. The risk band is printed next to every product.' },
  { q: 'Where are my assets actually held?', a: 'With an independent custodian, segregated from our own balance sheet and from other clients. If Aurivest disappeared tomorrow, your securities and digital assets would still be yours, held by someone else.' },
  { q: 'Can I run my own positions alongside a managed mandate?', a: 'Yes, and most clients do. The self-directed brokerage sits in the same account as the managed sleeves, so you see the committee’s positions and your own on one statement.' },
  { q: 'How do I get money in and out?', a: 'By bank wire or ACH. Your dashboard shows the receiving details and a reference unique to you. Withdrawals go back to the bank account you save in Settings, which we verify once before the first payout.' },
  { q: 'What does the advisory fee actually cost?', a: 'One all-in rate per managed mandate, shown in full on the product before you subscribe. There is no performance fee, no platform fee stacked on top, and no commission on US equity and ETF trades.' },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section no="VI" eyebrow="Questions" title="What investors ask before they move.">
      <div className="mt-14 max-w-3xl border-t border-[color:var(--rule)]">
        {FAQS.map((f, i) => (
          <div key={f.q} className="acc-item">
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
              className="w-full flex items-start justify-between gap-6 py-6 text-left group">
              <span className="display-sm group-hover:text-[color:var(--accent)] transition-colors">{f.q}</span>
              <span className="shrink-0 mt-1 w-7 h-7 rounded-full border border-[color:var(--rule)] flex items-center justify-center transition-colors group-hover:border-[color:var(--accent)]">
                {open === i ? <Minus size={13} className="text-[color:var(--accent)]" /> : <Plus size={13} className="text-[color:var(--muted)]" />}
              </span>
            </button>
            <div className={`acc-body ${open === i ? 'open' : ''}`}>
              <div><p className="pb-7 pr-12 text-[15px] leading-[1.75] text-[color:var(--muted)]">{f.a}</p></div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================
   Closing
   ============================================================ */
function Closing() {
  const navigate = useNavigate();
  return (
    <section className="noir relative overflow-hidden">
      <GoldDust tone="gold" density={11000} intensity={1} />
      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-6 py-24 md:py-36 text-center">
        <Reveal><p className="eyebrow eyebrow-gold eyebrow-bare">Open an account</p></Reveal>
        <h2 className="display-lg mt-7 max-w-3xl mx-auto" style={{ color: '#FBF7EF' }}>
          <MaskLines lines={['Three minutes to open.']} />
          <span className="foil block mt-1"><MaskLines lines={['Decades to compound.']} delay={140} /></span>
        </h2>
        <Reveal delay={420}>
          <p className="mt-8 max-w-lg mx-auto" style={{ color: 'rgba(246,241,231,.62)', fontSize: 17, lineHeight: 1.72 }}>
            No account fee, no minimum to open, and 4.65% on cash from the day it lands.
          </p>
        </Reveal>
        <Reveal delay={500}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-11">
            <button onClick={() => navigate('/register')} className="btn-gold px-9 py-4">
              Start investing <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost-light px-9 py-4">Sign in</button>
          </div>
        </Reveal>
        <Reveal delay={580}>
          <div className="flex flex-wrap items-center justify-center gap-7 mt-12 pt-9" style={{ borderTop: '1px solid var(--noir-rule)' }}>
            {[[Building2, 'Independent custody'], [Percent, 'One all-in fee'], [FileText, 'Holdings published']].map(([Icon, label]) => (
              <span key={label} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'rgba(246,241,231,.5)' }}>
                <Icon size={14} strokeWidth={1.7} style={{ color: 'var(--gold-leaf)' }} /> {label}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={640}>
          <p className="text-[11.5px] mt-9 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(246,241,231,.36)' }}>
            Investments are not deposits, are not insured, and may lose value. Target returns are
            objectives, not guarantees. Past performance does not indicate future results.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Homepage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar open={open} setOpen={setOpen} overHero />
      <main>
        <Hero />
        <Seals />
        <Shelf />
        <CinemaScroll onNavigate={navigate} />
        <Numbers />
        <HowBuilt />
        <Costs />
        <Safeguards />
        <Voices />
        <Faq />
        <Closing />
      </main>
      <Footer />
      <LandingChatbot />
    </div>
  );
}
