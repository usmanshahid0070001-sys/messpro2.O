import React, { useState, useEffect } from 'react';
import {
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
  Utensils,
  Flame,
  Activity,
  Check,
  Lock,
  Clock,
  Radio,
  Layers,
  Wifi,
  ChevronRight,
  Copy,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Plus,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import type { RecentScan } from '../types';
import { toast } from 'sonner';

interface HeroSectionProps {
  onExploreClick: () => void;
  onCalculateClick: () => void;
  onSetupClick?: () => void;
}

const INITIAL_SCANS: RecentScan[] = [
  { name: 'Hamza Tariq', roll: '2023-EE-19', room: 'A-108', time: 'Just now', via: 'QR', meal: 'Dinner' },
  { name: 'Ali Hassan', roll: '2022-CS-41', room: 'B-204', time: '1m ago', via: 'Biometric', meal: 'Dinner' },
  { name: 'Bilal Ahmed', roll: '2021-ME-88', room: 'C-302', time: '3m ago', via: 'Manual', meal: 'Dinner' },
];

const SAMPLE_STUDENTS = [
  { name: 'Zaid Khan', roll: '2023-CS-12', room: 'A-102', plan: 'Hostel & Mess' },
  { name: 'Saad Farooq', roll: '2022-SE-05', room: 'B-310', plan: 'Mess Only' },
  { name: 'Daniyal Raza', roll: '2024-AI-99', room: 'C-105', plan: 'Hostel & Mess' },
  { name: 'Mustafa Ali', roll: '2021-EE-73', room: 'B-201', plan: 'Hostel Basic' },
  { name: 'Usman Shahid', roll: '2023-ME-14', room: 'A-214', plan: 'Hostel & Mess' },
];

const INITIAL_ROOMS = [
  { id: 'A-101', wing: 'Wing A', type: 'Triple', occupied: 3, capacity: 3, status: 'full' },
  { id: 'A-102', wing: 'Wing A', type: 'Twin', occupied: 1, capacity: 2, status: 'available' },
  { id: 'B-201', wing: 'Wing B', type: 'Single', occupied: 1, capacity: 1, status: 'full' },
  { id: 'B-202', wing: 'Wing B', type: 'Twin', occupied: 2, capacity: 2, status: 'full' },
  { id: 'B-203', wing: 'Wing B', type: 'Triple', occupied: 2, capacity: 3, status: 'available' },
  { id: 'C-301', wing: 'Wing C', type: 'Twin', occupied: 0, capacity: 2, status: 'sanitizing' },
];

const HEADLINE_WORDS_1 = ['Run', 'your', 'entire', 'mess', '&'];
const HEADLINE_WORDS_2 = ['hostel', 'without', 'the'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onCalculateClick,
  onSetupClick,
}) => {
  // Command Center State
  const [activeConsoleMode, setActiveConsoleMode] = useState<'gate' | 'rooms' | 'ledger' | 'dining'>('gate');
  const [scanCount, setScanCount] = useState<number>(248);
  const [scans, setScans] = useState<RecentScan[]>(INITIAL_SCANS);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanLaserActive, setScanLaserActive] = useState(false);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('A-102');
  const [mealPlateCount, setMealPlateCount] = useState<number>(58);
  const [isCopied, setIsCopied] = useState(false);
  const [hasGlitched, setHasGlitched] = useState(false);
  const [guestMealsBooked, setGuestMealsBooked] = useState<number>(3);

  // Mouse Parallax Glow
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
    setMousePos({ x: x * 24, y: y * 24 });
  };

  const handleSimulateScan = () => {
    if (isSimulatingScan) return;
    setIsSimulatingScan(true);
    setScanLaserActive(true);

    const randomStudent = SAMPLE_STUDENTS[Math.floor(Math.random() * SAMPLE_STUDENTS.length)];
    const methods: Array<'QR' | 'Biometric' | 'Manual'> = ['QR', 'QR', 'Biometric'];
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
      setScanLaserActive(false);
      setIsSimulatingScan(false);
      toast.success(`Verified: ${randomStudent.name} (${randomStudent.roll}) • Room ${randomStudent.room}`);
    }, 450);
  };

  const handleCheckInDemoResident = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.occupied < r.capacity) {
          const newOccupied = r.occupied + 1;
          return {
            ...r,
            occupied: newOccupied,
            status: newOccupied === r.capacity ? 'full' : 'available',
          };
        }
        return r;
      })
    );
    toast.success(`Bed allocated in Room ${roomId}! Occupancy matrix synchronized.`);
  };

  const handleCopySubdomain = () => {
    navigator.clipboard?.writeText('https://falcon-hall.messpro.app');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Workspace subdomain URL copied to clipboard');
  };

  // Derived Ledger Calculation
  const mealRate = 0.85; // USD per plate
  const roomRent = 75; // USD standard twin share
  const utilities = 12; // USD AC & WiFi
  const totalMealDues = Number((mealPlateCount * mealRate).toFixed(2));
  const totalLedgerDues = Number((totalMealDues + roomRent + utilities).toFixed(2));

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative pt-20 sm:pt-24 lg:pt-28 pb-14 sm:pb-20 overflow-hidden"
    >
      {/* ── Dynamic Ambient Light Flares & Cosmic Glow with Parallax ────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Core High-Energy Plasma Flare */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[260px] bg-gradient-to-tr from-amber-500/20 via-primary/10 to-emerald-500/15 dark:from-amber-500/25 dark:via-primary/15 dark:to-emerald-500/20 blur-[70px] rounded-full transition-transform duration-700 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5}px))`,
          }}
        />
        {/* Wide Ambient Background Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[480px] bg-gradient-to-br from-amber-500/10 via-primary/15 to-blue-500/10 dark:from-amber-500/15 dark:via-primary/20 dark:to-blue-500/15 blur-[140px] rounded-full transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(calc(-50% - ${mousePos.x}px), calc(-50% - ${mousePos.y}px))`,
          }}
        />
        {/* Sub-pixel Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ── Left Column: Value Copy ──────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
            
            {/* Liquid Glass Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 dark:border-white/15 bg-card/70 dark:bg-white/5 backdrop-blur-xl text-foreground text-xs font-semibold shadow-xs glass-bevel">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Version 2.0</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="font-bold text-foreground">
                Mess & Hostel OS
              </span>
            </div>

            {/* Word-by-Word Reveal Headline with Glitch Accent */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.08]">
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
              Eliminate meal fraud, automate room allocation, calculate dispute-free invoices, and scan dynamic QR attendance in real time — zero calculators, zero lost registers.
            </p>

            {/* 3 Value Assurance Checkmarks */}
            <div className="pt-1 pb-1 space-y-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300" />
                </div>
                <span><strong>Zero manual ledger math:</strong> Automated plate pricing, fines & dues.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300 delay-100" />
                </div>
                <span><strong>No ghost meal fraud:</strong> Instant 1-second Anti-Passback QR gate pass.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300 delay-200" />
                </div>
                <span><strong>Dispute-free student invoices:</strong> Itemized plate breakdowns on PDF.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Setup Hostel CTA */}
              <div className="relative p-[1px] rounded-full overflow-hidden inline-flex group shadow-lg shadow-primary/10">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#b8842a,#ff9800,#b8842a)] animate-spin-conic opacity-90 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={onSetupClick || onExploreClick}
                  className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Setup Hostel (10-Day Free Trial)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 hover:bg-muted/80 backdrop-blur-md text-foreground transition-all cursor-pointer glass-bevel"
              >
                <span>Explore Features</span>
              </button>

              <button
                type="button"
                onClick={onCalculateClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full border border-border/80 dark:border-white/15 bg-card/60 dark:bg-white/5 hover:bg-muted/80 backdrop-blur-md text-foreground transition-all cursor-pointer glass-bevel"
              >
                <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Calculate ROI</span>
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

          {/* ── Right Column: Next-Gen Holographic Quantum Command Console ────────────────── */}
          <div className="lg:col-span-6 relative">
            
            {/* 🛰️ Floating Hologram Satellite Pill 1: Top-Right (Anti-Passback Active) */}
            <div className="absolute -top-5 -right-3 sm:-right-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-card/90 dark:bg-neutral-900/90 border border-blue-500/30 shadow-xl backdrop-blur-xl animate-float-slow text-[11px] font-semibold text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Anti-Passback Active</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                0 Leaks
              </span>
            </div>

            {/* 🛰️ Floating Hologram Satellite Pill 2: Bottom-Left (Sync Radar) */}
            <div className="absolute -bottom-5 -left-3 sm:-left-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-card/90 dark:bg-neutral-900/90 border border-emerald-500/40 shadow-xl backdrop-blur-xl animate-float-medium text-[11px] font-semibold text-foreground">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Realtime Cloud Sync</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                12ms
              </span>
            </div>

            {/* 🛰️ Central 3D Command Deck Container */}
            <div className="relative rounded-3xl border border-white/40 dark:border-white/15 bg-card/85 dark:bg-neutral-950/85 p-4 sm:p-5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl glass-bevel overflow-hidden">
              
              {/* Top macOS Style Window Chrome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-border/70 dark:border-white/10">
                {/* Window Dots & Live Facility URL */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 pr-2 border-r border-border/60 dark:border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySubdomain}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 dark:bg-white/5 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    title="Click to copy subdomain"
                  >
                    <Lock className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-foreground font-semibold">falcon-hall</span>
                    <span>.messpro.app</span>
                    <Copy className="w-2.5 h-2.5 ml-1 text-muted-foreground" />
                  </button>
                </div>

                {/* Real-time Status Badge */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground self-start sm:self-auto">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Live OS v2.0
                  </span>
                </div>
              </div>

              {/* High-Tech Mode Switcher Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 mt-3 rounded-2xl bg-muted/40 dark:bg-white/5 border border-border/60 dark:border-white/10 text-xs font-semibold select-none">
                <button
                  type="button"
                  onClick={() => setActiveConsoleMode('gate')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                    activeConsoleMode === 'gate'
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">QR Gate</span>
                  <span className="sm:hidden">Gate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveConsoleMode('rooms')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                    activeConsoleMode === 'rooms'
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bed Matrix</span>
                  <span className="sm:hidden">Beds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveConsoleMode('ledger')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                    activeConsoleMode === 'ledger'
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auto-Ledger</span>
                  <span className="sm:hidden">Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveConsoleMode('dining')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                    activeConsoleMode === 'dining'
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Menu Sentinel</span>
                  <span className="sm:hidden">Menu</span>
                </button>
              </div>

              {/* ── MODE 1: QR & Biometric Gate Telemetry ────────────────────── */}
              {activeConsoleMode === 'gate' && (
                <div className="pt-3.5 space-y-3 animate-in fade-in duration-200">
                  {/* Realtime Scan Metric Banner with interactive Trigger */}
                  <div className="relative overflow-hidden p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
                    {/* Laser sweep line */}
                    {scanLaserActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-scan-sweep pointer-events-none" />
                    )}

                    <div>
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        Dinner Service • Gate Terminal #01
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-foreground tracking-tight">
                          {scanCount}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          plates validated today
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSimulatingScan}
                      onClick={handleSimulateScan}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-extrabold shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ScanLine className={`w-3.5 h-3.5 ${isSimulatingScan ? 'animate-spin' : ''}`} />
                      <span>{isSimulatingScan ? 'Verifying...' : 'Simulate Scan'}</span>
                    </button>
                  </div>

                  {/* Live Verification Stream List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      <span>Live Verification Stream</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Anti-Passback OK
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {scans.map((scan, idx) => {
                        const isLatest = idx === 0 && isSimulatingScan;
                        return (
                          <div
                            key={`${scan.roll}-${idx}`}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                              isLatest
                                ? 'bg-amber-500/20 border-amber-500/50 shadow-md scale-[1.01]'
                                : 'bg-muted/30 dark:bg-white/5 hover:bg-muted/60 border-border/60 dark:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 border border-primary/20">
                                {scan.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-foreground text-xs block leading-tight truncate">
                                  {scan.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {scan.roll} • Room {scan.room}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {scan.via} Verified
                              </span>
                              <span className="text-[9px] text-muted-foreground block mt-0.5 font-medium">
                                {scan.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MODE 2: Dynamic Bed & Wing Occupancy HUD ──────────────────── */}
              {activeConsoleMode === 'rooms' && (
                <div className="pt-3.5 space-y-3 animate-in fade-in duration-200 text-xs">
                  {/* Occupancy Stats Header */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-muted/40 dark:bg-white/5 border border-border/60 dark:border-white/10">
                      <span className="text-base font-black text-foreground block">120</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Total Beds</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">112</span>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold">Occupied (93%)</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <span className="text-base font-black text-blue-600 dark:text-blue-400 block">8</span>
                      <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-semibold">Available</span>
                    </div>
                  </div>

                  {/* Interactive Room Pod Matrix */}
                  <div className="p-3 rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/60 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                      <span>Wing A & B • Interactive Floorplan Matrix</span>
                      <span className="text-[10px] text-muted-foreground">Click room to allocate</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {rooms.map((room) => {
                        const isSelected = selectedRoomId === room.id;
                        const isFull = room.occupied === room.capacity;
                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs scale-105'
                                : isFull
                                ? 'border-border/60 bg-background/50 hover:bg-muted/40'
                                : 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                            }`}
                          >
                            <span className="font-bold text-foreground text-xs block">{room.id}</span>
                            <span
                              className={`text-[9px] font-bold block ${
                                isFull ? 'text-muted-foreground' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {room.occupied}/{room.capacity} Beds
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Room Inspector & Quick Allotment Action */}
                  <div className="p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-foreground text-xs block">
                        Room {selectedRoomId} ({rooms.find((r) => r.id === selectedRoomId)?.type})
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {rooms.find((r) => r.id === selectedRoomId)?.occupied}/
                        {rooms.find((r) => r.id === selectedRoomId)?.capacity} Beds Allocated • Housekeeping Clean
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckInDemoResident(selectedRoomId)}
                      disabled={
                        (rooms.find((r) => r.id === selectedRoomId)?.occupied || 0) >=
                        (rooms.find((r) => r.id === selectedRoomId)?.capacity || 0)
                      }
                      className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer"
                    >
                      + Allocate Bed
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODE 3: Automated Ledger & Dispute-Free Invoicing ────────── */}
              {activeConsoleMode === 'ledger' && (
                <div className="pt-3.5 space-y-3 animate-in fade-in duration-200 text-xs">
                  {/* Ledger Breakdown Card */}
                  <div className="p-3.5 rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/70 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div>
                        <span className="font-bold text-foreground text-xs block">
                          Student Monthly Statement #MP-9842
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Hamza Tariq (2023-EE-19) • Room A-108
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        100% Reconciled
                      </span>
                    </div>

                    {/* Itemized Table */}
                    <div className="divide-y divide-border/50 text-[11px] space-y-1.5">
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Utensils className="w-3 h-3 text-emerald-500" />
                          Mess Dining ({mealPlateCount} plates @ ${mealRate})
                        </span>
                        <span className="font-bold text-foreground font-mono">${totalMealDues}</span>
                      </div>

                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <BedDouble className="w-3 h-3 text-teal-500" />
                          Twin Room Monthly Rent
                        </span>
                        <span className="font-bold text-foreground font-mono">${roomRent}.00</span>
                      </div>

                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-500" />
                          AC Utility & WiFi Meter
                        </span>
                        <span className="font-bold text-foreground font-mono">${utilities}.00</span>
                      </div>
                    </div>

                    {/* Total Row */}
                    <div className="pt-2 border-t border-border/70 flex justify-between items-center text-xs font-black">
                      <span className="text-foreground">Total Auto-Generated Due:</span>
                      <span className="text-base text-foreground font-mono">
                        ${totalLedgerDues}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Meal Plate Slider */}
                  <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>Simulate Monthly Plate Consumption:</span>
                      <span className="font-bold text-foreground">{mealPlateCount} Verified Plates</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={90}
                      value={mealPlateCount}
                      onChange={(e) => setMealPlateCount(parseInt(e.target.value, 10))}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* ── MODE 4: Smart Weekly Menu & Cutoff Sentinel ──────────────── */}
              {activeConsoleMode === 'dining' && (
                <div className="pt-3.5 space-y-3 animate-in fade-in duration-200 text-xs">
                  {/* Today's Menu Highlight Card */}
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Tonight's Dinner Menu
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        8:00 PM - 10:30 PM
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-foreground">
                      Chicken Biryani • Mint Raita • Fresh Salad • Kheer
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-md bg-muted font-medium">Halal</span>
                      <span className="px-2 py-0.5 rounded-md bg-muted font-medium">Chef Tariq</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">
                        650 kCal / plate
                      </span>
                    </div>
                  </div>

                  {/* Cutoff Timer & Guest Booking Strip */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Cutoff Countdown
                      </span>
                      <span className="font-extrabold text-foreground text-xs font-mono block">
                        42 mins remaining
                      </span>
                      <span className="text-[9px] text-muted-foreground block">
                        To cancel meal or book guests
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        <span>Guest Diners</span>
                        <span>{guestMealsBooked} Plates</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGuestMealsBooked((prev) => prev + 1);
                          toast.success('Guest meal token added to student ledger!');
                        }}
                        className="w-full py-1 rounded-lg bg-primary text-primary-foreground font-bold text-[10px] shadow-xs hover:opacity-90 cursor-pointer"
                      >
                        + Book Guest Plate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Console Footer Telemetry Strip */}
              <div className="mt-3 pt-3 border-t border-border/60 dark:border-white/10 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted Ledger Protocol</span>
                </span>
                <span className="text-foreground font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  100% Paperless Automation
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
