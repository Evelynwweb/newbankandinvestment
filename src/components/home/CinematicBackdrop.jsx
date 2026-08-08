import { useState, useEffect, useRef } from 'react';
import GoldDust from './GoldDust.jsx';

/* ============================================================
   The film behind the whole page.

   A single fixed layer holding every scene. Sections declare which
   scene they want with data-scene="n"; whichever section owns the
   middle of the viewport wins, and the layer cross-fades to it.

   Because it is one fixed element rather than a background per
   section, the page reads as one continuous shot — the camera never
   cuts back to a blank wall between chapters.
   ============================================================ */

export const SCENES = [
  { id: 0, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#100D0A' },
  { id: 1, img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#14100B' },
  { id: 2, img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#0F0D0B' },
  { id: 3, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#16110C' },
  { id: 4, img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#0E0C0A' },
  { id: 5, img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#15110C' },
  { id: 6, img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fm=jpg&q=74&w=1800&auto=format&fit=crop', tint: '#131009' },
];

function Scene({ scene, on, seen }) {
  const [failed, setFailed] = useState(false);
  // Don't fetch a plate until it has been reached once — keeps the first
  // paint to a single image instead of seven.
  if (!seen) return null;
  return (
    <div
      className="cbd-scene"
      style={{ opacity: on ? 1 : 0, background: scene.tint }}
      aria-hidden="true"
    >
      {!failed && (
        <img
          src={scene.img}
          alt=""
          onError={() => setFailed(true)}
          style={{ transform: on ? 'scale(1.1)' : 'scale(1.02)' }}
        />
      )}
    </div>
  );
}

export default function CinematicBackdrop() {
  const [active, setActive] = useState(0);
  const seenRef = useRef(new Set([0]));
  const [, force] = useState(0);

  useEffect(() => {
    let raf = null;

    const pick = () => {
      const mid = window.innerHeight / 2;
      let best = null;
      let bestDist = Infinity;
      // Whichever scene-owning section covers the middle of the screen wins.
      document.querySelectorAll('[data-scene]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (r.top <= mid && r.bottom >= mid) {
          if (dist < bestDist) { bestDist = dist; best = el; }
        } else if (best === null && dist < bestDist) {
          bestDist = dist; best = el;
        }
      });
      if (best) {
        const n = Number(best.dataset.scene) || 0;
        setActive((prev) => {
          if (prev === n) return prev;
          // Mount the next plate one step ahead so the fade never shows a gap.
          if (!seenRef.current.has(n)) { seenRef.current.add(n); force((v) => v + 1); }
          const nxt = n + 1;
          if (nxt < SCENES.length && !seenRef.current.has(nxt)) {
            seenRef.current.add(nxt);
            force((v) => v + 1);
          }
          return n;
        });
      }
      raf = null;
    };

    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cbd" aria-hidden="true">
      {SCENES.map((s) => (
        <Scene key={s.id} scene={s} on={s.id === active} seen={seenRef.current.has(s.id)} />
      ))}
      <div className="cbd-scrim" />
      <GoldDust tone="gold" density={11000} intensity={0.95} link={false} className="cbd-dust" />
    </div>
  );
}
