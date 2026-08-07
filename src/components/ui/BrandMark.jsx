/* ============================================================
   Brand logo mark — the Aurivest crest from public/alogo.svg.
   Single source of truth so every surface uses the same logo.
   ============================================================ */
export default function BrandMark({ size = 28, className = '' }) {
  return (
    <img
      src="/alogo.svg"
      width={size}
      height={size}
      alt="Aurivest"
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  );
}
