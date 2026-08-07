import { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight, Send, Check, ArrowRight, ArrowLeft, Zap, Building2,
  Globe, AlertCircle, ShieldCheck,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const STEPS = ['Where to', 'Amount', 'Review'];

/* Rails available for money leaving Aurivest. Cost and speed are always
   shown before the transfer is confirmed — no surprise deductions. */
const RAILS = [
  { id: 'ACH', label: 'ACH transfer', icon: Building2, fee: 0, speed: '1–2 business days' },
  { id: 'Wire', label: 'Same-day wire', icon: Zap, fee: 15, speed: 'Today, by 5pm' },
  { id: 'SWIFT', label: 'International wire', icon: Globe, fee: 25, speed: '2–4 business days' },
];

export default function Transfers() {
  const location = useLocation();
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data, reload } = useApi('/api/accounts', [walletVersion]);

  const [scope, setScope] = useState('internal');
  const [step, setStep] = useState(0);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [rail, setRail] = useState('ACH');
  const [recipient, setRecipient] = useState({ name: '', bank: '', number: '', nickname: '' });
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Arriving from a "Send" button on the Accounts page — jump straight to the
  // external flow with that recipient filled in.
  const preselected = location.state?.beneficiaryId;
  useEffect(() => {
    if (!preselected || !data) return;
    const b = (data.beneficiaries || []).find((x) => x._id === preselected);
    if (!b) return;
    setScope('external');
    setRecipient({ name: b.name, bank: b.bank, number: b.number, nickname: b.nickname || '' });
  }, [preselected, data]);

  if (!data) return <LoadingScreen inline />;

  const accounts = data.accounts || [];
  const beneficiaries = data.beneficiaries || [];
  const from = accounts.find((a) => a._id === fromId) || accounts[0];
  const to = accounts.find((a) => a._id === toId);
  const railInfo = RAILS.find((r) => r.id === rail) || RAILS[0];
  const amt = Number(amount) || 0;
  const fee = scope === 'internal' ? 0 : railInfo.fee;

  const destinationReady = scope === 'internal'
    ? !!(from && to && from._id !== to._id)
    : !!(recipient.name.trim() && recipient.number.trim());

  const amountReady = amt > 0 && from && amt + fee <= from.balance;

  const next = () => {
    if (step === 0 && !destinationReady) {
      setError(scope === 'internal' ? 'Pick two different accounts.' : 'Add the recipient’s name and account number.');
      return;
    }
    if (step === 1 && !amountReady) {
      setError(amt <= 0 ? 'Enter an amount to send.' : 'That’s more than this account can cover, including the fee.');
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/api/accounts/transfer', {
        scope,
        fromAccountId: from._id,
        toAccountId: to?._id,
        amount: amt,
        rail,
        note,
        recipientName: recipient.name,
        recipientBank: recipient.bank,
        recipientNumber: recipient.number,
        nickname: recipient.nickname,
        saveBeneficiary,
      });
      bumpWallet();
      reload();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setDone(false); setStep(0); setAmount(''); setNote('');
    setRecipient({ name: '', bank: '', number: '', nickname: '' });
    setSaveBeneficiary(false);
  };

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Transfers" title="Transfer submitted" />
        <DashReveal>
          <div className="card dash-surface rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
            <div className="dash-success-ring"><Check size={38} strokeWidth={3} /></div>
            <h3 className="font-display text-[22px] font-semibold mt-6 text-[color:var(--ink)]">
              {fmtUSD(amt)} on its way
            </h3>
            <p className="text-[13.5px] mt-2 max-w-sm leading-relaxed text-[color:var(--muted-2)]">
              {scope === 'internal'
                ? `Moved from ${from.name} to ${to.name}. Instant, and free.`
                : `Sent to ${recipient.name} via ${railInfo.label}. Expected ${railInfo.speed.toLowerCase()}.`}
            </p>
            <button onClick={restart} className="btn-gold text-[13.5px] px-7 py-3 mt-7">Make another transfer</button>
          </div>
        </DashReveal>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Move money"
        title="Transfers"
        subtitle="Instant and free between your own accounts. Every external fee is shown before you confirm."
      />

      <DashReveal>
        <div className="dash-segment max-w-md">
          {[
            { id: 'internal', label: 'Between my accounts' },
            { id: 'external', label: 'To someone else' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { setScope(s.id); setStep(0); setError(''); }}
              className={`dash-segment-btn ${scope === s.id ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </DashReveal>

      <DashReveal delay={60}>
        <div className="card dash-surface rounded-3xl p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={`${scope}-${step}`}>
            {/* ---------- step 0: destination ---------- */}
            {step === 0 && scope === 'internal' && (
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: 'From', value: from?._id, onChange: setFromId },
                  { label: 'To', value: to?._id ?? '', onChange: setToId },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-3">{field.label}</p>
                    <div className="flex flex-col gap-2.5">
                      {accounts.map((a) => {
                        const selected = field.value === a._id;
                        const meta = ACCOUNT_META[a.kind];
                        return (
                          <button
                            key={a._id}
                            onClick={() => { setError(''); field.onChange(a._id); }}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                            style={{
                              background: selected ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)',
                              border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule-soft)'}`,
                            }}
                          >
                            <div className="min-w-0">
                              <p className="text-[13.5px] text-[color:var(--ink)] truncate">{a.name}</p>
                              <p className="text-[11px] text-[color:var(--muted-2)]">{meta?.label} &middot; ••••{a.number.slice(-4)}</p>
                            </div>
                            <span className="font-mono text-[12.5px] shrink-0 text-[color:var(--muted)]">
                              {fmtUSD(a.balance, { maximumFractionDigits: 0 })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 0 && scope === 'external' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="auth-label">Recipient name</label>
                    <input value={recipient.name} onChange={(e) => { setError(''); setRecipient((r) => ({ ...r, name: e.target.value })); }} placeholder="Daniel Okafor" className="auth-field" />
                  </div>
                  <div>
                    <label className="auth-label">Bank</label>
                    <input value={recipient.bank} onChange={(e) => setRecipient((r) => ({ ...r, bank: e.target.value }))} placeholder="Chase Bank" className="auth-field" />
                  </div>
                  <div>
                    <label className="auth-label">Account number</label>
                    <input value={recipient.number} onChange={(e) => { setError(''); setRecipient((r) => ({ ...r, number: e.target.value.replace(/[^0-9]/g, '') })); }} placeholder="5540118293" className="auth-field font-mono" inputMode="numeric" />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={saveBeneficiary} onChange={(e) => setSaveBeneficiary(e.target.checked)} className="accent-[color:var(--accent)]" />
                    <span className="text-[12.5px] text-[color:var(--muted)]">Save this recipient for next time</span>
                  </label>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-3">How it travels</p>
                  <div className="flex flex-col gap-2.5">
                    {RAILS.map((r) => {
                      const selected = rail === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setRail(r.id)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                          style={{
                            background: selected ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)',
                            border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule-soft)'}`,
                          }}
                        >
                          <r.icon size={17} className="text-[color:var(--accent)] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] text-[color:var(--ink)]">{r.label}</p>
                            <p className="text-[11px] text-[color:var(--muted-2)]">{r.speed}</p>
                          </div>
                          <span className="font-mono text-[12px] shrink-0 text-[color:var(--muted)]">
                            {r.fee === 0 ? 'Free' : fmtUSD(r.fee, { maximumFractionDigits: 0 })}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {beneficiaries.length > 0 && (
                    <>
                      <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mt-6 mb-3">Saved recipients</p>
                      <div className="flex flex-wrap gap-2">
                        {beneficiaries.map((b) => (
                          <button
                            key={b._id}
                            onClick={() => { setError(''); setRecipient({ name: b.name, bank: b.bank, number: b.number, nickname: b.nickname || '' }); }}
                            className="dash-filter-chip"
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ---------- step 1: amount ---------- */}
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
                  Sending from {from?.name} &middot; {fmtUSD(from?.balance || 0)} available
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[100, 500, 1000, 5000].map((v) => (
                    <button key={v} onClick={() => { setError(''); setAmount(String(v)); }} className="dash-filter-chip">
                      ${v.toLocaleString()}
                    </button>
                  ))}
                  <button onClick={() => { setError(''); setAmount(String(Math.max(0, (from?.balance || 0) - fee))); }} className="dash-filter-chip">
                    Max
                  </button>
                </div>

                <div className="mt-6">
                  <label className="auth-label">Reference (optional)</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Rent · March" className="auth-field" />
                </div>
              </div>
            )}

            {/* ---------- step 2: review ---------- */}
            {step === 2 && (
              <div className="max-w-md">
                <div className="card-grad rounded-2xl p-6">
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">You’re sending</p>
                  <p className="font-display text-[36px] font-semibold mt-1 text-[color:var(--ink)]">{fmtUSD(amt)}</p>

                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-[color:var(--rule)]">
                    {[
                      ['From', from?.name],
                      ['To', scope === 'internal' ? to?.name : `${recipient.name} · ${recipient.bank || 'External bank'}`],
                      ['Method', scope === 'internal' ? 'Instant internal transfer' : railInfo.label],
                      ['Arrives', scope === 'internal' ? 'Immediately' : railInfo.speed],
                      ['Fee', fee === 0 ? 'Free' : fmtUSD(fee)],
                      ['Reference', note || '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-4 text-[13px]">
                        <span className="text-[color:var(--muted-2)] shrink-0">{k}</span>
                        <span className="text-[color:var(--ink)] text-right">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--rule)]">
                    <span className="text-[13px] font-medium text-[color:var(--ink)]">Total debited</span>
                    <span className="font-mono text-[16px] font-semibold text-[color:var(--ink)]">{fmtUSD(amt + fee)}</span>
                  </div>
                </div>

                <p className="flex items-start gap-2 text-[11.5px] mt-4 leading-relaxed text-[color:var(--muted-2)]">
                  <ShieldCheck size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
                  Check the recipient details carefully — transfers to an external account can’t be recalled once settled.
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
                  {busy ? 'Sending…' : 'Confirm transfer'} <Send size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={120}>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: ArrowLeftRight, title: 'Internal transfers', body: 'Instant and free, any hour, any day — including weekends.' },
            { icon: Building2, title: 'ACH transfers', body: 'Free to any US bank account, settling in one to two business days.' },
            { icon: Globe, title: 'International wires', body: 'The full cost is quoted up front — no hidden exchange-rate spread.' },
          ].map((c) => (
            <div key={c.title} className="card dash-surface rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <c.icon size={16} className="text-[color:var(--accent)]" />
              </div>
              <p className="text-[14px] font-medium mt-3.5 text-[color:var(--ink)]">{c.title}</p>
              <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted-2)]">{c.body}</p>
            </div>
          ))}
        </div>
      </DashReveal>
    </>
  );
}
