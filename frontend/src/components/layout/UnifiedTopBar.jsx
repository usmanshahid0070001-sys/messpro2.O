import { Menu, Sun, Moon, Bell, Search, Settings } from 'lucide-react';
import useUIStore from '../../store/useUIStore';

export default function UnifiedTopBar({ title = 'MessPro', subtitle = '' }) {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-[#e0e0e0] dark:border-white/10 bg-[#fafafa]/80 dark:bg-[#050505]/80 backdrop-blur-md px-4 sm:px-6 transition-colors duration-300">
      
      {/* Left side: Hamburger (Mobile) & Titles */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-[#737373] hover:bg-[#f5f5f5] dark:text-slate-300 dark:hover:bg-white/5 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white leading-none">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#737373] dark:text-[#888888] hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search Bar (Hidden on very small screens) */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#a3a3a3] group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" />
          </div>
          <input
            className="w-48 xl:w-64 pl-10 pr-4 py-2 bg-[#f5f5f5] dark:bg-[#111111] border border-[#e0e0e0] dark:border-[#222222] rounded-full text-sm font-semibold text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-orange-500/20 focus:border-indigo-500 dark:focus:border-orange-500 transition-all placeholder:text-[#a3a3a3]"
            placeholder="Quick search..."
            aria-label="Search"
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-[#e0e0e0] bg-[#fafafa] text-[#737373] hover:bg-[#f5f5f5] dark:border-[#222222] dark:bg-[#111111] dark:text-slate-300 dark:hover:bg-[#1a1a1a] shadow-sm transition-all relative overflow-hidden"
          aria-label="Toggle Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
             <Sun className={`absolute w-5 h-5 transition-transform duration-500 ${theme === 'dark' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`} />
             <Moon className={`absolute w-5 h-5 transition-transform duration-500 ${theme === 'dark' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`} />
          </div>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-full border border-[#e0e0e0] bg-[#fafafa] text-[#737373] hover:bg-[#f5f5f5] dark:border-[#222222] dark:bg-[#111111] dark:text-slate-300 dark:hover:bg-[#1a1a1a] shadow-sm transition-all hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#050505]"></span>
        </button>

      </div>
    </header>
  );
}
