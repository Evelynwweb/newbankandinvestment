import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Plus, Minus, Star, Quote, ChevronDown,
  Wallet, PiggyBank, Landmark, ShieldCheck, Lock, Fingerprint,
  Building2, Scale, Clock,
} from 'lucide-react';
import { Reveal, MaskLines, CountUp, Plate, useInView } from './components/ui/motion.jsx';
import Navbar from './components/home/Navbar.jsx';
import Footer from './components/home/Footer.jsx';
import LandingChatbot from './components/home/LandingChatbot.jsx';
import GoldDust from './components/home/GoldDust.jsx';
import CinemaScroll from './components/home/CinemaScroll.jsx';
import JourneyRail from './components/home/JourneyRail.jsx';
import './index.css';

/* Unsplash — free for commercial use. Everything renders through <Plate>,
   which falls back to a warm gradient if the CDN ever fails. */
const IMG = {
  hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fm=jpg&q=78&w=2100&auto=format&fit=crop',
  desk: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  advisor: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  vault: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?fm=jpg&q=74&w=1100&auto=format&fit=crop',
  portraitA: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?fm=jpg&q=74&w=500&auto=format&fit=crop',
  portraitB: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=74&w=500&auto=format&fit=crop',
  portraitC: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=jpg&q=74&w=500&auto=format&fit=crop',
};

/* ============================================================
   Section scaffold
   ============================================================ */
