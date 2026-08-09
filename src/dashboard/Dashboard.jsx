import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowLeftRight, ChevronRight, Download, Upload, Send,
  Eye, EyeOff, Percent, Landmark, CreditCard, Users, Gift, ShieldCheck,
  AlertTriangle, PiggyBank,
} from 'lucide-react';
import { fmtUSD, DashReveal, buildAreaPath } from './data.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useApi } from '../lib/useApi.js';
import { timeAgo, fmtSigned } from '../lib/format.js';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import Notice from './components/Notice.jsx';

/* ============================================================
   Overview — one balance, then the supporting figures as a plain
   row. The 3D swipeable stat carousel is gone; on a phone this is
   a single card and a four-cell grid, which is the whole point.
   ============================================================ */

/* ---------- the one balance card ---------- */
function BalanceCard({ overview, name, hidden, onToggle }) {
  const navigate = useNavigate();
  const pct = overview.changePct?.['1M'] ?? 0;

  return (
    <div className="dash-balance">
      <span className="dash-balance-mark" aria-hidden="true">A</span>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10.5px] tracking-[0.2em] uppercase" style={{ color: 'rgba(251,247,239,.5)' }}>
            Available balance
          </p>
          <p className="dash-balance-figure text-[46px] sm:text-[62px] mt-3.5">
            {hidden ? '••••••' : fmtUSD(overview.balance)}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-[13px]" style={{ color: 'rgba(251,247,239,.62)' }}>
              Cash Management
            </span>
            {pct !== 0 && (
              <span
                className="inline-flex items-center gap-1.5 num text-[12px] px-2.5 py-1 rounded-full"
                style={{
                  color: pct >= 0 ? '#7BE0A6' : '#F1978E',
                  background: pct >= 0 ? 'rgba(123,224,166,.11)' : 'rgba(241,151,142,.11)',
                }}
              >
                {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}% this month
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onToggle}
          aria-label={hidden ? 'Show balances' : 'Hide balances'}
          className="dash-balance-btn shrink-0"
          style={{ padding: '9px 12px' }}
        >
          {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
      </div>

      <div className="dash-balance-rule my-7" />

      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={() => navigate('/dashboard/invest')} className="dash-balance-btn primary">
          <PiggyBank size={14} /> Invest
        </button>
        <button onClick={() => navigate('/dashboard/funding')} className="dash-balance-btn">
          <Download size={14} /> Deposit
        </button>
        <button onClick={() => navigate('/dashboard/withdrawal')} className="dash-balance-btn">
          <Upload size={14} /> Withdraw
        </button>
        <span className="ml-auto hidden sm:block text-[12px]" style={{ color: 'rgba(251,247,239,.4)' }}>
          Good afternoon, {name?.split(' ')[0] || 'there'}
        </span>
      </div>
    </div>
  );
}

/* ---------- the three headline figures ---------- */
function Figures({ overview, hidden }) {
  const rows = [
    { label: 'Total profit', value: overview.totalProfit, note: 'Interest, dividends and accrued returns', to: '/dashboard/activity', tone: 'var(--up)' },
    { label: 'Total deposits', value: overview.totalDeposits, note: 'Confirmed on-chain and credited', to: '/dashboard/funding' },
    { label: 'Total investment', value: overview.totalInvestment, note: 'Subscribed products and positions', to: '/dashboard/invest' },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {rows.map((r) => (
        <Link key={r.label} to={r.to} className="dash-figure block">
          <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">{r.label}</p>
          <p className="num text-[24px] mt-2.5" style={{ color: r.tone || 'var(--ink)' }}>
            {hidden ? '••••••' : fmtUSD(r.value || 0)}
          </p>
          <p className="text-[11.5px] mt-1.5 text-[color:var(--muted-2)]">{r.note}</p>
        </Link>
      ))}
    </div>
  );
}

/* ---------- value line ---------- */
function ValueChart({ overview }) {
  const [range, setRange] = useState('1M');
  const points = overview.performance?.[range] || [0, 0];
  const W = 620, H = 150;
  const { line, area } = useMemo(() => buildAreaPath(points, W, H, 12), [points]);
  const pct = overview.changePct?.[range] ?? 0;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">Total value</p>
          <p className="font-display text-[28px] font-semibold mt-1.5">{fmtUSD(overview.accountValue)}</p>
          <p className="text-[12.5px] mt-1">
            <span className="num" style={{ color: pct >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {pct >= 0 ? '+' : ''}{pct}%
            </span>
            <span className="text-[color:var(--muted-2)]"> · updated {timeAgo(overview.updatedAt)}</span>
          </p>
        </div>
        <div className="flex gap-1.5">
          {['1W', '1M', '1Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`dash-filter-chip ${range === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6" style={{ height: 150 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#valueFill)" />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ---------- where the money sits ---------- */
function Allocation({ holdings }) {
  const total = holdings.reduce((s, h) => s + h.value, 0);
  if (!total) return null;
  return (
    <div className="card p-6">
      <p className="text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--muted-2)]">Where it sits</p>
      <div className="flex flex-col gap-4 mt-5">
        {holdings.map((h) => {
          const pct = (h.value / total) * 100;
          return (
            <div key={h.sym}>
              <div className="flex items-baseline justify-between text-[13px] mb-2">
                <span>{h.sym}</span>
                <span className="num text-[color:var(--muted)]">{pct.toFixed(1)}%</span>
              </div>
              <div className="dash-progress-track">
                <div className="dash-progress-fill" style={{ width: `${pct}%`, background: h.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- recent activity ---------- */
const ACTIVITY_ICON = {
  deposit: Download, withdraw: Upload, transfer: ArrowLeftRight, interest: Percent,
  investment: Landmark, card: CreditCard, loan: Landmark, bonus: Gift, referral: Users,
};

function Activity({ activity }) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--rule)]">
        <p className="font-display text-[16px] font-semibold">Recent activity</p>
        <button onClick={() => navigate('/dashboard/activity')} className="link-rule text-[12.5px]">
          View all <ChevronRight size={13} />
        </button>
      </div>
      {activity.length === 0 ? (
        <p className="text-[13px] text-[color:var(--muted-2)] py-10 text-center">
          Nothing yet — deposits, transfers and interest will appear here.
        </p>
      ) : (
        <div className="px-2 py-1">
          {activity.map((a) => {
            const Icon = ACTIVITY_ICON[a.type] || ArrowLeftRight;
            return (
              <div key={a._id} className="dash-row flex items-center gap-3 px-3 py-3 rounded">
                <div className="dash-activity-icon">
                  <Icon size={14} strokeWidth={1.7} className="text-[color:var(--muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] truncate">{a.label}</p>
                  <p className="text-[11.5px] text-[color:var(--muted-2)] truncate">{a.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="num text-[13px]" style={{ color: a.amount >= 0 ? 'var(--up)' : 'var(--ink)' }}>
                    {fmtSigned(a.amount)}
                  </p>
                  <p className="text-[11px] text-[color:var(--muted-2)]">
                    {a.status === 'pending' ? 'Pending' : timeAgo(a.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { walletVersion, bumpWallet } = useOutletContext();
  const [hidden, setHidden] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const { data: overview } = useApi('/api/dashboard/overview', [walletVersion]);

  const sweep = async () => {
    setSweeping(true);
    try {
      const { api } = await import('../lib/api.js');
      const updated = await api.post('/api/users/me/transfer-profit');
      setUser(updated);
      bumpWallet();
    } catch {
      // transient failure — the wallet simply stays put
    } finally {
      setSweeping(false);
    }
  };

  if (!overview) return <LoadingScreen inline />;

  const kyc = overview.kycStatus;
  const lowFunds = overview.balance < overview.minTransfer;

  return (
    <>
      {kyc === 'pending' && (
        <Notice
          icon={ShieldCheck}
          title="Verification in review"
          message="Usually done within 24 hours. Withdrawals open as soon as it clears."
        />
      )}
      {lowFunds && (
        <Notice
          tone="danger"
          icon={AlertTriangle}
          title="Balance running low"
          message="Add funds to keep payments and transfers flowing."
          ctaLabel="Deposit"
          onCta={() => navigate('/dashboard/funding')}
        />
      )}

      <DashReveal>
        <BalanceCard
          overview={overview}
          name={user?.name}
          hidden={hidden}
          onToggle={() => setHidden((v) => !v)}
        />
      </DashReveal>

      <DashReveal delay={60}>
        <Figures overview={overview} hidden={hidden} />
      </DashReveal>

      <DashReveal delay={100} className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <ValueChart overview={overview} />
        <Allocation holdings={overview.holdings} />
      </DashReveal>

      <DashReveal delay={140} className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Activity activity={overview.activity} />
        <div className="card p-6 flex flex-col">
          <p className="eyebrow">Suggested</p>
          <h3 className="font-display text-[20px] font-semibold mt-3">Treasury Ladder · 5.10%</h3>
          <p className="text-[13.5px] leading-relaxed mt-2 flex-1 text-[color:var(--muted)]">
            A six-month laddered government-bill portfolio, rolled every four weeks. Very low
            risk, rate fixed the moment you subscribe, from $1,000.
          </p>
          <button onClick={() => navigate('/dashboard/invest')} className="btn-solid text-[13px] px-5 py-2.5 mt-5 w-fit">
            <PiggyBank size={14} /> View plans
          </button>
        </div>
      </DashReveal>
    </>
  );
}
