import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, X, ArrowRight, AlertCircle, TrendingUp, Clock, Layers } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, RISK_COLOR, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   The shelf — six families, twenty-two products.

   Everything is funded from the cash account. Products whose kind is
   'holding' are bought on the Holdings screen instead, so they link
   across rather than opening a subscription form.
   ============================================================ */

/* Simple annualised projection — how these mandates are quoted. */
const project = (amount, rate, termMonths) => amount * (1 + (rate / 100) * ((termMonths || 12) / 12));

function SubscribeModal({ product, accounts, onClose, onDone }) {
  const [amount, setAmount] = useState(String(product.min || 100));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const amt = Number(amount) || 0;
  const cash = accounts.find((a) => a.kind === 'cash');
  const projected = project(amt, product.rate, product.termMonths);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/investments', { productId: product.id, amount: amt });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
      <div className="absolute inset-0" style={{ background: 'var(--scrim)' }} onClick={onClose} />
      <form onSubmit={submit} className="card-soft relative w-full max-w-[430px] p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">{product.familyName}</p>
            <h3 className="display-sm mt-2">{product.name}</h3>
            <p className="text-[12.5px] mt-1 text-[color:var(--muted-2)]">
              {product.termMonths ? `${product.termMonths}-month term` : 'No lock-up'}
              {product.rate > 0 ? ` · ${product.rate}% target` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
            <X size={18} />
          </button>
        </div>

        <label className="auth-label mt-6">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[color:var(--muted-2)]">$</span>
          <input
            autoFocus
            value={amount}
            onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
            inputMode="decimal"
            className="auth-field num"
            style={{ fontSize: 22, paddingLeft: 34 }}
          />
        </div>
        <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">
          Minimum {fmtUSD(product.min, { maximumFractionDigits: 0 })} · funded from{' '}
          {cash ? `${cash.name} (${fmtUSD(cash.balance, { maximumFractionDigits: 0 })} available)` : 'your cash account'}
        </p>

        {product.rate > 0 && amt > 0 && (
          <div className="card-inset p-4 mt-5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[color:var(--muted)]">
                Projected at {product.termMonths ? `${product.termMonths} months` : '12 months'}
              </span>
              <span className="num text-[15px] font-semibold" style={{ color: 'var(--up)' }}>{fmtUSD(projected)}</span>
            </div>
            <p className="text-[11px] mt-2 leading-relaxed text-[color:var(--muted-2)]">
              A projection at the stated target, not a guarantee. Capital in market-linked products
              can lose value.
            </p>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-[12.5px] mt-4" style={{ color: 'var(--down)' }}>
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy || !(amt > 0)} className="btn-solid w-full py-3.5 mt-6 disabled:opacity-50">
          {busy ? 'Subscribing…' : `Invest ${fmtUSD(amt, { maximumFractionDigits: 0 })}`} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}

export default function Invest() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: families } = useApi('/api/investments/families');
  const { data: mine, reload } = useApi('/api/investments', [walletVersion]);
  const { data: accountData, reload: reloadAccounts } = useApi('/api/accounts', [walletVersion]);
  const [active, setActive] = useState(null);
  const [family, setFamily] = useState('all');
  const [flash, setFlash] = useState('');

  if (!families || !mine || !accountData) return <LoadingScreen inline />;

  const accounts = accountData.accounts || [];
  const held = new Set(mine.filter((i) => i.status === 'active').map((i) => i.planId));
  const activeRows = mine.filter((i) => i.status === 'active');
  const principal = activeRows.reduce((s, i) => s + i.principal, 0);
  const accrued = activeRows.reduce((s, i) => s + (i.accrued || 0), 0);

  const shown = family === 'all' ? families : families.filter((f) => f.id === family);

  const onSubscribed = () => {
    setActive(null);
    setFlash('Subscription confirmed — it is already accruing.');
    setTimeout(() => setFlash(''), 4000);
    bumpWallet();
    reload();
    reloadAccounts();
  };

  return (
    <>
      <PageHeader
        eyebrow="The shelf"
        title="Invest"
        subtitle="Six families, from treasury bills to private credit. Every rate, term and risk band stated before you commit."
      />

      {flash && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px]"
          style={{ background: 'color-mix(in srgb, var(--up) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--up) 35%, transparent)', color: 'var(--up)' }}>
          <Check size={15} /> {flash}
        </div>
      )}

      <DashReveal className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Subscribed principal', value: fmtUSD(principal), icon: Layers },
          { label: 'Accrued to date', value: fmtUSD(accrued), icon: TrendingUp, tone: 'var(--up)' },
          { label: 'Active subscriptions', value: String(activeRows.length), icon: Clock },
        ].map((s) => (
          <div key={s.label} className="dash-figure">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">{s.label}</p>
              <s.icon size={14} className="text-[color:var(--accent)]" strokeWidth={1.7} />
            </div>
            <p className="num text-[22px] mt-2" style={{ color: s.tone || 'var(--ink)' }}>{s.value}</p>
          </div>
        ))}
      </DashReveal>

      <DashReveal delay={60}>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFamily('all')} className={`dash-filter-chip ${family === 'all' ? 'active' : ''}`}>
            All families
          </button>
          {families.map((f) => (
            <button key={f.id} onClick={() => setFamily(f.id)} className={`dash-filter-chip ${family === f.id ? 'active' : ''}`}>
              {f.name}
            </button>
          ))}
        </div>
      </DashReveal>

      {shown.map((f, fi) => (
        <DashReveal key={f.id} delay={70 + fi * 40}>
          <div className="flex items-baseline justify-between gap-4 mt-2 mb-4">
            <div>
              <h3 className="display-sm">{f.name}</h3>
              <p className="text-[12.5px] mt-1 text-[color:var(--muted-2)]">{f.blurb}</p>
            </div>
            {f.premium && <span className="tag tag-accent shrink-0">Premium tier</span>}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {f.products.map((p) => {
              const isHeld = held.has(p.id);
              const isHolding = p.kind === 'holding';
              return (
                <div key={p.id} className="dash-plan-card" data-held={isHeld}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="display-sm text-[16.5px]">{p.name}</p>
                    <span className="dash-risk-chip shrink-0"
                      style={{ background: `color-mix(in srgb, ${RISK_COLOR[p.risk] || 'var(--muted)'} 14%, transparent)`, color: RISK_COLOR[p.risk] || 'var(--muted)' }}>
                      {p.risk}
                    </span>
                  </div>

                  {p.rate > 0 ? (
                    <>
                      <p className="num text-[30px] font-semibold mt-4 leading-none" style={{ color: 'var(--accent)' }}>
                        {p.rate}<span className="text-[17px]">%</span>
                      </p>
                      <p className="text-[11px] mt-1 text-[color:var(--muted-2)]">
                        {p.termMonths ? `target over ${p.termMonths} months` : 'annualised, no lock-up'}
                      </p>
                    </>
                  ) : (
                    <p className="num text-[17px] font-semibold mt-4" style={{ color: 'var(--accent)' }}>
                      {isHolding ? 'You choose' : 'Advisory'}
                    </p>
                  )}

                  <p className="text-[13px] mt-4 leading-relaxed flex-1 text-[color:var(--muted)]">{p.blurb}</p>

                  <div className="flex items-center justify-between text-[11.5px] mt-4 mb-4 pt-4 border-t border-[color:var(--rule-soft)]">
                    <span className="text-[color:var(--muted-2)]">Minimum</span>
                    <span className="num">{p.min > 0 ? fmtUSD(p.min, { maximumFractionDigits: 0 }) : 'None'}</span>
                  </div>

                  {isHolding ? (
                    <a href="/dashboard/holdings" className="dash-plan-btn" data-held="false">
                      Trade on Holdings <ArrowRight size={14} />
                    </a>
                  ) : (
                    <button onClick={() => setActive({ ...p, familyName: f.name })} className="dash-plan-btn" data-held={isHeld}>
                      {isHeld ? <><Check size={14} /> Add more</> : <>Invest <ArrowRight size={14} /></>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </DashReveal>
      ))}

      <DashReveal delay={140}>
        <div className="card p-5 md:p-6">
          <p className="display-sm mb-4">Your subscriptions</p>
          {activeRows.length === 0 ? (
            <p className="text-[13px] text-[color:var(--muted-2)] py-8 text-center">
              Nothing subscribed yet — Cash Management pays 4.65% with no lock-up.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeRows.map((inv) => {
                const start = new Date(inv.startedAt).getTime();
                const end = inv.maturesAt ? new Date(inv.maturesAt).getTime() : null;
                const pct = end ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) : null;
                return (
                  <div key={inv._id} className="card-inset p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold">{inv.planName}</p>
                        <p className="text-[11.5px] text-[color:var(--muted-2)]">
                          {fmtUSD(inv.principal)} at {inv.rate}%
                          {inv.maturesAt ? ` · matures ${fmtDate(inv.maturesAt)}` : ' · no lock-up'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="num text-[15px] font-semibold" style={{ color: 'var(--up)' }}>+{fmtUSD(inv.accrued || 0)}</p>
                        <p className="text-[10.5px] text-[color:var(--muted-2)]">accrued</p>
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="mt-3">
                        <div className="dash-progress-track"><div className="dash-progress-fill" style={{ width: `${pct * 100}%` }} /></div>
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

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        Investments are not deposits, are not insured, and may lose value. Target returns are
        objectives, not guarantees, and fixed-term products return principal only if closed early.
      </p>

      {active && (
        <SubscribeModal product={active} accounts={accounts} onClose={() => setActive(null)} onDone={onSubscribed} />
      )}
    </>
  );
}
