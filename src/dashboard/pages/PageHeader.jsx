/* ============================================================
   Shared page header — eyebrow, title, subtitle. Keeps every
   dashboard sub-page visually consistent.
   ============================================================ */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[11px] tracking-widest uppercase text-[color:var(--accent-soft)] mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[24px] md:text-[28px] font-bold text-[color:var(--ink)]">{title}</h2>
        {subtitle && <p className="text-[13.5px] mt-2 max-w-xl leading-relaxed text-[color:var(--muted-2)]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
