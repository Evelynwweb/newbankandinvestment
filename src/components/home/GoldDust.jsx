import { useRef, useEffect } from 'react';

/* ============================================================
   Gold dust — a canvas field of motes drifting in two depth planes.

   Near motes are larger, brighter and carry a soft halo; far motes
   are small and dim. They link into a faint constellation when they
   drift close, and part around the pointer.

   Readable, not shy: this is meant to be seen.
   ============================================================ */

export default function GoldDust({
  density = 9000,      // one mote per N px² — lower means more
  tone = 'light',      // 'light' over paper, 'gold' over noir
  link = true,
  intensity = 1,       // global multiplier on opacity
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d', { alpha: true });
    const rgb = tone === 'gold' ? [243, 226, 188] : [180, 96, 15];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let motes = [];
    let w = 0, h = 0, raf = null;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(150, Math.round((w * h) / density));
      motes = Array.from({ length: count }, () => {
        // A third of them sit "near" the lens: bigger, brighter, faster.
        const near = Math.random() < 0.34;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (near ? 0.22 : 0.1),
          vy: (Math.random() - 0.5) * (near ? 0.22 : 0.1),
          r: near ? Math.random() * 1.9 + 1.4 : Math.random() * 1.1 + 0.5,
          a: (near ? Math.random() * 0.45 + 0.42 : Math.random() * 0.28 + 0.16) * intensity,
          near,
          // slow independent twinkle so the field never looks frozen
          ph: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.012 + 0.004,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const m of motes) {
        if (!still) {
          m.x += m.vx;
          m.y += m.vy;
          m.ph += m.sp;

          if (m.x < -12) m.x = w + 12;
          if (m.x > w + 12) m.x = -12;
          if (m.y < -12) m.y = h + 12;
          if (m.y > h + 12) m.y = -12;

          const dx = m.x - pointer.x;
          const dy = m.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 20000 && d2 > 0.01) {
            const f = (1 - d2 / 20000) * (m.near ? 1.1 : 0.6);
            const d = Math.sqrt(d2);
            m.x += (dx / d) * f;
            m.y += (dy / d) * f;
          }
        }

        const twinkle = 0.78 + Math.sin(m.ph) * 0.22;
        const alpha = Math.min(1, m.a * twinkle);

        // Halo on the near plane gives the field visible depth.
        if (m.near) {
          const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
          g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.34})`);
          g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        ctx.fill();
      }

      if (link) {
        for (let i = 0; i < motes.length; i++) {
          for (let j = i + 1; j < motes.length; j++) {
            const dx = motes[i].x - motes[j].x;
            const dy = motes[i].y - motes[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 15000) {
              ctx.beginPath();
              ctx.moveTo(motes[i].x, motes[i].y);
              ctx.lineTo(motes[j].x, motes[j].y);
              ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1 - d2 / 15000) * 0.24 * intensity})`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            }
          }
        }
      }

      if (!still) raf = requestAnimationFrame(draw);
    };

    const onPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };

    resize();
    draw();

    // Don't burn frames on canvases scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf && !still) raf = requestAnimationFrame(draw);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }, { threshold: 0 });
    io.observe(canvas);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [density, tone, link, intensity]);

  return <canvas ref={canvasRef} className={`particle-layer ${className}`} aria-hidden="true" />;
}
