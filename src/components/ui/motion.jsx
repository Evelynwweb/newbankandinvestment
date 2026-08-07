import { useState, useEffect, useRef } from 'react';

/* ============================================================
   Motion primitives — deliberately two of them.

   The old system had tilt, magnetic pull, parallax and 3D stages.
   A bank reads better still, so all that is gone: content fades and
   rises once, and numbers count up. Nothing else moves.
   ============================================================ */

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    );
    obs.observe(el);
    // Anything already on screen at mount won't fire an intersection event.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => setInView(true));
    }
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export function CountUp({ target, decimals = 0, prefix = '', suffix = '', duration = 1200 }) {
  const [ref, inView] = useInView(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return <span ref={ref} className="num">{prefix}{val.toFixed(decimals)}{suffix}</span>;
}
