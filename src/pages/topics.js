import {
  Wallet, Banknote, ShieldCheck, Layers, Landmark, TrendingUp,
  CandlestickChart, PieChart, Target, Briefcase, Users, Baby,
  Scale, Coins, Building2, Bitcoin, Percent, Clock, FileText,
  Calculator, Globe, Lock, HeartHandshake, Gem,
} from 'lucide-react';

/* ============================================================
   The investment product taxonomy, as marketing pages.

   Mirrors config/constants.js PRODUCT_FAMILIES on the backend —
   six families, and the sub-products the client named. Keep the two
   in step: the Invest screen renders from the API, these pages from
   here, and a client who reads one then opens the other should see
   the same shelf.
   ============================================================ */

export const CASH_TOPICS = {
  'cash-management': {
    label: 'High-Yield Cash Management',
    icon: Wallet,
    tagline: 'Money that has to stay reachable, still earning while it waits.',
    description:
      'The settlement account everything else funds from. It pays 4.65% APY with no lock-up and no minimum, interest credited monthly, and you can move cash into any other product the same day. This is where an idle balance should sit rather than in a current account earning nothing.',
    points: [
      { icon: Percent, title: '4.65% APY', body: 'Variable, credited monthly, with no minimum balance to qualify.' },
      { icon: Clock, title: 'No lock-up', body: 'Withdraw or redeploy any business day, with no penalty or notice period.' },
      { icon: Layers, title: 'Funds everything', body: 'Every other product on the shelf is subscribed from this account.' },
      { icon: ShieldCheck, title: 'Held separately', body: 'Client cash sits with the custodian, not on our balance sheet.' },
    ],
  },
  'money-market': {
    label: 'Money Market Funds',
    icon: Banknote,
    tagline: 'A government money market fund, priced daily.',
    description:
      'For balances large enough to want a fund rather than a deposit rate. The fund holds short-dated government paper, is priced every day and settles T+1, currently yielding around 5.02%. It is a fund, not a deposit — the yield moves and the value can move with it.',
    points: [
      { icon: Percent, title: '~5.02% yield', body: 'Moves with short-term rates rather than being set by us.' },
      { icon: Clock, title: 'T+1 settlement', body: 'Redeem on any business day; cash lands the next.' },
      { icon: FileText, title: 'Daily pricing', body: 'The fund is marked every day and the holdings are published.' },
      { icon: Calculator, title: 'From $1,000', body: 'Sized for balances that have outgrown a simple cash rate.' },
    ],
  },
  'treasury': {
    label: 'Treasury-Backed Accounts',
    icon: ShieldCheck,
    tagline: 'Held directly in short-dated government bills.',
    description:
      'Your balance is held in three-month government bills, rolled automatically at maturity, currently around 5.18%. It is the lowest credit risk available anywhere in the market — the trade is that your money is committed for the length of the bill.',
    points: [
      { icon: ShieldCheck, title: 'Sovereign credit', body: 'Backed directly by government bills, not by a bank promise.' },
      { icon: Percent, title: '~5.18%', body: 'Fixed at the moment each bill is bought, not drifting underneath you.' },
      { icon: Clock, title: 'Rolled at maturity', body: 'Positions roll automatically unless you tell us to stop.' },
      { icon: Lock, title: '3-month term', body: 'Committed for the life of the bill. Plan the liquidity accordingly.' },
    ],
  },
};

