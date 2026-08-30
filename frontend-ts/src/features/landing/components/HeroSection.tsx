import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calculator,
  ScanLine,
  BedDouble,
  Receipt,
  Sparkles,
  Users,
  Utensils
} from 'lucide-react';
import type { RecentScan } from '../types';

interface HeroSectionProps {
  onExploreClick: () => void;
  onCalculateClick: () => void;
}

const INITIAL_SCANS: RecentScan[] = [
  { name: 'Hamza Tariq', roll: '2023-EE-19', room: 'A-108', time: 'Just now', via: 'QR', meal: 'Dinner' },
  { name: 'Ali Hassan', roll: '2022-CS-41', room: 'B-204', time: '1m ago', via: 'Biometric', meal: 'Dinner' },
  { name: 'Bilal Ahmed', roll: '2021-ME-88', room: 'C-302', time: '3m ago', via: 'Manual', meal: 'Dinner' },
];

const SAMPLE_NAMES = [
  { name: 'Zaid Khan', roll: '2023-CS-12', room: 'A-102' },
  { name: 'Saad Farooq', roll: '2022-SE-05', room: 'B-310' },
  { name: 'Daniyal Raza', roll: '2024-AI-99', room: 'C-105' },
  { name: 'Mustafa Ali', roll: '2021-EE-73', room: 'B-201' },
  { name: 'Usman Shahid', roll: '2023-ME-14', room: 'A-214' },
];

