import { useState, useEffect, useRef } from 'react';
import { useInView } from '../ui/motion.jsx';

/* ============================================================
   Split-flap rate board.

   The old mechanical departure boards banks and exchanges used to
   post rates on. Each character shuffles through a few glyphs before
   settling — so the board "lands" on the real number a beat after it
   scrolls into view.
   ============================================================ */

const GLYPHS = '0123456789';

/* One character cell. Cycles a few random glyphs, then locks. */
function Flap({ target, delay }) {
  const [ch, setCh] = useState(() => (/[0-9]/.test(target) ? '0' : target));
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Punctuation doesn't flap — it's printed on the board.
    if (!/[0-9]/.test(target)) { setCh(target); return; }

    let ticks = 0;
    const maxTicks = 5 + Math.floor(Math.random() * 4);
    let iv;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        ticks += 1;
        if (ticks >= maxTicks) {
          setCh(target);
          setKey((k) => k + 1);
          clearInterval(iv);
        } else {
          setCh(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
          setKey((k) => k + 1);
        }
      }, 55);
    }, delay);

    return () => { clearTimeout(start); clearInterval(iv); };
  }, [target, delay]);

  const isSep = !/[0-9]/.test(target);
  return (
    <span className={`flap-cell ${isSep ? 'flap-sep' : ''}`}>
      <span key={key}>{ch}</span>
    </span>
  );
}

function FlapValue({ value, baseDelay }) {
  return (
    <span className="flex items-center gap-[2px]" aria-label={value}>
      {value.split('').map((c, i) => (
        <Flap key={`${i}-${c}`} target={c} delay={baseDelay + i * 70} />
      ))}
    </span>
  );
}

export default function FlapBoard({ rows, title = 'Today’s rates', note }) {
  const [ref, inView] = useInView(0.25);
  const mounted = useRef(false);
  useEffect(() => { if (inView) mounted.current = true; }, [inView]);

  return (
    <div ref={ref} className="flap-board">
      <div className="flex items-baseline justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--noir-rule)' }}>
        <p className="font-display text-[16px] font-semibold" style={{ color: 'var(--gold-hi)' }}>{title}</p>
        <p className="num text-[10px] tracking-[0.16em]" style={{ color: 'rgba(216,180,117,.55)' }}>
          LIVE · REVIEWED DAILY
        </p>
      </div>

      {rows.map((r, i) => (
        <div key={r.label} className="flap-row">
          <div className="min-w-0">
            <p className="text-[13.5px]" style={{ color: '#F0E7D6' }}>{r.label}</p>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(240,231,214,.45)' }}>{r.note}</p>
          </div>
          {inView
            ? <FlapValue value={r.value} baseDelay={220 + i * 130} />
            : <span className="flex items-center gap-[2px] opacity-0">{r.value}</span>}
        </div>
      ))}

      {note && (
        <p className="px-5 py-3.5 text-[11px] leading-relaxed"
           style={{ borderTop: '1px solid var(--noir-rule)', color: 'rgba(240,231,214,.42)' }}>
          {note}
        </p>
      )}
    </div>
  );
}
