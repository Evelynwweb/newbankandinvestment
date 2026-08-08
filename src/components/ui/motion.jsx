import { useState, useEffect, useRef, useCallback } from 'react';

/* ============================================================
   Motion primitives.

   Everything here is plain IntersectionObserver + rAF-throttled
   scroll. No animation library, so the bundle stays small and the
   timing curves stay ours.
   ============================================================ */

/* Fires once when an element crosses into view. */
export function useInView(threshold = 0.18, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); if (once) obs.unobserve(el); }
        else if (!once) setInView(false);
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);

    // Anything already on screen at mount never fires an intersection event.
    // Set it synchronously rather than inside rAF: a tab opened in the
    // background gets no animation frames, and gating on one would leave the
    // whole page sitting at opacity 0 until it was focused.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) setInView(true);

    // Failsafe. If neither the observer nor the mount check ever fires —
    // occluded tab, exotic browser, observer throttled — reveal anyway.
    // Content that is merely un-animated beats content that is invisible.
    const failsafe = setTimeout(() => setInView(true), 2500);

    return () => { obs.disconnect(); clearTimeout(failsafe); };
  }, [threshold, once]);
  return [ref, inView];
}

/* Generic reveal wrapper. `variant` picks the CSS animation class. */
export function Reveal({ children, delay = 0, className = '', variant = 'rise', as: Tag = 'div', threshold }) {
  const [ref, inView] = useInView(threshold);
  return (
    <Tag
      ref={ref}
      className={`${variant} ${inView ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/* A headline that lifts line by line out from behind a mask.
   Pass an array of strings — one per visual line. */
export function MaskLines({ lines, className = '', stagger = 110, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`line-mask ${inView ? 'in' : ''}`}>
          <span style={{ transitionDelay: `${delay + i * stagger}ms` }}>{line}</span>
        </span>
      ))}
    </span>
  );
}

/* Counts to a target when scrolled into view. */
export function CountUp({ target, decimals = 0, prefix = '', suffix = '', duration = 1600, className = '' }) {
  const [ref, inView] = useInView(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return <span ref={ref} className={`num ${className}`}>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

/* 0→1 progress of an element travelling through the viewport.
   Drives the pinned scroll sections. */
export function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = null;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      // Before the section pins, progress is 0; after it releases, 1.
      const scrolled = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setP(scrolled);
      raf = null;
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}

/* Whole-page scroll fraction — drives the masthead hairline. */
export function usePageProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = null;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
      raf = null;
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

/* True once the page has scrolled past `offset`. */
export function useScrolled(offset = 12) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return on;
}

/* Photograph with a graceful fallback — a dead CDN URL should degrade to a
   warm plate, never a broken-image icon on a bank's homepage. */
export function Plate({ src, alt = '', className = '', variant = 'plate-clip', drift = false, ratio }) {
  const [ref, inView] = useInView(0.15);
  const [failed, setFailed] = useState(false);
  return (
    <div
      ref={ref}
      className={`plate ${variant} ${drift ? 'plate-drift' : ''} ${inView ? 'in' : ''} ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {failed ? (
        <div
          className="w-full h-full"
          style={{ background: 'linear-gradient(140deg, var(--surface-2), var(--paper-2) 55%, var(--accent-wash))' }}
        />
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

/* Pointer position in [-0.5, 0.5] over an element, for subtle parallax. */
export function usePointerOffset() {
  const ref = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOff({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }, []);
  const onLeave = useCallback(() => setOff({ x: 0, y: 0 }), []);
  return [ref, off, { onMouseMove: onMove, onMouseLeave: onLeave }];
}
