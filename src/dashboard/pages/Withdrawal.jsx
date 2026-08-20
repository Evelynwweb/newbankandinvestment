import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, AlertCircle, AlertTriangle, Bitcoin, Landmark,
  ShieldCheck, Clock, Wallet, Lock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Withdrawal — two rails, crypto or wire.

   The client says where the money goes on the request itself: a
   crypto wallet (type + address) or a bank wire (the full seven-field
   block the desk needs to execute it). Whichever they pick, the
   balance is debited and held the moment the request is filed, so the
   same money cannot be requested twice while one is in review.
   ============================================================ */

const STEPS = ['Method', 'Details', 'Amount', 'Review'];

const OTHER = 'Other';

const WALLET_TYPES = [
  'Bitcoin (BTC)',
  'Ethereum (ETH · ERC-20)',
  'Tether (USDT · TRC-20)',
  'Tether (USDT · ERC-20)',
  'USD Coin (USDC · ERC-20)',
  'BNB (BEP-20)',
  'Solana (SOL)',
  'Tron (TRX)',
  'Litecoin (LTC)',
  'XRP',
  OTHER,
];

/* Grouped so the two long address fields sit together at the bottom
   rather than breaking up the short bank identifiers. */
const WIRE_FIELDS = [
  { key: 'accountName', label: 'Account name', placeholder: 'Exactly as the bank holds it' },
  { key: 'bankName', label: 'Bank name', placeholder: 'e.g. First National Bank' },
  { key: 'accountNumber', label: 'Account number', placeholder: 'Account number or IBAN', mono: true },
  { key: 'swiftCode', label: 'Swift code', placeholder: 'e.g. FNBKUS33XXX', mono: true, upper: true },
  { key: 'routingNumber', label: 'Routing number', placeholder: 'ABA / sort code', mono: true },
  { key: 'homeAddress', label: 'Home address', placeholder: 'Your residential address', wide: true, lines: 2 },
  { key: 'bankAddress', label: 'Bank address', placeholder: 'Branch address of the receiving bank', wide: true, lines: 2 },
];

const EMPTY_WIRE = Object.fromEntries(WIRE_FIELDS.map((f) => [f.key, '']));

const METHODS = [
  {
    id: 'crypto',
    icon: Bitcoin,
    title: 'Crypto',
    blurb: 'Paid on-chain to a wallet you name. Usually released the same day.',
    meta: 'Wallet type · wallet address',
  },
  {
    id: 'wire',
    icon: Landmark,
    title: 'Wire transfer',
    blurb: 'Sent to your bank account. Settles in one to three business days.',
    meta: 'Full bank details required',
  },
];

/* ---------- small pieces ---------- */

function Gate({ icon: Icon, title, children, action }) {
  return (
    <>
      <PageHeader eyebrow="Move out" title="Withdrawal" />
      <div className="card p-10 flex flex-col items-center text-center">
        <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-wash)' }}>
          <Icon size={24} style={{ color: 'var(--accent)' }} />
        </span>
        <h3 className="display-sm text-[20px] mt-5">{title}</h3>
        <p className="text-[13.5px] mt-2 max-w-sm text-[color:var(--muted)]">{children}</p>
        {action}
      </div>
    </>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="auth-label">
        {label}{hint && <span className="opacity-60"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[13px]">
      <span className="text-[color:var(--muted-2)] shrink-0">{label}</span>
      <span className="text-right min-w-0 break-all">{value}</span>
    </div>
  );
}

/* The balance band. Sits above the wizard on every step so the number
   being withdrawn from is never more than a glance away. */
