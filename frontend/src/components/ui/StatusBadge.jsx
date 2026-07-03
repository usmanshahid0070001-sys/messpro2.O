export default function StatusBadge({ tone, children }) {
  const tones = {
    success: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
    info: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
    danger: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.info}`}>{children}</span>;
}
