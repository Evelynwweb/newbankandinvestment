import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Landmark, TrendingUp, Wallet, ArrowUpRight, PiggyBank, Scale,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const KIND_ICON = { checking: Wallet, savings: PiggyBank, investment: Landmark };

export default function Portfolio() {
  const navigate = useNavigate();
  const { walletVersion } = useOutletContext();
  const { data } = useApi('/api/portfolio', [walletVersion]);

  if (!data) return <LoadingScreen inline />;

  const { investments = [], accounts = [], totalPrincipal = 0, totalAccrued = 0, netWorth = 0 } = data;
  const returnPct = totalPrincipal > 0 ? (totalAccrued / totalPrincipal) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow="Position"
        title="Portfolio"
        subtitle="Everything you hold with Aurivest, and what each piece has earned."
      />

      <DashReveal>
        <div className="card rounded-3xl p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">Net worth with Aurivest</p>
          <p className="font-display text-[40px] md:text-[52px] font-semibold leading-none mt-2 text-[color:var(--ink)]">
            {fmtUSD(netWorth)}
          </p>
          <p className="text-[12px] mt-2 text-[color:var(--muted-2)]">Total account value less outstanding credit.</p>

          <div className="grid sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-[color:var(--rule-soft)]">
            {[
              { label: 'Invested principal', value: fmtUSD(totalPrincipal) },
              { label: 'Earned to date', value: `+${fmtUSD(totalAccrued)}`, accent: true },
              { label: 'Return on invested', value: `${returnPct.toFixed(2)}%`, accent: true },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">{s.label}</p>
                <p className={`font-mono text-[22px] mt-1.5 ${s.accent ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={60}>
        <div className="card rounded-2xl p-5 md:p-6">
          <p className="font-display text-[16px] font-medium mb-4 text-[color:var(--ink)]">Accounts</p>
          <div className="flex flex-col">
            {accounts.map((a) => {
              const Icon = KIND_ICON[a.kind] || Wallet;
              const meta = ACCOUNT_META[a.kind] || {};
              return (
                <div key={a._id} className="dash-row flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl">
                  <div className="dash-activity-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <Icon size={15} style={{ color: meta.color || 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[color:var(--ink)] truncate">{a.name}</p>
                    <p className="text-[11.5px] text-[color:var(--muted-2)]">
                      {meta.label} &middot; ••••{a.number.slice(-4)}
                      {a.apy > 0 ? ` · ${a.apy.toFixed(2)}% ${a.kind === 'investment' ? 'trailing 1y' : 'APY'}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-[14px] shrink-0 text-[color:var(--ink)]">{fmtUSD(a.balance)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={110}>
        <div className="card rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-[16px] font-medium text-[color:var(--ink)]">Holdings</p>
            <button onClick={() => navigate('/dashboard/invest')} className="text-[12px] text-[color:var(--accent-soft)] flex items-center gap-0.5">
              Add a mandate <ArrowUpRight size={13} />
            </button>
          </div>

          {investments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Scale size={22} className="text-[color:var(--muted-2)]" />
              <p className="text-[13px] max-w-xs text-[color:var(--muted-2)]">
                No mandates yet. Reserve Savings pays 4.65% with no lock-up — a reasonable first step.
              </p>
              <button onClick={() => navigate('/dashboard/invest')} className="btn-gold text-[12.5px] px-5 py-2.5 mt-1">Browse plans</button>
            </div>
          ) : (
            <>
              {/* desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)]">
                      <th className="pb-3 font-normal">Mandate</th>
                      <th className="pb-3 font-normal">Rate</th>
                      <th className="pb-3 font-normal">Principal</th>
                      <th className="pb-3 font-normal">Earned</th>
                      <th className="pb-3 font-normal">Matures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv._id} className="dash-row border-t border-[color:var(--rule-soft)]">
                        <td className="py-3.5 text-[13.5px] text-[color:var(--ink)]">{inv.planName}</td>
                        <td className="py-3.5 font-mono text-[13px] text-[color:var(--accent)]">{inv.rate}%</td>
                        <td className="py-3.5 font-mono text-[13px] text-[color:var(--ink)]">{fmtUSD(inv.principal)}</td>
                        <td className="py-3.5 font-mono text-[13px] text-[color:var(--up)]">+{fmtUSD(inv.accrued || 0)}</td>
                        <td className="py-3.5 text-[12.5px] text-[color:var(--muted-2)]">
                          {inv.maturesAt ? fmtDate(inv.maturesAt) : 'Flexible'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <div className="md:hidden flex flex-col gap-3">
                {investments.map((inv) => (
                  <div key={inv._id} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--rule-soft)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-[13.5px] text-[color:var(--ink)]">{inv.planName}</p>
                      <span className="font-mono text-[12px] text-[color:var(--accent)]">{inv.rate}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[12px]">
                      <span className="text-[color:var(--muted-2)]">Principal</span>
                      <span className="font-mono text-[color:var(--ink)]">{fmtUSD(inv.principal)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[12px]">
                      <span className="text-[color:var(--muted-2)]">Earned</span>
                      <span className="font-mono text-[color:var(--up)]">+{fmtUSD(inv.accrued || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[12px]">
                      <span className="text-[color:var(--muted-2)]">Matures</span>
                      <span className="text-[color:var(--ink)]">{inv.maturesAt ? fmtDate(inv.maturesAt) : 'Flexible'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DashReveal>

      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        <TrendingUp size={14} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
        Earned figures accrue daily at the mandate&rsquo;s stated rate and are credited at maturity or
        month end. Market-linked mandates may lose value.
      </p>
    </>
  );
}