const HEADLINE_WORDS_1 = ['Run', 'your', 'entire', 'mess', '&'];
const HEADLINE_WORDS_2 = ['hostel', 'without', 'the'];

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onCalculateClick }) => {
  const [scanCount, setScanCount] = useState<number>(248);
  const [scans, setScans] = useState<RecentScan[]>(INITIAL_SCANS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [newScanFlash, setNewScanFlash] = useState(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'occupancy' | 'billing'>('scanner');
  const [hasGlitched, setHasGlitched] = useState(false);

  // Mouse parallax offset for ambient background orbs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setHasGlitched(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x: x * 20, y: y * 20 });
  };

  const handleSimulateScan = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const randomStudent = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const methods: Array<'QR' | 'Biometric' | 'Manual'> = ['QR', 'QR', 'Biometric', 'Manual'];
    const chosenMethod = methods[Math.floor(Math.random() * methods.length)];

    setTimeout(() => {
      setScanCount((prev) => prev + 1);
      setScans((prev) => [
        {
          name: randomStudent.name,
          roll: randomStudent.roll,
          room: randomStudent.room,
          time: 'Just now',
          via: chosenMethod,
          meal: 'Dinner',
        },
        ...prev.slice(0, 2),
      ]);
      setNewScanFlash(true);
      setTimeout(() => setNewScanFlash(false), 600);
      setIsSimulating(false);
    }, 350);
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 overflow-hidden"
    >
      {/* ── Dynamic Ambient Light Flares with Parallax ────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Core high-saturation flare (blur 40px) */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[180px] bg-amber-500/25 dark:bg-amber-500/30 blur-[50px] rounded-full transition-transform duration-700 ease-out"
          style={{ transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5}px))` }}
        />
        {/* Wide ambient background orb (blur 120px) */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-primary/20 to-orange-500/10 dark:from-amber-500/20 dark:via-primary/25 dark:to-orange-500/15 blur-[120px] rounded-full transition-transform duration-1000 ease-out"
          style={{ transform: `translate(calc(-50% - ${mousePos.x}px), calc(-50% - ${mousePos.y}px))` }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Value Copy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            
            {/* Liquid Glass Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 backdrop-blur-xl text-foreground text-xs font-semibold shadow-2xs glass-bevel">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Version 2.0</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="font-bold text-foreground">Mess & Hostel OS</span>
            </div>

            {/* Word-by-Word Reveal Headline with Glitch Accent */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              <span className="inline-flex flex-wrap gap-x-2">
                {HEADLINE_WORDS_1.map((w, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  >
                    {w}
                  </span>
                ))}
              </span>{' '}
              <span className="inline-flex flex-wrap gap-x-2">
                {HEADLINE_WORDS_2.map((w, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${(i + 5) * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  >
                    {w}
                  </span>
                ))}
              </span>{' '}
              <span
                className={`bg-gradient-to-r from-amber-500 via-primary to-orange-500 bg-clip-text text-transparent inline-block ${
                  hasGlitched ? 'glitch-burst' : ''
                }`}
              >
                paper chaos
              </span>.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl font-normal leading-relaxed">
              Track meals, allocate rooms, generate dispute-free bills, and automate QR attendance — zero calculators, zero missing registers.
            </p>

            {/* "Without The Fear" - 3 Trust Pillars with Draw-on Effect */}
            <div className="pt-1 pb-1 space-y-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300" />
                </div>
                <span><strong>Zero manual ledger math:</strong> Automated meal prices, fines & dues.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300 delay-100" />
                </div>
                <span><strong>No ghost meal fraud:</strong> Instant 1-second QR & Biometric gate pass.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300 delay-200" />
                </div>
                <span><strong>Dispute-free student invoices:</strong> Itemized plate breakdowns on PDF.</span>
              </div>
            </div>

            {/* Action Buttons with 1px Rotating Conic Gradient Signature */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="relative p-[1px] rounded-full overflow-hidden inline-flex group">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#b8842a,#ff9800,#b8842a)] animate-spin-conic opacity-70 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Explore Features</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <button
                type="button"
                onClick={onCalculateClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 hover:bg-muted/80 backdrop-blur-md text-foreground transition-all cursor-pointer glass-bevel"
              >
                <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Calculate Savings</span>
              </button>
            </div>

            {/* Proof Metric Strip */}
            <div className="pt-3 flex items-center gap-5 text-xs text-muted-foreground border-t border-border/60 dark:border-white/10">
              <div>
                <span className="font-extrabold text-foreground text-xs sm:text-sm">100%</span> Audit Accuracy
              </div>
              <div className="w-px h-3.5 bg-border/80 dark:bg-white/10" />
              <div>
                <span className="font-extrabold text-foreground text-xs sm:text-sm">&lt; 1s</span> Gate Pass
              </div>
              <div className="w-px h-3.5 bg-border/80 dark:bg-white/10" />
              <div>
                <span className="font-extrabold text-foreground text-xs sm:text-sm">3-Min</span> Onboarding
              </div>
            </div>
          </div>

          {/* Right Column: Aceternity Glass Simulator Deck */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/30 dark:border-white/10 bg-card/70 dark:bg-neutral-950/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl glass-bevel">
              
              {/* Glass Header & Tab Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                    Live Operations Deck
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-muted/50 dark:bg-white/5 p-0.5 rounded-full border border-border/50 dark:border-white/10 text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scanner')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      activeTab === 'scanner' ? 'bg-background dark:bg-white/20 text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Mess Gate
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('occupancy')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      activeTab === 'occupancy' ? 'bg-background dark:bg-white/20 text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Beds
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('billing')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      activeTab === 'billing' ? 'bg-background dark:bg-white/20 text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Ledger
                  </button>
                </div>
              </div>

              {/* Tab 1: Live QR Scanner Gate */}
              {activeTab === 'scanner' && (
                <div className="pt-3.5 space-y-3">
                  {/* Real-time Scan Metric Banner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 block">
                        Dinner Session Served
                      </span>
                      <span className="text-xl font-black text-foreground tracking-tight">
                        {scanCount} <span className="text-xs font-normal text-muted-foreground">plates verified</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={handleSimulateScan}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ScanLine className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
                      <span>{isSimulating ? 'Validating...' : 'Simulate Scan'}</span>
                    </button>
                  </div>

                  {/* Live Scans Feed with Scanner Highlight Sweep */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Live Gate Verification Stream
                    </span>
                    <div className="space-y-1.5">
                      {scans.map((scan, idx) => {
                        const isLatest = idx === 0 && newScanFlash;
                        return (
                          <div
                            key={`${scan.roll}-${idx}`}
                            className={`relative overflow-hidden flex items-center justify-between p-2 rounded-xl border text-xs transition-all duration-300 ${
                              isLatest
                                ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/40 scale-[1.01] shadow-xs'
                                : 'bg-card/60 dark:bg-white/5 hover:bg-muted/60 border-border/60 dark:border-white/10'
                            }`}
                          >
                            {/* Scan sweep light beam */}
                            {isLatest && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent animate-scan-sweep pointer-events-none" />
                            )}

                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center">
                                {scan.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-foreground block text-xs leading-tight">{scan.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {scan.roll} • Room {scan.room}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {scan.via}
                              </span>
                              <span className="text-[9px] text-muted-foreground block mt-0.5">{scan.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Occupancy Mini-View */}
              {activeTab === 'occupancy' && (
                <div className="pt-3.5 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-card/60 dark:bg-white/5 border border-border/60 dark:border-white/10">
                      <span className="text-base font-black text-foreground block">120</span>
                      <span className="text-[10px] text-muted-foreground">Total Beds</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">112</span>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Occupied</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <span className="text-base font-black text-blue-600 dark:text-blue-400 block">8</span>
                      <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Available</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-card/60 dark:bg-white/5 border border-border/60 dark:border-white/10 space-y-1.5">
                    <span className="text-xs font-bold text-foreground block">Wing B • Floor 2 Status</span>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      {['B-201 (3/3)', 'B-202 (2/2)', 'B-203 (3/3)', 'B-204 (1/2)'].map((r, i) => (
                        <div key={i} className="p-1 rounded-lg bg-background dark:bg-neutral-900 border border-border/60 dark:border-white/10 text-[10px] font-semibold text-foreground">
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Automated Ledger Mini-View */}
              {activeTab === 'billing' && (
                <div className="pt-3.5 space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-card/60 dark:bg-white/5 border border-border/60 dark:border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-foreground font-bold">
                      <span>Monthly Statement #INV-2026-08</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10">Auto-Calculated</span>
                    </div>
                    <div className="divide-y divide-border/60 dark:divide-white/10 text-muted-foreground text-[10px]">
                      <div className="flex justify-between py-1">
                        <span>Dietary Meals (62 plates @ 180 PKR)</span>
                        <span className="font-bold text-foreground">11,160 PKR</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Room Rent (Standard Twin)</span>
                        <span className="font-bold text-foreground">14,000 PKR</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Electricity & Maintenance</span>
                        <span className="font-bold text-foreground">1,500 PKR</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-1 font-black text-foreground border-t border-border/60 dark:border-white/10 text-xs">
                      <span>Total Due</span>
                      <span>26,660 PKR</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deck Footer */}
              <div className="mt-3 pt-2.5 border-t border-border/60 dark:border-white/10 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Instant Cloud Sync
                </span>
                <span className="font-semibold">100% Paperless</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
