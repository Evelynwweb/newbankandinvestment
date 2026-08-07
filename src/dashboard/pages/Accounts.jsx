import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Wallet, PiggyBank, Landmark, Copy, Check, Eye, EyeOff,
  Download, Upload, Send, Percent, ArrowUpRight, TrendingUp,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, ACCOUNT_META, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { fmtDate } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const KIND_ICON = { checking: Wallet, savings: PiggyBank, investment: Landmark };

const KIND_BLURB = {
  checking: 'Everyday spending, direct deposit and bill pay. No monthly fee, no minimum.',
  savings: 'High-yield reserve. Interest credited monthly, withdraw any day without penalty.',
  investment: 'Holds your subscribed mandates. Valued at close of business each day.',
};

function AccountCard({ account, hidden, onCopy, copied }) {
  const navigate = useNavigate();
  const Icon = KIND_ICON[account.kind] || Wallet;
  const meta = ACCOUNT_META[account.kind] || { label: account.kind, color: 'var(--accent)' };

  return (
    <div className="card dash-surface rounded-2xl p-6 relative overflow-hidden flex flex-col">
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: meta.color }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Icon size={18} style={{ color: meta.color }} />
          </div>
          <div>
            <p className="text-[14.5px] font-medium text-[color:var(--ink)]">{account.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">{meta.label}</p>
          </div>
        </div>
        {/* Only deposit accounts quote an APY. An investment account's return is
            not a guaranteed rate, so it's labelled as a trailing figure instead. */}
        {account.apy > 0 && (
          account.kind === 'investment' ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
              <TrendingUp size={11} /> {account.apy.toFixed(2)}% trailing 1y
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-[color:var(--up)]/10 text-[color:var(--up)]">
              <Percent size={11} /> {account.apy.toFixed(2)}% APY
            </span>
          )
        )}
      </div>

      <p className="relative font-mono text-[28px] font-semibold mt-5 tabular-nums text-[color:var(--ink)]">
        {hidden ? '••••••••' : fmtUSD(account.balance)}
      </p>

      <button
        onClick={() => onCopy(account)}
        className="relative flex items-center gap-2 mt-2 text-[12px] text-[color:var(--muted-2)] hover:text-[color:var(--ink)] transition-colors w-fit"
      >
        <span className="font-mono">
          {hidden ? '•••• ••••' : `•••• ${account.number.slice(-4)}`}
        </span>
        {copied === account._id ? <Check size={12} className="text-[color:var(--up)]" /> : <Copy size={12} />}
      </button>

      <p className="relative text-[12px] mt-4 leading-relaxed flex-1 text-[color:var(--muted-2)]">
        {KIND_BLURB[account.kind]}
      </p>

      <div className="relative flex items-center gap-2 mt-5 pt-4 border-t border-[color:var(--rule-soft)]">
        <button onClick={() => navigate('/dashboard/transfers')} className="btn-ghost flex-1 text-[12px] py-2.5 flex items-center justify-center gap-1.5">
          <Send size={13} /> Transfer
        </button>
        {account.kind === 'investment' ? (
          <button onClick={() => navigate('/dashboard/invest')} className="btn-gold flex-1 text-[12px] py-2.5 flex items-center justify-center gap-1.5">
            <ArrowUpRight size={13} /> Invest
          </button>
        ) : (
          <button onClick={() => navigate('/dashboard/deposit')} className="btn-gold flex-1 text-[12px] py-2.5 flex items-center justify-center gap-1.5">
            <Download size={13} /> Fund
          </button>
        )}
      </div>

      <p className="relative text-[10.5px] mt-3 text-[color:var(--muted-2)]">Opened {fmtDate(account.openedAt)}</p>
    </div>
  );
}

export default function Accounts() {
  const navigate = useNavigate();
  const { walletVersion } = useOutletContext();
  const { data } = useApi('/api/accounts', [walletVersion]);
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(null);

  if (!data) return <LoadingScreen inline />;

  const accounts = data.accounts || [];
  const beneficiaries = data.beneficiaries || [];
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const copyNumber = async (account) => {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(account._id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // clipboard blocked — the number is still visible on the card
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Your money"
        title="Accounts"
        subtitle="Every account under your Aurivest relationship, with the rate each one earns."
      >
        <button
          onClick={() => setHidden((v) => !v)}
          className="btn-ghost text-[12.5px] px-4 py-2.5 flex items-center gap-1.5"
        >
          {hidden ? <Eye size={14} /> : <EyeOff size={14} />} {hidden ? 'Show' : 'Hide'} balances
        </button>
      </PageHeader>

      <DashReveal>
        <div className="dash-glow-card rounded-3xl p-6 md:p-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">Total across accounts</p>
            <p className="font-display text-[38px] md:text-[46px] font-semibold leading-none mt-2 text-[color:var(--ink)]">
              {hidden ? '••••••••' : fmtUSD(total)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => navigate('/dashboard/deposit')} className="btn-gold text-[13px] px-5 py-3 flex items-center gap-1.5">
              <Download size={14} /> Deposit
            </button>
            <button onClick={() => navigate('/dashboard/withdrawal')} className="btn-ghost text-[13px] px-5 py-3 flex items-center gap-1.5">
              <Upload size={14} /> Withdraw
            </button>
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={80} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((a) => (
          <AccountCard key={a._id} account={a} hidden={hidden} onCopy={copyNumber} copied={copied} />
        ))}
      </DashReveal>

      <DashReveal delay={140}>
        <div className="card dash-surface rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display text-[16px] font-medium text-[color:var(--ink)]">Saved recipients</p>
              <p className="text-[12px] mt-0.5 text-[color:var(--muted-2)]">People and accounts you send to regularly.</p>
            </div>
            <button onClick={() => navigate('/dashboard/transfers')} className="text-[12px] text-[color:var(--accent-soft)]">Send money</button>
          </div>

          {beneficiaries.length === 0 ? (
            <p className="text-[12.5px] text-[color:var(--muted-2)] py-6 text-center">
              No saved recipients yet — save one the next time you make a transfer.
            </p>
          ) : (
            <div className="flex flex-col">
              {beneficiaries.map((b) => (
                <div key={b._id} className="dash-row flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11.5px] font-semibold text-[color:var(--on-accent)] shrink-0" style={{ background: 'var(--accent)' }}>
                    {b.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[color:var(--ink)] truncate">{b.name}</p>
                    <p className="text-[11.5px] text-[color:var(--muted-2)] truncate">
                      {b.bank} &middot; ••••{b.number.slice(-4)}{b.nickname ? ` · ${b.nickname}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/transfers', { state: { beneficiaryId: b._id } })}
                    className="btn-ghost text-[11.5px] px-3.5 py-2 shrink-0"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashReveal>
    </>
  );
}
