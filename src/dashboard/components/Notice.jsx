/* ============================================================
   A flat notice with a coloured left rule. Replaces the old
   breathing, glowing, scroll-driven banner deck — a bank telling
   you something important should not pulse at you.
   ============================================================ */
export default function Notice({ tone = 'info', icon: Icon, title, message, ctaLabel, onCta }) {
  return (
    <div className="dash-notice" data-tone={tone}>
      {Icon && (
        <Icon
          size={17}
          strokeWidth={1.7}
          className="shrink-0 mt-0.5"
          style={{ color: tone === 'danger' ? 'var(--down)' : 'var(--accent)' }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold">{title}</p>
        {message && <p className="text-[12.5px] mt-0.5 text-[color:var(--muted)]">{message}</p>}
      </div>
      {ctaLabel && (
        <button onClick={onCta} className="btn-solid text-[12.5px] px-4 py-2 shrink-0">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
