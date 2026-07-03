export default function TopBar({ title = 'MessPro', subtitle = '' }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-4 py-4 sm:px-6">
      <div>
        <p className="text-sm text-slate-400">{subtitle || 'Super Admin Control Center'}</p>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-400 shadow-inner shadow-black/10">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-32 bg-transparent outline-none sm:w-48"
            placeholder="Search hostels..."
            aria-label="Search"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 shadow-inner shadow-black/10">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">All Systems Normal</span>
        </div>

        <button className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
          <span>🔔</span>
        </button>
        <button className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
          <span>⚙️</span>
        </button>
      </div>
    </header>
  );
}