function Section({ no, eyebrow, title, lede, children, className = '', id }) {
  return (
    <section id={id} className={className}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-[150px_1fr] gap-5 md:gap-12">
          <Reveal><p className="section-no md:pt-2">{no}</p></Reveal>
          <div>
            <Reveal><p className="eyebrow">{eyebrow}</p></Reveal>
            <Reveal delay={80}>
              <h2 className="display-md mt-5 max-w-2xl">{title}</h2>
            </Reveal>
            {lede && <Reveal delay={140}><p className="lede mt-6 max-w-xl">{lede}</p></Reveal>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   HERO — full-bleed cinematic plate
   ============================================================ */
const HERO_RATES = [
  ['Reserve Savings', '4.65%'],
  ['Checking', '0.75%'],
  ['Treasury Ladder', '5.10%'],
  ['30-yr Mortgage', '5.75%'],
];

function Hero() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden" style={{ background: 'var(--noir)' }}>
      {/* the plate */}
      <div className="absolute inset-0">
        {failed ? (
          <div className="w-full h-full" style={{ background: 'linear-gradient(150deg, #261D13, #100D0A 58%, #1D1811)' }} />
        ) : (
          <img
            src={IMG.hero}
            alt=""
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
            style={{ animation: 'plateDrift 26s ease-in-out infinite alternate' }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(16,13,10,.82) 0%, rgba(16,13,10,.34) 30%, rgba(16,13,10,.62) 66%, rgba(16,13,10,.96) 100%),' +
              'linear-gradient(94deg, rgba(16,13,10,.88) 0%, rgba(16,13,10,.4) 55%, rgba(16,13,10,.08) 100%)',
          }}
        />
      </div>

      <GoldDust tone="gold" density={9000} intensity={1.1} />

      {/* copy */}
      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-6 w-full pt-36 pb-12">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass text-[12px]" style={{ color: 'rgba(251,247,239,.85)', borderRadius: 999 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-leaf)' }} />
            Bank &amp; Trust &middot; serving 60+ countries since 2019
          </span>
        </Reveal>

        <h1 className="display-xl mt-8 max-w-4xl" style={{ color: '#FDFAF5' }}>
          <MaskLines lines={['Wealth is not made', 'in a hurry.']} />
          <span className="block foil mt-1">
            <MaskLines lines={['It is made on purpose.']} delay={260} />
          </span>
        </h1>

        <Reveal delay={640}>
          <p className="mt-8 max-w-xl" style={{ color: 'rgba(251,247,239,.7)', fontSize: 17.5, lineHeight: 1.72 }}>
            Insured deposits earning 4.65%, portfolios run by a committee that publishes its
            reasoning, and credit priced in the open.
          </p>
        </Reveal>

        <Reveal delay={720}>
          <div className="flex flex-wrap items-center gap-3.5 mt-10">
            <button onClick={() => navigate('/register')} className="btn-gold px-8 py-4">
              Open an account <ArrowRight size={17} />
            </button>
            <Link to="/pricing" className="btn-ghost-light px-8 py-4">See every rate</Link>
          </div>
        </Reveal>
      </div>

      {/* frosted rate bar along the foot */}
      <Reveal delay={820}>
        <div className="relative max-w-[1180px] mx-auto px-5 sm:px-6 w-full pb-10">
          <div className="glass px-6 py-5 flex flex-wrap items-center gap-x-10 gap-y-4">
            <span className="text-[10.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(251,247,239,.45)' }}>
              Today
            </span>
            {HERO_RATES.map(([label, value]) => (
              <span key={label} className="flex items-baseline gap-2.5">
                <span className="text-[12.5px]" style={{ color: 'rgba(251,247,239,.6)' }}>{label}</span>
                <span className="num text-[16px] font-semibold" style={{ color: 'var(--gold-hi)' }}>{value}</span>
              </span>
            ))}
            <span className="ml-auto hidden md:flex items-center gap-2 text-[11.5px]" style={{ color: 'rgba(251,247,239,.42)' }}>
              Scroll <ChevronDown size={14} className="animate-bounce" />
            </span>
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
    'FDIC-Insured Deposits', 'SOC 2 Type II Audited', 'ISO 27001 Certified',
    'GDPR Compliant', 'Equal Housing Lender', 'AML / KYC Compliant',
    'Independent Custody', '24/7 Fraud Monitoring',
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
   Three books
   ============================================================ */
const BOOKS = [
  {
    icon: Wallet, no: '01', title: 'Bank', img: IMG.desk,
    body: 'Checking that pays 0.75% on every dollar, instant free transfers between your own accounts, and cards you can freeze in a single tap.',
    points: ['Paid up to 2 days early', '55,000+ fee-free ATMs', 'No overdraft fee, ever'],
    to: '/banking/checking',
  },
  {
    icon: PiggyBank, no: '02', title: 'Invest', img: IMG.advisor,
    body: 'From an insured 4.65% reserve tier to equity-tilted mandates. Every holding and every fee is published before you subscribe — not after.',
    points: ['Named investment committee', 'Quarterly written reviews', 'From $100'],
    to: '/investing/managed-portfolios',
  },
  {
    icon: Landmark, no: '03', title: 'Borrow', img: IMG.vault,
    body: 'Mortgages from 5.75%, personal credit from 8.9%. The monthly payment and total interest over the full term are quoted before you sign.',
    points: ['No origination fee', 'Same-day personal funding', 'No early repayment penalty'],
    to: '/banking/loans',
  },
];

function ThreeBooks() {
  return (
    <Section
      no="I"
      eyebrow="What we do"
      title="Three financial lives, one relationship."
      lede="Most people keep spending at one bank, savings at another, and investments somewhere they never log into. Held in one place, they can finally be planned as a whole."
    >
      <div className="grid md:grid-cols-3 gap-6 mt-14">
        {BOOKS.map((b, i) => (
          <Reveal key={b.title} delay={i * 110}>
            <Link to={b.to} className="card-soft lift overflow-hidden h-full flex flex-col group">
              <Plate src={b.img} alt="" ratio="16/10" drift />
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <b.icon size={21} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                  <span className="section-no">{b.no}</span>
                </div>
                <h3 className="display-sm mt-5 text-[26px]">{b.title}</h3>
                <p className="text-[14px] leading-[1.7] mt-3 flex-1 text-[color:var(--muted)]">{b.body}</p>
                <ul className="flex flex-col gap-2.5 mt-6 pt-5 border-t border-[color:var(--rule-soft)]">
                  {b.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-2)]">
                      <Check size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
                <span className="link-rule text-[13px] mt-6 w-fit">Read more <ArrowUpRight size={14} /></span>
              </div>
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
    { target: 4.2, decimals: 1, prefix: '$', suffix: 'B', label: 'Client deposits and assets' },
    { target: 1.4, decimals: 1, suffix: 'M', label: 'Clients worldwide' },
    { target: 60, suffix: '+', label: 'Countries served' },
    { target: 98.6, decimals: 1, suffix: '%', label: 'Client satisfaction' },
  ];
  return (
    <section className="noir noir-2">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <p className="display-md foil" style={{ fontSize: 'clamp(32px, 3.4vw, 46px)' }}>
              <CountUp target={s.target} decimals={s.decimals || 0} prefix={s.prefix || ''} suffix={s.suffix} />
            </p>
            <p className="text-[12.5px] mt-3" style={{ color: 'rgba(246,241,231,.55)' }}>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Fees
   ============================================================ */
function Costs() {
  const rows = [
    ['Monthly account fee', 'None', true],
    ['Minimum balance', 'None', true],
    ['Overdraft fee', 'None', true],
    ['Domestic transfer (ACH)', 'Free', true],
    ['Between your own accounts', 'Free, instant', true],
    ['Card replacement', 'First one free', true],
    ['Same-day wire', '$15', false],
    ['International wire', '$25', false],
  ];
  return (
    <Section
      no="II"
      eyebrow="What it costs"
      title="The entire fee schedule, on one screen."
      lede="This is all of it. There is no second page, no asterisk, and nothing deducted quietly from a return before you see it."
    >
      <Reveal delay={100}>
        <div className="card-soft overflow-hidden mt-14 max-w-3xl">
          <table className="ledger">
            <tbody>
              {rows.map(([label, value, free]) => (
                <tr key={label}>
                  <td className="text-[14.5px]">{label}</td>
                  <td className="text-right">
                    <span className="num text-[14.5px] font-semibold" style={{ color: free ? 'var(--up)' : 'var(--ink)' }}>{value}</span>
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
    { icon: ShieldCheck, title: 'Insured deposits', body: 'Deposit balances are insured to the applicable statutory limit — the reserve tier included.' },
    { icon: Building2, title: 'Segregated assets', body: 'Client securities sit with an independent custodian. They are never on our balance sheet.' },
    { icon: Fingerprint, title: 'Two-factor everywhere', body: 'Every sign-in, wire and card change is confirmed on a second device before it moves.' },
    { icon: Scale, title: 'Regulated and audited', body: 'Licensed, AML/KYC compliant, SOC 2 Type II audited and ISO 27001 certified.' },
  ];
  return (
    <Section
      no="III"
      eyebrow="Safeguards"
      title="The boring parts, done properly."
      lede="A bank earns trust by being predictable. Here is exactly what stands behind the balance on your screen."
    >
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
            <path d="M100 34 L162 60 V114 c0 34-26 56-62 70 C64 170 38 148 38 114 V60 Z"
              fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.35"
              className={`ink-path ${inView ? 'in' : ''}`} style={{ '--len': 560, transitionDelay: '260ms' }} />
            <path d="M68 116 L92 142 L136 86"
              fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              className={`ink-path ${inView ? 'in' : ''}`} style={{ '--len': 140, transitionDelay: '620ms' }} />
          </svg>
        </div>
      </div>

      <Reveal delay={240}>
        <div className="flex flex-wrap gap-2.5 mt-12 pt-9 border-t border-[color:var(--rule)]">
          {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'AML / KYC', 'Equal Housing Lender', 'Independent Custody'].map((c) => (
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
    { quote: 'I moved my whole financial life over in an afternoon. What surprised me was the statement — for the first time I could see spending, savings and investments on one page.', name: 'Sarah Thompson', role: 'Everyday client · 3 years', img: IMG.portraitA },
    { quote: 'The card controls alone save me a day a month. Per-employee limits, freeze in a tap, and payroll runs from the same screen I check the balance on.', name: 'Michael Chen', role: 'Business banking · 2 years', img: IMG.portraitB },
    { quote: 'They told me the total cost of the mortgage before I signed anything. My previous bank never managed that in eleven years.', name: 'Amara Okonkwo', role: 'Mortgage client · 1 year', img: IMG.portraitC },
  ];
  return (
    <Section no="IV" eyebrow="In their words" title="What clients actually say."
      lede="Unedited, from the annual client survey. The rating below is the average across all 1.4 million accounts.">
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
  { q: 'How long does opening an account take?', a: 'About three minutes. Checking, savings and an investment account are opened together, and you can use them straight away. Identity verification is only required before your first withdrawal.' },
  { q: 'Is my money actually safe?', a: 'Deposit balances are insured to the applicable statutory limit, client securities are held by an independent custodian rather than on our balance sheet, and every payment leaving the bank is screened in real time. Investment products are separate: they are not deposits, are not insured, and may lose value.' },
  { q: 'What is the catch with 4.65%?', a: 'There is not one, but there is a caveat worth stating plainly: it is a variable rate, so it can move. There is no lock-up, no minimum, and no teaser period that quietly expires after six months.' },
  { q: 'How fast are transfers?', a: 'Between your own Aurivest accounts, instantly and free, any hour of any day. Domestic ACH is free and settles in one to two business days. Same-day wires are $15 if sent before the cut-off.' },
  { q: 'Can I take my money out whenever I want?', a: 'Yes, with no exit fee. Flexible products pay out immediately. Fixed-term mandates pay at maturity, or sooner at the current value of the underlying holdings if you need them early.' },
  { q: 'Who decides what the portfolios hold?', a: 'A named investment committee that publishes its allocation and its reasoning every quarter. You can read the current holdings and the all-in fee before you subscribe to anything.' },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section no="V" eyebrow="Questions" title="The things people ask before they move.">
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
        <Reveal>
          <p className="eyebrow eyebrow-gold eyebrow-bare">Open an account</p>
        </Reveal>
        <h2 className="display-lg mt-7 max-w-3xl mx-auto" style={{ color: '#FBF7EF' }}>
          <MaskLines lines={['Three minutes now.']} />
          <span className="foil block mt-1"><MaskLines lines={['Compounding from tomorrow.']} delay={140} /></span>
        </h2>
        <Reveal delay={420}>
          <p className="mt-8 max-w-lg mx-auto" style={{ color: 'rgba(246,241,231,.62)', fontSize: 17, lineHeight: 1.72 }}>
            No monthly fee, no minimum balance, and 4.65% on your reserve from the day the money lands.
          </p>
        </Reveal>
        <Reveal delay={500}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-11">
            <button onClick={() => navigate('/register')} className="btn-gold px-9 py-4">
              Open an account <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost-light px-9 py-4">Sign in</button>
          </div>
        </Reveal>
        <Reveal delay={580}>
          <div className="flex flex-wrap items-center justify-center gap-7 mt-12 pt-9" style={{ borderTop: '1px solid var(--noir-rule)' }}>
            {[[Lock, 'Bank-grade encryption'], [ShieldCheck, 'Insured deposits'], [Clock, '24/7 human support']].map(([Icon, label]) => (
              <span key={label} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'rgba(246,241,231,.5)' }}>
                <Icon size={14} strokeWidth={1.7} style={{ color: 'var(--gold-leaf)' }} /> {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function Homepage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar open={open} setOpen={setOpen} overHero />
      <main>
        <Hero />
        <Seals />
        <ThreeBooks />
        <CinemaScroll onNavigate={navigate} />
        <Numbers />
        <JourneyRail />
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
