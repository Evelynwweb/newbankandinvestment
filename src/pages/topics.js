import {
  Wallet, PiggyBank, CreditCard, Send, Home, Coins, Briefcase, Gem,
  LineChart, ShieldCheck, Target, Scale, Baby, Compass,
  Zap, Percent, Lock, Clock, Globe, BadgeCheck, Users, Calculator,
  TrendingUp, FileText, Landmark, HeartHandshake, GraduationCap, Building2,
} from 'lucide-react';

/* ============================================================
   Content for the Banking and Investing topic pages. Each entry
   drives one page through pages/TopicPage.jsx: hero copy plus a
   four-card "what you get" grid.
   ============================================================ */

export const BANKING_TOPICS = {
  checking: {
    label: 'Checking Accounts',
    icon: Wallet,
    tagline: 'An everyday account that pays you instead of charging you.',
    description:
      'Everyday Checking earns 0.75% APY on every dollar with no monthly fee, no minimum balance and no overdraft fee. Direct deposits land up to two days early, and you get fee-free access to more than 55,000 ATMs. It is the account your salary, bills and card spending run through — and it still earns while it sits there.',
    points: [
      { icon: Percent, title: '0.75% APY', body: 'Interest on your everyday balance, credited monthly, with no minimum to qualify.' },
      { icon: Zap, title: 'Paid up to 2 days early', body: 'We release direct deposits the moment the payer files them, not when they settle.' },
      { icon: Globe, title: '55,000+ free ATMs', body: 'Fee-free cash withdrawals across the network, and reimbursed fees abroad.' },
      { icon: Lock, title: 'No surprise fees', body: 'No monthly fee, no minimum balance, no overdraft fee. The list of fees is short and published.' },
    ],
  },
  savings: {
    label: 'Savings & CDs',
    icon: PiggyBank,
    tagline: 'High yield without locking your money away.',
    description:
      'Reserve Savings pays 4.65% APY with no lock-up — withdraw any day without penalty. If you can commit for a term, our Treasury Ladder pays 5.10% over six months, backed by a laddered portfolio of government bills rolled every four weeks. Interest is credited monthly, and deposits are insured to the applicable statutory limit.',
    points: [
      { icon: Percent, title: '4.65% APY, flexible', body: 'Among the highest insured rates available, with no notice period and no penalty.' },
      { icon: Clock, title: '5.10% on a 6-month term', body: 'A laddered treasury portfolio for cash you know you will not need this quarter.' },
      { icon: ShieldCheck, title: 'Insured deposits', body: 'Savings balances are insured to the applicable statutory limit.' },
      { icon: TrendingUp, title: 'Automatic sweeps', body: 'Set a target checking balance and we move the surplus into savings each week.' },
    ],
  },
  cards: {
    label: 'Debit & Credit Cards',
    icon: CreditCard,
    tagline: 'One physical card, unlimited virtual ones.',
    description:
      'Every account ships with a metal debit card and as many virtual cards as you want — free. Give each virtual card its own monthly limit and freeze it in a single tap. Fraud monitoring runs around the clock, and you are never liable for confirmed fraudulent transactions.',
    points: [
      { icon: Lock, title: 'Freeze in one tap', body: 'Lock any card instantly from the dashboard and unlock it the moment it turns up.' },
      { icon: Calculator, title: 'Per-card limits', body: 'Cap monthly spend per card — ideal for subscriptions, contractors and staff.' },
      { icon: ShieldCheck, title: 'Zero liability', body: 'Confirmed fraudulent card transactions are refunded, in full, every time.' },
      { icon: Globe, title: 'No foreign fees', body: 'Spend abroad at the interbank rate with no added transaction fee.' },
    ],
  },
  transfers: {
    label: 'Transfers & Payments',
    icon: Send,
    tagline: 'Money moves at the speed it should, priced in the open.',
    description:
      'Transfers between your own Aurivest accounts settle instantly and free, at any hour. Domestic ACH is free and lands in one to two business days; same-day wires are $15. International wires quote the full cost up front — including the rate we use — so nothing is skimmed quietly on the way out.',
    points: [
      { icon: Zap, title: 'Instant internal transfers', body: 'Between your own accounts, free, including weekends and holidays.' },
      { icon: Send, title: 'Free ACH', body: 'Send to any US bank account at no charge, settling in one to two business days.' },
      { icon: Globe, title: 'Honest FX', body: 'International wires show the exact rate and fee before you confirm. No hidden spread.' },
      { icon: Clock, title: 'Scheduled payments', body: 'Set recurring transfers for rent, tuition or savings and forget about them.' },
    ],
  },
  mortgages: {
    label: 'Mortgages',
    icon: Home,
    tagline: 'A home loan without the origination fee.',
    description:
      'Thirty-year fixed mortgages from 5.75% APR, with no lender origination fee for Aurivest clients. You get a named underwriter from application to close, a rate lock that holds for 60 days, and a full cost breakdown before anything is signed. Pre-approval usually takes two business days.',
    points: [
      { icon: Percent, title: 'From 5.75% APR', body: '30-year fixed, with 15-year and adjustable options priced alongside it.' },
      { icon: BadgeCheck, title: 'No origination fee', body: 'Waived for clients holding an Aurivest deposit account.' },
      { icon: Users, title: 'A named underwriter', body: 'One person owns your file from application through to closing.' },
      { icon: Clock, title: '60-day rate lock', body: 'Lock at pre-approval so a moving market does not move your payment.' },
    ],
  },
  loans: {
    label: 'Loans & Credit',
    icon: Coins,
    tagline: 'Borrow at a rate you can see, on terms you chose.',
    description:
      'Personal loans from 8.9% APR with no collateral and same-day funding once approved. Auto loans from 6.4% on new and used vehicles up to seven years old. Every quote shows the monthly payment and total interest over the full term before you sign — and there is never a penalty for paying early.',
    points: [
      { icon: Percent, title: 'Fixed rates', body: 'Your rate is set at signing and does not move for the life of the loan.' },
      { icon: Zap, title: 'Same-day funding', body: 'Approved personal loans are usually in your account the same business day.' },
      { icon: Calculator, title: 'Total cost up front', body: 'Monthly payment and total interest shown before you commit. No teaser pricing.' },
      { icon: BadgeCheck, title: 'No early repayment fee', body: 'Clear the balance whenever you like and stop paying interest that day.' },
    ],
  },
  business: {
    label: 'Business Banking',
    icon: Briefcase,
    tagline: 'Operating accounts, payroll and credit that keeps pace.',
    description:
      'Business banking covers operating and reserve accounts, payroll runs, corporate cards with per-employee limits, and a revolving credit line from 9.75% APR that draws and repays with your cash cycle. Balances above $250,000 come with a dedicated relationship manager.',
    points: [
      { icon: Building2, title: 'Operating accounts', body: 'Multi-user access with role-based permissions and a full audit trail.' },
      { icon: Users, title: 'Payroll built in', body: 'Run payroll from the same dashboard, with tax withholding handled.' },
      { icon: CreditCard, title: 'Corporate cards', body: 'Issue cards per employee, each with its own limit and merchant controls.' },
      { icon: Coins, title: 'Revolving credit', body: 'A line from 9.75% APR that you draw and repay as the cash cycle demands.' },
    ],
  },
  'private-banking': {
    label: 'Private Banking',
    icon: Gem,
    tagline: 'A banker who knows your name and your plan.',
    description:
      'Private Banking starts at $250,000 in combined balances. You get a named banker, preferential deposit and lending rates, bespoke credit against your portfolio, and coordination between your banking, investment and estate arrangements — so the parts of your financial life stop working against each other.',
    points: [
      { icon: Users, title: 'A named banker', body: 'One person who knows your circumstances, reachable directly, not through a queue.' },
      { icon: Percent, title: 'Preferential pricing', body: 'Better deposit rates and lower lending margins across every product.' },
      { icon: Landmark, title: 'Lending against assets', body: 'Borrow against your portfolio without selling and triggering a tax event.' },
      { icon: HeartHandshake, title: 'Joined-up advice', body: 'Banking, investment and estate teams working from the same plan.' },
    ],
  },
};

