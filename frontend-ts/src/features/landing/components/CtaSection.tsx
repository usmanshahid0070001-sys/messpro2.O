import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  LogIn
} from 'lucide-react';
import type { RootState } from '@/store';

interface CtaSectionProps {
  onSetupClick?: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onSetupClick }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <section id="cta" className="py-20 sm:py-28 lg:py-32 bg-muted/20 dark:bg-neutral-950/60 border-t border-border/60 dark:border-white/10 relative overflow-hidden">
      
      {/* Dynamic breathing radial heartbeat flare */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[350px] bg-amber-500/20 dark:bg-amber-500/25 blur-[120px] rounded-full animate-pulse [animation-duration:4s]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        
        {/* Value Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide glass-bevel">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Your Hostel Today</span>
        </div>

        {/* Main CTA Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Ready to eliminate paper chaos and run a dispute-free mess?
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Join modern hostels and university residences that save 100+ administrative hours every month with MessPro.
        </p>

        {/* CTA Buttons with 1px Rotating Conic Gradient Signature */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          {/* Setup Hostel Primary Action */}
          <div className="relative p-[1px] rounded-full overflow-hidden inline-flex group">
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#b8842a,#ff9800,#b8842a)] animate-spin-conic opacity-90 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={onSetupClick}
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 text-xs sm:text-sm font-extrabold rounded-full bg-primary text-primary-foreground shadow-xl hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Setup Your Hostel (10-Day Free Trial)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Secondary Action */}
          {isAuthenticated ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 hover:bg-muted/80 backdrop-blur-md text-foreground transition-colors glass-bevel"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 hover:bg-muted/80 backdrop-blur-md text-foreground transition-colors glass-bevel"
            >
              <LogIn className="w-4 h-4 text-muted-foreground" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Reassurance Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Fast 3-minute onboarding</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>10-day full access trial</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Official Superadmin approval</span>
          </div>
        </div>

      </div>
    </section>
  );
};

