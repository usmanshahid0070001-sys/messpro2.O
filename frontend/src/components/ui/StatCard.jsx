export default function StatCard({ label, value, note, change, icon: Icon, accent }) {
  // Use monochrome glass panel. Retain the subtle accent color purely for the icon background to preserve visual hierarchy.
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-[1.02] duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{value}</p>
          <p className="mt-2 text-xs font-bold text-zinc-500 dark:text-zinc-500">{note}</p>
        </div>
        <div 
          className="rounded-2xl p-3 shadow-inner" 
          style={{ backgroundColor: accent ? `${accent}15` : 'rgba(113, 113, 122, 0.1)', color: accent || '#71717a' }}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
      {change && (
        <div className="mt-6 inline-flex rounded-full bg-zinc-100 dark:bg-zinc-900/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          {change}
        </div>
      )}
    </div>
  );
}
