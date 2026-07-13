export default function PageHeader({ 
  title, 
  highlightText, 
  subtitle, 
  badgeText, 
  icon: Icon, 
  rightWidget,
  as: HeadingTag = "h1" // defaults to h1; pass as="h2" if nested under another h1
}) {
  return (
    <header className="mb-8 glass-panel rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden">
      {/* Subtle monochrome background glow instead of blue */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#e0e0e0]/20 dark:bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          {/* Top Badge */}
          {badgeText && (
            <div className="flex items-center gap-2 mb-3">
              {Icon && (
                <span className="w-6 h-6 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-[#737373] dark:text-[#888888]" />
                </span>
              )}
              <span className="text-[10px] font-black text-[#737373] dark:text-[#888888] uppercase tracking-[0.3em]">
                {badgeText}
              </span>
            </div>
          )}

          {/* Dynamic Title */}
          <HeadingTag className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111111] dark:text-white mb-2 leading-tight">
            {title}
            {highlightText && (
              <>
                {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-[#dddddd] dark:to-white">
                  {highlightText}
                </span>
              </>
            )}
          </HeadingTag>

          {subtitle && (
            <p className="text-[#737373] dark:text-[#888888] font-semibold text-sm max-w-2xl mt-3">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Right Widget (e.g., Live Date or Action Button) */}
        {rightWidget && (
          <div className="shrink-0 w-full md:w-auto">
            {rightWidget}
          </div>
        )}
      </div>
    </header>
  );
}