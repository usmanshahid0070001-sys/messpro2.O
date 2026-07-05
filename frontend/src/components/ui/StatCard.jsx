export default function StatCard({ label, value, note, change, icon: Icon, accent }) {
  // Use monochrome glass panel. Retain the subtle accent color purely for the icon background to preserve visual hierarchy.
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-[#222222] transition-transform hover:scale-[1.02] duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-[#888888]">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#555555]">{note}</p>
        </div>
        <div 
          className="rounded-2xl p-3 shadow-inner" 
          style={{ backgroundColor: accent ? `${accent}15` : 'rgba(136, 136, 136, 0.1)', color: accent || '#888888' }}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
      {change && (
        <div className="mt-6 inline-flex rounded-full bg-slate-100 dark:bg-[#1a1a1a] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-[#dddddd] border border-slate-200/50 dark:border-[#333333]">
          {change}
        </div>
      )}
    </div>
  );
}
