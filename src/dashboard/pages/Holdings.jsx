import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CandlestickChart, Plus, Minus, X, AlertCircle, Check } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

/* ============================================================
   Self-directed, fractional and crypto positions.

   Holdings-only by design: no order book, no live feed. A buy or sell
   settles immediately at the platform's published mark, and the cash
   account is debited or credited in the same movement.
   ============================================================ */

const KIND_LABEL = { equity: 'Equity', etf: 'ETF', crypto: 'Crypto' };

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
  const proceeds = buying ? value : value * price;

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
              <span className="num font-semibold">
                {buying ? units.toFixed(6) : fmtUSD(proceeds)}
              </span>
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
          Orders settle immediately at the published mark. Aurivest carries no live market feed —
          marks are set by the desk and may differ from an exchange print.
        </p>
      </form>
    </div>
  );
}

export default function Holdings() {
  const { walletVersion, bumpWallet } = useOutletContext();
  const { data, reload } = useApi('/api/holdings', [walletVersion]);
  const { data: instruments } = useApi('/api/holdings/instruments');
  const [mode, setMode] = useState(null);
  const [flash, setFlash] = useState('');

  if (!data || !instruments) return <LoadingScreen inline />;

  const { holdings = [], marketValue = 0, costBasis = 0 } = data;
  const gain = marketValue - costBasis;
  const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  const done = (verb) => {
    setMode(null);
    setFlash(`${verb} filled.`);
    setTimeout(() => setFlash(''), 4000);
    bumpWallet();
    reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Self-directed"
        title="Holdings"
        subtitle="Your own positions in equities, ETFs and digital assets. Commission-free."
      >
        <div className="flex gap-2">
          <button onClick={() => setMode('buy')} className="btn-solid text-[13px] px-5 py-2.5">
            <Plus size={14} /> Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            disabled={!holdings.length}
            className="btn-outline text-[13px] px-5 py-2.5 disabled:opacity-40"
          >
            <Minus size={14} /> Sell
          </button>
        </div>
      </PageHeader>

      {flash && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px]"
          style={{ background: 'color-mix(in srgb, var(--up) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--up) 35%, transparent)', color: 'var(--up)' }}>
          <Check size={15} /> {flash}
        </div>
      )}

      <DashReveal className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Market value', value: fmtUSD(marketValue) },
          { label: 'Cost basis', value: fmtUSD(costBasis) },
          { label: 'Unrealised', value: `${gain >= 0 ? '+' : ''}${fmtUSD(gain)}`, sub: `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(2)}%`, tone: gain >= 0 ? 'var(--up)' : 'var(--down)' },
        ].map((s) => (
          <div key={s.label} className="dash-figure">
            <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">{s.label}</p>
            <p className="num text-[22px] mt-2" style={{ color: s.tone || 'var(--ink)' }}>{s.value}</p>
            {s.sub && <p className="text-[11.5px] mt-1" style={{ color: s.tone }}>{s.sub}</p>}
          </div>
        ))}
      </DashReveal>

      <DashReveal delay={70}>
        <div className="card overflow-hidden">
          {holdings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
              <CandlestickChart size={22} className="text-[color:var(--muted-2)]" />
              <p className="text-[13.5px] max-w-xs text-[color:var(--muted)]">
                No positions yet. Buy a slice of any name on the shelf from five dollars up.
              </p>
              <button onClick={() => setMode('buy')} className="btn-solid text-[13px] px-5 py-2.5 mt-1">Place your first order</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Position</th><th>Units</th><th>Mark</th>
                    <th className="text-right">Market value</th><th className="text-right">Unrealised</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h._id}>
                      <td>
                        <p className="text-[14px] font-semibold">{h.symbol}</p>
                        <p className="text-[12px] text-[color:var(--muted-2)]">{h.name} · {KIND_LABEL[h.kind]}</p>
                      </td>
                      <td className="num text-[13px]">{h.units}</td>
                      <td className="num text-[13px]">{fmtUSD(h.price)}</td>
                      <td className="num text-[13.5px] text-right">{fmtUSD(h.marketValue)}</td>
                      <td className="num text-[13px] text-right" style={{ color: h.gain >= 0 ? 'var(--up)' : 'var(--down)' }}>
                        {h.gain >= 0 ? '+' : ''}{fmtUSD(h.gain)}
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

      <p className="text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        Positions are held in your brokerage account. Digital assets sit in segregated institutional
        custody. Nothing on this page is a deposit, none of it is insured, and it may lose value.
      </p>

      {mode && (
        <TradeModal
          mode={mode}
          instruments={instruments}
          holdings={holdings}
          onClose={() => setMode(null)}
          onDone={() => done(mode === 'buy' ? 'Buy' : 'Sell')}
        />
      )}
    </>
  );
}
