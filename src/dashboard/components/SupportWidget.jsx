import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones, X, Send, ArrowRight, LifeBuoy, ShieldCheck, Download, Send as SendIcon,
} from 'lucide-react';
import { getReply } from '../../components/home/chatbotBrain.js';
import { BRAND } from '../data.jsx';

/* ============================================================
   In-dashboard support desk — quick actions for the things people
   actually contact support about, plus the same keyword-matched
   assistant the marketing site uses.
   ============================================================ */

const QUICK_ACTIONS = [
  { icon: Download, label: 'Fund my account', to: '/dashboard/deposit' },
  { icon: SendIcon, label: 'Send a transfer', to: '/dashboard/transfers' },
  { icon: ShieldCheck, label: 'Verify my identity', to: '/dashboard/kyc' },
  { icon: LifeBuoy, label: 'Help Center', to: '/resources/help-center' },
];

const OPENER = `Hi! You're through to the ${BRAND} desk. Ask about transfers, rates, cards or verification — a specialist is on the line if I can't answer it.`;

export default function SupportWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: OPENER }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const send = (e) => {
    e.preventDefault();
    const q = text.trim();
    if (!q || typing) return;
    setText('');
    setMessages((m) => [...m, { from: 'user', text: q }]);
    setTyping(true);
    const reply = getReply(q);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'bot', text: reply.answer, link: reply.link }]);
    }, Math.min(2000, 600 + reply.answer.length * 5));
  };

  return (
    <>
      {open && (
        <div className="dash-support-panel card dash-surface">
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--rule-soft)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))' }}>
                <Headphones size={16} className="text-[color:var(--on-accent)]" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[color:var(--ink)]">Client support</p>
                <p className="flex items-center gap-1.5 text-[10.5px] text-[color:var(--up)]">
                  <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[color:var(--up)]" /> Online 24/7
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close support" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
              <X size={18} />
            </button>
          </div>

          <div className="px-3.5 py-3 grid grid-cols-2 gap-2" style={{ borderBottom: '1px solid var(--rule-soft)' }}>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => { setOpen(false); navigate(a.to); }}
                className="dash-row flex items-center gap-2 px-2.5 py-2 rounded-xl text-left border border-[color:var(--rule-soft)]"
              >
                <a.icon size={14} className="text-[color:var(--accent)] shrink-0" />
                <span className="text-[11.5px] text-[color:var(--ink)] leading-tight">{a.label}</span>
              </button>
            ))}
          </div>

          <div className="home-chat-scroll">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex'}>
                <div className={m.from === 'user' ? 'home-chat-bubble-user' : 'home-chat-bubble-bot'}>
                  <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.link && (
                    <button onClick={() => { setOpen(false); navigate(m.link.to); }} className="flex items-center gap-1.5 text-[12px] font-semibold mt-2 text-[color:var(--accent)]">
                      {m.link.label} <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="home-chat-bubble-bot home-chat-typing w-fit"><span /><span /><span /></div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 px-3.5 py-3" style={{ borderTop: '1px solid var(--rule-soft)' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your issue…"
              className="flex-1 bg-[color:var(--surface-2)] border border-[color:var(--rule)] rounded-full px-4 py-2.5 text-[13px] outline-none text-[color:var(--ink)] placeholder:text-[color:var(--muted-2)] focus:border-[color:var(--accent-soft)]"
            />
            <button
              type="submit"
              disabled={!text.trim() || typing}
              aria-label="Send"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[color:var(--on-accent)] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close support' : 'Contact support'} className="dash-support-fab">
        {open ? <X size={20} /> : <Headphones size={20} />}
      </button>
    </>
  );
}
