/* ============================================================
   In-browser demo backend.

   Active only while VITE_API_URL is unset (see lib/api.js). It answers the
   exact routes the real Aurivest API is expected to expose and persists to
   localStorage, so every screen — accounts, products, holdings, funding,
   KYC — is fully explorable without a server running.

   Swap in the real backend by setting VITE_API_URL; nothing else changes.
   ============================================================ */

const DB_KEY = 'aurivest-demo-db';
const LATENCY = 260; // ms — enough for loading states to be visible/real

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();
const round2 = (n) => Math.round(n * 100) / 100;
const acctNumber = () => String(Math.floor(1e9 + Math.random() * 9e9));
const last4 = () => String(Math.floor(1000 + Math.random() * 9000));

class MockError extends Error {
  constructor(message, status = 400, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* ============================================================
   Catalogue — the products the marketing site sells
   ============================================================ */
export const PRODUCT_FAMILIES = [
  { id: 'cash', name: 'Cash & Liquidity', account: 'cash', blurb: 'Money that has to stay reachable — still earning while it waits.', products: [
    { id: 'hy-cash', name: 'High-Yield Cash Management', kind: 'yield', rate: 4.65, termMonths: 0, min: 100, risk: 'Very low', blurb: 'Withdraw any day, no penalty. Interest credited monthly.' },
    { id: 'mmf', name: 'Money Market Fund', kind: 'yield', rate: 5.02, termMonths: 0, min: 1000, risk: 'Very low', blurb: 'A government money market fund, priced daily, settling T+1.' },
    { id: 'treasury', name: 'Treasury-Backed Account', kind: 'yield', rate: 5.18, termMonths: 3, min: 1000, risk: 'Very low', blurb: 'Held directly in short-dated government bills, rolled at maturity.' },
  ] },
  { id: 'fixed-income', name: 'Fixed Income', account: 'brokerage', blurb: 'Predictable income with a defined maturity.', products: [
    { id: 'bond-ladder', name: 'Bond Ladder', kind: 'yield', rate: 5.45, termMonths: 12, min: 5000, risk: 'Low', blurb: 'Staggered maturities so a rung comes due every quarter.' },
    { id: 'muni', name: 'Municipal Bonds', kind: 'yield', rate: 4.28, termMonths: 24, min: 10000, risk: 'Low', blurb: 'Investment-grade municipal issues, generally tax-advantaged.' },
    { id: 'preferred', name: 'Preferred Stock', kind: 'yield', rate: 6.6, termMonths: 12, min: 5000, risk: 'Moderate', blurb: 'Senior to common equity, with a fixed dividend schedule.' },
  ] },
  { id: 'portfolios', name: 'Portfolios', account: 'brokerage', blurb: 'ETF-built portfolios, run for you or run by you.', products: [
    { id: 'core-etf', name: 'Core ETF Portfolio', kind: 'managed', rate: 7.8, termMonths: 12, min: 2500, risk: 'Moderate', blurb: '60/40 global equity and investment-grade credit, rebalanced quarterly.' },
    { id: 'growth-etf', name: 'Growth ETF Portfolio', kind: 'managed', rate: 11.2, termMonths: 24, min: 10000, risk: 'Elevated', blurb: 'Equity-tilted for capital with a horizon beyond two years.' },
    { id: 'self-directed', name: 'Self-Directed Brokerage', kind: 'holding', rate: 0, termMonths: 0, min: 500, risk: 'Self-managed', blurb: 'Your own positions, your own calls. Commission-free.' },
    { id: 'fractional', name: 'Fractional Shares', kind: 'holding', rate: 0, termMonths: 0, min: 5, risk: 'Self-managed', blurb: 'Own a slice of any listed name from five dollars up.' },
  ] },
  { id: 'retirement', name: 'Retirement', account: 'retirement', blurb: 'The tax-advantaged wrappers, without the paperwork.', products: [
    { id: 'trad-ira', name: 'Traditional IRA', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 500, risk: 'Moderate', blurb: 'Pre-tax contributions, taxed on withdrawal.' },
    { id: 'roth-ira', name: 'Roth IRA', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 500, risk: 'Moderate', blurb: 'Post-tax in, tax-free qualified withdrawals out.' },
    { id: 'sep-ira', name: 'SEP IRA', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 1000, risk: 'Moderate', blurb: 'For the self-employed, with higher contribution room.' },
    { id: 'simple-ira', name: 'SIMPLE IRA', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 1000, risk: 'Moderate', blurb: 'A straightforward plan for teams under 100.' },
    { id: 'rollover-401k', name: '401(k) Rollover', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 0, risk: 'Moderate', blurb: 'We chase the outgoing provider for you.' },
    { id: 'solo-401k', name: 'Solo 401(k)', kind: 'wrapper', rate: 7.4, termMonths: 0, min: 1000, risk: 'Moderate', blurb: 'For owner-only businesses.' },
  ] },
  { id: 'alternatives', name: 'Higher-Yield Add-Ons', account: 'brokerage', blurb: 'Larger returns, wider outcomes. Sized as a slice, never the whole.', products: [
    { id: 'margin', name: 'Margin Lending', kind: 'facility', rate: 8.75, termMonths: 0, min: 5000, risk: 'High', blurb: 'Borrow against eligible positions from 8.75%.' },
    { id: 'real-estate', name: 'Private Real Estate', kind: 'yield', rate: 12.4, termMonths: 36, min: 25000, risk: 'High', blurb: 'Income-producing property. Illiquid.' },
    { id: 'private-credit', name: 'Private Credit', kind: 'yield', rate: 13.8, termMonths: 24, min: 25000, risk: 'High', blurb: 'Direct lending to mid-market borrowers.' },
    { id: 'crypto', name: 'Crypto Trading & Custody', kind: 'holding', rate: 0, termMonths: 0, min: 100, risk: 'Very high', blurb: 'Major digital assets in segregated custody.' },
  ] },
  { id: 'private', name: 'Private Access', account: 'brokerage', premium: true, blurb: 'For situations that have outgrown a product sheet.', products: [
    { id: 'estate', name: 'Estate Planning Tools', kind: 'wrapper', rate: 0, termMonths: 0, min: 50000, risk: 'n/a', blurb: 'Wills, beneficiary alignment, tax consequences mapped.' },
    { id: 'trust', name: 'Trust Account Services', kind: 'wrapper', rate: 0, termMonths: 0, min: 100000, risk: 'n/a', blurb: 'Trust formation and administration.' },
  ] },
];

const ALL_PRODUCTS = PRODUCT_FAMILIES.flatMap((f) =>
  f.products.map((p) => ({ ...p, familyId: f.id, familyName: f.name, account: f.account })));

export const INSTRUMENTS = [
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', kind: 'etf', price: 512.40 },
  { symbol: 'VTI', name: 'Vanguard Total Market ETF', kind: 'etf', price: 284.15 },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', kind: 'etf', price: 98.72 },
  { symbol: 'AAPL', name: 'Apple Inc.', kind: 'equity', price: 231.80 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', kind: 'equity', price: 428.60 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', kind: 'equity', price: 138.25 },
  { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', price: 68420.00 },
  { symbol: 'ETH', name: 'Ethereum', kind: 'crypto', price: 3285.50 },
];

const WALLETS = [
  { _id: 'w-btc', asset: 'BTC', name: 'Bitcoin', network: 'Bitcoin', address: 'bc1qav7x2m0kz9wq4l3sdcpr8yhn6tgu5vfe20jxda',
    memo: '', memoLabel: '', confirmations: '2 confirmations', minDeposit: 50, scope: 'both', isActive: true, sortOrder: 1 },
  { _id: 'w-eth', asset: 'ETH', name: 'Ethereum', network: 'ERC-20', address: '0x7A3fD2c9E41b8065aC4Db19e5f0C7B2a63E914Dd',
    memo: '', memoLabel: '', confirmations: '12 confirmations', minDeposit: 50, scope: 'both', isActive: true, sortOrder: 2 },
  { _id: 'w-usdt-trc', asset: 'USDT', name: 'Tether USD', network: 'TRC-20', address: 'TQm5rV8xLc2FbNw9YePd3JhKzS6uA4gWnX',
    memo: '', memoLabel: '', confirmations: '19 confirmations', minDeposit: 50, scope: 'both', isActive: true, sortOrder: 3 },
  { _id: 'w-usdt-erc', asset: 'USDT', name: 'Tether USD', network: 'ERC-20', address: '0x1C8bE47aF03d95127eB6a4D80fC9375216AaE0b1',
    memo: '', memoLabel: '', confirmations: '12 confirmations', minDeposit: 100, scope: 'both', isActive: true, sortOrder: 4 },
  { _id: 'w-usdc', asset: 'USDC', name: 'USD Coin', network: 'ERC-20', address: '0x92Fd4a7bC016e5D83aB27409cF1e6B0d5847Ea23',
    memo: '', memoLabel: '', confirmations: '12 confirmations', minDeposit: 100, scope: 'both', isActive: true, sortOrder: 5 },
];

const SETTINGS = {
  minTransfer: 10,
  minDeposit: 50,
  minWithdrawal: 25,
  supportEmail: 'support@aurivest.com',
};

/* ============================================================
   Store
   ============================================================ */
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt payload — reseed below */ }
  const seeded = seed();
  save(seeded);
  return seeded;
}
function save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/* A ready-to-explore demo account so the dashboard is never empty. */
function seed() {
  const userId = 'demo-user';
  const cashId = 'acct-cash';
  const brokerageId = 'acct-brokerage';
  const retirementId = 'acct-retirement';

  const db = {
    users: [{
      _id: userId,
      name: 'Alexandra Reyes',
      email: 'demo@aurivest.com',
      password: 'demo1234',
      phone: '+1 415 555 0142',
      country: 'United States',
      emailVerified: true,
      verifyCode: null,
      role: 'client',
      kyc: { status: 'verified', submittedAt: daysAgo(40), documentType: 'passport' },
      referralCode: 'AURI-DEMO',
      twoFactor: true,
      createdAt: daysAgo(420),
    }],
    accounts: [
      { _id: cashId, userId, kind: 'cash', name: 'Cash Management', number: '4820119736', balance: 48250.40, apy: 4.65, openedAt: daysAgo(420) },
      { _id: brokerageId, userId, kind: 'brokerage', name: 'Brokerage Account', number: '7719038452', balance: 96500, apy: 0, openedAt: daysAgo(400) },
      { _id: retirementId, userId, kind: 'retirement', name: 'Retirement Account', number: '9903471182', balance: 132400, apy: 0, openedAt: daysAgo(360) },
    ],
    investments: [
      { _id: uid(), userId, planId: 'core-etf', planName: 'Core ETF Portfolio', familyId: 'portfolios', principal: 45000, rate: 7.8, termMonths: 12, startedAt: daysAgo(190), maturesAt: daysAhead(175), status: 'active' },
      { _id: uid(), userId, planId: 'treasury', planName: 'Treasury-Backed Account', familyId: 'cash', principal: 20000, rate: 5.1, termMonths: 6, startedAt: daysAgo(70), maturesAt: daysAhead(110), status: 'active' },
      { _id: uid(), userId, planId: 'roth-ira', planName: 'Roth IRA', familyId: 'retirement', principal: 60000, rate: 11.2, termMonths: 24, startedAt: daysAgo(310), maturesAt: daysAhead(420), status: 'active' },
    ],
    holdings: [
      { _id: 'h-voo', userId, accountId: brokerageId, symbol: 'VOO', name: 'Vanguard S&P 500 ETF', kind: 'etf', units: 42.5, costBasis: 19800, price: 512.40 },
      { _id: 'h-aapl', userId, accountId: brokerageId, symbol: 'AAPL', name: 'Apple Inc.', kind: 'equity', units: 60, costBasis: 12400, price: 231.80 },
      { _id: 'h-btc', userId, accountId: brokerageId, symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', units: 0.42, costBasis: 24100, price: 68420.00 },
    ],
    payout: {
      asset: 'USDT', network: 'TRC-20', address: 'TXk2pQ9vNc7HbRw4YsPd1JhLzM6uB3gWnE',
      memo: '', label: 'Main payout wallet', verified: true, updatedAt: daysAgo(38),
    },
    beneficiaries: [
      { _id: uid(), userId, name: 'Daniel Okafor', bank: 'Chase Bank', number: '5540118293', nickname: 'Rent' },
      { _id: uid(), userId, name: 'Mira Solberg', bank: 'Aurivest', number: '7719038452', nickname: 'Sister' },
    ],
    transactions: [],
    profitBalance: { [userId]: 1284.62 },
  };

  const tx = [
    { type: 'interest', label: 'Monthly interest', detail: 'Cash Management · 4.65% APY', amount: 248.9, status: 'completed', accountId: brokerageId, at: 2 },
    { type: 'trade', label: 'Buy NVDA', detail: '12.000000 units at $138.25', amount: -1659, status: 'completed', accountId: cashId, at: 4 },
    { type: 'transfer', label: 'Transfer to Daniel Okafor', detail: 'Chase Bank ····8293 · Rent', amount: -2400, status: 'completed', accountId: cashId, at: 4 },
    { type: 'deposit', label: 'Payroll deposit', detail: 'Northwind Studios · ACH', amount: 8420, status: 'completed', accountId: cashId, at: 6 },
    { type: 'investment', label: 'Growth Portfolio', detail: 'Quarterly gain credited', amount: 1682.4, status: 'completed', accountId: retirementId, at: 9 },
    { type: 'dividend', label: 'VOO distribution', detail: 'Quarterly dividend', amount: 214.8, status: 'completed', accountId: brokerageId, at: 9 },
    { type: 'investment', label: 'Private Credit', detail: 'Subscribed from Cash Management', amount: -25000, status: 'completed', accountId: cashId, at: 120 },
    { type: 'withdraw', label: 'ATM withdrawal', detail: 'Market St · San Francisco', amount: -300, status: 'completed', accountId: cashId, at: 18 },
    { type: 'investment', label: 'Balanced Portfolio', detail: 'Top-up subscription', amount: -5000, status: 'completed', accountId: retirementId, at: 24 },
    { type: 'referral', label: 'Referral reward', detail: 'Mira Solberg joined Aurivest', amount: 75, status: 'completed', accountId: cashId, at: 30 },
  ];
  db.transactions = tx.map((t) => ({
    _id: uid(), userId, type: t.type, label: t.label, detail: t.detail,
    amount: t.amount, status: t.status, accountId: t.accountId, createdAt: daysAgo(t.at),
  }));

  return db;
}

/* ============================================================
   Helpers
   ============================================================ */
/* Never let the stored password or the live verification code leave the store. */
const publicUser = (u) => {
  const rest = { ...u };
  delete rest.password;
  delete rest.verifyCode;
  return rest;
};
const tokenFor = (u) => `demo.${u._id}`;

function userFromToken(db, token) {
  if (!token || !token.startsWith('demo.')) return null;
  return db.users.find((u) => u._id === token.slice(5)) || null;
}
function requireUser(db, token) {
  const u = userFromToken(db, token);
  if (!u) throw new MockError('Your session has expired — please log in again.', 401);
  return u;
}

const accountsOf = (db, userId) => db.accounts.filter((a) => a.userId === userId);
const primaryAccount = (db, userId) => accountsOf(db, userId).find((a) => a.kind === 'cash');

function addTx(db, userId, tx) {
  const row = { _id: uid(), userId, status: 'completed', createdAt: now(), ...tx };
  db.transactions.unshift(row);
  return row;
}

/* Accrued return on an investment, prorated across its elapsed term. */
function accruedOn(inv) {
  const elapsedDays = (Date.now() - new Date(inv.startedAt).getTime()) / 86400000;
  return round2(inv.principal * (inv.rate / 100) * (elapsedDays / 365));
}

/* Deterministic-ish account value series used by the performance chart. */
function seriesFor(total, points, drift) {
  const out = [];
  let v = total * (1 - drift);
  for (let i = 0; i < points; i++) {
    const wave = Math.sin(i / (points / 6)) * total * 0.012;
    v += (total * drift) / points + wave * 0.35;
    out.push(round2(Math.max(v, 0)));
  }
  out[out.length - 1] = round2(total);
  return out;
}

function overviewFor(db, user) {
  const accts = accountsOf(db, user._id);
  const cash = accts.find((a) => a.kind === 'cash');
  const brokerage = accts.find((a) => a.kind === 'brokerage');
  const retirement = accts.find((a) => a.kind === 'retirement');
  const investments = db.investments.filter((i) => i.userId === user._id && i.status === 'active');
  const totalInvested = round2(investments.reduce((s, i) => s + i.principal, 0));
  const accountValue = round2(accts.reduce((s, a) => s + a.balance, 0));
  const loans = db.loans.filter((l) => l.userId === user._id && l.status === 'active');

  const holdings = [
    { sym: 'Cash & liquidity', value: round2(cash?.balance || 0), color: 'var(--accent)' },
    { sym: 'Brokerage', value: round2(brokerage?.balance || 0), color: 'var(--accent-warm)' },
    { sym: 'Retirement', value: round2(retirement?.balance || 0), color: 'var(--gold-leaf)' },
  ].filter((h) => h.value > 0);

  const completed = db.transactions.filter((t) => t.userId === user._id && t.status !== 'failed');
  const totalDeposits = round2(
    completed.filter((t) => t.type === 'deposit' && t.amount > 0).reduce((s, t) => s + t.amount, 0)
  );
  const holdingsValue = round2(
    (db.holdings || []).filter((h) => h.userId === user._id).reduce((s, h) => s + h.units * h.price, 0)
  );
  const totalProfit = round2(
    completed.filter((t) => ['interest', 'dividend'].includes(t.type) && t.amount > 0).reduce((s, t) => s + t.amount, 0)
    + (db.profitBalance?.[user._id] || 0)
    + investments.reduce((s, i) => s + accruedOn(i), 0)
  );
  const totalInvestment = round2(totalInvested + holdingsValue);

  return {
    accountValue,
    totalDeposits,
    totalProfit,
    totalInvestment,
    balance: round2(cash?.balance || 0),
    brokerageBalance: round2(brokerage?.balance || 0),
    retirementBalance: round2(retirement?.balance || 0),
    holdingsValue,
    profitBalance: round2(db.profitBalance?.[user._id] || 0),
    totalInvested,
    activeInvestments: investments.length,
    referralEarnings: round2(
      db.transactions.filter((t) => t.userId === user._id && t.type === 'referral').reduce((s, t) => s + t.amount, 0)
    ),
    outstandingDebt: round2(loans.reduce((s, l) => s + l.outstanding, 0)),
    interestYtd: round2(
      db.transactions.filter((t) => t.userId === user._id && t.type === 'interest').reduce((s, t) => s + t.amount, 0)
    ),
    minTransfer: SETTINGS.minTransfer,
    kycStatus: user.kyc?.status || 'unverified',
    holdings,
    performance: {
      '1D': seriesFor(accountValue, 24, 0.004),
      '1W': seriesFor(accountValue, 28, 0.011),
      '1M': seriesFor(accountValue, 30, 0.028),
      '1Y': seriesFor(accountValue, 48, 0.164),
    },
    changePct: { '1D': 0.4, '1W': 1.1, '1M': 2.8, '1Y': 16.4 },
    activity: db.transactions.filter((t) => t.userId === user._id).slice(0, 7),
    updatedAt: now(),
  };
}

/* ============================================================
   Router
   ============================================================ */
function route(db, path, method, body, token) {
  const url = path.split('?')[0];

  /* ---------- auth ---------- */
  if (url === '/api/auth/register' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      throw new MockError('An account with that email already exists.', 409);
    }
    const userId = uid();
    const user = {
      _id: userId,
      name: body.name || 'New Client',
      email,
      password: body.password || '',
      phone: body.phone || '',
      country: body.country || '',
      emailVerified: true,
      verifyCode: null,
      role: 'client',
      kyc: { status: 'unverified' },
      referralCode: `AURI-${userId.slice(0, 5).toUpperCase()}`,
      twoFactor: false,
      createdAt: now(),
    };
    db.users.push(user);
    db.accounts.push(
      { _id: uid(), userId, kind: 'cash', name: 'Everyday Checking', number: acctNumber(), balance: 0, apy: 0.75, openedAt: now() },
      { _id: uid(), userId, kind: 'brokerage', name: 'Reserve Savings', number: acctNumber(), balance: 0, apy: 4.65, openedAt: now() },
      { _id: uid(), userId, kind: 'investment', name: 'Wealth Portfolio', number: acctNumber(), balance: 0, apy: 0, openedAt: now() },
    );
    db.profitBalance[userId] = 0;
    return { user: publicUser(user), token: tokenFor(user) };
  }

  if (url === '/api/auth/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const user = db.users.find((u) => u.email === email);
    if (!user || user.password !== body.password) {
      throw new MockError('Those credentials don’t match an account.', 401);
    }
    return { user: publicUser(user), token: tokenFor(user) };
  }

  if (url === '/api/auth/me' && method === 'GET') {
    return publicUser(requireUser(db, token));
  }



  /* ---------- settings ---------- */
  if (url === '/api/settings' && method === 'GET') return SETTINGS;

  /* ---------- dashboard ---------- */
  if (url === '/api/dashboard/overview' && method === 'GET') {
    return overviewFor(db, requireUser(db, token));
  }

  /* ---------- accounts ---------- */
  if (url === '/api/accounts' && method === 'GET') {
    const user = requireUser(db, token);
    return { accounts: accountsOf(db, user._id), beneficiaries: db.beneficiaries.filter((b) => b.userId === user._id) };
  }

  if (url === '/api/accounts/transfer' && method === 'POST') {
    const user = requireUser(db, token);
    const amount = Number(body.amount);
    if (!(amount >= SETTINGS.minTransfer)) {
      throw new MockError(`The minimum transfer is $${SETTINGS.minTransfer}.`, 400);
    }
    const from = db.accounts.find((a) => a._id === body.fromAccountId && a.userId === user._id);
    if (!from) throw new MockError('Pick an account to send from.', 400);
    if (from.balance < amount) throw new MockError('That transfer is larger than the available balance.', 400);

    from.balance = round2(from.balance - amount);

    // Internal transfers land instantly; external ones are queued for review.
    const internal = body.scope === 'internal';
    if (internal) {
      const to = db.accounts.find((a) => a._id === body.toAccountId && a.userId === user._id);
      if (!to) throw new MockError('Pick an account to send to.', 400);
      if (to._id === from._id) throw new MockError('Choose two different accounts.', 400);
      to.balance = round2(to.balance + amount);
      addTx(db, user._id, { type: 'transfer', label: `Transfer to ${to.name}`, detail: `From ${from.name} · instant`, amount: -amount, accountId: from._id });
      addTx(db, user._id, { type: 'transfer', label: `Transfer from ${from.name}`, detail: `To ${to.name} · instant`, amount, accountId: to._id });
    } else {
      addTx(db, user._id, {
        type: 'transfer',
        label: `Transfer to ${body.recipientName || 'external account'}`,
        detail: `${body.recipientBank || 'External bank'} ····${String(body.recipientNumber || '').slice(-4)} · ${body.rail || 'ACH'}`,
        amount: -amount,
        status: 'pending',
        accountId: from._id,
      });
      if (body.saveBeneficiary && body.recipientName) {
        db.beneficiaries.push({
          _id: uid(), userId: user._id, name: body.recipientName,
          bank: body.recipientBank || 'External bank', number: String(body.recipientNumber || ''), nickname: body.nickname || '',
        });
      }
    }
    return { ok: true, accounts: accountsOf(db, user._id) };
  }

  /* ---------- cards ---------- */



  /* ---------- investments ---------- */
  if (url === '/api/investments/families' && method === 'GET') return PRODUCT_FAMILIES;
  if (url === '/api/investments/products' && method === 'GET') return ALL_PRODUCTS;

  if (url === '/api/holdings/instruments' && method === 'GET') { requireUser(db, token); return INSTRUMENTS; }

  if (url === '/api/holdings' && method === 'GET') {
    const user = requireUser(db, token);
    const rows = (db.holdings || []).filter((h) => h.userId === user._id).map((h) => {
      const mv = round2(h.units * h.price);
      return { ...h, marketValue: mv, gain: round2(mv - h.costBasis),
        gainPct: h.costBasis > 0 ? Math.round(((mv - h.costBasis) / h.costBasis) * 10000) / 100 : 0 };
    });
    return { holdings: rows, marketValue: round2(rows.reduce((s, h) => s + h.marketValue, 0)),
      costBasis: round2(rows.reduce((s, h) => s + h.costBasis, 0)) };
  }

  if (url === '/api/holdings/buy' && method === 'POST') {
    const user = requireUser(db, token);
    const inst = INSTRUMENTS.find((i) => i.symbol === String(body.symbol || '').toUpperCase());
    if (!inst) throw new MockError('We do not carry that symbol.', 404);
    const cost = round2(body.amount);
    if (!(cost >= 5)) throw new MockError('The minimum order is $5.', 400);
    const cash = accountsOf(db, user._id).find((a) => a.kind === 'cash');
    if (!cash || cash.balance < cost) throw new MockError('Not enough available cash for that order.', 400);
    const units = cost / inst.price;
    cash.balance = round2(cash.balance - cost);
    db.holdings = db.holdings || [];
    let h = db.holdings.find((x) => x.userId === user._id && x.symbol === inst.symbol);
    if (h) { h.units += units; h.costBasis = round2(h.costBasis + cost); h.price = inst.price; }
    else {
      h = { _id: uid(), userId: user._id, accountId: accountsOf(db, user._id).find((a) => a.kind === 'brokerage')?._id,
        symbol: inst.symbol, name: inst.name, kind: inst.kind, units, costBasis: cost, price: inst.price };
      db.holdings.push(h);
    }
    addTx(db, user._id, { type: 'trade', label: 'Buy ' + inst.symbol, detail: units.toFixed(6) + ' units', amount: -cost, accountId: cash._id });
    return h;
  }

  if (url === '/api/holdings/sell' && method === 'POST') {
    const user = requireUser(db, token);
    const h = (db.holdings || []).find((x) => x.userId === user._id && x.symbol === String(body.symbol || '').toUpperCase());
    if (!h) throw new MockError('You do not hold that symbol.', 404);
    const units = body.all ? h.units : Number(body.units);
    if (!(units > 0)) throw new MockError('Enter how many units to sell.', 400);
    if (units > h.units + 1e-9) throw new MockError('That is more than you hold.', 400);
    const proceeds = round2(units * h.price);
    const basisOut = round2(h.costBasis * (units / h.units));
    const cash = accountsOf(db, user._id).find((a) => a.kind === 'cash');
    cash.balance = round2(cash.balance + proceeds);
    h.units -= units;
    h.costBasis = round2(Math.max(0, h.costBasis - basisOut));
    if (h.units <= 1e-9) db.holdings = db.holdings.filter((x) => x !== h);
    addTx(db, user._id, { type: 'trade', label: 'Sell ' + h.symbol, detail: units.toFixed(6) + ' units', amount: proceeds, accountId: cash._id });
    return { ok: true, proceeds, realised: round2(proceeds - basisOut) };
  }

  if (url.startsWith('/api/wallets') && method === 'GET') {
    requireUser(db, token);
    const scope = new URLSearchParams(url.split('?')[1] || '').get('scope');
    return WALLETS
      .filter((w) => w.isActive && (!scope || w.scope === 'both' || w.scope === scope))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  if (url === '/api/payout' && method === 'GET') {
    requireUser(db, token);
    const p = db.payout;
    if (!p?.address) return null;
    return {
      asset: p.asset, network: p.network, label: p.label, memo: p.memo,
      verified: p.verified, updatedAt: p.updatedAt,
      addressMasked: p.address.slice(0, 6) + '…' + p.address.slice(-6),
    };
  }
  if (url === '/api/payout' && method === 'PUT') {
    const user = requireUser(db, token);
    if (!body.asset || !body.network) throw new MockError('Choose an asset and a network.', 400);
    if (!body.address || String(body.address).trim().length < 20) throw new MockError('That does not look like a valid wallet address.', 400);
    /* A new address always re-enters review — that is the whole point of the gate. */
    db.payout = {
      asset: body.asset, network: body.network, address: String(body.address).trim(),
      memo: body.memo || '', label: body.label || '', verified: false, updatedAt: now(),
    };
    return publicUser(user);
  }

  if (url === '/api/investments' && method === 'GET') {
    const user = requireUser(db, token);
    const mine = db.investments.filter((i) => i.userId === user._id);
    return mine.map((i) => ({ ...i, accrued: accruedOn(i) }));
  }

  if (url === '/api/investments' && method === 'POST') {
    const user = requireUser(db, token);
    const plan = ALL_PRODUCTS.find((p) => p.id === (body.productId || body.planId));
    if (!plan) throw new MockError('That plan is no longer available.', 404);
    const amount = Number(body.amount);
    if (!(amount >= plan.min)) throw new MockError(`${plan.name} starts at $${plan.min.toLocaleString()}.`, 400);

    const from = db.accounts.find((a) => a._id === body.fromAccountId && a.userId === user._id)
      || primaryAccount(db, user._id);
    if (!from || from.balance < amount) throw new MockError('Not enough available balance to fund that.', 400);

    from.balance = round2(from.balance - amount);
    const investAcct = accountsOf(db, user._id).find((a) => a.kind === 'brokerage');
    if (investAcct) investAcct.balance = round2(investAcct.balance + amount);

    const inv = {
      _id: uid(), userId: user._id, planId: plan.id, planName: plan.name,
      principal: amount, rate: plan.rate, termMonths: plan.termMonths,
      startedAt: now(),
      maturesAt: plan.termMonths ? daysAhead(plan.termMonths * 30) : null,
      status: 'active',
    };
    db.investments.push(inv);
    addTx(db, user._id, { type: 'investment', label: plan.name, detail: `Subscribed from ${from.name}`, amount: -amount, accountId: investAcct?._id });
    return inv;
  }

  /* ---------- portfolio ---------- */
  if (url === '/api/portfolio' && method === 'GET') {
    const user = requireUser(db, token);
    const investments = db.investments.filter((i) => i.userId === user._id && i.status === 'active')
      .map((i) => ({ ...i, accrued: accruedOn(i) }));
    const accts = accountsOf(db, user._id);
    return {
      investments,
      accounts: accts,
      totalPrincipal: round2(investments.reduce((s, i) => s + i.principal, 0)),
      totalAccrued: round2(investments.reduce((s, i) => s + i.accrued, 0)),
      netWorth: round2(accts.reduce((s, a) => s + a.balance, 0)
        - db.loans.filter((l) => l.userId === user._id && l.status === 'active').reduce((s, l) => s + l.outstanding, 0)),
    };
  }

  /* ---------- transactions ---------- */
  if (url.startsWith('/api/transactions') && method === 'GET') {
    const user = requireUser(db, token);
    return db.transactions.filter((t) => t.userId === user._id);
  }

  /* ---------- deposits / withdrawals ---------- */
  if (url === '/api/deposits' && method === 'POST') {
    const user = requireUser(db, token);
    const amount = Number(body.amount);
    if (!(amount >= SETTINGS.minDeposit)) throw new MockError(`The minimum deposit is $${SETTINGS.minDeposit}.`, 400);
    if (!body.proof || !/^data:image\//.test(body.proof)) throw new MockError('Attach a screenshot or photo of your payment receipt.', 400);
    const wallet = WALLETS.find((w) => w._id === body.walletId) || WALLETS[0];
    const acct = db.accounts.find((a) => a._id === body.accountId && a.userId === user._id) || primaryAccount(db, user._id);
    /* Deposits are credited by a reviewer approving the receipt, never automatically. */
    addTx(db, user._id, {
      type: 'deposit', label: 'Deposit pending review',
      detail: `${wallet.asset} on ${wallet.network} · receipt uploaded`,
      amount, status: 'pending', accountId: acct._id,
    });
    return { ok: true, status: 'pending', account: acct };
  }

  if (url === '/api/withdrawals' && method === 'POST') {
    const user = requireUser(db, token);
    if ((user.kyc?.status || 'unverified') !== 'verified') {
      throw new MockError('Identity verification must be approved before withdrawing.', 403);
    }
    /* Mirrors routes/money.js: the destination is whatever the client filled
       in on the request — a crypto wallet, or the seven-field wire block. */
    const trim = (v) => String(v ?? '').trim();
    let detail;
    let payoutDetails;
    if (body.method === 'crypto') {
      const walletType = trim(body.walletType);
      const address = trim(body.walletAddress);
      if (!walletType) throw new MockError('Choose the crypto wallet type to be paid in.', 400);
      if (address.length < 20) throw new MockError('That does not look like a valid wallet address.', 400);
      payoutDetails = { walletType, address };
      detail = `${walletType} · ${address.slice(0, 6)}…${address.slice(-6)}`;
    } else if (body.method === 'wire') {
      const WIRE = [
        ['accountName', 'Account name'], ['bankName', 'Bank name'],
        ['accountNumber', 'Account number'], ['swiftCode', 'Swift code'],
        ['homeAddress', 'Home address'], ['routingNumber', 'Routing number'],
        ['bankAddress', 'Bank address'],
      ];
      payoutDetails = {};
      for (const [key, label] of WIRE) {
        const value = trim(body[key]);
        if (!value) throw new MockError(`${label} is required for a wire withdrawal.`, 400);
        payoutDetails[key] = value;
      }
      detail = `${payoutDetails.bankName} · ····${payoutDetails.accountNumber.slice(-4)}`;
    } else {
      throw new MockError('Choose whether to withdraw by crypto or by wire.', 400);
    }
    const amount = Number(body.amount);
    if (!(amount >= SETTINGS.minWithdrawal)) throw new MockError(`The minimum withdrawal is $${SETTINGS.minWithdrawal}.`, 400);
    const acct = db.accounts.find((a) => a._id === body.accountId && a.userId === user._id) || primaryAccount(db, user._id);
    if (acct.balance < amount) throw new MockError('That’s more than the available balance.', 400);
    acct.balance = round2(acct.balance - amount);
    addTx(db, user._id, {
      type: 'withdraw', label: 'Withdrawal requested',
      detail,
      amount: -amount, status: 'pending', accountId: acct._id,
      payoutMethod: body.method, payoutDetails,
    });
    return { ok: true, account: acct };
  }

  /* ---------- loans ---------- */


  /* ---------- referrals ---------- */
  if (url === '/api/referrals' && method === 'GET') {
    const user = requireUser(db, token);
    const rows = db.transactions.filter((t) => t.userId === user._id && t.type === 'referral');
    return {
      code: user.referralCode,
      link: `${window.location.origin}/register?ref=${user.referralCode}`,
      invited: rows.length,
      earned: round2(rows.reduce((s, t) => s + t.amount, 0)),
      rewardPerSignup: 75,
      history: rows,
    };
  }

  /* ---------- account / profile ---------- */
  if (url === '/api/users/me' && method === 'PUT') {
    const user = requireUser(db, token);
    ['name', 'phone', 'country', 'twoFactor'].forEach((k) => {
      if (body[k] !== undefined) user[k] = body[k];
    });
    return publicUser(user);
  }

  if (url === '/api/users/me/password' && method === 'PUT') {
    const user = requireUser(db, token);
    if (user.password !== body.currentPassword) throw new MockError('Your current password isn’t right.', 400);
    user.password = body.newPassword;
    return { message: 'Password updated.' };
  }


  if (url === '/api/users/me/transfer-profit' && method === 'POST') {
    const user = requireUser(db, token);
    const amount = round2(db.profitBalance?.[user._id] || 0);
    if (amount < 0.01) throw new MockError('There’s nothing to move yet.', 400);
    db.profitBalance[user._id] = 0;
    const acct = primaryAccount(db, user._id);
    if (acct) {
      acct.balance = round2(acct.balance + amount);
      addTx(db, user._id, { type: 'interest', label: 'Earnings moved to checking', detail: 'From earnings wallet', amount, accountId: acct._id });
    }
    return publicUser(user);
  }

  /* ---------- KYC ---------- */
  if (url === '/api/kyc' && method === 'POST') {
    const user = requireUser(db, token);
    user.kyc = {
      status: 'pending',
      documentType: body.documentType,
      submittedAt: now(),
      fullName: body.fullName,
      dob: body.dob,
      address: body.address,
    };
    return publicUser(user);
  }

  if (url === '/api/kyc/skip' && method === 'POST') {
    const user = requireUser(db, token);
    user.kyc = { ...(user.kyc || {}), status: 'skipped' };
    return publicUser(user);
  }

  throw new MockError(`No demo handler for ${method} ${url}`, 404);
}

/* Public entry point used by lib/api.js */
export function mockRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const db = load();
      try {
        const result = route(db, path, method, body, token);
        save(db);
        resolve(result);
      } catch (err) {
        reject(err instanceof MockError ? err : new MockError(err.message, 500));
      }
    }, LATENCY);
  });
}

/* Wipe the demo data — used by the settings screen. */
export function resetDemo() {
  localStorage.removeItem(DB_KEY);
}
