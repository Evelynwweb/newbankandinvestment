import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PiggyBank, Check, X, TrendingUp, Clock, ShieldCheck, AlertCircle, ArrowRight,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, RISK_COLOR, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* Projected value at the end of a plan's term — simple annualised interest,
   which is how these mandates are quoted. Flexible plans project one year. */
function project(amount, rate, termMonths) {
  const years = (termMonths || 12) / 12;
  return amount * (1 + (rate / 100) * years);
}

function SubscribeModal({ plan, accounts, onClose, onDone }) {
  const [amount, setAmount] = useState(String(plan.min));
  const [fromId, setFromId] = useState(accounts[0]?._id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const amt = Number(amount) || 0;
  const from = accounts.find((a) => a._id === fromId);
  const projected = project(amt, plan.rate, plan.termMonths);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/investments', { planId: plan.id, amount: amt, fromAccountId: fromId });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/75" style={{ animation: 'dashFadeIn 0.3s ease both' }} onClick={onClose} />
      <form
        onSubmit={submit}
        className="card relative w-full max-w-[440px] rounded-3xl p-7 overflow-hidden"
        style={{ animation: 'dashModalIn 0.4s cubic-bezier(.16,1,.3,1) both' }}
      >
        <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--accent)' }} />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--accent-soft)]">Subscribe</p>
            <h3 className="font-display text-[21px] font-semibold mt-1 text-[color:var(--ink)]">{plan.name}</h3>
            <p className="text-[12px] mt-1 text-[color:var(--muted-2)]">{plan.horizon} &middot; {plan.rate}% target</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
            <X size={18} />
          </button>
        </div>

        <div className="relative mt-6">
          <label className="auth-label">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-[20px] text-[color:var(--muted-2)]">$</span>
            <input
              autoFocus
              value={amount}
              onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
              inputMode="decimal"
              className="auth-field font-display"
              style={{ fontSize: 24, paddingLeft: 34 }}
            />
          </div>
          <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">Minimum {fmtUSD(plan.min, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="relative mt-5">
          <label className="auth-label">Fund from</label>
          <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="auth-field">
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} — {fmtUSD(a.balance, { maximumFractionDigits: 0 })}
              </option>
            ))}
          </select>
          {from && amt > from.balance && (
            <p className="text-[11.5px] mt-2 text-[color:var(--down)]">That’s more than this account can cover.</p>
          )}
        </div>

        <div className="relative card rounded-2xl p-5 mt-6">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-[color:var(--muted-2)]">Projected at {plan.termMonths ? `${plan.termMonths} months` : '12 months'}</span>
            <span className="font-mono text-[15px] font-semibold text-[color:var(--up)]">{fmtUSD(projected)}</span>
          </div>
          <p className="text-[11px] mt-2 leading-relaxed text-[color:var(--muted-2)]">
            A projection at the stated target rate, not a guarantee. Actual returns vary and
            capital in market-linked mandates can lose value.
          </p>
        </div>

        {error && (
          <p className="relative flex items-center gap-1.5 text-[12.5px] mt-4 text-[color:var(--down)]">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="relative btn-gold w-full text-[13.5px] px-6 py-3.5 mt-6 flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? 'Subscribing…' : `Invest ${fmtUSD(amt, { maximumFractionDigits: 0 })}`} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}

export default function Invest() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: plans } = useApi('/api/investments/plans');
  const { data: mine, reload } = useApi('/api/investments', [walletVersion]);
  const { data: accountData, reload: reloadAccounts } = useApi('/api/accounts', [walletVersion]);
  const [active, setActive] = useState(null);
  const [flash, setFlash] = useState('');

  if (!plans || !mine || !accountData) return <LoadingScreen inline />;

  const accounts = accountData.accounts || [];
  const heldIds = new Set(mine.filter((i) => i.status === 'active').map((i) => i.planId));
  const totalPrincipal = mine.filter((i) => i.status === 'active').reduce((s, i) => s + i.principal, 0);
  const totalAccrued = mine.filter((i) => i.status === 'active').reduce((s, i) => s + (i.accrued || 0), 0);

  const onSubscribed = () => {
    setActive(null);
    setFlash('Subscription confirmed — it’s already earning.');
    setTimeout(() => setFlash(''), 4000);
    bumpWallet();
    reload();
    reloadAccounts();
  };

  return (
    <>
      <PageHeader
        eyebrow="Grow"
        title="Invest"
        subtitle="Savings and portfolio mandates, priced transparently. Every rate, term and risk band is stated before you commit."
      />

      {flash && (
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px]" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)', color: 'var(--up)' }}>
          <Check size={15} /> {flash}
        </div>
      )}

      <DashReveal className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total invested', value: fmtUSD(totalPrincipal), icon: PiggyBank },
          { label: 'Earned so far', value: fmtUSD(totalAccrued), icon: TrendingUp, accent: true },
          { label: 'Active mandates', value: String(mine.filter((i) => i.status === 'active').length), icon: Clock },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <s.icon size={14} className="text-[color:var(--accent)]" />
              </div>
            </div>
            <p className={`font-mono text-[23px] mt-3 tabular-nums ${s.accent ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>{s.value}</p>
          </div>
        ))}
      </DashReveal>

      <DashReveal delay={60}>
        <h3 className="font-display text-[17px] font-medium text-[color:var(--ink)] mb-4">Available plans</h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const held = heldIds.has(plan.id);
            return (
              <div key={plan.id} className="dash-plan-card flex flex-col" data-held={held}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[17px] font-medium text-[color:var(--ink)]">{plan.name}</p>
                    <p className="text-[11.5px] mt-0.5 text-[color:var(--muted-2)]">{plan.horizon}</p>
                  </div>
                  <span
                    className="dash-risk-chip shrink-0"
                    style={{ background: `color-mix(in srgb, ${RISK_COLOR[plan.risk]} 14%, transparent)`, color: RISK_COLOR[plan.risk] }}
                  >
                    {plan.risk}
                  </span>
                </div>

                <p className="font-display text-[34px] font-semibold mt-4 leading-none text-[color:var(--accent)]">
                  {plan.rate}<span className="text-[18px]">%</span>
                </p>
                <p className="text-[11px] mt-1 text-[color:var(--muted-2)]">
                  {plan.termMonths ? 'target over term' : 'APY, variable'}
                </p>

                <p className="text-[12.5px] mt-4 leading-relaxed flex-1 text-[color:var(--muted)]">{plan.blurb}</p>

                <div className="flex items-center justify-between text-[11.5px] mt-4 mb-4 pt-4 border-t border-[color:var(--rule-soft)]">
                  <span className="text-[color:var(--muted-2)]">Minimum</span>
                  <span className="font-mono text-[color:var(--ink)]">{fmtUSD(plan.min, { maximumFractionDigits: 0 })}</span>
                </div>

                <button
                  onClick={() => setActive(plan)}
                  className="dash-plan-btn"
                  data-held={held}
                >
                  {held ? <><Check size={14} /> Add more</> : <>Invest now <ArrowRight size={14} /></>}
                </button>
              </div>
            );
          })}
        </div>
      </DashReveal>

      <DashReveal delay={120}>
        <div className="card rounded-2xl p-5 md:p-6">
          <p className="font-display text-[16px] font-medium mb-4 text-[color:var(--ink)]">Your mandates</p>

          {mine.length === 0 ? (
            <p className="text-[12.5px] text-[color:var(--muted-2)] py-8 text-center">
              Nothing subscribed yet — pick a plan above to put idle cash to work.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {mine.map((inv) => {
                const start = new Date(inv.startedAt).getTime();
                const end = inv.maturesAt ? new Date(inv.maturesAt).getTime() : null;
                const pct = end ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) : null;
                return (
                  <div key={inv._id} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--rule-soft)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-medium text-[color:var(--ink)]">{inv.planName}</p>
                        <p className="text-[11.5px] text-[color:var(--muted-2)]">
                          {fmtUSD(inv.principal)} at {inv.rate}%
                          {inv.maturesAt ? ` · matures ${fmtDate(inv.maturesAt)}` : ' · flexible, no lock-up'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[15px] font-semibold text-[color:var(--up)]">+{fmtUSD(inv.accrued || 0)}</p>
                        <p className="text-[10.5px] text-[color:var(--muted-2)]">earned to date</p>
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="mt-3">
                        <div className="dash-progress-track">
                          <div className="dash-progress-fill" style={{ width: `${pct * 100}%` }} />
                        </div>
                        <p className="text-[10.5px] mt-1.5 text-[color:var(--muted-2)]">{Math.round(pct * 100)}% through its term</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashReveal>

      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        <ShieldCheck size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
        Savings products are insured to the applicable statutory limit. Market-linked mandates are
        not deposits, are not insured, and may lose value. Target rates are not guarantees.
      </p>

      {active && (
        <SubscribeModal
          plan={active}
          accounts={accounts}
          onClose={() => setActive(null)}
          onDone={onSubscribed}
        />
      )}
    </>
  );
}