export const FIXED_INCOME_TOPICS = {
  'bond-ladders': {
    label: 'Bond Ladders',
    icon: Layers,
    tagline: 'Staggered maturities, so a rung always comes due.',
    description:
      'Rather than one bond with one maturity, a ladder holds several with maturities spread across the term. A rung comes due every quarter, which you can spend or roll out to the far end. It smooths reinvestment risk and gives income you can actually schedule around.',
    points: [
      { icon: Clock, title: 'A rung every quarter', body: 'Maturities are staggered so liquidity is never far away.' },
      { icon: Percent, title: '~5.45% target', body: 'Blended across the rungs and fixed as each one is bought.' },
      { icon: Calculator, title: 'Income you can plan', body: 'Payment dates and amounts are known in advance.' },
      { icon: TrendingUp, title: 'Rolls automatically', body: 'Matured rungs are reinvested at the long end by default.' },
    ],
  },
  'municipal-bonds': {
    label: 'Municipal Bonds',
    icon: Landmark,
    tagline: 'Investment-grade municipal issues, generally tax-advantaged.',
    description:
      'Debt issued by states, cities and public authorities. Interest is often exempt from federal tax and sometimes from state tax too, which can make a 4.28% municipal yield worth considerably more than the same number on a taxable bond. Your actual treatment depends on where you live.',
    points: [
      { icon: Percent, title: '~4.28% target', body: 'Before any tax advantage, which is where the real value sits.' },
      { icon: Scale, title: 'Often tax-exempt', body: 'Frequently exempt from federal tax; confirm your own position.' },
      { icon: ShieldCheck, title: 'Investment grade only', body: 'We do not buy speculative municipal credit for client accounts.' },
      { icon: Building2, title: 'Public infrastructure', body: 'Your capital funds schools, transit and utilities.' },
    ],
  },
  'preferred-stock': {
    label: 'Preferred Stock',
    icon: TrendingUp,
    tagline: 'Senior to common equity, with a fixed dividend.',
    description:
      'Preferred shares pay a stated dividend and rank ahead of common stock if things go wrong. They behave more like a bond than a share, which suits an income sleeve — but they are still equity, they can be suspended, and they sit behind every bondholder in the queue.',
    points: [
      { icon: Percent, title: '~6.6% target', body: 'A stated dividend rather than a variable distribution.' },
      { icon: Layers, title: 'Senior to common', body: 'Ranks ahead of ordinary shares on dividends and in a wind-up.' },
      { icon: Clock, title: 'Scheduled payments', body: 'Dividends are declared on a published calendar.' },
      { icon: Scale, title: 'Still equity', body: 'Behind all debt, and dividends can be suspended.' },
    ],
  },
};

export const PORTFOLIO_TOPICS = {
  'managed-portfolios': {
    label: 'Managed ETF Portfolios',
    icon: PieChart,
    tagline: 'Built from ETFs, run by a committee that shows its work.',
    description:
      'Two mandates: Core targets 7.8% from a 60/40 blend of global equity and investment-grade credit; Growth targets 11.2% with an equity tilt for money you will not need for two years. Both are rebalanced quarterly, and every holding and the single all-in fee are published before you subscribe.',
    points: [
      { icon: PieChart, title: 'Core, 7.8% target', body: '60/40 global equity and investment-grade credit.' },
      { icon: TrendingUp, title: 'Growth, 11.2% target', body: 'Equity-tilted, for a horizon beyond two years.' },
      { icon: FileText, title: 'Everything disclosed', body: 'Full holdings and one all-in fee, before you commit.' },
      { icon: Users, title: 'A named committee', body: 'The people setting allocation publish their reasoning quarterly.' },
    ],
  },
  'self-directed': {
    label: 'Self-Directed Brokerage',
    icon: CandlestickChart,
    tagline: 'Your own positions, your own calls.',
    description:
      'A brokerage account for running your own book alongside anything managed. Commission-free on US equities and ETFs, with positions, cost basis and unrealised P/L on one screen. Orders are filled by the desk at the published mark — Aurivest carries no live exchange feed.',
    points: [
      { icon: CandlestickChart, title: 'Commission-free', body: 'No per-trade charge on US equities and ETFs.' },
      { icon: Calculator, title: 'Cost basis tracked', body: 'Unrealised gain and loss maintained per position.' },
      { icon: Clock, title: 'Desk-filled', body: 'Orders settle at the published mark, not an exchange print.' },
      { icon: Layers, title: 'Sits beside managed', body: 'Run your own ideas without leaving the platform.' },
    ],
  },
  'fractional-shares': {
    label: 'Fractional Shares',
    icon: Coins,
    tagline: 'Own a slice of anything, from five dollars up.',
    description:
      'Buy by dollar amount rather than by share count, so a $500 share is not a barrier and no cash sits idle waiting for a round lot. Particularly useful for building a position steadily, or for holding a diversified set of expensive names on a modest balance.',
    points: [
      { icon: Coins, title: 'From $5', body: 'Order by amount rather than by whole shares.' },
      { icon: Calculator, title: 'Nothing idle', body: 'Every dollar is invested — no leftover cash waiting.' },
      { icon: TrendingUp, title: 'Build gradually', body: 'Accumulate a position over months at your own pace.' },
      { icon: PieChart, title: 'Diversify small', body: 'Hold many expensive names on a modest balance.' },
    ],
  },
};