function BalanceBand({ cash, others, held, min }) {
  return (
    <div className="card p-6 md:p-7 grid lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">
            Available to withdraw
          </p>
          <span className="tag" style={{ borderColor: 'var(--up)', color: 'var(--up)' }}>
            <ShieldCheck size={11} /> Cleared
          </span>
        </div>
        <p className="num display-md mt-2" style={{ fontSize: 40, lineHeight: 1.05 }}>
          {fmtUSD(cash?.balance || 0)}
        </p>
        <p className="text-[12.5px] mt-2 text-[color:var(--muted-2)]">
          {cash?.name || 'Cash Management'}
          {cash?.number && <span className="num"> · ····{String(cash.number).slice(-4)}</span>}
        </p>
        <p className="text-[12.5px] mt-4 leading-relaxed text-[color:var(--muted)]">
          {(cash?.balance || 0) > 0
            ? 'Every dollar shown here is yours to take out — in crypto or by wire, in one request or several. Nothing is locked and there is no withdrawal fee.'
            : held > 0
              ? 'Your cash is currently held against a withdrawal that is still with the desk. It returns here in full if that request is declined.'
              : 'There is no cash to withdraw yet. Fund the account, or move a matured investment into Cash Management, and it will show up here.'}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 lg:pl-8 lg:border-l border-[color:var(--rule-soft)]">
        <div className="flex items-center justify-between gap-4 text-[13px]">
          <span className="text-[color:var(--muted-2)]">Minimum per withdrawal</span>
          <span className="num">{fmtUSD(min, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[13px]">
          <span className="text-[color:var(--muted-2)]">Held in review</span>
          <span className="num" style={held > 0 ? { color: 'var(--accent)' } : undefined}>
            {fmtUSD(held)}
          </span>
        </div>
        {others.map((a) => (
          <div key={a._id} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="text-[color:var(--muted-2)]">{a.name}</span>
            <span className="num text-[color:var(--muted-2)]">{fmtUSD(a.balance)}</span>
          </div>
        ))}
        {others.some((a) => a.balance > 0) && (
          <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)] pt-1">
            Investment balances have to be moved into Cash Management before they can leave — do that
            from the Account screen.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function Withdrawal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: accountData, reload } = useApi('/api/accounts', [walletVersion]);
  const { data: settings } = useApi('/api/settings');
  const { data: txns } = useApi('/api/transactions?type=withdraw&limit=200', [walletVersion]);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null);
  const [crypto, setCrypto] = useState({ walletType: WALLET_TYPES[0], otherType: '', address: '' });
  const [wire, setWire] = useState(EMPTY_WIRE);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const accounts = accountData?.accounts || [];
  const cash = accounts.find((a) => a.kind === 'cash');
  const others = accounts.filter((a) => a.kind !== 'cash');
  const balance = cash?.balance || 0;
  const min = settings?.minWithdrawal ?? 100;
  const amt = Number(amount) || 0;

  const withdrawals = (txns || []).filter((t) => t.type === 'withdraw');
  const held = withdrawals
    .filter((t) => t.status === 'pending' || t.status === 'processing')
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const kycStatus = user?.kyc?.status || 'unverified';
  const walletType = crypto.walletType === OTHER ? crypto.otherType.trim() : crypto.walletType;

  /* ---------- gates ---------- */
  if (!accountData) return <LoadingScreen inline />;

  if (kycStatus !== 'verified') {
    const pending = kycStatus === 'pending';
    return (
      <Gate
        icon={pending ? Clock : Lock}
        title={pending ? 'Verification under review' : 'Verify your identity to withdraw'}
        action={!pending && (
          <button onClick={() => navigate('/dashboard/kyc')} className="btn-solid px-7 py-3 mt-7">
            {kycStatus === 'rejected' ? 'Resubmit documents' : 'Start verification'} <ArrowRight size={15} />
          </button>
        )}
      >
        {pending
          ? 'Your documents are with the desk. Withdrawals open as soon as they are approved — usually within a few hours.'
          : 'Money can only leave an account whose owner has been verified. It takes a couple of minutes and only has to be done once.'}
      </Gate>
    );
  }

  if (cash?.isFrozen) {
    return (
      <Gate icon={Lock} title="This account is frozen">
        Withdrawals from {cash.name} are on hold. Contact the desk from the support widget and we will
        tell you exactly what is needed to lift it.
      </Gate>
    );
  }

  /* ---------- validation ---------- */
  const detailsError = () => {
    if (method === 'crypto') {
      if (!walletType) return 'Tell us which wallet type you are being paid in.';
      if (crypto.address.trim().length < 20) return 'Paste the full wallet address — that one looks too short.';
      return '';
    }
    const missing = WIRE_FIELDS.find((f) => !wire[f.key].trim());
    return missing ? `${missing.label} is required for a wire withdrawal.` : '';
  };

  const amountError = () => {
    if (!amt) return 'Enter an amount to withdraw.';
    if (amt < min) return `The minimum withdrawal is ${fmtUSD(min, { maximumFractionDigits: 0 })}.`;
    if (amt > balance) return 'That is more than the cash you have available.';
    return '';
  };

  const next = () => {
    const problem = step === 1 ? detailsError() : step === 2 ? amountError() : '';
    if (problem) { setError(problem); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const back = () => { setError(''); setStep((s) => s - 1); };

  const pickMethod = (id) => {
    setError('');
    setMethod(id);
    setStep(1);
  };

  const reset = () => {
    setReceipt(null);
    setStep(0);
    setMethod(null);
    setAmount('');
    setError('');
    setCrypto({ walletType: WALLET_TYPES[0], otherType: '', address: '' });
    setWire(EMPTY_WIRE);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const destination = method === 'crypto'
        ? { method: 'crypto', walletType, walletAddress: crypto.address.trim() }
        : { method: 'wire', ...Object.fromEntries(WIRE_FIELDS.map((f) => [f.key, wire[f.key].trim()])) };

      await api.post('/api/withdrawals', { amount: amt, accountId: cash?._id, ...destination });
      bumpWallet();
      reload();
      setReceipt({ amount: amt, method, walletType, to: method === 'crypto' ? crypto.address.trim() : wire.bankName });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- done ---------- */
  if (receipt) {
    return (
      <>
        <PageHeader eyebrow="Withdrawal" title="Withdrawal requested" />
        <DashReveal>
          <div className="card p-10 md:p-14 flex flex-col items-center text-center">
            <div className="dash-success-ring"><Check size={30} strokeWidth={2.5} /></div>
            <h3 className="display-sm text-[22px] mt-6">{fmtUSD(receipt.amount)} on its way</h3>
            <p className="text-[13.5px] mt-2 max-w-md text-[color:var(--muted)]">
              {receipt.method === 'crypto'
                ? `Paying out in ${receipt.walletType} to ${receipt.to.slice(0, 8)}…${receipt.to.slice(-8)}. The desk releases crypto payouts twice daily and emails you the transaction hash.`
                : `Wiring to ${receipt.to}. Wires are sent on the next banking cycle and normally land within one to three business days.`}
            </p>
            <p className="text-[12.5px] mt-4 text-[color:var(--muted-2)]">
              The amount has already been held against your balance, so it cannot be spent twice.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
              <button onClick={reset} className="btn-solid px-7 py-3">Make another withdrawal</button>
              <button onClick={() => navigate('/dashboard/activity')} className="btn-outline px-6 py-3 text-[13.5px]">
                View in Activity
              </button>
            </div>
          </div>
        </DashReveal>
      </>
    );
  }

  /* ---------- wizard ---------- */
  const destinationSummary = method === 'crypto'
    ? [
        ['Method', 'Crypto'],
        ['Wallet type', walletType],
        ['Wallet address', crypto.address.trim()],
      ]
    : [['Method', 'Wire transfer'], ...WIRE_FIELDS.map((f) => [f.label, wire[f.key].trim()])];

  return (
    <>
      <PageHeader
        eyebrow="Move out"
        title="Withdrawal"
        subtitle="Take your money out in crypto or by bank wire. No fee, no lock-up — the whole available balance is withdrawable."
      />

      <DashReveal>
        <BalanceBand cash={cash} others={others} held={held} min={min} />
      </DashReveal>

      <DashReveal delay={60}>
        <div className="card p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={step}>
            {/* ---------- 0 · method ---------- */}
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const on = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => pickMethod(m.id)}
                      className="text-left p-5 rounded-2xl transition-all"
                      style={{
                        background: on ? 'var(--accent-wash)' : 'var(--surface-2)',
                        border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule-soft)'}`,
                      }}
                    >
                      <span className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-wash)', color: 'var(--accent)' }}>
                        <Icon size={19} />
                      </span>
                      <p className="display-sm text-[17px] mt-4">{m.title}</p>
                      <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted)]">{m.blurb}</p>
                      <p className="text-[11px] tracking-[0.1em] uppercase mt-4 text-[color:var(--muted-2)]">{m.meta}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ---------- 1 · details ---------- */}
            {step === 1 && method === 'crypto' && (
              <div className="max-w-lg flex flex-col gap-4">
                <Field label="Crypto wallet type">
                  <select
                    value={crypto.walletType}
                    onChange={(e) => { setError(''); setCrypto((c) => ({ ...c, walletType: e.target.value })); }}
                    className="auth-field"
                  >
                    {WALLET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                {crypto.walletType === OTHER && (
                  <Field label="Which asset and network?">
                    <input
                      value={crypto.otherType}
                      onChange={(e) => { setError(''); setCrypto((c) => ({ ...c, otherType: e.target.value })); }}
                      placeholder="e.g. Polygon (MATIC)"
                      className="auth-field"
                    />
                  </Field>
                )}

                <Field label="Wallet address">
                  <input
                    value={crypto.address}
                    onChange={(e) => { setError(''); setCrypto((c) => ({ ...c, address: e.target.value })); }}
                    placeholder="Paste your receiving address"
                    spellCheck={false}
                    autoComplete="off"
                    className="auth-field num text-[12.5px]"
                  />
                </Field>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
                  style={{ background: 'color-mix(in srgb, var(--down) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--down) 28%, transparent)' }}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
                  <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                    Check the address and the network character by character. An on-chain transfer
                    cannot be reversed, and coins sent on the wrong network are gone for good.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && method === 'wire' && (
              <div className="max-w-2xl">
                <div className="grid sm:grid-cols-2 gap-4">
                  {WIRE_FIELDS.map((f) => (
                    <div key={f.key} className={f.wide ? 'sm:col-span-2' : undefined}>
                      <Field label={f.label}>
                        {f.lines ? (
                          <textarea
                            rows={f.lines}
                            value={wire[f.key]}
                            onChange={(e) => { setError(''); setWire((w) => ({ ...w, [f.key]: e.target.value })); }}
                            placeholder={f.placeholder}
                            className="auth-field"
                            style={{ resize: 'vertical', lineHeight: 1.5 }}
                          />
                        ) : (
                          <input
                            value={wire[f.key]}
                            onChange={(e) => {
                              setError('');
                              const v = f.upper ? e.target.value.toUpperCase() : e.target.value;
                              setWire((w) => ({ ...w, [f.key]: v }));
                            }}
                            placeholder={f.placeholder}
                            spellCheck={false}
                            autoComplete="off"
                            className={`auth-field${f.mono ? ' num text-[13px]' : ''}`}
                          />
                        )}
                      </Field>
                    </div>
                  ))}
                </div>
                <p className="text-[11.5px] leading-relaxed mt-4 text-[color:var(--muted-2)]">
                  All seven fields are required. Wires that are missing a SWIFT or routing number get
                  returned by the correspondent bank days later, minus their charges.
                </p>
              </div>
            )}

            {/* ---------- 2 · amount ---------- */}
            {step === 2 && (
              <div className="max-w-md">
                <label className="auth-label">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[color:var(--muted-2)]">$</span>
                  <input
                    autoFocus
                    value={amount}
                    onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="auth-field num"
                    style={{ fontSize: 26, paddingLeft: 36 }}
                  />
                </div>
                <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">
                  {fmtUSD(balance)} available · minimum {fmtUSD(min, { maximumFractionDigits: 0 })}
                </p>

                <div className="flex flex-wrap gap-2 mt-4" hidden={balance <= 0}>
                  {[0.25, 0.5, 0.75].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => { setError(''); setAmount(String(Math.floor(balance * pct * 100) / 100)); }}
                      className="dash-filter-chip"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                  <button
                    onClick={() => { setError(''); setAmount(String(balance)); }}
                    className="dash-filter-chip"
                  >
                    Withdraw all · {fmtUSD(balance, { maximumFractionDigits: 0 })}
                  </button>
                </div>

                {amt > 0 && amt <= balance && (
                  <div className="card-inset p-4 mt-5 flex items-center justify-between gap-4 text-[13px]">
                    <span className="text-[color:var(--muted-2)]">Balance afterwards</span>
                    <span className="num">{fmtUSD(balance - amt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ---------- 3 · review ---------- */}
            {step === 3 && (
              <div className="max-w-lg">
                <div className="card-inset p-6">
                  <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">Withdrawing</p>
                  <p className="display-md mt-1">{fmtUSD(amt)}</p>
                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-[color:var(--rule-soft)]">
                    <SummaryRow label="From" value={cash?.name || 'Cash Management'} />
                    {destinationSummary.map(([k, v]) => <SummaryRow key={k} label={k} value={v} />)}
                    <SummaryRow label="Fee" value="None" />
                    <SummaryRow
                      label="Released"
                      value={method === 'crypto' ? 'Twice daily, after review' : '1–3 business days, after review'}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mt-4"
                  style={{ background: 'color-mix(in srgb, var(--down) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--down) 28%, transparent)' }}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
                  <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                    Check the destination once more. {method === 'crypto'
                      ? 'On-chain transfers cannot be recalled once broadcast, and the network fee at the time of sending is deducted from the amount above.'
                      : 'A wire sent to the wrong account details can take weeks to recover, if it can be recovered at all.'}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-1.5 text-[12.5px] mt-5" style={{ color: 'var(--down)' }}>
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button onClick={back} className="btn-outline px-5 py-3 text-[13.5px]">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step > 0 && step < 3 && (
                <button onClick={next} className="btn-solid px-7 py-3 text-[13.5px]">
                  Continue <ArrowRight size={15} />
                </button>
              )}
              {step === 3 && (
                <button onClick={submit} disabled={busy} className="btn-solid px-7 py-3 text-[13.5px] disabled:opacity-60">
                  {busy ? 'Submitting…' : `Withdraw ${fmtUSD(amt)}`} <Check size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DashReveal>

      {/* recent requests */}
      {withdrawals.length > 0 && (
        <DashReveal delay={120}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={15} className="text-[color:var(--muted-2)]" />
              <p className="display-sm text-[15px]">Recent withdrawals</p>
            </div>
            <div className="flex flex-col">
              {withdrawals.slice(0, 5).map((t) => (
                <div key={t._id} className="dash-row flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] truncate">{t.label}</p>
                    <p className="text-[11.5px] mt-0.5 truncate text-[color:var(--muted-2)]">
                      {t.detail || t.method}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="num text-[13.5px]">{fmtUSD(Math.abs(t.amount))}</p>
                    <p className="text-[11px] mt-0.5 capitalize" style={{
                      color: t.status === 'completed' ? 'var(--up)'
                        : t.status === 'failed' ? 'var(--down)' : 'var(--accent)',
                    }}>
                      {t.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashReveal>
      )}
    </>
  );
}
