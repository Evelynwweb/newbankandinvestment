import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, AlertCircle, AlertTriangle, Wallet, ShieldCheck, Clock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Withdrawal — crypto only, to the saved payout wallet.

   The destination is never taken from this form. It comes from the
   verified address on the profile, so a compromised session cannot
   redirect a payout to a fresh address.
   ============================================================ */

const STEPS = ['Destination', 'Amount', 'Confirm'];

export default function Withdrawal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: accountData, reload } = useApi('/api/accounts', [walletVersion]);
  const { data: payout } = useApi('/api/payout', [walletVersion]);

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!accountData) return <LoadingScreen inline />;

  const cash = (accountData.accounts || []).find((a) => a.kind === 'cash');
  const amt = Number(amount) || 0;

  /* ---------- gates ---------- */
  if (!payout?.addressMasked) {
    return (
      <>
        <PageHeader eyebrow="Move out" title="Withdrawal" />
        <div className="card p-10 flex flex-col items-center text-center">
          <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-wash)' }}>
            <Wallet size={24} style={{ color: 'var(--accent)' }} />
          </span>
          <h3 className="display-sm text-[20px] mt-5">Add a payout wallet first</h3>
          <p className="text-[13.5px] mt-2 max-w-sm text-[color:var(--muted)]">
            Withdrawals only go to a wallet saved on your profile and approved by the desk. That is
            what stops a payout being redirected if your session is ever compromised.
          </p>
          <button onClick={() => navigate('/dashboard/settings')} className="btn-solid px-7 py-3 mt-7">
            Add payout wallet <ArrowRight size={15} />
          </button>
        </div>
      </>
    );
  }

  if (!payout.verified) {
    return (
      <>
        <PageHeader eyebrow="Move out" title="Withdrawal" />
        <div className="card p-10 flex flex-col items-center text-center">
          <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-wash)' }}>
            <Clock size={24} style={{ color: 'var(--accent)' }} />
          </span>
          <h3 className="display-sm text-[20px] mt-5">Payout wallet under review</h3>
          <p className="text-[13.5px] mt-2 max-w-sm text-[color:var(--muted)]">
            Your {payout.asset} address on {payout.network} is waiting for approval. This usually
            clears within a few hours, and only has to happen once per address.
          </p>
          <p className="num text-[12.5px] mt-5 text-[color:var(--muted-2)]">{payout.addressMasked}</p>
        </div>
      </>
    );
  }

  /* ---------- wizard ---------- */
  const next = () => {
    if (step === 1) {
      if (amt < 100) { setError('The minimum withdrawal is $100.'); return; }
      if (amt > (cash?.balance || 0)) { setError('That is more than your available cash.'); return; }
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/api/withdrawals', { amount: amt, accountId: cash?._id });
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
          <div className="card p-10 md:p-14 flex flex-col items-center text-center">
            <div className="dash-success-ring"><Check size={30} strokeWidth={2.5} /></div>
            <h3 className="display-sm text-[22px] mt-6">{fmtUSD(amt)} queued</h3>
            <p className="text-[13.5px] mt-2 max-w-sm text-[color:var(--muted)]">
              Sending {payout.asset} on {payout.network} to {payout.addressMasked}. The desk releases
              payouts twice daily; you will get the transaction hash by email.
            </p>
            <button onClick={() => { setDone(false); setStep(0); setAmount(''); }} className="btn-solid px-7 py-3 mt-7">
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
        subtitle="Paid in crypto to your verified wallet. Network fees are deducted from the amount sent."
      />

      <DashReveal>
        <div className="card p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={step}>
            {step === 0 && (
              <div className="max-w-lg">
                <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)] mb-3">
                  Verified payout wallet
                </p>
                <div className="card-inset p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="display-sm text-[17px]">{payout.asset}</p>
                      <p className="text-[12.5px] text-[color:var(--muted-2)]">{payout.network} network</p>
                    </div>
                    <span className="tag" style={{ borderColor: 'var(--up)', color: 'var(--up)' }}>
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>
                  <p className="num text-[13px] mt-4 pt-4 border-t border-[color:var(--rule-soft)] break-all">
                    {payout.addressMasked}
                  </p>
                  {payout.label && <p className="text-[12px] mt-2 text-[color:var(--muted-2)]">{payout.label}</p>}
                </div>
                <p className="text-[12px] mt-4 text-[color:var(--muted-2)]">
                  Sending somewhere else?{' '}
                  <button onClick={() => navigate('/dashboard/settings')} className="link-rule text-[12px]">
                    Change it in Settings
                  </button>{' '}
                  — a new address needs approving again.
                </p>
              </div>
            )}

            {step === 1 && (
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
                  {fmtUSD(cash?.balance || 0)} available in Cash Management · minimum $100
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[500, 2500, 10000].map((v) => (
                    <button key={v} onClick={() => { setError(''); setAmount(String(v)); }} className="dash-filter-chip">
                      ${v.toLocaleString()}
                    </button>
                  ))}
                  <button onClick={() => { setError(''); setAmount(String(cash?.balance || 0)); }} className="dash-filter-chip">
                    Max
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md">
                <div className="card-inset p-6">
                  <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">Withdrawing</p>
                  <p className="display-md mt-1">{fmtUSD(amt)}</p>
                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-[color:var(--rule-soft)]">
                    {[
                      ['Asset', payout.asset],
                      ['Network', payout.network],
                      ['To', payout.addressMasked],
                      ['From', 'Cash Management'],
                      ['Released', 'Twice daily, after review'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-4 text-[13px]">
                        <span className="text-[color:var(--muted-2)] shrink-0">{k}</span>
                        <span className="text-right break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mt-4"
                  style={{ background: 'color-mix(in srgb, var(--down) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--down) 28%, transparent)' }}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
                  <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                    On-chain transfers cannot be reversed once broadcast. The network fee at the time
                    of sending is deducted from the amount above.
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
                <button onClick={() => { setError(''); setStep((s) => s - 1); }} className="btn-outline px-5 py-3 text-[13.5px]">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={next} className="btn-solid px-7 py-3 text-[13.5px]">
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={submit} disabled={busy} className="btn-solid px-7 py-3 text-[13.5px] disabled:opacity-60">
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
