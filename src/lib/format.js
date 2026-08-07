/* Shared date / amount formatting for API data. */

export const initials = (name = '') =>
  name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

/* "Jul 8, 2026 · 14:02" */
export const fmtDateTime = (d) => {
  const date = new Date(d);
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} · ${time}`;
};

/* "Jul 8, 2026" */
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* "just now" / "2h ago" / "3d ago" */
export const timeAgo = (d) => {
  const secs = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 86400 * 30) return `${Math.floor(secs / 86400)}d ago`;
  return fmtDate(d);
};

/* Signed currency: "+$5,000.00" / "-$2,000.00" */
export const fmtSigned = (n) => {
  const abs = Math.abs(n).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return `${n < 0 ? '-' : '+'}${abs}`;
};

/* "•••• 4821" — never render a full account or card number. */
export const maskNumber = (value = '', visible = 4) => {
  const s = String(value);
  return `•••• ${s.slice(-visible)}`;
};
