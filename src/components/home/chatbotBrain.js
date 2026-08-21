/* ============================================================
   Aura — the landing assistant's brain. No network, no model:
   a keyword-scored lookup over hand-written answers, so the
   marketing site can answer the common questions instantly.

   Each entry: keywords to match on, the answer, and an optional
   in-app link the reply renders as a follow-up button.
   ============================================================ */

export const BOT_NAME = 'Aura';

const KB = [
  {
    keys: ['open', 'account', 'sign up', 'signup', 'register', 'get started', 'start', 'join'],
    answer: 'Opening an account takes about three minutes — name, email, a password, and you\'re in. You can explore everything straight away; identity verification is only needed before your first withdrawal.',
    link: { label: 'Open an account', to: '/register' },
  },
  {
    keys: ['checking', 'current account', 'everyday', 'debit'],
    answer: 'Everyday Checking earns 0.75% APY with no monthly fee, no minimum balance, and fee-free withdrawals at over 55,000 ATMs. Your debit card ships within five business days.',
    link: { label: 'See checking accounts', to: '/banking/checking' },
  },
  {
    keys: ['savings', 'apy', 'interest rate', 'cd', 'certificate', 'yield'],
    answer: 'Reserve Savings pays 4.65% APY with no lock-up — withdraw any day, no penalty. If you can commit for a term, the 6-month Treasury Ladder pays 5.10%. Interest is credited monthly.',
    link: { label: 'Savings & CDs', to: '/banking/savings' },
  },
  {
    keys: ['invest', 'portfolio', 'fund', 'etf', 'managed', 'return'],
    answer: 'Managed portfolios run from a 60/40 Balanced mandate targeting 7.8% to a Growth mandate targeting 11.2%. Each one is rebalanced by our investment committee, and you can see every holding and every fee before you commit.',
    link: { label: 'Managed portfolios', to: '/investing/managed-portfolios' },
  },
  {
    keys: ['retirement', 'ira', 'pension', '401'],
    answer: 'We offer Traditional and Roth IRAs plus rollovers from an old employer plan. Contributions can be automated monthly, and a planner will map your target retirement income at no charge.',
    link: { label: 'Retirement & IRAs', to: '/investing/retirement' },
  },
  {
    keys: ['loan', 'borrow', 'credit', 'mortgage', 'apr', 'finance'],
    answer: 'Personal loans start at 8.9% APR, auto loans at 6.4%, and 30-year fixed mortgages at 5.75% with no lender origination fee for Betament clients. Decisions on personal loans usually land the same day.',
    link: { label: 'Loans & credit', to: '/banking/loans' },
  },
  {
    keys: ['card', 'credit card', 'virtual', 'freeze', 'limit'],
    answer: 'Every account comes with a physical card and unlimited virtual cards you can create, limit and freeze instantly from the dashboard. Freezing a card is a single tap and reversible any time.',
    link: { label: 'Cards', to: '/banking/cards' },
  },
  {
    keys: ['transfer', 'send money', 'wire', 'ach', 'payment', 'pay'],
    answer: 'Transfers between your own Betament accounts settle instantly and free. Domestic ACH is free and lands in 1–2 business days; same-day wires are $15. International wires quote the full cost up front — no hidden spread.',
    link: { label: 'Transfers & payments', to: '/banking/transfers' },
  },
  {
    keys: ['deposit', 'fund', 'add money', 'top up'],
    answer: 'Fund your account by linked bank transfer, wire, direct deposit or a mobile check photo. Direct deposits post up to two days early, and there is no fee on incoming transfers.',
    link: { label: 'Open an account', to: '/register' },
  },
  {
    keys: ['withdraw', 'take out', 'cash out', 'atm'],
    answer: 'Withdraw to any linked bank account, or use over 55,000 fee-free ATMs. Withdrawals require approved identity verification, which usually completes within 24 hours of submitting your documents.',
  },
  {
    keys: ['safe', 'security', 'secure', 'insured', 'fdic', 'protect', 'fraud'],
    answer: 'Deposits are insured to the applicable statutory limit. Every login and payment is protected by two-factor authentication, and our fraud desk monitors accounts around the clock. Investment products are separate — they are not deposits and can lose value.',
    link: { label: 'Security Center', to: '/resources/security-center' },
  },
  {
    keys: ['fee', 'cost', 'charge', 'price', 'pricing', 'plan'],
    answer: 'No monthly fee, no minimum balance, no overdraft fee on checking. Managed portfolios charge a single all-in advisory rate that is shown before you subscribe — nothing is taken from returns quietly.',
    link: { label: 'Plans & rates', to: '/pricing' },
  },
  {
    keys: ['kyc', 'verify', 'verification', 'identity', 'document', 'passport'],
    answer: 'Verification asks for a government-issued ID and your address. Most submissions are reviewed within 24 hours, and you will get an email the moment it clears.',
  },
  {
    keys: ['business', 'company', 'llc', 'payroll'],
    answer: 'Business banking covers operating accounts, payroll runs, corporate cards with per-employee limits, and a revolving credit line from 9.75% APR. A dedicated relationship manager comes with balances above $250,000.',
    link: { label: 'Business banking', to: '/banking/business' },
  },
  {
    keys: ['wealth', 'private', 'advisor', 'estate', 'trust'],
    answer: 'Private Wealth clients get a named advisor, a bespoke multi-asset mandate, and estate and trust structuring handled alongside the investment plan. It starts at $50,000 under management.',
    link: { label: 'Wealth management', to: '/investing/wealth-management' },
  },
  {
    keys: ['support', 'contact', 'help', 'human', 'phone', 'email'],
    answer: 'Real people, 24/7 — live chat from the dashboard, or support@betamentmgt.com. Complex cases get a named specialist who stays with your ticket until it closes.',
    link: { label: 'Help Center', to: '/resources/help-center' },
  },
  {
    keys: ['country', 'available', 'where', 'international', 'global'],
    answer: 'Betament serves clients in 60+ countries. Product availability varies by jurisdiction — the account opening flow shows exactly what is available where you live.',
  },
];

const FALLBACK = {
  answer: 'I don\'t have a canned answer for that one, but our team does — they\'re available 24/7 and reply fast. In the meantime, the Help Center covers accounts, transfers, investing and verification.',
  link: { label: 'Help Center', to: '/resources/help-center' },
};

export const SUGGESTIONS = [
  'What is the savings APY?',
  'How do I open an account?',
  'What do managed portfolios return?',
  'Are my deposits insured?',
  'What fees do you charge?',
  'How fast are transfers?',
  'Can I get a mortgage?',
  'How does verification work?',
  'Do you offer IRAs?',
];

/* Score each entry by how many of its keywords appear in the question;
   longer keyword matches count for more so "credit card" beats "credit". */
export function getReply(question) {
  const q = question.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const key of entry.keys) {
      if (q.includes(key)) score += key.length;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best && bestScore >= 3 ? best : FALLBACK;
}
