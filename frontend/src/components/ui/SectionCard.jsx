export default function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1.5 text-sm font-semibold text-slate-500 dark:text-[#888888]">{subtitle}</p> : null}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}