export const INVESTING_TOPICS = {
  'managed-portfolios': {
    label: 'Managed Portfolios',
    icon: LineChart,
    tagline: 'Professionally run mandates, priced in the open.',
    description:
      'Choose a mandate that matches your horizon: Balanced targets 7.8% from a 60/40 blend of global equity and investment-grade credit; Growth targets 11.2% with an equity tilt for long-horizon capital. Each is rebalanced quarterly by our investment committee, and you can see every holding and every fee before you subscribe.',
    points: [
      { icon: Scale, title: 'Balanced, 7.8% target', body: '60/40 global equity and investment-grade credit, rebalanced every quarter.' },
      { icon: TrendingUp, title: 'Growth, 11.2% target', body: 'Equity-tilted for capital you will not need for at least two years.' },
      { icon: FileText, title: 'Every holding disclosed', body: 'The full position list and the single all-in advisory fee, before you commit.' },
      { icon: Users, title: 'A real committee', body: 'Allocations set by people who publish their reasoning each quarter.' },
    ],
  },
  'bonds-treasuries': {
    label: 'Bonds & Treasuries',
    icon: ShieldCheck,
    tagline: 'Predictable income, backed by the safest paper there is.',
    description:
      'The Treasury Ladder holds government bills across staggered maturities, rolling a tranche every four weeks so cash keeps coming due. It targets 5.10% over six months at very low risk. For longer horizons, our investment-grade credit sleeve extends duration for additional yield.',
    points: [
      { icon: Clock, title: 'Laddered maturities', body: 'A tranche matures every four weeks, so liquidity is never far away.' },
      { icon: Percent, title: '5.10% target', body: 'Fixed at the moment you subscribe, not a rate that drifts underneath you.' },
      { icon: ShieldCheck, title: 'Government-backed', body: 'The ladder holds sovereign bills — the lowest credit risk available.' },
      { icon: Calculator, title: 'Income you can plan', body: 'Payment dates and amounts are known in advance, not estimated.' },
    ],
  },
  'funds-etfs': {
    label: 'Mutual Funds & ETFs',
    icon: Coins,
    tagline: 'Broad exposure without picking single names.',
    description:
      'Access a curated shelf of index funds and ETFs spanning global equity, fixed income, real assets and sector sleeves. Fractional purchases mean any amount can be fully invested, dividends reinvest automatically, and the expense ratio of every fund on the shelf is shown next to it.',
    points: [
      { icon: Globe, title: 'Global coverage', body: 'Developed and emerging equity, sovereign and corporate credit, real assets.' },
      { icon: Calculator, title: 'Fractional shares', body: 'Every dollar gets invested — no cash left idle waiting for a round lot.' },
      { icon: TrendingUp, title: 'Automatic reinvestment', body: 'Dividends and distributions go straight back to work, free of charge.' },
      { icon: FileText, title: 'Fees shown plainly', body: 'The expense ratio sits next to every fund on the shelf. No digging.' },
    ],
  },
  retirement: {
    label: 'Retirement & IRAs',
    icon: Target,
    tagline: 'Build the income you will live on later.',
    description:
      'Open a Traditional or Roth IRA, or roll over a plan from a previous employer — we handle the paperwork with the outgoing provider. Contributions can be automated monthly, allocation shifts toward capital preservation as your target date approaches, and a planner will map your projected retirement income at no charge.',
    points: [
      { icon: Target, title: 'Traditional & Roth', body: 'Both structures available, with guidance on which fits your tax picture.' },
      { icon: Send, title: 'Rollovers handled', body: 'We chase the outgoing provider so an old plan does not sit forgotten.' },
      { icon: Clock, title: 'Glide-path allocation', body: 'Risk steps down automatically as your target retirement date approaches.' },
      { icon: Calculator, title: 'Free income projection', body: 'See the monthly income your current path produces, and what changes it.' },
    ],
  },
  'wealth-management': {
    label: 'Wealth Management',
    icon: Gem,
    tagline: 'A bespoke mandate and an advisor who owns it.',
    description:
      'Private Wealth starts at $50,000 under management. You get a named advisor, a multi-asset mandate built around your circumstances rather than a model portfolio, and coordination with your banking, tax and estate arrangements. Reviews are quarterly, in person or by call, with the reasoning written down.',
    points: [
      { icon: Users, title: 'A named advisor', body: 'The same person every quarter, who knows what changed since last time.' },
      { icon: Scale, title: 'Built, not selected', body: 'A mandate shaped to your goals, liquidity needs and tax position.' },
      { icon: FileText, title: 'Written reasoning', body: 'Every allocation change comes with the thinking behind it, in plain English.' },
      { icon: HeartHandshake, title: 'Joined to your banking', body: 'Lending, liquidity and investing planned together, not in separate silos.' },
    ],
  },
  'estate-planning': {
    label: 'Estate Planning',
    icon: Scale,
    tagline: 'Make sure it goes where you intend.',
    description:
      'Estate planning covers wills, trust structuring, beneficiary alignment across every account, and the tax consequences of each choice. We work alongside your solicitor or introduce one, and we keep the plan current as circumstances change — because an estate plan written once and never revisited usually fails at the moment it matters.',
    points: [
      { icon: FileText, title: 'Wills & trusts', body: 'Structures chosen for your family situation, not a template.' },
      { icon: BadgeCheck, title: 'Beneficiaries aligned', body: 'Account designations checked against the will so they do not contradict.' },
      { icon: Calculator, title: 'Tax consequences mapped', body: 'What each structure costs your estate, quantified before you decide.' },
      { icon: Clock, title: 'Kept current', body: 'Reviewed as marriages, births and moves change what the plan should say.' },
    ],
  },
  'education-savings': {
    label: 'Education Savings',
    icon: Baby,
    tagline: 'Start early, and let time do the heavy lifting.',
    description:
      'Tax-advantaged education accounts with an allocation that de-risks as the first tuition bill approaches. Set a target school year and a monthly contribution, and the projection updates with actual returns so you always know whether you are on track — and by how much you are not.',
    points: [
      { icon: GraduationCap, title: 'Tax-advantaged', body: 'Growth and qualified withdrawals treated favourably under the relevant scheme.' },
      { icon: Clock, title: 'Age-based glide path', body: 'Risk steps down automatically as the first tuition payment gets closer.' },
      { icon: Calculator, title: 'Honest projections', body: 'Updated with real returns, so the shortfall is visible while it is still fixable.' },
      { icon: Users, title: 'Family can contribute', body: 'Grandparents and relatives can pay in directly, with a shareable link.' },
    ],
  },
  'financial-planning': {
    label: 'Financial Planning',
    icon: Compass,
    tagline: 'A plan for the whole picture, not one product.',
    description:
      'Planning starts with everything: income, spending, debt, insurance, property, investments and what you actually want the money to do. You get a written plan with specific actions and dates, a review each quarter, and honest answers when the plan says the goal needs to move rather than the portfolio.',
    points: [
      { icon: Compass, title: 'The whole picture', body: 'Cash flow, debt, insurance and investments assessed together, not separately.' },
      { icon: FileText, title: 'A written plan', body: 'Specific actions with dates attached — not a slide deck of principles.' },
      { icon: Clock, title: 'Quarterly reviews', body: 'What worked, what did not, and what changes as a result.' },
      { icon: HeartHandshake, title: 'Straight answers', body: 'Including when the honest answer is to spend less or move the target.' },
    ],
  },
};
