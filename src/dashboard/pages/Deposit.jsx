import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building2, Zap, Landmark, Camera, Check, ArrowRight, ArrowLeft,
  AlertCircle, Copy, Clock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const STEPS = ['Method', 'Amount', 'Confirm'];

const METHODS = [
  { id: 'Linked bank', icon: Building2, speed: '1–2 business days', fee: 'Free', body: 'Pull funds from a bank account you’ve linked to Aurivest.' },
  { id: 'Incoming wire', icon: Zap, speed: 'Same business day', fee: 'Free', body: 'Wire from any bank using the details we generate for you.' },
  { id: 'Direct deposit', icon: Landmark, speed: 'Up to 2 days early', fee: 'Free', body: 'Route your salary here and get paid up to two days early.' },
  { id: 'Mobile check', icon: Camera, speed: '1–3 business days', fee: 'Free', body: 'Photograph a paper check and deposit it from your phone.' },
];

export default function Deposit() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data, reload } = useApi('/api/accounts', [walletVersion]);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('Linked bank');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return <LoadingScreen inline />;

  const accounts = (data.accounts || []).filter((a) => a.kind !== 'investment');
  const target = accounts.find((a) => a._id === accountId) || accounts[0];
  const chosen = METHODS.find((m) => m.id === method);
  const amt = Number(amount) || 0;

  const next = () => {
    if (step === 1 && amt < 50) { setError('The minimum deposit is $50.'); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/api/deposits', { amount: amt, method, accountId: target._id });
      bumpWallet();
      reload();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(
        `Aurivest Bank & Trust\nRouting: 021000021\nAccount: ${target.number}\nBeneficiary account: ${target.name}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — the details are on screen anyway
    }
  };

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Deposit" title="Deposit received" />
        <DashReveal>
          <div className="card rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
            <div className="dash-success-ring"><Check size={38} strokeWidth={3} /></div>
            <h3 className="font-display text-[22px] font-semibold mt-6 text-[color:var(--ink)]">{fmtUSD(amt)} added</h3>
            <p className="text-[13.5px] mt-2 max-w-sm leading-relaxed text-[color:var(--muted-2)]">
              Credited to {target.name} via {method}. It&rsquo;s available to spend, transfer or invest right away.
            </p>
            <button onClick={() => { setDone(false); setStep(0); setAmount(''); }} className="btn-gold text-[13.5px] px-7 py-3 mt-7">
              Make another deposit
            </button>
          </div>
        </DashReveal>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Add funds"
        title="Deposit"
        subtitle="Incoming transfers are always free. Pick the route that suits your timing."
      />

      <DashReveal>
        <div className="card rounded-3xl p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={step}>
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {METHODS.map((m) => {
                  const selected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="flex flex-col text-left p-5 rounded-2xl transition-colors"
                      style={{
                        background: selected ? 'rgba(245,158,11,0.09)' : 'var(--surface-2)',
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule-soft)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                          <m.icon size={16} className="text-[color:var(--accent)]" />
                        </div>
                        {selected && <Check size={16} className="text-[color:var(--accent)]" />}
                      </div>
                      <p className="text-[14.5px] font-medium mt-3.5 text-[color:var(--ink)]">{m.id}</p>
                      <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted-2)]">{m.body}</p>
                      <div className="flex items-center gap-4 mt-3.5 text-[11.5px]">
                        <span className="flex items-center gap-1 text-[color:var(--muted)]"><Clock size={11} /> {m.speed}</span>
                        <span className="text-[color:var(--up)]">{m.fee}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="max-w-md">
                <label className="auth-label">Deposit into</label>
                <select value={target._id} onChange={(e) => setAccountId(e.target.value)} className="auth-field">
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} — {ACCOUNT_META[a.kind]?.label}{a.apy > 0 ? ` · ${a.apy.toFixed(2)}% APY` : ''}
                    </option>
                  ))}
                </select>

                <label className="auth-label mt-5">Amount</label>
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
                <p className="text-[11.5px] mt-2 text-[color:var(--muted-2)]">Minimum deposit $50.</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[250, 1000, 5000, 25000].map((v) => (
                    <button key={v} onClick={() => { setError(''); setAmount(String(v)); }} className="dash-filter-chip">
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md">
                <div className="card rounded-2xl p-6">
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">Depositing</p>
                  <p className="font-display text-[36px] font-semibold mt-1 text-[color:var(--ink)]">{fmtUSD(amt)}</p>

                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-[color:var(--rule)]">
                    {[
                      ['Into', target.name],
                      ['Method', method],
                      ['Available', chosen.speed],
                      ['Fee', chosen.fee],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[13px]">
                        <span className="text-[color:var(--muted-2)]">{k}</span>
                        <span className="text-[color:var(--ink)]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {method === 'Incoming wire' && (
                  <div className="card rounded-2xl p-5 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">Send your wire to</p>
                      <button onClick={copyDetails} className="flex items-center gap-1.5 text-[11.5px] text-[color:var(--accent)]">
                        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    {[
                      ['Bank', 'Aurivest Bank & Trust'],
                      ['Routing', '021000021'],
                      ['Account', target.number],
                      ['Beneficiary', target.name],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between py-1 text-[12.5px]">
                        <span className="text-[color:var(--muted-2)]">{k}</span>
                        <span className="font-mono text-[color:var(--ink)]">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                  {busy ? 'Processing…' : 'Confirm deposit'} <Check size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DashReveal>
    </>
  );
}