export const RETIREMENT_TOPICS = {
  'iras': {
    label: 'Traditional & Roth IRAs',
    icon: Target,
    tagline: 'The two core wrappers, opened in minutes.',
    description:
      'A Traditional IRA takes pre-tax contributions and taxes the withdrawal; a Roth takes post-tax contributions and lets qualified withdrawals out tax-free. Which is better depends on whether your tax rate now is higher or lower than it will be in retirement — a planner will walk you through it at no charge.',
    points: [
      { icon: Target, title: 'Traditional', body: 'Pre-tax contributions, taxed when you draw in retirement.' },
      { icon: Target, title: 'Roth', body: 'Post-tax in, and qualified withdrawals come out tax-free.' },
      { icon: Calculator, title: 'Free projection', body: 'See the monthly income your current path actually produces.' },
      { icon: Clock, title: 'Glide path', body: 'Risk steps down automatically as the target date approaches.' },
    ],
  },
  'employer-plans': {
    label: 'SEP & SIMPLE IRAs',
    icon: Briefcase,
    tagline: 'For the self-employed and small teams.',
    description:
      'A SEP IRA gives the self-employed and small firms far higher contribution room than a personal IRA, funded entirely by the employer. A SIMPLE IRA suits teams under 100 people and takes contributions from both sides. We handle the plan documents and the annual administration.',
    points: [
      { icon: Briefcase, title: 'SEP IRA', body: 'Employer-funded, with substantially higher contribution room.' },
      { icon: Users, title: 'SIMPLE IRA', body: 'For teams under 100, with employer and employee contributions.' },
      { icon: FileText, title: 'Paperwork handled', body: 'Plan documents and annual administration are ours.' },
      { icon: Calculator, title: 'Contribution modelling', body: 'See what each structure allows before you choose.' },
    ],
  },
  'rollovers': {
    label: '401(k) Rollovers & Solo 401(k)',
    icon: Layers,
    tagline: 'Bring the old plan across, or open your own.',
    description:
      'Old employer plans drift — high fees, stale allocations, nobody watching. We chase the outgoing provider and bring it across without you sitting on hold. If you are owner-only, a Solo 401(k) gives you both the employer and the employee contribution room in one plan.',
    points: [
      { icon: Layers, title: 'We chase the provider', body: 'You sign once; we handle the transfer paperwork.' },
      { icon: Briefcase, title: 'Solo 401(k)', body: 'Owner-only businesses get both contribution allowances.' },
      { icon: Percent, title: 'Fees compared', body: 'We show the old plan cost against the new one before you move.' },
      { icon: Clock, title: 'No tax event', body: 'A direct rollover keeps the tax treatment intact.' },
    ],
  },
};

