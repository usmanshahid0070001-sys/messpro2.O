export default function StatCard({ label, value, note, change, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{note}</p>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: `${accent}16`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
        {change}
      </div>
    </div>
  );
}
