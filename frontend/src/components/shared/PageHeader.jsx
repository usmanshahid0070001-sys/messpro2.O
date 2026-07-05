export default function PageHeader({ 
  title, 
  highlightText, 
  subtitle, 
  badgeText, 
  icon: Icon, 
  rightWidget 
}) {
  return (
    <header className="mb-8 bg-white dark:bg-[#121212] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-[#2a2a2a] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-slate-50 dark:bg-[#1a1a1a] rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          {/* Top Badge */}
          <div className="flex items-center gap-2 mb-3">
            {Icon && <Icon className="w-4 h-4 text-slate-900 dark:text-white" />}
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {badgeText}
            </span>
          </div>
          
          {/* Dynamic Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
            {title}{" "}
            {highlightText && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-400">
                {highlightText}
              </span>
            )}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base max-w-2xl mt-3">
            {subtitle}
          </p>
        </div>

        {/* Optional Right Widget (e.g., Live Date or Action Button) */}
        {rightWidget && (
          <div className="shrink-0">
            {rightWidget}
          </div>
        )}
      </div>
    </header>
  );
}