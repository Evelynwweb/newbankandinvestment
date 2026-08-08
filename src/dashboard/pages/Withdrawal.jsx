import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2, Zap, Check, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Clock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const STEPS = ['Destination', 'Amount', 'Confirm'];

const METHODS = [
  { id: 'Bank transfer', icon: Building2, speed: '1–2 business days', fee: 0 },
  { id: 'Same-day wire', icon: Zap, speed: 'Today, by 5pm', fee: 15 },
];

export default function Withdrawal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data, reload } = useApi('/api/accounts', [walletVersion]);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('Bank transfer');
  const [accountId, setAccountId] = useState('');
  const [destination, setDestination] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const verified = user?.kyc?.status === 'verified';

  if (!data) return <LoadingScreen inline />;

  const accounts = (data.accounts || []).filter((a) => a.kind !== 'brokerage');
  const source = accounts.find((a) => a._id === accountId) || accounts[0];
  const chosen = METHODS.find((m) => m.id === method) || METHODS[0];
  const amt = Number(amount) || 0;

  if (!verified) {
    return (
      <>
        <PageHeader eyebrow="Move out" title="Withdrawal" />
        <DashReveal>
          <div className="card rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <ShieldCheck size={28} className="text-[color:var(--accent)]" />
            </div>
            <h3 className="font-display text-[21px] font-semibold mt-5 text-[color:var(--ink)]">Verification required</h3>
            <p className="text-[13.5px] mt-2 max-w-sm leading-relaxed text-[color:var(--muted-2)]">
              Withdrawals open once your identity documents are approved. Most reviews finish
              within 24 hours of submission.
            </p>
            <button onClick={() => navigate('/dashboard/kyc')} className="btn-gold text-[13.5px] px-7 py-3 mt-7">
              {user?.kyc?.status === 'pending' ? 'Check verification status' : 'Verify my identity'}
            </button>
          </div>
        </DashReveal>
      </>
    );
  }

  const next = () => {
    if (step === 0 && destination.trim().length < 6) { setError('Enter the destination account number.'); return; }
    if (step === 1) {
      if (amt < 25) { setError('The minimum withdrawal is $25.'); return; }
      if (amt + chosen.fee > source.balance) { setError('That’s more than this account can cover, including the fee.'); return; }
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/api/withdrawals', { amount: amt, method, destination, accountId: source._id });
      bumpWallet();
      reload();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Withdrawal" title="Withdrawal requested" />
        <DashReveal>
          <div className="card rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
            <div className="dash-success-ring"><Check size={38} strokeWidth={3} /></div>
            <h3 className="font-display text-[22px] font-semibold mt-6 text-[color:var(--ink)]">{fmtUSD(amt)} on its way</h3>
            <p className="text-[13.5px] mt-2 max-w-sm leading-relaxed text-[color:var(--muted-2)]">
              Sent from {source.name} to ••••{destination.slice(-4)} via {method}. Expected {chosen.speed.toLowerCase()}.
            </p>
            <button onClick={() => { setDone(false); setStep(0); setAmount(''); }} className="btn-gold text-[13.5px] px-7 py-3 mt-7">
              Make another withdrawal
            </button>
          </div>
        </DashReveal>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Move out"
        title="Withdrawal"
        subtitle="Send money to a bank account in your name. The fee is shown before you confirm."
      />

      <DashReveal>
        <div className="card rounded-3xl p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={step}>
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="auth-label">Withdraw from</label>
                    <select value={source._id} onChange={(e) => setAccountId(e.target.value)} className="auth-field">
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name} — {fmtUSD(a.balance, { maximumFractionDigits: 0 })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="auth-label">Destination bank</label>
                    <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase Bank" className="auth-field" />
                  </div>
                  <div>
                    <label className="auth-label">Destination account number</label>
                    <input
                      value={destination}
                      onChange={(e) => { setError(''); setDestination(e.target.value.replace(/[^0-9]/g, '')); }}
                      placeholder="5540118293"
                      inputMode="numeric"
                      className="auth-field font-mono"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-3">How it travels</p>
                  <div className="flex flex-col gap-2.5">
                    {METHODS.map((m) => {
                      const selected = method === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-colors"
                          style={{
                            background: selected ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)',
                            border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule-soft)'}`,
                          }}
                        >
                          <m.icon size={17} className="text-[color:var(--accent)] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] text-[color:var(--ink)]">{m.id}</p>
                            <p className="text-[11px] flex items-center gap-1 text-[color:var(--muted-2)]"><Clock size={10} /> {m.speed}</p>
                          </div>
                          <span className="font-mono text-[12px] shrink-0 text-[color:var(--muted)]">
                            {m.fee === 0 ? 'Free' : fmtUSD(m.fee, { maximumFractionDigits: 0 })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-md">
                <label className="auth-label">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-[24px] text-[color:var(--muted-2)]">$</span>
                  <input
                    autoFocus
                    value={amount}
                    onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="auth-field font-display"
                    style={{ fontSize: 30, paddingLeft: 38, paddingTop: 14, paddingBottom: 14 }}
                  />
                </div>
                <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">
                  {fmtUSD(source.balance)} available in {source.name} &middot; minimum $25
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[100, 500, 2500].map((v) => (
                    <button key={v} onClick={() => { setError(''); setAmount(String(v)); }} className="dash-filter-chip">
                      ${v.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => { setError(''); setAmount(String(Math.max(0, source.balance - chosen.fee))); }}
                    className="dash-filter-chip"
                  >
                    Max
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md">
                <div className="card rounded-2xl p-6">
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">Withdrawing</p>
                  <p className="font-display text-[36px] font-semibold mt-1 text-[color:var(--ink)]">{fmtUSD(amt)}</p>

                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-[color:var(--rule)]">
                    {[
                      ['From', `${source.name} · ${ACCOUNT_META[source.kind]?.label}`],
                      ['To', `${bankName || 'External bank'} ····${destination.slice(-4)}`],
                      ['Method', method],
                      ['Arrives', chosen.speed],
                      ['Fee', chosen.fee === 0 ? 'Free' : fmtUSD(chosen.fee)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-4 text-[13px]">
                        <span className="text-[color:var(--muted-2)] shrink-0">{k}</span>
                        <span className="text-[color:var(--ink)] text-right">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--rule)]">
                    <span className="text-[13px] font-medium text-[color:var(--ink)]">Total debited</span>
                    <span className="font-mono text-[16px] font-semibold text-[color:var(--ink)]">{fmtUSD(amt + chosen.fee)}</span>
                  </div>
                </div>

                <p className="flex items-start gap-2 text-[11.5px] mt-4 leading-relaxed text-[color:var(--muted-2)]">
                  <ShieldCheck size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
                  Withdrawals go only to accounts in your own name. Double-check the destination — it can&rsquo;t be recalled once settled.
                </p>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-1.5 text-[12.5px] mt-5 text-[color:var(--down)]">
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => { setError(''); setStep((s) => s - 1); }} className="btn-ghost text-[13px] px-5 py-3 flex items-center gap-1.5">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={next} className="btn-gold text-[13.5px] px-7 py-3 flex items-center gap-1.5">
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={submit} disabled={busy} className="btn-gold text-[13.5px] px-7 py-3 flex items-center gap-1.5 disabled:opacity-60">
                  {busy ? 'Submitting…' : 'Confirm withdrawal'} <Check size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DashReveal>
    </>
  );
}
