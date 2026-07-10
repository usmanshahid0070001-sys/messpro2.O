export default function PageHeader({ 
  title, 
  highlightText, 
  subtitle, 
  badgeText, 
  icon: Icon, 
  rightWidget 
}) {
  return (
    <header className="mb-8 glass-panel rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden">
      {/* Subtle monochrome background glow instead of blue */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#e0e0e0]/20 dark:bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          {/* Top Badge */}
          <div className="flex items-center gap-2 mb-3">
            {Icon && <Icon className="w-4 h-4 text-[#737373] dark:text-[#888888]" />}
            <span className="text-[10px] font-black text-[#737373] dark:text-[#888888] uppercase tracking-[0.3em]">
              {badgeText}
            </span>
          </div>
          
          {/* Dynamic Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-[#111111] dark:text-white mb-2 leading-tight">
            {title}{" "}
            {highlightText && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-[#dddddd] dark:to-white">
                {highlightText}
              </span>
            )}
          </h2>
          
          <p className="text-[#737373] dark:text-[#888888] font-semibold text-sm max-w-2xl mt-3">
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