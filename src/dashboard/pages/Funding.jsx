import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Check, Wallet, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Funding — crypto only.

   Pick an asset and network, send to the address, then paste the
   transaction hash so the desk can verify it on-chain. Nothing is
   credited until that check passes; there is no auto-approval on a
   deposit the platform cannot yet see.
   ============================================================ */

const ASSET_TINT = {
  BTC: '#F7931A', ETH: '#8A92B2', USDT: '#26A17B', USDC: '#2775CA',
};

export default function Funding() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: wallets } = useApi('/api/wallets?scope=deposit', [walletVersion]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!wallets) return <LoadingScreen inline />;

  const wallet = wallets[active];

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* clipboard blocked — the value is on screen */ }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/deposits', {
        amount: Number(amount),
        walletId: wallet._id,
        txHash: txHash.trim(),
      });
      setSent(true);
      setAmount('');
      setTxHash('');
      bumpWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!wallet) {
    return (
      <>
        <PageHeader eyebrow="Add funds" title="Funding" />
        <div className="card p-10 text-center">
          <Wallet size={22} className="mx-auto text-[color:var(--muted-2)]" />
          <p className="text-[13.5px] mt-3 text-[color:var(--muted)]">
            No deposit wallets are published yet. Contact the desk and we will send an address.
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
        subtitle="Send crypto to the address below, then paste the transaction hash so we can confirm it on-chain."
      />

      {/* asset picker */}
      <DashReveal>
        <div className="flex flex-wrap gap-2">
          {wallets.map((w, i) => (
            <button
              key={w._id}
              onClick={() => { setActive(i); setSent(false); setError(''); }}
              className={`dash-filter-chip flex items-center gap-2 ${i === active ? 'active' : ''}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: ASSET_TINT[w.asset] || 'var(--accent)' }} />
              {w.asset} <span className="opacity-60">· {w.network}</span>
            </button>
          ))}
        </div>
      </DashReveal>

      <DashReveal delay={60} className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        {/* the address */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: `color-mix(in srgb, ${ASSET_TINT[wallet.asset] || 'var(--accent)'} 16%, transparent)`, color: ASSET_TINT[wallet.asset] || 'var(--accent)' }}>
                {wallet.asset.slice(0, 2)}
              </span>
              <div>
                <p className="display-sm">{wallet.name}</p>
                <p className="text-[12px] text-[color:var(--muted-2)]">{wallet.network} network</p>
              </div>
            </div>
            <span className="tag">Min {fmtUSD(wallet.minDeposit, { maximumFractionDigits: 0 })}</span>
          </div>

          {/* network warning — the single most expensive mistake a client can make */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5"
            style={{ background: 'color-mix(in srgb, var(--down) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--down) 30%, transparent)' }}>
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
            <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
              Send <strong>{wallet.asset}</strong> on the <strong>{wallet.network}</strong> network only.
              Anything sent on another network, or a different asset to this address, is permanently lost
              and cannot be recovered by us or anyone else.
            </p>
          </div>

          <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)] mb-2">
            Deposit address
          </p>
          <button
            onClick={() => copy('address', wallet.address)}
            className="w-full text-left card-inset p-4 flex items-start justify-between gap-3 group"
          >
            <span className="num text-[13px] break-all leading-relaxed">{wallet.address}</span>
            <span className="shrink-0 mt-0.5" style={{ color: copied === 'address' ? 'var(--up)' : 'var(--muted-2)' }}>
              {copied === 'address' ? <Check size={15} /> : <Copy size={15} />}
            </span>
          </button>

          {wallet.memo && (
            <>
              <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)] mt-5 mb-2">
                {wallet.memoLabel || 'Memo / destination tag'} — required
              </p>
              <button onClick={() => copy('memo', wallet.memo)} className="w-full text-left card-inset p-4 flex items-center justify-between gap-3">
                <span className="num text-[13px]">{wallet.memo}</span>
                <span style={{ color: copied === 'memo' ? 'var(--up)' : 'var(--muted-2)' }}>
                  {copied === 'memo' ? <Check size={15} /> : <Copy size={15} />}
                </span>
              </button>
            </>
          )}

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--rule-soft)] text-[12.5px]">
            <span className="text-[color:var(--muted-2)]">Credited after</span>
            <span>{wallet.confirmations}</span>
          </div>
        </div>

        {/* confirm the transfer */}
        <div className="card p-6 flex flex-col">
          <p className="display-sm">Confirm your transfer</p>
          <p className="text-[13px] mt-2 text-[color:var(--muted)]">
            Once sent, paste the transaction hash. We verify it on-chain before crediting.
          </p>

          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 py-10 flex-1 justify-center">
              <span className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--up) 12%, transparent)' }}>
                <Check size={22} style={{ color: 'var(--up)' }} />
              </span>
              <p className="text-[14px] font-semibold">Submitted for verification</p>
              <p className="text-[12.5px] text-[color:var(--muted)] max-w-[240px]">
                Your cash account is credited as soon as the transaction confirms on-chain.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline text-[13px] px-5 py-2.5 mt-2">
                Log another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col flex-1">
              <label className="auth-label">Amount sent (USD value)</label>
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

              <label className="auth-label mt-5">Transaction hash</label>
              <input
                value={txHash}
                onChange={(e) => { setError(''); setTxHash(e.target.value.trim()); }}
                placeholder="0x… or the chain's tx id"
                className="auth-field num text-[12.5px]"
              />

              {error && (
                <p className="flex items-center gap-1.5 text-[12.5px] mt-4" style={{ color: 'var(--down)' }}>
                  <AlertCircle size={13} /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !(Number(amount) > 0) || txHash.length < 10}
                className="btn-solid w-full py-3.5 mt-auto disabled:opacity-50"
              >
                {busy ? 'Submitting…' : 'Submit for verification'} <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </DashReveal>

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        Deposits are credited at the USD value confirmed by the desk at the time the transaction
        settles, which may differ from the value when you sent it. Send only from a wallet you control.
      </p>
    </>
  );
}
