import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Landmark, Home, Car, Briefcase, Coins, Check, X, ArrowRight, AlertCircle, Clock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const PRODUCT_ICON = { personal: Coins, auto: Car, mortgage: Home, business: Briefcase };

const STATUS_STYLE = {
  active: { bg: 'rgba(52,211,153,0.12)', color: 'var(--up)', label: 'Active' },
  pending: { bg: 'rgba(245,158,11,0.14)', color: 'var(--accent)', label: 'Under review' },
  closed: { bg: 'rgba(255,255,255,0.06)', color: 'var(--muted-2)', label: 'Closed' },
};

/* Standard amortising payment: P·r / (1 − (1+r)^−n) */
function monthlyPayment(principal, apr, months) {
  const r = apr / 100 / 12;
  if (!principal || !months) return 0;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function ApplyModal({ product, onClose, onDone }) {
  const [amount, setAmount] = useState(String(Math.min(10000, product.maxAmount)));
  const [term, setTerm] = useState(String(product.termMonths));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const amt = Number(amount) || 0;
  const months = Number(term) || product.termMonths;
  const payment = monthlyPayment(amt, product.apr, months);
  const totalInterest = payment * months - amt;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/loans', { productId: product.id, amount: amt, termMonths: months });
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
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--accent-soft)]">Apply</p>
            <h3 className="font-display text-[21px] font-semibold mt-1 text-[color:var(--ink)]">{product.name}</h3>
            <p className="text-[12px] mt-1 text-[color:var(--muted-2)]">From {product.apr}% APR</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
            <X size={18} />
          </button>
        </div>

        <div className="relative mt-6">
          <label className="auth-label">How much do you need?</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-[20px] text-[color:var(--muted-2)]">$</span>
            <input
              autoFocus
              value={amount}
              onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9]/g, '')); }}
              inputMode="numeric"
              className="auth-field font-display"
              style={{ fontSize: 24, paddingLeft: 34 }}
            />
          </div>
          <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">Up to {fmtUSD(product.maxAmount, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="relative mt-5">
          <label className="auth-label">Over how long?</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="auth-field">
            {[12, 24, 36, 60, 120, 360]
              .filter((m) => m <= product.termMonths)
              .map((m) => (
                <option key={m} value={m}>{m} months ({(m / 12).toFixed(0)} years)</option>
              ))}
          </select>
        </div>

        <div className="relative card rounded-2xl p-5 mt-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-[color:var(--muted-2)]">Estimated monthly payment</span>
            <span className="font-mono text-[17px] font-semibold text-[color:var(--ink)]">{fmtUSD(payment)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-[color:var(--muted-2)]">Total interest over term</span>
            <span className="font-mono text-[13px] text-[color:var(--muted)]">{fmtUSD(Math.max(0, totalInterest))}</span>
          </div>
          <p className="text-[11px] mt-1 leading-relaxed text-[color:var(--muted-2)]">
            An estimate at the headline rate. Your final rate depends on credit assessment and is
            confirmed in writing before anything is drawn.
          </p>
        </div>

        {error && (
          <p className="relative flex items-center gap-1.5 text-[12.5px] mt-4 text-[color:var(--down)]">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="relative btn-gold w-full text-[13.5px] px-6 py-3.5 mt-6 flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? 'Submitting…' : 'Submit application'} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}

export default function Loans() {
  const { walletVersion } = useOutletContext();
  const { data: products } = useApi('/api/loans/products');
  const { data: loans, reload } = useApi('/api/loans', [walletVersion]);
  const [active, setActive] = useState(null);
  const [flash, setFlash] = useState('');

  if (!products || !loans) return <LoadingScreen inline />;

  const outstanding = loans.filter((l) => l.status === 'active').reduce((s, l) => s + l.outstanding, 0);
  const monthlyDue = loans.filter((l) => l.status === 'active').reduce((s, l) => s + l.monthlyPayment, 0);

  const onApplied = () => {
    setActive(null);
    setFlash('Application received — we’ll come back to you within one business day.');
    setTimeout(() => setFlash(''), 5000);
    reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Borrow"
        title="Loans & Credit"
        subtitle="Fixed rates, no origination fee for Aurivest clients, and the full cost quoted before you sign."
      />

      {flash && (
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px]" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)', color: 'var(--up)' }}>
          <Check size={15} /> {flash}
        </div>
      )}

      <DashReveal className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Outstanding balance', value: fmtUSD(outstanding), icon: Landmark },
          { label: 'Due each month', value: fmtUSD(monthlyDue), icon: Clock },
          { label: 'Open facilities', value: String(loans.filter((l) => l.status === 'active').length), icon: Coins },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <s.icon size={14} className="text-[color:var(--accent)]" />
              </div>
            </div>
            <p className="font-mono text-[23px] mt-3 tabular-nums text-[color:var(--ink)]">{s.value}</p>
          </div>
        ))}
      </DashReveal>

      {loans.length > 0 && (
        <DashReveal delay={60}>
          <div className="card rounded-2xl p-5 md:p-6">
            <p className="font-display text-[16px] font-medium mb-4 text-[color:var(--ink)]">Your facilities</p>
            <div className="flex flex-col gap-4">
              {loans.map((loan) => {
                const paid = loan.principal > 0 ? 1 - loan.outstanding / loan.principal : 0;
                const st = STATUS_STYLE[loan.status] || STATUS_STYLE.closed;
                return (
                  <div key={loan._id} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--rule-soft)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-[color:var(--ink)]">{loan.product}</p>
                          <span className="dash-risk-chip" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        <p className="text-[11.5px] mt-0.5 text-[color:var(--muted-2)]">
                          {fmtUSD(loan.principal, { maximumFractionDigits: 0 })} at {loan.apr}% over {loan.termMonths} months
                          &middot; opened {fmtDate(loan.appliedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[15px] font-semibold text-[color:var(--ink)]">{fmtUSD(loan.outstanding)}</p>
                        <p className="text-[10.5px] text-[color:var(--muted-2)]">outstanding</p>
                      </div>
                    </div>

                    {loan.status === 'active' && (
                      <div className="mt-3">
                        <div className="dash-progress-track">
                          <div className="dash-progress-fill" style={{ width: `${paid * 100}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-[color:var(--muted-2)]">
                          <span>{Math.round(paid * 100)}% repaid</span>
                          <span>{fmtUSD(loan.monthlyPayment)} / month</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DashReveal>
      )}

      <DashReveal delay={110}>
        <h3 className="font-display text-[17px] font-medium text-[color:var(--ink)] mb-4">Available products</h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const Icon = PRODUCT_ICON[p.id] || Coins;
            return (
              <div key={p.id} className="dash-plan-card flex flex-col" data-held="false">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <Icon size={18} className="text-[color:var(--accent)]" />
                </div>
                <p className="font-display text-[16.5px] font-medium mt-4 text-[color:var(--ink)]">{p.name}</p>
                <p className="font-display text-[28px] font-semibold mt-2 leading-none text-[color:var(--accent)]">
                  {p.apr}<span className="text-[15px]">% APR</span>
                </p>
                <p className="text-[12.5px] mt-3 leading-relaxed flex-1 text-[color:var(--muted)]">{p.blurb}</p>
                <div className="flex items-center justify-between text-[11.5px] my-4 pt-4 border-t border-[color:var(--rule-soft)]">
                  <span className="text-[color:var(--muted-2)]">Up to</span>
                  <span className="font-mono text-[color:var(--ink)]">{fmtUSD(p.maxAmount, { maximumFractionDigits: 0 })}</span>
                </div>
                <button onClick={() => setActive(p)} className="dash-plan-btn" data-held="false">
                  Apply <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </DashReveal>

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        All credit is subject to approval and affordability assessment. Rates shown are the lowest
        available and depend on credit profile, term and collateral. Equal Housing Lender.
      </p>

      {active && <ApplyModal product={active} onClose={() => setActive(null)} onDone={onApplied} />}
    </>
  );
}
