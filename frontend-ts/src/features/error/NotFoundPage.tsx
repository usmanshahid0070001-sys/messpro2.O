import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home,
  LayoutDashboard,
  ArrowLeft,
  SearchX,
  FileQuestion,
  HelpCircle,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeProvider';
import { useSEO } from '@/hooks/useSEO';
import type { RootState } from '@/store';
import logoUrl from '@/assets/pwa-192x192.png';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useSEO({
    title: '404 — Page Not Found',
    description: 'The requested page could not be found on MessPro 2.0. Return to the home screen or your authenticated dashboard.',
    robots: 'noindex, follow',
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Floating Header — Matches TermsPage, PrivacyPolicyPage, & Docs standard */}
      <header className="sticky top-0 z-40 bg-background/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-border/80 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity group"
            title="Return to MessPro Home"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 p-1 flex items-center justify-center shrink-0">
              <img
                src={logoUrl}
                alt="MessPro"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm text-foreground">
                MessPro
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                2.0
              </span>
            </div>
          </Link>

          {/* Breadcrumb Indicator */}
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1.5 pl-2 border-l border-border/60">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">404 Error</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-full border border-border/60 dark:border-white/10 hover:bg-muted/60 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </Button>
        </div>
      </header>

      {/* Main 404 Visual Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center text-center z-10">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs mb-6 animate-in fade-in zoom-in-95 duration-300">
          <SearchX className="w-3.5 h-3.5" />
          <span>Error 404 • Destination Lost</span>
        </div>

        {/* Large 404 Typography */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-foreground via-foreground/80 to-muted-foreground/40 bg-clip-text text-transparent select-none leading-none mb-3">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          This room doesn&apos;t seem to exist
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
          The link you followed may be broken, expired, or the room and page path might have been relocated.
        </p>

        {/* Recovery Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          {isAuthenticated ? (
            <Button
              asChild
              className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md gap-2"
            >
              <Link to="/app">
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md gap-2"
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold border-border/80 bg-card/60 hover:bg-muted/80 backdrop-blur-md gap-2"
          >
            <Link to="/docs">
              <FileQuestion className="w-4 h-4 text-muted-foreground" />
              <span>Read Documentation</span>
            </Link>
          </Button>
        </div>

        {/* Helpful Shortcut Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
          <Link
            to="/login"
            className="p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 transition-colors group flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Resident & Admin Portal</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sign in to your mess account or view bills.</p>
            </div>
          </Link>

          <Link
            to="/docs"
            className="p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card/80 transition-colors group flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Help & FAQ Center</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Find answers to billing, QR scans, and room setup.</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>Need urgent assistance? Reach our helpline at <span className="text-foreground font-semibold">+92 326 1678545</span> or email <span className="text-foreground font-semibold">support@messpro.app</span></p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
