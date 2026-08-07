import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Copy, Check, Gift, Share2, ArrowRight } from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { fmtDate, fmtSigned } from '../../lib/format.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

const STEPS = [
  { icon: Share2, title: 'Share your link', body: 'Send it to anyone who’d benefit from better banking.' },
  { icon: Users, title: 'They open an account', body: 'Your code is applied automatically when they sign up.' },
  { icon: Gift, title: 'You both get paid', body: 'Once their first deposit clears, the reward lands in checking.' },
];

export default function Referrals() {
  const { walletVersion } = useOutletContext();
  const { data } = useApi('/api/referrals', [walletVersion]);
  const [copied, setCopied] = useState('');

  if (!data) return <LoadingScreen inline />;

  const copy = async (value, which) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      // clipboard blocked — the value is visible on screen
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Grow together"
        title="Referrals"
        subtitle={`Earn ${fmtUSD(data.rewardPerSignup, { maximumFractionDigits: 0 })} for every person who opens an account and funds it.`}
      />

      <DashReveal>
        <div className="dash-glow-card rounded-3xl p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'People invited', value: String(data.invited) },
              { label: 'Rewards earned', value: fmtUSD(data.earned), accent: true },
              { label: 'Per successful signup', value: fmtUSD(data.rewardPerSignup, { maximumFractionDigits: 0 }) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)]">{s.label}</p>
                <p className={`font-display text-[30px] font-semibold mt-1.5 ${s.accent ? 'text-[color:var(--up)]' : 'text-[color:var(--ink)]'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-[auto_1fr] gap-4 mt-8 pt-7 border-t border-[color:var(--rule-soft)]">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-2">Your code</p>
              <button
                onClick={() => copy(data.code, 'code')}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl font-mono text-[15px] tracking-wider text-[color:var(--ink)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }}
              >
                {data.code}
                {copied === 'code' ? <Check size={14} className="text-[color:var(--up)]" /> : <Copy size={14} className="text-[color:var(--muted-2)]" />}
              </button>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-2">Your link</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={data.link}
                  onFocus={(e) => e.target.select()}
                  className="auth-field font-mono text-[12.5px] truncate"
                />
                <button onClick={() => copy(data.link, 'link')} className="btn-gold text-[12.5px] px-4 py-3 shrink-0 flex items-center gap-1.5">
                  {copied === 'link' ? <Check size={14} /> : <Copy size={14} />} {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={60} className="grid sm:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card dash-surface rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <s.icon size={17} className="text-[color:var(--accent)]" />
              </div>
              <span className="font-mono text-[11px] text-[color:var(--muted-2)]">0{i + 1}</span>
            </div>
            <p className="font-display text-[16px] font-medium mt-4 text-[color:var(--ink)]">{s.title}</p>
            <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted-2)]">{s.body}</p>
          </div>
        ))}
      </DashReveal>

      <DashReveal delay={110}>
        <div className="card dash-surface rounded-2xl p-5 md:p-6">
          <p className="font-display text-[16px] font-medium mb-4 text-[color:var(--ink)]">Reward history</p>
          {data.history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Users size={22} className="text-[color:var(--muted-2)]" />
              <p className="text-[13px] max-w-xs text-[color:var(--muted-2)]">
                No rewards yet — share your link and they&rsquo;ll show up here as people join.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {data.history.map((r) => (
                <div key={r._id} className="dash-row flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl">
                  <div className="dash-activity-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <Gift size={15} className="text-[color:var(--up)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[color:var(--ink)] truncate">{r.label}</p>
                    <p className="text-[11.5px] text-[color:var(--muted-2)] truncate">{r.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[13px] text-[color:var(--up)]">{fmtSigned(r.amount)}</p>
                    <p className="text-[10.5px] text-[color:var(--muted-2)]">{fmtDate(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashReveal>

      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[color:var(--muted-2)]">
        <ArrowRight size={13} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
        Rewards are credited once the referred client completes verification and funds their account.
        Self-referrals and duplicate accounts don&rsquo;t qualify.
      </p>
    </>
  );
}
