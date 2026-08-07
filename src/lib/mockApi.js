/* ============================================================
   In-browser demo backend.

   Active only while VITE_API_URL is unset (see lib/api.js). It answers the
   exact routes the real Aurivest API is expected to expose and persists to
   localStorage, so every screen — accounts, transfers, cards, investments,
   loans, KYC — is fully explorable without a server running.

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
export const PLAN_CATALOGUE = [
  { id: 'reserve', name: 'Reserve Savings', horizon: 'Flexible', termMonths: 0, rate: 4.65, min: 100, risk: 'Insured', blurb: 'High-yield insured savings. Withdraw any day, no penalty.' },
  { id: 'treasury', name: 'Treasury Ladder', horizon: '6 Months', termMonths: 6, rate: 5.1, min: 1000, risk: 'Very low', blurb: 'A laddered government-bill portfolio rolled every 4 weeks.' },
  { id: 'balanced', name: 'Balanced Portfolio', horizon: '12 Months', termMonths: 12, rate: 7.8, min: 2500, risk: 'Moderate', blurb: '60/40 global equity and investment-grade credit, rebalanced quarterly.' },
  { id: 'growth', name: 'Growth Portfolio', horizon: '24 Months', termMonths: 24, rate: 11.2, min: 10000, risk: 'Elevated', blurb: 'Equity-tilted mandate for long-horizon capital with quarterly reviews.' },
  { id: 'private', name: 'Private Wealth Mandate', horizon: '36 Months', termMonths: 36, rate: 14.5, min: 50000, risk: 'High', blurb: 'Bespoke multi-asset mandate with a named advisor and estate planning.' },
];

export const LOAN_PRODUCTS = [
  { id: 'personal', name: 'Personal Loan', apr: 8.9, maxAmount: 50000, termMonths: 36, blurb: 'Fixed-rate, no collateral, funded same day once approved.' },
  { id: 'auto', name: 'Auto Loan', apr: 6.4, maxAmount: 120000, termMonths: 60, blurb: 'Competitive rates on new and used vehicles up to 7 years old.' },
  { id: 'mortgage', name: 'Home Mortgage', apr: 5.75, maxAmount: 1500000, termMonths: 360, blurb: '30-year fixed with no lender origination fee on Aurivest accounts.' },
  { id: 'business', name: 'Business Line', apr: 9.75, maxAmount: 250000, termMonths: 24, blurb: 'Revolving credit that draws and repays with your cash cycle.' },
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
  const checkingId = 'acct-checking';
  const savingsId = 'acct-savings';
  const investId = 'acct-invest';

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
      { _id: checkingId, userId, kind: 'checking', name: 'Everyday Checking', number: '4820119736', balance: 18452.86, apy: 0.75, openedAt: daysAgo(420) },
      { _id: savingsId, userId, kind: 'savings', name: 'Reserve Savings', number: '7719038452', balance: 64200.4, apy: 4.65, openedAt: daysAgo(400) },
      { _id: investId, userId, kind: 'investment', name: 'Wealth Portfolio', number: '9903471182', balance: 128740.15, apy: 9.4, openedAt: daysAgo(360) },
    ],
    cards: [
      { _id: uid(), userId, accountId: checkingId, label: 'Aurivest Reserve', network: 'Visa Infinite', type: 'physical', last4: '4821', expiry: '09/29', frozen: false, monthlyLimit: 12000, spent: 3184.22, color: 'amber' },
      { _id: uid(), userId, accountId: checkingId, label: 'Online Virtual', network: 'Mastercard', type: 'virtual', last4: '9037', expiry: '02/28', frozen: false, monthlyLimit: 3000, spent: 412.9, color: 'dark' },
    ],
    investments: [
      { _id: uid(), userId, planId: 'balanced', planName: 'Balanced Portfolio', principal: 45000, rate: 7.8, termMonths: 12, startedAt: daysAgo(190), maturesAt: daysAhead(175), status: 'active' },
      { _id: uid(), userId, planId: 'treasury', planName: 'Treasury Ladder', principal: 20000, rate: 5.1, termMonths: 6, startedAt: daysAgo(70), maturesAt: daysAhead(110), status: 'active' },
      { _id: uid(), userId, planId: 'growth', planName: 'Growth Portfolio', principal: 60000, rate: 11.2, termMonths: 24, startedAt: daysAgo(310), maturesAt: daysAhead(420), status: 'active' },
    ],
    loans: [
      { _id: uid(), userId, productId: 'auto', product: 'Auto Loan', principal: 32000, apr: 6.4, termMonths: 60, monthlyPayment: 624.11, outstanding: 21440.8, status: 'active', appliedAt: daysAgo(300) },
    ],
    beneficiaries: [
      { _id: uid(), userId, name: 'Daniel Okafor', bank: 'Chase Bank', number: '5540118293', nickname: 'Rent' },
      { _id: uid(), userId, name: 'Mira Solberg', bank: 'Aurivest', number: '7719038452', nickname: 'Sister' },
    ],
    transactions: [],
    profitBalance: { [userId]: 1284.62 },
  };

  const tx = [
    { type: 'interest', label: 'Monthly interest', detail: 'Reserve Savings · 4.65% APY', amount: 248.9, status: 'completed', accountId: savingsId, at: 2 },
    { type: 'card', label: 'Aurivest Reserve card', detail: 'Blue Bottle Coffee · San Francisco', amount: -18.4, status: 'completed', accountId: checkingId, at: 2 },
    { type: 'transfer', label: 'Transfer to Daniel Okafor', detail: 'Chase Bank ····8293 · Rent', amount: -2400, status: 'completed', accountId: checkingId, at: 4 },
    { type: 'deposit', label: 'Payroll deposit', detail: 'Northwind Studios · ACH', amount: 8420, status: 'completed', accountId: checkingId, at: 6 },
    { type: 'investment', label: 'Growth Portfolio', detail: 'Quarterly gain credited', amount: 1682.4, status: 'completed', accountId: investId, at: 9 },
    { type: 'card', label: 'Online Virtual card', detail: 'Adobe Creative Cloud', amount: -59.99, status: 'completed', accountId: checkingId, at: 12 },
    { type: 'loan', label: 'Auto loan payment', detail: 'Instalment 41 of 60', amount: -624.11, status: 'completed', accountId: checkingId, at: 14 },
    { type: 'withdraw', label: 'ATM withdrawal', detail: 'Market St · San Francisco', amount: -300, status: 'completed', accountId: checkingId, at: 18 },
    { type: 'investment', label: 'Balanced Portfolio', detail: 'Top-up subscription', amount: -5000, status: 'completed', accountId: investId, at: 24 },
    { type: 'referral', label: 'Referral reward', detail: 'Mira Solberg joined Aurivest', amount: 75, status: 'completed', accountId: checkingId, at: 30 },
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
const primaryAccount = (db, userId) => accountsOf(db, userId).find((a) => a.kind === 'checking');

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
  const checking = accts.find((a) => a.kind === 'checking');
  const savings = accts.find((a) => a.kind === 'savings');
  const invest = accts.find((a) => a.kind === 'investment');
  const investments = db.investments.filter((i) => i.userId === user._id && i.status === 'active');
  const totalInvested = round2(investments.reduce((s, i) => s + i.principal, 0));
  const accountValue = round2(accts.reduce((s, a) => s + a.balance, 0));
  const loans = db.loans.filter((l) => l.userId === user._id && l.status === 'active');

  const holdings = [
    { sym: 'Cash & checking', value: round2(checking?.balance || 0), color: 'var(--accent)' },
    { sym: 'Savings', value: round2(savings?.balance || 0), color: 'var(--accent-deep)' },
    { sym: 'Investments', value: round2(invest?.balance || 0), color: 'var(--accent-warm)' },
  ].filter((h) => h.value > 0);

  return {
    accountValue,
    balance: round2(checking?.balance || 0),
    savingsBalance: round2(savings?.balance || 0),
    investedBalance: round2(invest?.balance || 0),
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
      { _id: uid(), userId, kind: 'checking', name: 'Everyday Checking', number: acctNumber(), balance: 0, apy: 0.75, openedAt: now() },
      { _id: uid(), userId, kind: 'savings', name: 'Reserve Savings', number: acctNumber(), balance: 0, apy: 4.65, openedAt: now() },
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
  if (url === '/api/cards' && method === 'GET') {
    const user = requireUser(db, token);
    return db.cards.filter((c) => c.userId === user._id);
  }

  if (url === '/api/cards' && method === 'POST') {
    const user = requireUser(db, token);
    const account = primaryAccount(db, user._id);
    const card = {
      _id: uid(), userId: user._id, accountId: account?._id,
      label: body.label || 'Virtual card',
      network: 'Mastercard', type: 'virtual',
      last4: last4(), expiry: '11/30', frozen: false,
      monthlyLimit: Number(body.monthlyLimit) || 2000, spent: 0, color: 'dark',
    };
    db.cards.push(card);
    return card;
  }

  const freezeMatch = url.match(/^\/api\/cards\/([^/]+)\/freeze$/);
  if (freezeMatch && method === 'PATCH') {
    const user = requireUser(db, token);
    const card = db.cards.find((c) => c._id === freezeMatch[1] && c.userId === user._id);
    if (!card) throw new MockError('Card not found.', 404);
    card.frozen = !card.frozen;
    return card;
  }

  /* ---------- investments ---------- */
  if (url === '/api/investments/plans' && method === 'GET') return PLAN_CATALOGUE;

  if (url === '/api/investments' && method === 'GET') {
    const user = requireUser(db, token);
    const mine = db.investments.filter((i) => i.userId === user._id);
    return mine.map((i) => ({ ...i, accrued: accruedOn(i) }));
  }

  if (url === '/api/investments' && method === 'POST') {
    const user = requireUser(db, token);
    const plan = PLAN_CATALOGUE.find((p) => p.id === body.planId);
    if (!plan) throw new MockError('That plan is no longer available.', 404);
    const amount = Number(body.amount);
    if (!(amount >= plan.min)) throw new MockError(`${plan.name} starts at $${plan.min.toLocaleString()}.`, 400);

    const from = db.accounts.find((a) => a._id === body.fromAccountId && a.userId === user._id)
      || primaryAccount(db, user._id);
    if (!from || from.balance < amount) throw new MockError('Not enough available balance to fund that.', 400);

    from.balance = round2(from.balance - amount);
    const investAcct = accountsOf(db, user._id).find((a) => a.kind === 'investment');
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
    const acct = db.accounts.find((a) => a._id === body.accountId && a.userId === user._id) || primaryAccount(db, user._id);
    acct.balance = round2(acct.balance + amount);
    addTx(db, user._id, { type: 'deposit', label: 'Deposit received', detail: `${body.method || 'Bank transfer'} → ${acct.name}`, amount, accountId: acct._id });
    return { ok: true, account: acct };
  }

  if (url === '/api/withdrawals' && method === 'POST') {
    const user = requireUser(db, token);
    if ((user.kyc?.status || 'unverified') !== 'verified') {
      throw new MockError('Identity verification must be approved before withdrawing.', 403);
    }
    const amount = Number(body.amount);
    if (!(amount >= SETTINGS.minWithdrawal)) throw new MockError(`The minimum withdrawal is $${SETTINGS.minWithdrawal}.`, 400);
    const acct = db.accounts.find((a) => a._id === body.accountId && a.userId === user._id) || primaryAccount(db, user._id);
    if (acct.balance < amount) throw new MockError('That’s more than the available balance.', 400);
    acct.balance = round2(acct.balance - amount);
    addTx(db, user._id, {
      type: 'withdraw', label: 'Withdrawal requested',
      detail: `${body.method || 'Bank transfer'} · ····${String(body.destination || '').slice(-4)}`,
      amount: -amount, status: 'pending', accountId: acct._id,
    });
    return { ok: true, account: acct };
  }

  /* ---------- loans ---------- */
  if (url === '/api/loans/products' && method === 'GET') return LOAN_PRODUCTS;

  if (url === '/api/loans' && method === 'GET') {
    const user = requireUser(db, token);
    return db.loans.filter((l) => l.userId === user._id);
  }

  if (url === '/api/loans' && method === 'POST') {
    const user = requireUser(db, token);
    const product = LOAN_PRODUCTS.find((p) => p.id === body.productId);
    if (!product) throw new MockError('Unknown loan product.', 404);
    const principal = Number(body.amount);
    if (!(principal > 0) || principal > product.maxAmount) {
      throw new MockError(`${product.name} is available up to $${product.maxAmount.toLocaleString()}.`, 400);
    }
    const termMonths = Number(body.termMonths) || product.termMonths;
    const r = product.apr / 100 / 12;
    const monthlyPayment = round2((principal * r) / (1 - Math.pow(1 + r, -termMonths)));
    const loan = {
      _id: uid(), userId: user._id, productId: product.id, product: product.name,
      principal, apr: product.apr, termMonths, monthlyPayment,
      outstanding: principal, status: 'pending', appliedAt: now(),
    };
    db.loans.push(loan);
    addTx(db, user._id, { type: 'loan', label: `${product.name} application`, detail: `Under review · ${termMonths} months`, amount: 0, status: 'pending' });
    return loan;
  }

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
