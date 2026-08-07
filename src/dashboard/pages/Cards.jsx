import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CreditCard, Snowflake, Plus, Eye, EyeOff, ShieldCheck, Check, X, Lock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { fmtUSD, DashReveal } from '../data.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';
import BrandMark from '../../components/ui/BrandMark.jsx';

/* A card face. The full PAN is never rendered — only the last four digits,
   which is all the client needs to identify a card. */
function PayCard({ card, holder, revealed }) {
  return (
    <div className="dash-paycard" data-color={card.color} data-frozen={card.frozen}>
      <span className="dash-paycard-sheen" />

      <div className="relative flex items-start justify-between">
        <BrandMark size={26} />
        <span className="text-[10px] uppercase tracking-widest opacity-70">
          {card.type === 'virtual' ? 'Virtual' : 'Debit'}
        </span>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <div className="dash-paycard-chip mb-3" />
          <p className="font-mono text-[15px] tracking-[0.14em]">
            {revealed ? `4821 9037 1174 ${card.last4}` : `•••• •••• •••• ${card.last4}`}
          </p>
          <div className="flex items-center gap-5 mt-2.5 text-[10.5px] opacity-80">
            <span className="uppercase tracking-wider truncate max-w-[140px]">{holder}</span>
            <span className="font-mono">{card.expiry}</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold opacity-80 text-right shrink-0">{card.network}</span>
      </div>

      {card.frozen && (
        <div className="dash-paycard-frozen">
          <Snowflake size={16} /> Frozen
        </div>
      )}
    </div>
  );
}

export default function Cards() {
  const { user } = useAuth();
  const { walletVersion } = useOutletContext();
  const { data: cards, reload } = useApi('/api/cards', [walletVersion]);
  const [revealed, setRevealed] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newCard, setNewCard] = useState({ label: '', monthlyLimit: '2000' });
  const [error, setError] = useState('');

  if (!cards) return <LoadingScreen inline />;

  const toggleFreeze = async (card) => {
    setBusyId(card._id);
    try {
      await api.patch(`/api/cards/${card._id}/freeze`);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const createCard = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/cards', {
        label: newCard.label.trim() || 'Virtual card',
        monthlyLimit: Number(newCard.monthlyLimit) || 2000,
      });
      setCreating(false);
      setNewCard({ label: '', monthlyLimit: '2000' });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Spending"
        title="Cards"
        subtitle="Freeze, limit or replace any card instantly. Virtual cards are free and unlimited."
      >
        <button onClick={() => setCreating((v) => !v)} className="btn-gold text-[12.5px] px-5 py-2.5 flex items-center gap-1.5">
          <Plus size={14} /> New virtual card
        </button>
      </PageHeader>

      {creating && (
        <DashReveal>
          <form onSubmit={createCard} className="card dash-surface rounded-2xl p-6 grid sm:grid-cols-[1fr_180px_auto] gap-4 items-end">
            <div>
              <label className="auth-label">Card name</label>
              <input
                autoFocus
                value={newCard.label}
                onChange={(e) => setNewCard((c) => ({ ...c, label: e.target.value }))}
                placeholder="Subscriptions"
                className="auth-field"
              />
            </div>
            <div>
              <label className="auth-label">Monthly limit</label>
              <input
                value={newCard.monthlyLimit}
                onChange={(e) => setNewCard((c) => ({ ...c, monthlyLimit: e.target.value.replace(/[^0-9]/g, '') }))}
                inputMode="numeric"
                className="auth-field font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="btn-gold text-[13px] px-5 py-3">Create</button>
              <button type="button" onClick={() => setCreating(false)} className="btn-ghost text-[13px] px-4 py-3" aria-label="Cancel">
                <X size={15} />
              </button>
            </div>
          </form>
        </DashReveal>
      )}

      {error && <p className="text-[12.5px] text-[color:var(--down)]">{error}</p>}

      <DashReveal delay={60} className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => {
          const pct = card.monthlyLimit > 0 ? Math.min(1, card.spent / card.monthlyLimit) : 0;
          return (
            <div key={card._id} className="flex flex-col gap-4">
              <PayCard card={card} holder={user?.name || 'Cardholder'} revealed={revealed === card._id} />

              <div className="card dash-surface rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[color:var(--ink)]">{card.label}</p>
                    <p className="text-[11.5px] text-[color:var(--muted-2)]">
                      {card.type === 'virtual' ? 'Virtual' : 'Physical'} &middot; ••••{card.last4}
                    </p>
                  </div>
                  <span
                    className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                    style={card.frozen
                      ? { background: 'rgba(251,113,133,0.12)', color: 'var(--down)' }
                      : { background: 'rgba(52,211,153,0.12)', color: 'var(--up)' }}
                  >
                    {card.frozen ? 'Frozen' : 'Active'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                    <span className="text-[color:var(--muted-2)]">This month</span>
                    <span className="font-mono text-[color:var(--ink)]">
                      {fmtUSD(card.spent, { maximumFractionDigits: 0 })} / {fmtUSD(card.monthlyLimit, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="dash-progress-track">
                    <div className="dash-progress-fill" style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <button
                    onClick={() => setRevealed((v) => (v === card._id ? null : card._id))}
                    className="btn-ghost flex-1 text-[12px] py-2.5 flex items-center justify-center gap-1.5"
                  >
                    {revealed === card._id ? <EyeOff size={13} /> : <Eye size={13} />}
                    {revealed === card._id ? 'Hide' : 'Show'} number
                  </button>
                  <button
                    onClick={() => toggleFreeze(card)}
                    disabled={busyId === card._id}
                    className="btn-ghost flex-1 text-[12px] py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {card.frozen ? <Check size={13} /> : <Snowflake size={13} />}
                    {busyId === card._id ? '…' : card.frozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </DashReveal>

      <DashReveal delay={120} className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Snowflake, title: 'Freeze in one tap', body: 'Misplaced a card? Freeze it instantly and unfreeze the moment it turns up.' },
          { icon: Lock, title: 'Per-card limits', body: 'Cap what each card can spend per month — useful for subscriptions and staff.' },
          { icon: ShieldCheck, title: 'Zero liability', body: 'You’re never on the hook for confirmed fraudulent card transactions.' },
        ].map((c) => (
          <div key={c.title} className="card dash-surface rounded-2xl p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <c.icon size={16} className="text-[color:var(--accent)]" />
            </div>
            <p className="text-[14px] font-medium mt-3.5 text-[color:var(--ink)]">{c.title}</p>
            <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted-2)]">{c.body}</p>
          </div>
        ))}
      </DashReveal>

      <p className="flex items-center gap-2 text-[11.5px] text-[color:var(--muted-2)]">
        <CreditCard size={13} className="text-[color:var(--accent)]" />
        Card numbers shown here are illustrative. A live deployment must never render a full PAN in the browser.
      </p>
    </>
  );
}