export const ALTERNATIVE_TOPICS = {
  'margin-lending': {
    label: 'Margin Lending',
    icon: Scale,
    tagline: 'Borrow against eligible positions, from 8.75%.',
    description:
      'A credit line secured on your portfolio, so you can raise cash without selling and triggering a tax event. It is genuinely risky: if the collateral falls far enough we can sell your positions to meet the call, and we do not have to ask first. Size it as a tool, not as leverage for its own sake.',
    points: [
      { icon: Percent, title: 'From 8.75%', body: 'Interest accrues daily on the drawn balance only.' },
      { icon: Coins, title: 'No forced sale', body: 'Raise cash without realising a gain on the underlying.' },
      { icon: Scale, title: 'Positions can be sold', body: 'A margin call can be met by selling your holdings, without notice.' },
      { icon: ShieldCheck, title: 'Eligible assets only', body: 'Not everything on the shelf can be borrowed against.' },
    ],
  },
  'alternatives': {
    label: 'Private Real Estate & Credit',
    icon: Building2,
    tagline: 'Higher targets, and genuinely illiquid.',
    description:
      'Private real estate targets 12.4% from income-producing property; private credit targets 13.8% from direct lending to mid-market borrowers. Both are held through private vehicles, both lock your capital for the full term, and neither can be sold early because you changed your mind.',
    points: [
      { icon: Building2, title: 'Real estate, 12.4%', body: 'Income-producing property held through a private vehicle.' },
      { icon: Coins, title: 'Private credit, 13.8%', body: 'Direct lending to mid-market borrowers.' },
      { icon: Lock, title: 'Capital is locked', body: 'Committed for the full term. There is no early exit.' },
      { icon: Scale, title: 'Sized as a slice', body: 'Suitable as a minority of a portfolio, never the core of it.' },
    ],
  },
  'crypto': {
    label: 'Crypto Trading & Custody',
    icon: Bitcoin,
    tagline: 'Major digital assets, in segregated institutional custody.',
    description:
      'Bitcoin and Ethereum held in segregated institutional custody rather than on an exchange, so the assets are not commingled with anyone else’s. Buy fractionally from $100. This is the highest-volatility thing on the shelf and it should be sized accordingly.',
    points: [
      { icon: Lock, title: 'Segregated custody', body: 'Held apart from platform assets and from other clients.' },
      { icon: Coins, title: 'Fractional from $100', body: 'Buy by amount rather than by whole coins.' },
      { icon: CandlestickChart, title: 'Positions on one screen', body: 'Alongside your equities and ETFs, not in a separate app.' },
      { icon: Scale, title: 'Very high volatility', body: 'Capable of losing a large share of its value quickly.' },
    ],
  },
};

export const PRIVATE_TOPICS = {
  'estate-planning': {
    label: 'Estate Planning Tools',
    icon: FileText,
    tagline: 'Make sure it goes where you intend.',
    description:
      'Wills, beneficiary designations aligned across every account, and the tax consequences of each structure quantified before you sign anything. An estate plan written once and never revisited usually fails at the exact moment it matters, so we review it as circumstances change.',
    points: [
      { icon: FileText, title: 'Wills and structures', body: 'Chosen for your family situation, not from a template.' },
      { icon: ShieldCheck, title: 'Beneficiaries aligned', body: 'Account designations checked against the will so they agree.' },
      { icon: Calculator, title: 'Tax mapped', body: 'What each structure costs your estate, quantified up front.' },
      { icon: Clock, title: 'Kept current', body: 'Revisited as marriages, births and moves change the picture.' },
    ],
  },
  'trust-services': {
    label: 'Trust Account Services',
    icon: Gem,
    tagline: 'Formation and administration, with a named officer.',
    description:
      'Trust formation and ongoing administration for clients who need assets held for someone else — children, a charity, a business succession. A named trust officer runs the account, and the investment mandate inside the trust is managed on the same shelf as everything else.',
    points: [
      { icon: Users, title: 'A named officer', body: 'One person accountable for the administration.' },
      { icon: Gem, title: 'Formation handled', body: 'Structuring and drafting through an independent practice.' },
      { icon: Globe, title: 'Cross-border aware', body: 'Structures that survive beneficiaries living elsewhere.' },
      { icon: HeartHandshake, title: 'Joined to the plan', body: 'Trust assets invested on the same shelf as your own.' },
    ],
  },
};

/* One flat map so a single route can resolve any topic slug. */
export const ALL_TOPICS = {
  ...CASH_TOPICS,
  ...FIXED_INCOME_TOPICS,
  ...PORTFOLIO_TOPICS,
  ...RETIREMENT_TOPICS,
  ...ALTERNATIVE_TOPICS,
  ...PRIVATE_TOPICS,
};
