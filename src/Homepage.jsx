import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Minus, Plus,
  Wallet, PiggyBank, Landmark, ShieldCheck, Users, FileText,
} from 'lucide-react';
import { Reveal, CountUp } from './components/ui/motion.jsx';
import Navbar from './components/home/Navbar.jsx';
import Footer from './components/home/Footer.jsx';
import LandingChatbot from './components/home/LandingChatbot.jsx';
import './index.css';

/* ============================================================
   Landing page — an editorial prospectus, not a showreel.

   Rules this page follows:
     · one column of argument, read top to bottom
     · every claim carries its number next to it
     · no carousel, no parallax, no 3D, nothing auto-playing
     · motion is a single fade-and-rise, once per block
   ============================================================ */

function Section({ no, eyebrow, title, lede, children, id }) {
  return (
    <section id={id} className="border-t border-[color:var(--rule)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-16 md:py-24">
        <Reveal>
          <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-10">
            <div>
              {no && <p className="section-no">{no}</p>}
              {eyebrow && <p className="eyebrow mt-2 md:mt-3">{eyebrow}</p>}
            </div>
            <div>
              <h2 className="font-display text-[30px] sm:text-[40px] leading-[1.12] font-semibold max-w-2xl">
                {title}
              </h2>
              {lede && (
                <p className="mt-5 text-[16px] leading-[1.65] max-w-xl text-[color:var(--muted)]">{lede}</p>
              )}
            </div>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/* ---------- hero ---------- */
function Hero() {
  const navigate = useNavigate();
  const rates = [
    ['Reserve Savings', 'Flexible, insured', '4.65%', 'Insured'],
    ['Everyday Checking', 'On every balance', '0.75%', 'Insured'],
    ['Treasury Ladder', '6-month term', '5.10%', 'Insured'],
    ['Balanced Portfolio', '12-month target', '7.80%', 'At risk'],
    ['Growth Portfolio', '24-month target', '11.20%', 'At risk'],
    ['Home Mortgage', '30-year fixed', '5.75%', 'APR'],
  ];
  return (
    <section className="paper-grain border-b border-[color:var(--rule)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 pt-16 md:pt-24 pb-14 md:pb-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <Reveal><p className="eyebrow">Bank &amp; Trust &middot; Est. 2019</p></Reveal>

            <Reveal delay={60}>
              <h1 className="font-display text-[42px] sm:text-[60px] lg:text-[68px] leading-[1.04] font-semibold tracking-tight mt-6">
                Your money, kept<br className="hidden sm:block" /> where it can{' '}
                <span className="underline-amber">actually work</span>.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 text-[17px] leading-[1.65] max-w-lg text-[color:var(--muted)]">
                Insured deposit accounts earning 4.65%, managed portfolios run by a named
                committee, and credit priced in the open. One account for the money you spend
                and the money you are growing.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="flex flex-wrap items-center gap-3 mt-9">
                <button onClick={() => navigate('/register')} className="btn-solid px-7 py-3.5 text-[14.5px]">
                  Open an account <ArrowRight size={16} />
                </button>
                <Link to="/pricing" className="btn-outline px-7 py-3.5 text-[14.5px]">See every rate</Link>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <p className="mt-7 text-[13px] text-[color:var(--muted-2)]">
                No monthly fee &middot; No minimum balance &middot; No overdraft fee
              </p>
            </Reveal>
          </div>

          {/* The rate card — a printed table, not a floating widget. */}
          <Reveal delay={140}>
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-[color:var(--rule)] flex items-baseline justify-between">
                <p className="font-display text-[17px] font-semibold">Published rates</p>
                <p className="num text-[11px] text-[color:var(--muted-2)]">EFFECTIVE TODAY</p>
              </div>
              <table className="ledger">
                <tbody>
                  {rates.map(([name, note, rate, kind]) => (
                    <tr key={name}>
                      <td>
                        <p className="text-[14px]">{name}</p>
                        <p className="text-[12px] text-[color:var(--muted-2)]">{note}</p>
                      </td>
                      <td className="text-right">
                        <p className="num text-[16px] font-semibold text-[color:var(--accent)]">{rate}</p>
                        <p className="text-[10.5px] text-[color:var(--muted-2)]">{kind}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-[color:var(--rule)] bg-[color:var(--surface-2)]">
                <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
                  Deposit rates are variable. Portfolio figures are targets, not guarantees —
                  those products are not insured and may lose value.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- the three books ---------- */
const BOOKS = [
  {
    icon: Wallet, no: '01', title: 'Bank',
    body: 'Checking that pays 0.75%, instant free transfers between your own accounts, and cards you can freeze in one tap.',
    points: ['Paid up to 2 days early', '55,000+ fee-free ATMs', 'No overdraft fee'],
    to: '/banking/checking',
  },
  {
    icon: PiggyBank, no: '02', title: 'Invest',
    body: 'From an insured 4.65% savings tier to equity-tilted mandates. Every holding and every fee is published before you subscribe.',
    points: ['Named investment committee', 'Quarterly written reviews', 'From $100'],
    to: '/investing/managed-portfolios',
  },
  {
    icon: Landmark, no: '03', title: 'Borrow',
    body: 'Mortgages from 5.75%, personal credit from 8.9%. The monthly payment and total interest are quoted before you sign.',
    points: ['No origination fee', 'Same-day personal funding', 'No early repayment penalty'],
    to: '/banking/loans',
  },
];

function ThreeBooks() {
  return (
    <Section
      no="I"
      eyebrow="What we do"
      title="Three financial lives, one account."
      lede="Most people keep spending at one bank, savings at another, and investments somewhere they never log into. Held together, they can finally be planned."
    >
      <div className="grid md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] rounded-md overflow-hidden mt-12">
        {BOOKS.map((b) => (
          <div key={b.title} className="bg-[color:var(--surface)] p-7 flex flex-col">
            <div className="flex items-center justify-between">
              <b.icon size={20} className="text-[color:var(--accent)]" strokeWidth={1.6} />
              <span className="section-no">{b.no}</span>
            </div>
            <h3 className="font-display text-[26px] font-semibold mt-6">{b.title}</h3>
            <p className="text-[14px] leading-relaxed mt-3 flex-1 text-[color:var(--muted)]">{b.body}</p>
            <ul className="flex flex-col gap-2 mt-6 pt-5 border-t border-[color:var(--rule-soft)]">
              {b.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-2)]">
                  <Check size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" /> {p}
                </li>
              ))}
            </ul>
            <Link to={b.to} className="link-rule text-[13px] mt-6 w-fit">
              Read more <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- the numbers ---------- */
function Numbers() {
  const stats = [
    { target: 4.2, decimals: 1, prefix: '$', suffix: 'B', label: 'Client deposits and assets' },
    { target: 1.4, decimals: 1, suffix: 'M', label: 'Clients worldwide' },
    { target: 60, suffix: '+', label: 'Countries served' },
    { target: 98.6, decimals: 1, suffix: '%', label: 'Client satisfaction' },
  ];
  return (
    <section className="border-t border-[color:var(--rule)] bg-[color:var(--paper-2)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <p className="font-display text-[34px] sm:text-[40px] font-semibold leading-none">
                <CountUp target={s.target} decimals={s.decimals || 0} prefix={s.prefix || ''} suffix={s.suffix} />
              </p>
              <p className="text-[12.5px] mt-2 text-[color:var(--muted)]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- how it works ---------- */
const STEPS = [
  { no: '01', title: 'Open the account', body: 'Three minutes, no paperwork. Checking, savings and an investment account are opened together.' },
  { no: '02', title: 'Fund it, free', body: 'Bank transfer, wire, direct deposit or a mobile check photo. Incoming money is never charged for.' },
  { no: '03', title: 'Put the surplus to work', body: 'Idle cash earns 4.65% the day it lands. Commit for longer and the mandates pay more.' },
  { no: '04', title: 'Watch it, plainly', body: 'One statement covering spending, saving, investing and credit — with the reasoning written down.' },
];

function HowItWorks() {
  return (
    <Section no="II" eyebrow="How it works" title="Four steps, then it runs itself.">
      <div className="mt-12 border-t border-[color:var(--rule)]">
        {STEPS.map((s, i) => (
          <Reveal key={s.no} delay={i * 60}>
            <div className="grid md:grid-cols-[180px_1fr] gap-4 md:gap-10 py-7 border-b border-[color:var(--rule)]">
              <span className="section-no">{s.no}</span>
              <div className="grid md:grid-cols-[280px_1fr] gap-3 md:gap-10">
                <h3 className="font-display text-[20px] font-semibold">{s.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-[color:var(--muted)]">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- what it costs ---------- */
function Costs() {
  const rows = [
    ['Monthly account fee', 'None', true],
    ['Minimum balance', 'None', true],
    ['Overdraft fee', 'None', true],
    ['Domestic transfer (ACH)', 'Free', true],
    ['Transfer between your accounts', 'Free, instant', true],
    ['Same-day wire', '$15', false],
    ['International wire', '$25', false],
    ['Card replacement', 'First one free', false],
  ];
  return (
    <Section
      no="III"
      eyebrow="What it costs"
      title="The whole fee schedule fits on one screen."
      lede="This is all of it. There is no second page, and nothing is deducted quietly from a return."
    >
      <Reveal delay={80}>
        <div className="card overflow-hidden mt-12 max-w-3xl">
          <table className="ledger">
            <tbody>
              {rows.map(([label, value, free]) => (
                <tr key={label}>
                  <td className="text-[14px]">{label}</td>
                  <td className="text-right">
                    <span className={`num text-[14px] font-semibold ${free ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>
                      {value}
                    </span>
                  </td>
                  <td className="w-8 text-right">
                    {free
                      ? <Minus size={14} className="text-[color:var(--up)] inline" />
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

/* ---------- safeguards ---------- */
function Safeguards() {
  const items = [
    { icon: ShieldCheck, title: 'Insured deposits', body: 'Deposit balances are insured to the applicable statutory limit.' },
    { icon: FileText, title: 'Segregated assets', body: 'Client securities sit with an independent custodian, never on our balance sheet.' },
    { icon: Users, title: 'Named accountability', body: 'Every mandate has a committee that publishes its reasoning each quarter.' },
    { icon: Landmark, title: 'Regulated and audited', body: 'Licensed, AML/KYC compliant, SOC 2 Type II audited, ISO 27001 certified.' },
  ];
  return (
    <Section
      no="IV"
      eyebrow="Safeguards"
      title="The boring parts, done properly."
      lede="A bank earns trust by being predictable. Here is what stands behind the balance on your screen."
    >
      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 mt-12 max-w-4xl">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 70}>
            <div className="flex items-start gap-4 pb-7 border-b border-[color:var(--rule-soft)]">
              <it.icon size={19} className="text-[color:var(--accent)] shrink-0 mt-1" strokeWidth={1.6} />
              <div>
                <h3 className="font-display text-[17px] font-semibold">{it.title}</h3>
                <p className="text-[13.5px] leading-relaxed mt-1.5 text-[color:var(--muted)]">{it.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={220}>
        <div className="flex flex-wrap gap-2 mt-9">
          {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'AML / KYC', 'Equal Housing Lender'].map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- client voices ---------- */
function InTheirWords() {
  const quotes = [
    {
      quote: 'I moved my whole financial life over in an afternoon. The part that surprised me was the statement — for the first time I could see spending, savings and investments on one page.',
      name: 'Sarah Thompson', role: 'Everyday client, 3 years',
    },
    {
      quote: 'The card controls alone save me a day a month. Per-employee limits, freeze in a tap, and payroll runs from the same screen.',
      name: 'Michael Chen', role: 'Business banking, 2 years',
    },
    {
      quote: 'They told me the total cost of the mortgage before I signed anything. My last bank never did that in eleven years.',
      name: 'Fred Rodriguez', role: 'Mortgage client, 1 year',
    },
  ];
  return (
    <Section no="V" eyebrow="In their words" title="What clients actually say.">
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {quotes.map((q, i) => (
          <Reveal key={q.name} delay={i * 80}>
            <figure className="border-t-2 border-[color:var(--accent)] pt-6">
              <blockquote className="font-display text-[18px] leading-[1.5]">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-[13px]">
                <span className="font-semibold">{q.name}</span>
                <span className="block text-[color:var(--muted-2)] mt-0.5">{q.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- closing ---------- */
function Closing() {
  const navigate = useNavigate();
  return (
    <section className="border-t border-[color:var(--rule)] bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--accent-warm)' }}>
              Open an account
            </p>
            <h2 className="font-display text-[34px] sm:text-[46px] leading-[1.1] font-semibold mt-5">
              Three minutes now, compounding from tomorrow.
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed opacity-70">
              No monthly fee, no minimum balance, and 4.65% on your reserve from the day the money lands.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-9">
              <button
                onClick={() => navigate('/register')}
                className="btn-solid px-7 py-3.5 text-[14.5px]"
                style={{ background: 'var(--accent-warm)', borderColor: 'var(--accent-warm)', color: '#23180C' }}
              >
                Open an account <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-7 py-3.5 text-[14.5px] rounded border border-white/25 hover:border-white/60 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Homepage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Navbar open={open} setOpen={setOpen} />
      <main>
        <Hero />
        <ThreeBooks />
        <Numbers />
        <HowItWorks />
        <Costs />
        <Safeguards />
        <InTheirWords />
        <Closing />
      </main>
      <Footer />
      <LandingChatbot />
    </div>
  );
}
