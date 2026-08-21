/* ============================================================
   Brand logo mark — the Betament crest from public/blogo.svg.
   Single source of truth so every surface uses the same logo.
   ============================================================ */
export default function BrandMark({ size = 28, className = '' }) {
  return (
    <img
      src="/blogo.svg"
      width={size}
      height={size}
      alt="Betament Assets Management"
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  );
}

/* Stacked wordmark: the short brand over the discipline line, so the
   full name reads without crowding a 74px masthead. */
export function Wordmark({ size = 22, className = '' }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-display font-semibold tracking-tight" style={{ fontSize: size }}>
        Betament
      </span>
      <span
        className="font-semibold uppercase text-[color:var(--muted-2)]"
        style={{ fontSize: Math.max(7.5, size * 0.38), letterSpacing: '0.2em', marginTop: size * 0.16 }}
      >
        Assets Management
      </span>
    </span>
  );
}
