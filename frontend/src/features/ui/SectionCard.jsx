export default function SectionCard({ title, subtitle, children, action }) {
 return (
 <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
 <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{title}</h2>
 {subtitle ? <p className="mt-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
 </div>
 {action && <div className="shrink-0">{action}</div>}
 </div>
 <div className="w-full">
 {children}
 </div>
 </section>
 );
}
