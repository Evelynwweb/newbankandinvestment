import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { getReply, SUGGESTIONS, BOT_NAME } from './chatbotBrain.js';

/* ============================================================
   Aura — the landing-page assistant. Fully self-contained:
   premade answers matched by keyword scoring, a typing delay
   so replies feel considered, and quick-question chips.
   ============================================================ */

const WELCOME = `Hi there! 👋 I'm ${BOT_NAME}, Betamint's assistant. Ask me anything — opening an account, savings rates, transfers, portfolios, loans… I'm here 24/7.`;

export default function LandingChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: WELCOME }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [chipOffset, setChipOffset] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const ask = (question) => {
    const q = question.trim();
    if (!q || typing) return;
    setText('');
    setMessages((m) => [...m, { from: 'user', text: q }]);
    setTyping(true);
    const reply = getReply(q);
    // a considered pause, proportional to the answer length — feels alive
    const delay = Math.min(2200, 700 + reply.answer.length * 6);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'bot', text: reply.answer, link: reply.link }]);
      setChipOffset((o) => o + 3);
    }, delay);
  };

  const submit = (e) => {
    e.preventDefault();
    ask(text);
    inputRef.current?.focus();
  };

  const chips = [0, 1, 2].map((i) => SUGGESTIONS[(chipOffset + i) % SUGGESTIONS.length]);

  return (
    <>
      {open && (
        <div className="chat-panel">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--rule-soft)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
                <Sparkles size={16} className="text-[color:var(--on-accent)]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[color:var(--ink)]">{BOT_NAME} · Betamint</p>
                <p className="flex items-center gap-1.5 text-[10.5px] text-[color:var(--up)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--up)]" /> Online — instant answers
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]"><X size={18} /></button>
          </div>

          {/* conversation */}
          <div className="chat-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                {m.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: 'var(--accent)' }}>
                    <Sparkles size={11} className="text-[color:var(--on-accent)]" />
                  </div>
                )}
                <div className={m.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.link && (
                    <button onClick={() => navigate(m.link.to)} className="flex items-center gap-1.5 text-[12.5px] font-semibold mt-2 text-[color:var(--accent)]">
                      {m.link.label} <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: 'var(--accent)' }}>
                  <Sparkles size={11} className="text-[color:var(--on-accent)]" />
                </div>
                <div className="chat-bubble-bot chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* quick questions */}
            {!typing && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {chips.map((c) => (
                  <button key={c} onClick={() => ask(c)} className="chat-chip">{c}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* composer */}
          <form onSubmit={submit} className="flex items-center gap-2 px-3.5 py-3" style={{ borderTop: '1px solid var(--rule-soft)' }}>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-4 py-2.5 text-[13px] outline-none text-[color:var(--ink)] placeholder:text-[color:var(--muted-2)] focus:border-[color:var(--accent-soft)]"
            />
            <button
              type="submit"
              disabled={!text.trim() || typing}
              aria-label="Send"
              className="w-10 h-10 rounded flex items-center justify-center shrink-0 text-[color:var(--on-accent)] disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* floating bubble */}
      <button onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close chat' : 'Chat with us'} className="chat-fab">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chat-badge">1</span>}
      </button>
    </>
  );
}
