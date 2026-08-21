import { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  Wallet, CandlestickChart, Landmark, Eye, EyeOff, Copy, Check,
  ArrowUpRight, Plus, Minus, X, AlertCircle,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Account — the whole position in one place.

   Three accounts, the self-directed positions, and the subscribed
   products. This replaces the separate Accounts / Holdings /
   Portfolio screens, which were three views of the same money.
   ============================================================ */

const KIND_ICON = { cash: Wallet, brokerage: CandlestickChart, retirement: Landmark };

function TradeModal({ mode, instruments, holdings, onClose, onDone }) {
  const buying = mode === 'buy';
  const list = buying ? instruments : holdings;
  const [symbol, setSymbol] = useState(list[0]?.symbol || '');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chosen = list.find((i) => i.symbol === symbol);
  const price = chosen?.price || 0;
  const value = Number(amount) || 0;
  const units = buying ? (price > 0 ? value / price : 0) : value;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (buying) await api.post('/api/holdings/buy', { symbol, amount: value });
      else await api.post('/api/holdings/sell', { symbol, units: value });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
      <div className="absolute inset-0" style={{ background: 'var(--scrim)' }} onClick={onClose} />
      <form onSubmit={submit} className="card-soft relative w-full max-w-[420px] p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">{buying ? 'Buy' : 'Sell'}</p>
            <h3 className="display-sm mt-2">{buying ? 'Place a buy order' : 'Sell a position'}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
            <X size={18} />
          </button>
        </div>

        <label className="auth-label mt-6">Symbol</label>
        <select value={symbol} onChange={(e) => { setError(''); setSymbol(e.target.value); }} className="auth-field">
          {list.map((i) => (
            <option key={i.symbol} value={i.symbol}>
              {i.symbol} — {i.name}{!buying ? ` (${i.units} held)` : ''}
            </option>
          ))}
        </select>

        <label className="auth-label mt-5">{buying ? 'Amount to invest' : 'Units to sell'}</label>
        <input
          autoFocus
          value={amount}
          onChange={(e) => { setError(''); setAmount(e.target.value.replace(/[^0-9.]/g, '')); }}
          inputMode="decimal"
          placeholder={buying ? '1000.00' : '0.000000'}
          className="auth-field num"
        />

        {chosen && value > 0 && (
          <div className="card-inset p-4 mt-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[color:var(--muted)]">Mark</span>
              <span className="num">{fmtUSD(price)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[color:var(--muted)]">{buying ? 'Units acquired' : 'Proceeds'}</span>
              <span className="num font-semibold">{buying ? units.toFixed(6) : fmtUSD(value * price)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-[12.5px] mt-4" style={{ color: 'var(--down)' }}>
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <button type="submit" disabled={busy || !(value > 0)} className="btn-solid w-full py-3.5 mt-6 disabled:opacity-50">
          {busy ? 'Placing…' : buying ? `Buy ${fmtUSD(value)}` : `Sell ${units.toFixed(4)} units`}
        </button>
        <p className="text-[11.5px] mt-3 leading-relaxed text-[color:var(--muted-2)]">
          Orders settle at the published mark. Betamint carries no live market feed — marks are set
          by the desk and may differ from an exchange print.
        </p>
      </form>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data: accountData, reload: reloadAccounts } = useApi('/api/accounts', [walletVersion]);
  const { data: holdingData, reload: reloadHoldings } = useApi('/api/holdings', [walletVersion]);
  const { data: investments } = useApi('/api/investments', [walletVersion]);
  const { data: instruments } = useApi('/api/holdings/instruments');
  const { data: overview } = useApi('/api/dashboard/overview', [walletVersion]);
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(null);
  const [mode, setMode] = useState(null);

  if (!accountData || !holdingData || !investments || !instruments || !overview) return <LoadingScreen inline />;

  const accounts = accountData.accounts || [];
  const { holdings = [], marketValue = 0, costBasis = 0 } = holdingData;
  const activeSubs = investments.filter((i) => i.status === 'active');
  const gain = marketValue - costBasis;

  /* Same three figures as the overview, read from the same endpoint so the
     two screens can never disagree. */
  const FIGURES = [
    { label: 'Total deposits', value: overview.totalDeposits, note: 'Receipts approved and credited' },
    { label: 'Total profit', value: overview.totalProfit, note: 'Interest, dividends and accrued returns', tone: 'var(--up)' },
    { label: 'Total investments', value: overview.totalInvestment, note: 'Subscribed products and positions' },
  ];

  const copyNumber = async (acct) => {
    try {
      await navigator.clipboard.writeText(acct.number);
      setCopied(acct._id);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* clipboard blocked */ }
  };

  const tradeDone = () => {
    setMode(null);
    bumpWallet();
    reloadHoldings();
    reloadAccounts();
  };

  return (
    <>
      <PageHeader
        eyebrow="Your position"
        title="Account"
        subtitle="Every account, position and subscription you hold with Betamint."
      >
        <button onClick={() => setHidden((v) => !v)} className="btn-outline text-[12.5px] px-4 py-2.5">
          {hidden ? <Eye size={14} /> : <EyeOff size={14} />} {hidden ? 'Show' : 'Hide'} values
        </button>
      </PageHeader>

      <DashReveal className="grid sm:grid-cols-3 gap-3">
        {FIGURES.map((f) => (
          <div key={f.label} className="card p-6">
            <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">{f.label}</p>
            <p className="num text-[24px] mt-2.5" style={{ color: f.tone || 'var(--ink)' }}>
              {hidden ? '••••••' : fmtUSD(f.value || 0)}
            </p>
            <p className="text-[11.5px] mt-1.5 text-[color:var(--muted-2)]">{f.note}</p>
          </div>
        ))}
      </DashReveal>

      {/* the three accounts */}
      {/* <DashReveal delay={60} className="grid md:grid-cols-3 gap-4">
        {accounts.map((a) => {
          const Icon = KIND_ICON[a.kind] || Wallet;
          const meta = ACCOUNT_META[a.kind] || {};
          return (
            <div key={a._id} className="card p-6">
              <div className="flex items-start justify-between">
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-wash)' }}>
                  <Icon size={18} strokeWidth={1.7} style={{ color: meta.color || 'var(--accent)' }} />
                </span>
                {a.apy > 0 && <span className="tag tag-accent">{a.apy.toFixed(2)}% APY</span>}
              </div>
              <p className="display-sm mt-5">{a.name}</p>
              <p className="text-[11.5px] text-[color:var(--muted-2)]">{meta.label}</p>
              <p className="num text-[24px] mt-4">{hidden ? '••••••' : fmtUSD(a.balance)}</p>
              <button onClick={() => copyNumber(a)} className="flex items-center gap-2 mt-3 text-[12px] text-[color:var(--muted-2)] hover:text-[color:var(--ink)] transition-colors">
                <span className="num">•••• {a.number.slice(-4)}</span>
                {copied === a._id ? <Check size={12} style={{ color: 'var(--up)' }} /> : <Copy size={12} />}
              </button>
              <p className="text-[11px] mt-4 pt-4 border-t border-[color:var(--rule-soft)] text-[color:var(--muted-2)]">
                Opened {fmtDate(a.openedAt)}
              </p>
            </div>
          );
        })}
      </DashReveal> */}

      {/* self-directed positions */}
      <DashReveal delay={100}>
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-[color:var(--rule)]">
            <div>
              <p className="display-sm">Positions</p>
              <p className="text-[12.5px] mt-1 text-[color:var(--muted-2)]">
                {hidden ? '••••' : fmtUSD(marketValue)} market value
                {costBasis > 0 && (
                  <span style={{ color: gain >= 0 ? 'var(--up)' : 'var(--down)' }}>
                    {' · '}{gain >= 0 ? '+' : ''}{hidden ? '••••' : fmtUSD(gain)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('buy')} className="btn-solid text-[12.5px] px-4 py-2.5">
                <Plus size={14} /> Buy
              </button>
              <button onClick={() => setMode('sell')} disabled={!holdings.length}
                className="btn-outline text-[12.5px] px-4 py-2.5 disabled:opacity-40">
                <Minus size={14} /> Sell
              </button>
            </div>
          </div>

          {holdings.length === 0 ? (
            <p className="text-[13px] text-[color:var(--muted-2)] py-12 text-center px-6">
              No positions yet — buy a slice of any name on the shelf from five dollars up.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Position</th><th>Units</th><th>Mark</th>
                    <th className="text-right">Value</th><th className="text-right">Unrealised</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h._id}>
                      <td>
                        <p className="text-[14px] font-semibold">{h.symbol}</p>
                        <p className="text-[12px] text-[color:var(--muted-2)]">{h.name}</p>
                      </td>
                      <td className="num text-[13px]">{h.units}</td>
                      <td className="num text-[13px]">{fmtUSD(h.price)}</td>
                      <td className="num text-[13.5px] text-right">{hidden ? '••••' : fmtUSD(h.marketValue)}</td>
                      <td className="num text-[13px] text-right" style={{ color: h.gain >= 0 ? 'var(--up)' : 'var(--down)' }}>
                        {h.gain >= 0 ? '+' : ''}{hidden ? '••••' : fmtUSD(h.gain)}
                        <span className="block text-[11px] opacity-80">{h.gainPct >= 0 ? '+' : ''}{h.gainPct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashReveal>

      {/* subscribed products */}
      <DashReveal delay={140}>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--rule)]">
            <p className="display-sm">Subscribed products</p>
            <Link to="/dashboard/invest" className="link-rule text-[12.5px]">
              Add a product <ArrowUpRight size={13} />
            </Link>
          </div>

          {activeSubs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
              <p className="text-[13px] max-w-xs text-[color:var(--muted)]">
                Nothing subscribed yet. Cash Management pays 4.65% with no lock-up.
              </p>
              <button onClick={() => navigate('/dashboard/invest')} className="btn-solid text-[12.5px] px-5 py-2.5 mt-1">
                Browse the shelf
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Product</th><th>Rate</th><th>Principal</th>
                    <th className="text-right">Accrued</th><th>Matures</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubs.map((inv) => (
                    <tr key={inv._id}>
                      <td className="text-[14px]">{inv.planName}</td>
                      <td className="num text-[13px]" style={{ color: 'var(--accent)' }}>{inv.rate}%</td>
                      <td className="num text-[13px]">{hidden ? '••••' : fmtUSD(inv.principal)}</td>
                      <td className="num text-[13px] text-right" style={{ color: 'var(--up)' }}>
                        +{hidden ? '••••' : fmtUSD(inv.accrued || 0)}
                      </td>
                      <td className="text-[12.5px] text-[color:var(--muted-2)]">
                        {inv.maturesAt ? fmtDate(inv.maturesAt) : 'No lock-up'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashReveal>

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        Investments are not deposits, are not insured, and may lose value. Accrued figures build
        daily at the stated rate and are credited at maturity or month end.
      </p>

      {mode && (
        <TradeModal
          mode={mode}
          instruments={instruments}
          holdings={holdings}
          onClose={() => setMode(null)}
          onDone={tradeDone}
        />
      )}
    </>
  );
}
