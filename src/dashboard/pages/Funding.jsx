import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Check, Landmark, Info, AlertCircle } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Funding — the inbound half of the platform's banking surface.

   Clients wire to the platform's receiving account using their own
   reference, then log the transfer so the desk can match the credit.
   Nothing is credited until an admin confirms the money landed.
   ============================================================ */

function Row({ label, value, onCopy, copied }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[color:var(--rule-soft)] last:border-0">
      <span className="text-[12.5px] text-[color:var(--muted)] shrink-0">{label}</span>
      <span className="flex items-start gap-2.5 min-w-0">
        <span className="num text-[13px] text-right break-all">{value}</span>
        <button onClick={() => onCopy(label, value)} aria-label={`Copy ${label}`} className="shrink-0 mt-0.5 text-[color:var(--muted-2)] hover:text-[color:var(--accent)]">
          {copied === label ? <Check size={13} style={{ color: 'var(--up)' }} /> : <Copy size={13} />}
        </button>
      </span>
    </div>
  );
}

export default function Funding() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: instructions } = useApi('/api/bank/instructions', [walletVersion]);
  const { data: accountData } = useApi('/api/accounts', [walletVersion]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!instructions || !accountData) return <LoadingScreen inline />;

  const wire = instructions[active];
  const cash = accountData.accounts?.find((a) => a.kind === 'cash');

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* clipboard blocked — the value is on screen anyway */ }
  };

  const logTransfer = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/deposits', {
        amount: Number(amount),
        method: wire?.label || 'Bank wire',
        accountId: cash?._id,
      });
      setSent(true);
      setAmount('');
      bumpWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!wire) {
    return (
      <>
        <PageHeader eyebrow="Add funds" title="Funding" />
        <div className="card p-10 text-center">
          <Landmark size={22} className="mx-auto text-[color:var(--muted-2)]" />
          <p className="text-[13.5px] mt-3 text-[color:var(--muted)]">
            No funding routes are published yet. Contact the desk and we will send instructions.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Add funds"
        title="Funding"
        subtitle="Wire to the account below using your reference, then log the transfer so we can match it."
      />

      {instructions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {instructions.map((w, i) => (
            <button key={w._id} onClick={() => setActive(i)} className={`chip ${i === active ? 'active' : ''}`}>
              {w.label}
            </button>
          ))}
        </div>
      )}

      <DashReveal className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="display-sm">{wire.label}</p>
            <span className="tag">{wire.currency}</span>
          </div>

          <Row label="Account name" value={wire.accountName} onCopy={copy} copied={copied} />
          <Row label="Bank name" value={wire.bankName} onCopy={copy} copied={copied} />
          <Row label="Account number" value={wire.accountNumber} onCopy={copy} copied={copied} />
          <Row label="Routing number" value={wire.routingNumber} onCopy={copy} copied={copied} />
          <Row label="SWIFT code" value={wire.swiftCode} onCopy={copy} copied={copied} />
          <Row label="Bank address" value={wire.bankAddress} onCopy={copy} copied={copied} />
          <Row label="Beneficiary address" value={wire.beneficiaryAddress} onCopy={copy} copied={copied} />
          <Row label="Reference" value={wire.reference} onCopy={copy} copied={copied} />

          <div className="flex items-start gap-2.5 mt-5 p-3.5 rounded-xl" style={{ background: 'var(--accent-wash)' }}>
            <Info size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
            <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
              {wire.notes || 'Include your reference in the wire memo so the credit can be matched to your account.'}
            </p>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <p className="display-sm">Log your transfer</p>
          <p className="text-[13px] mt-2 text-[color:var(--muted)]">
            Tell us what you sent. The desk confirms the credit before it appears in your cash account.
          </p>

          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 py-10 flex-1 justify-center">
              <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--up) 12%, transparent)' }}>
                <Check size={22} style={{ color: 'var(--up)' }} />
              </span>
              <p className="text-[14px] font-semibold">Transfer logged</p>
              <p className="text-[12.5px] text-[color:var(--muted)] max-w-[240px]">
                We will credit your cash account as soon as the funds land.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline text-[13px] px-5 py-2.5 mt-2">Log another</button>
            </div>
          ) : (
            <form onSubmit={logTransfer} className="mt-6 flex flex-col flex-1">
              <label className="auth-label">Amount sent</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[color:var(--muted-2)]">$</span>
                <input
                  value={amount}
                  onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="auth-field num"
                  style={{ fontSize: 22, paddingLeft: 34 }}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {[1000, 5000, 25000].map((v) => (
                  <button key={v} type="button" onClick={() => setAmount(String(v))} className="dash-filter-chip">
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-[12.5px] mt-4" style={{ color: 'var(--down)' }}>
                  <AlertCircle size={13} /> {error}
                </p>
              )}

              <button type="submit" disabled={busy || !(Number(amount) > 0)} className="btn-solid w-full py-3.5 mt-auto disabled:opacity-50">
                {busy ? 'Logging…' : `Log ${fmtUSD(Number(amount) || 0)}`}
              </button>
            </form>
          )}
        </div>
      </DashReveal>

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        Only send from an account in your own name — third-party transfers are returned. Withdrawals
        go back to the bank account saved in Settings, which must be verified before the first payout.
      </p>
    </>
  );
}
