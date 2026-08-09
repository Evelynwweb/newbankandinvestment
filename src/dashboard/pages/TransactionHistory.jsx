import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download, Upload, CandlestickChart, Percent, Landmark,
  Gift, Users, Search, FileDown,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { fmtDateTime, fmtSigned } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const TYPE_ICON = {
  deposit: Download, withdraw: Upload, trade: CandlestickChart, interest: Percent,
  dividend: Percent, investment: Landmark, bonus: Gift, referral: Users,
};
const TYPE_COLOR = {
  deposit: 'var(--up)', withdraw: 'var(--accent-deep)', trade: 'var(--accent)',
  interest: 'var(--up)', dividend: 'var(--up)', investment: 'var(--accent-warm)',
  bonus: 'var(--up)', referral: 'var(--up)',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'deposit', label: 'Deposits' },
  { id: 'withdraw', label: 'Withdrawals' },
  { id: 'trade', label: 'Trades' },
  { id: 'investment', label: 'Investments' },
  { id: 'interest', label: 'Interest' },
  { id: 'referral', label: 'Referral' },
];

/* Escape a CSV cell — quotes doubled, whole field quoted. */
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function TransactionHistory() {
  const { walletVersion } = useOutletContext();
  const { data: transactions } = useApi('/api/transactions', [walletVersion]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    if (!transactions) return [];
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (!q) return true;
      return `${t.label} ${t.detail}`.toLowerCase().includes(q);
    });
  }, [transactions, filter, query]);

  if (!transactions) return <LoadingScreen inline />;

  const inflow = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const exportCsv = () => {
    const header = ['Date', 'Type', 'Description', 'Detail', 'Amount', 'Status'];
    const body = rows.map((t) => [
      new Date(t.createdAt).toISOString(), t.type, t.label, t.detail, t.amount.toFixed(2), t.status,
    ]);
    const csv = [header, ...body].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurivest-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Activity"
        subtitle="Every movement across your accounts — searchable and exportable."
      >
        <button onClick={exportCsv} className="btn-ghost text-[12.5px] px-4 py-2.5 flex items-center gap-1.5">
          <FileDown size={14} /> Export CSV
        </button>
      </PageHeader>

      <DashReveal className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Money in', value: fmtUSD(inflow), accent: 'var(--up)' },
          { label: 'Money out', value: fmtUSD(outflow), accent: 'var(--ink)' },
          { label: 'Entries shown', value: String(rows.length), accent: 'var(--ink)' },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-5">
            <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">{s.label}</p>
            <p className="font-mono text-[22px] mt-2.5 tabular-nums" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </DashReveal>

      <DashReveal delay={60}>
        <div className="card rounded-2xl p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="dash-search flex items-center gap-2.5 rounded-2xl px-4 py-2.5 flex-1 min-w-[200px]">
              <Search size={15} className="text-[color:var(--muted-2)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search descriptions…"
                className="bg-transparent outline-none text-[13.5px] w-full text-[color:var(--ink)] placeholder:text-[color:var(--muted-2)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`dash-filter-chip ${filter === f.id ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="text-[13px] text-[color:var(--muted-2)] py-12 text-center">
              Nothing matches that filter.
            </p>
          ) : (
            <>
              {/* desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">
                      <th className="pb-3 font-normal">Description</th>
                      <th className="pb-3 font-normal">Date</th>
                      <th className="pb-3 font-normal">Status</th>
                      <th className="pb-3 font-normal text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t) => {
                      const Icon = TYPE_ICON[t.type] || ArrowLeftRight;
                      return (
                        <tr key={t._id} className="dash-row border-t border-[color:var(--rule-soft)]">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="dash-activity-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                <Icon size={14} style={{ color: TYPE_COLOR[t.type] || 'var(--accent)' }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13.5px] text-[color:var(--ink)] truncate">{t.label}</p>
                                <p className="text-[11.5px] text-[color:var(--muted-2)] truncate">{t.detail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-[12.5px] text-[color:var(--muted-2)] whitespace-nowrap">{fmtDateTime(t.createdAt)}</td>
                          <td className="py-3.5">
                            <span
                              className="dash-risk-chip"
                              style={t.status === 'pending'
                                ? { background: 'rgba(245,158,11,0.14)', color: 'var(--accent)' }
                                : { background: 'rgba(52,211,153,0.12)', color: 'var(--up)' }}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className={`py-3.5 font-mono text-[13px] text-right whitespace-nowrap ${t.amount >= 0 ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>
                            {fmtSigned(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <div className="md:hidden flex flex-col gap-2.5">
                {rows.map((t) => {
                  const Icon = TYPE_ICON[t.type] || ArrowLeftRight;
                  return (
                    <div key={t._id} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--rule-soft)' }}>
                      <div className="dash-activity-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Icon size={15} style={{ color: TYPE_COLOR[t.type] || 'var(--accent)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[color:var(--ink)] truncate">{t.label}</p>
                        <p className="text-[11px] text-[color:var(--muted-2)] truncate">{t.detail}</p>
                        <p className="text-[10.5px] mt-0.5 text-[color:var(--muted-2)]">{fmtDateTime(t.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono text-[12.5px] ${t.amount >= 0 ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>{fmtSigned(t.amount)}</p>
                        {t.status === 'pending' && <p className="text-[10px] text-[color:var(--accent)]">pending</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DashReveal>
    </>
  );
}
