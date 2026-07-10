export default function StatusBadge({ tone, children }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    neutral: 'bg-[#f5f5f5] text-[#404040] border-[#e0e0e0] dark:bg-[#1a1a1a] dark:text-[#888888] dark:border-[#333333]',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
}
