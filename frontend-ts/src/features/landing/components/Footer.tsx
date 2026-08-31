import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Heart,
  ArrowUpRight,
  Building2,
  BookOpen,
  FileText,
  Lock,
  ArrowRight,
  Scale
} from 'lucide-react';
import logoUrl from '@/assets/pwa-192x192.png';

interface FooterProps {
  onNavigate?: (id: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/#${id}`;
      }
    }
  };

  return (
    <footer className="bg-background border-t border-border/80 dark:border-white/10 pt-16 pb-12 text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          {/* Col 1 & 2: Brand Lockup & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 shadow-sm">
                <div className="w-full h-full bg-background dark:bg-neutral-950 rounded-full flex items-center justify-center overflow-hidden p-1">
                  <img src={logoUrl} alt="MessPro" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-foreground tracking-tight">MessPro</span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                  v2.0
                </span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-sm text-xs">
              The modern automated management platform for student residences, hostels, and mess operations. Built for speed, audit compliance, and zero ledger disputes.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20 glass-bevel">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider block text-[11px]">
              Navigation
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('hero')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Overview & Hero
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('problem')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  The Paper Trap
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('solution')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  7 Core Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('how-it-works')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Setup in 4 Steps
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('faqs')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Documentation & Guides */}
          <div className="space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-primary" />
              <span>Documentation</span>
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/docs" className="hover:text-foreground transition-colors font-medium text-primary flex items-center gap-1">
                  <span>Getting Started</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </li>
              <li>
                <Link to="/docs?section=attendance" className="hover:text-foreground transition-colors">
                  QR Attendance Scanner
                </Link>
              </li>
              <li>
                <Link to="/docs?section=residence" className="hover:text-foreground transition-colors">
                  Room & Bed Allocation
                </Link>
              </li>
              <li>
                <Link to="/docs?section=dining-mess" className="hover:text-foreground transition-colors">
                  Meal Schedule & Menu
                </Link>
              </li>
              <li>
                <Link to="/docs?section=billing-finance" className="hover:text-foreground transition-colors">
                  Automated Billing Engine
                </Link>
              </li>
              <li>
                <Link to="/docs?section=pwa-mobile" className="hover:text-foreground transition-colors">
                  PWA & Mobile Install
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policy */}
          <div className="space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
              <Scale className="w-3 h-3 text-emerald-500" />
              <span>Legal & Policy</span>
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Terms of Service</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Privacy Policy</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/privacy#attendance-data" className="hover:text-foreground transition-colors">
                  Biometric & QR Data Security
                </Link>
              </li>
              <li>
                <Link to="/terms#saas-scope" className="hover:text-foreground transition-colors">
                  SLA & Availability
                </Link>
              </li>
              <li>
                <a href="mailto:privacy@messpro.io" className="hover:text-foreground transition-colors">
                  DPA Requests
                </a>
              </li>
            </ul>
          </div>

          {/* Col 6: Support & Portal */}
          <div className="space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider block text-[11px]">
              Direct Support
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <a href="mailto:support@messpro.io" className="hover:text-foreground transition-colors truncate">
                  support@messpro.io
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <a href="mailto:security@messpro.io" className="hover:text-foreground transition-colors truncate">
                  security@messpro.io
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Sign In to Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} MessPro Technologies. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Back to top &uarr;
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
