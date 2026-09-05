import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  LogIn,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import type { RootState } from '@/store';
import type { SectionId, NavItem } from '../types';
import logoUrl from '@/assets/pwa-192x192.png';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
  onSetupClick?: () => void;
  onSupportClick?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'problem', label: 'The Pain' },
  { id: 'solution', label: 'Features' },
  { id: 'plans', label: 'Plans' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'faqs', label: 'FAQs' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate, onSetupClick, onSupportClick }) => {

  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePulse, setActivePulse] = useState(false);

  // Sliding pill state with spring physics
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Track scroll position for dynamic island compaction
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update sliding pill position and trigger micro-feedback pulse
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = navContainerRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeSection}"]`);
    if (activeEl) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setPillStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });

      // Quick brightness pulse on section change
      setActivePulse(true);
      const timer = setTimeout(() => setActivePulse(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  const handleNavClick = (id: SectionId) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <div className="fixed top-2.5 sm:top-4 inset-x-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none">
      {/* Compact Apple Dynamic Island Capsule */}
      <header
        className={`pointer-events-auto flex items-center justify-between gap-1.5 sm:gap-4 lg:gap-6 rounded-full border transition-all duration-300 max-w-[calc(100vw-1rem)] sm:max-w-max mx-auto shrink-0 ${
          scrolled
            ? 'py-1 px-2.5 sm:px-3 bg-background/90 dark:bg-neutral-950/90 backdrop-blur-2xl border-white/30 dark:border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] scale-[0.99]'
            : 'py-1.5 px-3 sm:px-3.5 bg-background/80 dark:bg-neutral-950/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
        }`}
      >
        
        {/* Left: Brand Lockup */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
          className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none rounded-full pr-0.5 sm:pr-1 shrink-0"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
            <img
              src={logoUrl}
              alt="MessPro"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="font-extrabold tracking-tight text-xs sm:text-sm text-foreground">
              MessPro
            </span>
            <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              2.0
            </span>
          </div>
        </a>

        {/* Center: Desktop Nav Items with Liquid Spring Pill */}
        <nav
          ref={navContainerRef}
          className="hidden md:flex items-center relative bg-muted/40 dark:bg-white/5 px-1 py-0.5 rounded-full border border-border/40 dark:border-white/10"
        >
          {/* Elastic liquid pill transition */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full bg-background dark:bg-white/15 border border-border/60 dark:border-white/20 shadow-2xs backdrop-blur-md pointer-events-none transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                data-nav-id={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative z-10 px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                  isActive
                    ? `text-foreground font-bold ${activePulse ? 'brightness-125' : ''}`
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Docs link */}
          <Link
            to="/docs"
            className="relative z-10 px-3 py-1 text-xs font-semibold rounded-full text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
          >
            <span>Docs</span>
          </Link>
        </nav>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 sm:p-1.5 rounded-full border border-border/60 dark:border-white/10 hover:bg-muted/60 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer focus:outline-none shrink-0"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>

          {/* Support Helpline Trigger (Desktop only) */}
          {onSupportClick && (
            <button
              type="button"
              onClick={onSupportClick}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 transition-all cursor-pointer shrink-0"
              title="Platform Support & Helpline"
            >
              <Headphones className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Support</span>
            </button>
          )}

          {/* Setup Hostel Button (Hidden on small mobile, prominent in mobile menu) */}
          {onSetupClick && (
            <button
              type="button"
              onClick={onSetupClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-xs active:scale-[0.97] transition-all cursor-pointer relative overflow-hidden shrink-0"
            >
              <Sparkles className="w-3 h-3 text-neutral-950" />
              <span>Setup Hostel</span>
            </button>
          )}

          {/* Login or Dashboard Button */}
          {isAuthenticated ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer relative overflow-hidden group shrink-0"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3 hidden sm:inline-block group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full bg-muted/60 dark:bg-white/10 hover:bg-muted text-foreground border border-border/60 dark:border-white/10 shadow-xs hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer relative overflow-hidden group shrink-0"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full border border-border/60 dark:border-white/10 text-foreground hover:bg-muted/60 transition-colors cursor-pointer focus:outline-none shrink-0"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-14 inset-x-4 max-w-sm mx-auto rounded-3xl border border-white/20 dark:border-white/10 bg-background/95 dark:bg-neutral-950/95 backdrop-blur-2xl p-4 space-y-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {onSetupClick && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSetupClick();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-neutral-950 font-black text-xs shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Setup Your Hostel (10-Day Free Trial)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer animate-in fade-in slide-in-from-top-1 duration-200 fill-mode-both ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'bg-muted/40 dark:bg-white/5 text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sparkles className="w-3 h-3" />}
                </button>
              );
            })}

            {/* Mobile Docs Link */}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
            >
              <span>Documentation</span>
              <BookOpen className="w-3 h-3" />
            </Link>

            {/* Mobile Support Helpline */}
            {onSupportClick && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSupportClick();
                }}
                className="col-span-2 flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Support Helpline & Upgrades</span>
                </div>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {/* Mobile Terms & Privacy */}
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-muted/40 dark:bg-white/5 text-foreground hover:bg-muted"
            >
              <span>Terms</span>
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-muted/40 dark:bg-white/5 text-foreground hover:bg-muted"
            >
              <span>Privacy</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-border/60 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Have an account?</span>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground"
            >
              <span>Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};


export default Navbar;
