export default function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
