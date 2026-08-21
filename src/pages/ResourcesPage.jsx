import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import {
  LifeBuoy, SearchCheck, HelpCircle, MessageCircle, Mail, BookOpen,
  ShieldCheck, BadgeCheck, ChevronDown, ArrowRight, Lock, AlertTriangle, Fingerprint,
} from 'lucide-react';
import PageShell, { SectionHead } from './PageShell.jsx';
import { Reveal } from '../components/ui/motion.jsx';

/* ================= Help Center ================= */
function HelpCenter() {
  const channels = [
    { icon: MessageCircle, title: 'Live chat', body: 'Talk to a specialist in minutes — 24 hours a day, 7 days a week.', action: 'Start a chat' },
    { icon: Mail, title: 'Email support', body: 'Send us the detail and we’ll reply with a real answer, not a template.', action: 'support@betamentmgt.com' },
    { icon: BookOpen, title: 'Guides & tutorials', body: 'Step-by-step walkthroughs for every feature, from first deposit to estate planning.', action: 'Browse guides' },
  ];
  const topics = ['Opening an account', 'Deposits & withdrawals', 'Transfers & wires', 'Cards', 'Investing & mandates', 'Loans & credit', 'Identity verification', 'Account security'];
  return (
    <>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="grid sm:grid-cols-3 gap-5">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <div className="card rounded-md p-7 h-full flex flex-col">
                <c.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[17px] font-medium mt-5 text-[color:var(--ink)]">{c.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed flex-1 text-[color:var(--muted)]">{c.body}</p>
                <p className="text-[12.5px] mt-4 font-medium text-[color:var(--accent)]">{c.action}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <SectionHead eyebrow="Popular topics" title="What can we help with?" />
        <div className="flex flex-wrap gap-3 mt-8">
          {topics.map((t, i) => (
            <Reveal key={t} delay={i * 60}>
              <span className="px-4 py-2.5 rounded-full border border-[color:var(--rule)] text-[13px] text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--accent-soft)] transition-colors cursor-pointer">{t}</span>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= Security Center ================= */
function SecurityCenter() {
  const checks = [
    { icon: ShieldCheck, title: 'How we protect you', body: 'Insured deposits, segregated client assets, mandatory two-factor authentication and 24/7 transaction screening.' },
    { icon: Fingerprint, title: 'How to protect yourself', body: 'Turn on two-factor, use a password you use nowhere else, and never share a verification code with anyone — including us.' },
    { icon: AlertTriangle, title: 'Spotting a scam', body: 'We will never call and ask you to move money to a "safe account". That request is always fraud, no matter who it appears to come from.' },
  ];
  return (
    <>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="grid sm:grid-cols-3 gap-5">
          {checks.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <div className="card rounded-md p-7 h-full">
                <c.icon size={20} strokeWidth={1.6} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[16.5px] font-medium mt-5 text-[color:var(--ink)]">{c.title}</h3>
                <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--muted)]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <Reveal>
          <div className="card rounded-md p-8 md:p-10">
            <p className="text-[12px] tracking-widest uppercase text-[color:var(--accent-soft)]">Our credentials</p>
            <div className="flex flex-wrap gap-3 mt-5">
              {['Licensed Deposit Institution', 'ISO 27001 Certified', 'SOC 2 Type II Audited', 'GDPR Compliant', 'AML / KYC Compliant', 'Equal Housing Lender'].map((b) => (
                <span key={b} className="tag text-[12px] px-3.5 py-2 rounded-full text-[color:var(--ink)] flex items-center gap-1.5">
                  <BadgeCheck size={13} className="text-[color:var(--accent)]" /> {b}
                </span>
              ))}
            </div>
            <p className="text-[13px] mt-6 max-w-2xl leading-relaxed text-[color:var(--muted)]">
              If you&rsquo;ve been contacted by someone claiming to act on our behalf, or want to confirm any
              credential above, reach our verification desk through the Help Center before sharing
              any personal information. We would always rather field a false alarm than see a client lose money.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
        <SectionHead eyebrow="Never share these" title="Four things we will never ask for" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {[
            { title: 'Your password', body: 'No employee can see it and none will ever ask you to say or type it for them.' },
            { title: 'A verification code', body: 'Codes we text you are for you alone. Anyone asking for one is not from Betamint.' },
            { title: 'Remote access', body: 'We will never ask you to install screen-sharing software to "fix" an account issue.' },
            { title: 'A "safe account" transfer', body: 'There is no such thing. Any request to move your money to one is a scam.' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="card rounded-md p-6 h-full">
                <Lock size={17} className="text-[color:var(--accent)]" />
                <h3 className="font-display text-[15.5px] font-medium mt-4 leading-snug text-[color:var(--ink)]">{c.title}</h3>
                <p className="text-[12.5px] mt-2 leading-relaxed text-[color:var(--muted-2)]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= FAQs ================= */
const FAQS = [
  { q: 'How do I open an account?', a: 'Click "Open an account", fill in your details, and you’re in within minutes. No paperwork and no credit check to open — identity verification is only required before your first withdrawal.' },
  { q: 'What does it cost?', a: 'Nothing to hold. No monthly fee, no minimum balance and no overdraft fee on checking. Wires and a small number of specialist services carry a published fee; everything else is free.' },
  { q: 'Is my money safe?', a: 'Deposit balances are insured to the applicable statutory limit, client securities are held by an independent custodian, and every payment is screened in real time. Investment products are separate: they are not deposits, are not insured, and may lose value.' },
  { q: 'How fast are transfers?', a: 'Between your own Betamint accounts, instantly and free. Domestic ACH is free and lands in one to two business days. Same-day wires are $15 and clear the same day if sent before the cut-off.' },
  { q: 'What return should I expect on investments?', a: 'Reserve Savings pays a variable 4.65% APY. Market-linked mandates carry target rates from 5.10% to 14.50% depending on term and risk — targets, not guarantees. Higher targets carry a real possibility of loss.' },
  { q: 'How do I verify my identity?', a: 'Head to the verification section of your dashboard, submit a government-issued document and your address, and our compliance team reviews it. Most submissions clear within 24 hours.' },
  { q: 'Can I get a loan or mortgage?', a: 'Yes — personal loans from 8.9% APR, auto from 6.4%, and 30-year fixed mortgages from 5.75% with no lender origination fee for Betamint clients. All credit is subject to approval.' },
  { q: 'Can I close my account and take my money?', a: 'Any time, with no exit fee. Flexible products pay out immediately; fixed-term mandates pay at maturity or, if you need it sooner, at the current value of the underlying holdings.' },
];

function Faqs() {
  const [open, setOpen] = useState(0);
  return (
    <section className="max-w-4xl mx-auto px-5 sm:px-6 md:px-10 py-8 md:py-12">
      <div className="flex flex-col gap-3">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 50}>
            <div className={`card rounded-md overflow-hidden transition-colors ${open === i ? 'border-[color:var(--accent-soft)]' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-display text-[15.5px] font-medium text-[color:var(--ink)]">{f.q}</span>
                <ChevronDown size={17} className={`shrink-0 text-[color:var(--accent)] transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <div className="grid transition-all duration-300" style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-[13.5px] leading-relaxed text-[color:var(--muted)]">{f.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= page ================= */
const PAGES = {
  'help-center': {
    icon: LifeBuoy,
    title: 'Help Center',
    lede: 'Real humans, real answers — around the clock. Pick the channel that suits you.',
    body: HelpCenter,
  },
  'security-center': {
    icon: SearchCheck,
    title: 'Security Center',
    lede: 'How we protect your money, how to protect it yourself, and how to spot the people trying to take it.',
    body: SecurityCenter,
  },
  faqs: {
    icon: HelpCircle,
    title: 'Frequently Asked Questions',
    lede: 'The questions every new client asks — answered plainly.',
    body: Faqs,
  },
};

export default function ResourcesPage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const page = PAGES[topic];
  if (!page) return <Navigate to="/" replace />;
  const Body = page.body;

  return (
    <PageShell key={topic} eyebrow="Resources" title={page.title} lede={page.lede} icon={page.icon}>
      <Body />
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-12 md:py-16 text-center">
        <Reveal>
          <h2 className="font-display text-[24px] sm:text-[30px] font-medium text-[color:var(--ink)]">Still need a hand?</h2>
          <div className="flex justify-center mt-6">
            <button onClick={() => navigate('/register')} className="btn-solid text-[14px] px-8 py-3.5 flex items-center gap-2">
              Open an account <ArrowRight size={15} />
            </button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
