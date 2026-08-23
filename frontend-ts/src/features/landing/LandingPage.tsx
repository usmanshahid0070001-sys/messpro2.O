import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  QrCode,
  Receipt,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  TrendingDown,
  FileSpreadsheet,
  HelpCircle,
  Sun,
  Moon,
  Zap,
  DollarSign,
  Fingerprint,
  ScanLine,
  Wrench,
  ClipboardList,
  UserCog,
  Building2,
  Layers,
  BadgeCheck,
  ListChecks,
  Banknote,
  ShieldAlert,
  Plus,
  Minus,
  Star,
  ArrowRightLeft,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import logoUrl from '@/assets/pwa-192x192.png';

// ── Brand tokens ──────────────────────────────────────────────────────────
// A "ledger & stamp" identity: the whole pitch is "your paper register,
// digitized" — so the visual system borrows from registers, receipts and
// ink stamps rather than generic SaaS blue/gradient defaults.
const BRAND = {
  gold: '#B8842A',       // turmeric / ink-stamp gold — primary accent
  goldSoft: 'rgba(184,132,42,0.12)',
  green: '#2E6B57',      // verification green — confirmations, "paid"
  greenSoft: 'rgba(46,107,87,0.12)',
  brick: '#A6432F',      // register-ink red — "before", pain, alerts
  brickSoft: 'rgba(166,67,47,0.12)',
  steel: '#4F6B85',      // steel-blue — tertiary, staff/ops
  steelSoft: 'rgba(79,107,133,0.12)',
};

type ConfigMode = 'mess' | 'hostel' | 'both';
type RolePanel = 'admin' | 'manager' | 'student';

const MODULES: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  appliesTo: ConfigMode[];
}> = [
  { key: 'attendance', label: 'Meal attendance & QR gate', icon: <QrCode className="w-4 h-4" />, appliesTo: ['mess', 'both'] },
  { key: 'costing', label: 'Daily cost-per-plate split', icon: <DollarSign className="w-4 h-4" />, appliesTo: ['mess', 'both'] },
  { key: 'menu', label: 'Weekly menu & waste forecast', icon: <Utensils className="w-4 h-4" />, appliesTo: ['mess', 'both'] },
  { key: 'billing', label: 'Monthly ledger & invoices', icon: <Receipt className="w-4 h-4" />, appliesTo: ['mess', 'hostel', 'both'] },
  { key: 'rooms', label: 'Room & bed allocation', icon: <BedDouble className="w-4 h-4" />, appliesTo: ['hostel', 'both'] },
  { key: 'cleaning', label: 'Cleaning & maintenance logs', icon: <Wrench className="w-4 h-4" />, appliesTo: ['hostel', 'both'] },
  { key: 'complaints', label: 'Complaints & grievance desk', icon: <ClipboardList className="w-4 h-4" />, appliesTo: ['mess', 'hostel', 'both'] },
  { key: 'staff', label: 'Staff shifts & duty roster', icon: <UserCog className="w-4 h-4" />, appliesTo: ['mess', 'hostel', 'both'] },
  { key: 'users', label: 'User accounts & role access', icon: <Layers className="w-4 h-4" />, appliesTo: ['mess', 'hostel', 'both'] },
];

export const LandingPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // ── Interactive Demo Simulator State ──────────────────────────────────
  const [activeSimTab, setActiveSimTab] = useState<'attendance' | 'pricing' | 'billing' | 'rooms'>('attendance');
  const [scanCount, setScanCount] = useState<number>(142);
  const [recentScans, setRecentScans] = useState<Array<{ name: string; roll: string; room: string; time: string; via: string }>>([
    { name: 'Ali Hassan', roll: '2022-CS-41', room: 'B-204', time: 'Just now', via: 'QR' },
    { name: 'Hamza Tariq', roll: '2023-EE-19', room: 'A-108', time: '1 min ago', via: 'Biometric' },
    { name: 'Bilal Ahmed', roll: '2021-ME-88', room: 'C-302', time: '3 mins ago', via: 'Manual' },
  ]);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // ── Config toggle (Mess only / Hostel only / Both) ────────────────────
  const [configMode, setConfigMode] = useState<ConfigMode>('both');

  // ── Role panel preview ─────────────────────────────────────────────────
  const [rolePanel, setRolePanel] = useState<RolePanel>('admin');

  // ── FAQ accordion ───────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ── ROI Calculator State ────────────────────────────────────────────────
  const [studentCapacity, setStudentCapacity] = useState<number>(250);
  const [avgDailyExpense, setAvgDailyExpense] = useState<number>(350);

  const roiMetrics = useMemo(() => {
    const monthlyGrocery = studentCapacity * avgDailyExpense * 30;
    const estimatedSavings = Math.round(monthlyGrocery * 0.18);
    const staffHoursSaved = Math.round(studentCapacity * 0.35);
    const disputedBillsPrevented = Math.round(studentCapacity * 0.42);
    return {
      monthlySavings: estimatedSavings.toLocaleString(),
      hoursSaved: staffHoursSaved,
      disputesPrevented: disputedBillsPrevented,
    };
  }, [studentCapacity, avgDailyExpense]);

  const handleSimulateScan = () => {
    if (isSimulatingScan) return;
    setIsSimulatingScan(true);
    const names = ['Usman Shahid', 'Zaid Khan', 'Saad Farooq', 'Mustafa Ali', 'Daniyal Raza'];
    const rolls = ['2023-CS-12', '2022-SE-05', '2024-AI-99', '2021-EE-73', '2023-ME-14'];
    const rooms = ['A-102', 'B-310', 'C-105', 'B-201', 'A-214'];
    const methods = ['QR', 'Biometric', 'Manual'];
    const idx = Math.floor(Math.random() * names.length);
    setTimeout(() => {
      setScanCount((prev) => prev + 1);
      setRecentScans((prev) => [
        { name: names[idx], roll: rolls[idx], room: rooms[idx], time: 'Just now', via: methods[Math.floor(Math.random() * methods.length)] },
        ...prev.slice(0, 3),
      ]);
      setIsSimulatingScan(false);
    }, 450);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const configCopy: Record<ConfigMode, { title: string; blurb: string }> = {
    mess: {
      title: 'Running a mess or canteen only',
      blurb: 'No dorms to manage. You get meal attendance, menu planning, cost-per-plate splitting and billing — nothing about rooms clutters the screen.',
    },
    hostel: {
      title: 'Running rooms only, no dining hall',
      blurb: 'No meals to track. You get room allocation, cleaning logs, maintenance tickets and rent billing — the mess modules simply stay switched off.',
    },
    both: {
      title: 'Running the full residence — beds and meals',
      blurb: 'Everything is on: attendance feeds the kitchen, room fees and mess charges land on one invoice, and one dashboard covers the whole property.',
    },
  };

  const faqs = [
    {
      q: 'We only run a mess, not a hostel. Do we still need the room features?',
      a: 'No. During setup you tell us your operation is mess-only and the room allocation, bed maps and cleaning schedules are switched off entirely. You are never charged for modules you do not use, and your staff never see screens they do not need.',
    },
    {
      q: 'What if we only manage hostel rooms and outsource food to a separate contractor?',
      a: 'Choose the hostel-only setup. You keep room allocation, maintenance logs and rent billing, and skip meal attendance and kitchen costing. If the contractor later wants in, we can turn mess modules on without starting over.',
    },
    {
      q: 'How is pricing worked out if every hostel is different?',
      a: 'We scope your plan to two things: how many residents you manage, and which modules you switch on. A 60-bed hostel with no mess pays for a different footprint than a 500-seat mess with three shifts. Tell us your numbers and we send a quote the same day.',
    },
    {
      q: 'Do we need to buy biometric machines or special scanners?',
      a: 'No. Staff and students can check in with a phone camera reading a rotating QR code, or a manager can tally by name from a list. If you already own biometric hardware such as ZKTeco or Hikvision devices, we connect to it — you are not required to buy anything new.',
    },
    {
      q: 'Can all three attendance methods run at the same gate?',
      a: 'Yes. A hall can scan QR codes on one lane, run a biometric thumb reader on another, and let a supervisor tally latecomers by hand — every method writes to the same live count, so kitchen quotas and billing never have to be reconciled by hand.',
    },
    {
      q: 'Who can see what — students, mess managers, and wardens?',
      a: 'Access is role-based. Students see only their own meals, bill and complaint tickets. Managers see daily operations for the halls or wings assigned to them. Admins and wardens see full financials, staff rosters and cross-property reports. Nobody sees more than their role requires.',
    },
    {
      q: 'Can we add custom charges like electricity, fines, or a laundry fee?',
      a: 'Yes. When a monthly bill is generated you can attach a one-off or recurring charge to a single resident, a room, or an entire wing, and it lands on the same invoice as meals and rent.',
    },
    {
      q: 'Can we bring our existing student list instead of typing everyone in?',
      a: 'Yes. Upload an Excel or CSV with names, roll numbers and room numbers, and every account, login and ledger starts pre-filled — no manual entry for your first batch.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[color:rgba(184,132,42,0.25)] font-sans transition-colors duration-200" style={{ ['--brand-gold' as any]: BRAND.gold }}>
      {/* Fonts + signature motifs (stamp / perforation / ledger rule) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .mp-display { font-family: 'Fraunces', ui-serif, Georgia, serif; letter-spacing: -0.01em; }
        .mp-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        .mp-eyebrow {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        @keyframes mp-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mp-rise { animation: mp-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .mp-rise-1 { animation-delay: 0.05s; }
        .mp-rise-2 { animation-delay: 0.15s; }
        .mp-rise-3 { animation-delay: 0.25s; }

        @keyframes mp-stamp-in {
          0% { opacity: 0; transform: scale(1.6) rotate(-14deg); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: scale(1) rotate(-8deg); }
        }
        .mp-stamp { animation: mp-stamp-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 0.4s; }

        @keyframes mp-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .mp-pulse-dot { animation: mp-pulse-dot 1.8s ease-in-out infinite; }

        .mp-perforation {
          height: 18px;
          background-image: radial-gradient(circle, var(--mp-perf-color, rgba(120,120,120,0.35)) 2.4px, transparent 2.6px);
          background-size: 22px 22px;
          background-position: 11px 0;
        }

        .mp-ledger-rule {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 27px,
            rgba(120,120,120,0.14) 27px,
            rgba(120,120,120,0.14) 28px
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-rise, .mp-stamp, .mp-pulse-dot { animation: none !important; }
        }
      `}</style>

      {/* ── Sticky Navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/60 bg-card shadow-sm p-1.5 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src={logoUrl}
                alt="MessPro Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="mp-display font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">MessPro</span>
                <span
                  className="mp-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border"
                  style={{ color: BRAND.gold, borderColor: 'rgba(184,132,42,0.35)', background: BRAND.goldSoft }}
                >
                  2.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Hostel &amp; Mess, run from one ledger</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#configure" className="hover:text-foreground transition-colors">Built for your setup</a>
            <a href="#panels" className="hover:text-foreground transition-colors">Panels</a>
            <a href="#attendance" className="hover:text-foreground transition-colors">Attendance</a>
            <a href="#interactive-demo" className="hover:text-foreground transition-colors">Live demo</a>
            <a href="#plans" className="hover:text-foreground transition-colors">Plans</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
            >
              <span>Log in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[420px] -z-10 opacity-[0.06]"
          style={{ background: `radial-gradient(600px 300px at 20% 0%, ${BRAND.gold}, transparent)` }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-7">
              <div
                className="mp-rise mp-eyebrow inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{ color: BRAND.green, borderColor: 'rgba(46,107,87,0.3)', background: BRAND.greenSoft }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mess-only · Hostel-only · Or both — configured to fit</span>
              </div>

              <h1 className="mp-rise mp-rise-1 mp-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-foreground leading-[1.1]">
                The paper register was never built to run a hostel this size.
              </h1>

              <p className="mp-rise mp-rise-2 text-lg text-muted-foreground leading-relaxed max-w-[58ch]">
                MessPro replaces the attendance diary, the end-of-month calculator marathon, and the
                argument over who ate dinner on the 14th — with a phone tap, a running ledger, and one
                invoice everyone can trust. Set it up for meals, rooms, or both.
              </p>

              <div className="mp-rise mp-rise-3 flex flex-col sm:flex-row gap-4 pt-1">
                <a
                  href="#interactive-demo"
                  className="px-6 py-3.5 rounded-xl text-white font-semibold text-base shadow-md flex items-center justify-center gap-2.5 transition-transform hover:-translate-y-0.5"
                  style={{ background: BRAND.gold }}
                >
                  <Zap className="w-4 h-4" />
                  <span>Try the live sandbox</span>
                </a>
                <a
                  href="#plans"
                  className="px-6 py-3.5 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                >
                  <span>See how plans are scoped</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>

              <div className="mp-rise mp-rise-3 grid grid-cols-3 gap-4 pt-7 border-t border-border">
                <div>
                  <p className="mp-display text-2xl font-semibold text-foreground">3 min</p>
                  <p className="text-xs text-muted-foreground mt-0.5">To import your student list and go live</p>
                </div>
                <div>
                  <p className="mp-display text-2xl font-semibold text-foreground">3 ways</p>
                  <p className="text-xs text-muted-foreground mt-0.5">To mark attendance — QR, biometric, or manual</p>
                </div>
                <div>
                  <p className="mp-display text-2xl font-semibold text-foreground">1 ledger</p>
                  <p className="text-xs text-muted-foreground mt-0.5">For rooms, meals, fines — nothing off the books</p>
                </div>
              </div>
            </div>

            {/* Right: Live terminal + stamp */}
            <div className="lg:col-span-5 relative">
              <div
                className="mp-stamp hidden sm:flex absolute -top-6 -right-4 w-24 h-24 rounded-full border-2 items-center justify-center text-center z-10 pointer-events-none"
                style={{ borderColor: BRAND.green, color: BRAND.green, background: 'var(--card, #fff)' }}
              >
                <span className="mp-mono text-[9px] font-bold leading-tight uppercase tracking-wide" style={{ transform: 'rotate(-8deg)' }}>
                  Verified<br />&amp; timestamped
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full mp-pulse-dot" style={{ background: BRAND.green }} />
                    <span className="mp-eyebrow text-foreground">Live mess terminal</span>
                  </div>
                  <span className="mp-mono text-[11px] text-muted-foreground">Lunch slot</span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3.5 rounded-xl border" style={{ background: BRAND.goldSoft, borderColor: 'rgba(184,132,42,0.25)' }}>
                    <p className="text-[11px] font-medium" style={{ color: BRAND.gold }}>Checked in</p>
                    <p className="mp-mono text-2xl font-semibold text-foreground mt-1">{scanCount}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border" style={{ background: BRAND.greenSoft, borderColor: 'rgba(46,107,87,0.25)' }}>
                    <p className="text-[11px] font-medium" style={{ color: BRAND.green }}>Kitchen target</p>
                    <p className="mp-mono text-2xl font-semibold text-foreground mt-1">{scanCount + 28}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Recent check-ins</span>
                    <span style={{ color: BRAND.green }}>✓ Verified</span>
                  </div>
                  {recentScans.map((scan, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{scan.name}</p>
                        <p className="text-[11px] text-muted-foreground">{scan.roll} · Room {scan.room} · {scan.via}</p>
                      </div>
                      <span className="mp-mono text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                        {scan.time}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSimulateScan}
                  disabled={isSimulatingScan}
                  className="w-full py-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  style={{ background: BRAND.steel }}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isSimulatingScan ? 'Verifying...' : 'Simulate a check-in'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mp-perforation" style={{ ['--mp-perf-color' as any]: 'rgba(184,132,42,0.25)' }} />

      {/* ── 2. Before / After ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="mp-eyebrow" style={{ color: BRAND.brick }}>What you're replacing</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              Three habits that quietly cost a hostel money
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <QrCode className="w-5 h-5" />,
                title: 'The register book',
                before: 'A torn page, a smudged entry, and a student insisting "I never ate on the 14th."',
                after: 'A phone QR, thumbprint, or a manager\'s tap — timestamped and impossible to dispute.',
              },
              {
                icon: <Utensils className="w-5 h-5" />,
                title: 'Cooking for a guess',
                before: 'The kitchen preps for 250 while 80 students are home for the weekend. Groceries go in the bin.',
                after: 'Students toggle off meals they\'ll miss. The kitchen gets an exact plate count, hours ahead.',
              },
              {
                icon: <Receipt className="w-5 h-5" />,
                title: 'Three days with a calculator',
                before: 'Month-end means adding arrears, fines and room fees by hand, then re-checking it twice.',
                after: 'One click builds every invoice — meals, rent, fines — ready to print or send.',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: BRAND.steelSoft, color: BRAND.steel }}
                >
                  {item.icon}
                </div>
                <h3 className="mp-display text-lg font-semibold text-foreground">{item.title}</h3>
                <div className="space-y-2 text-xs">
                  <div
                    className="p-2.5 rounded-lg border flex items-start gap-2"
                    style={{ background: BRAND.brickSoft, borderColor: 'rgba(166,67,47,0.25)', color: BRAND.brick }}
                  >
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item.before}</span>
                  </div>
                  <div
                    className="p-2.5 rounded-lg border flex items-start gap-2"
                    style={{ background: BRAND.greenSoft, borderColor: 'rgba(46,107,87,0.25)', color: BRAND.green }}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item.after}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Built for your setup (Mess / Hostel / Both) ──────────────────── */}
      <section id="configure" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="mp-eyebrow" style={{ color: BRAND.gold }}>One product, your footprint</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              Only run a mess? Only run rooms? Say so.
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              Pick your setup below — the module list updates to show exactly what turns on for you.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {([
                { key: 'mess', label: 'Mess only', icon: <Utensils className="w-4 h-4" /> },
                { key: 'hostel', label: 'Hostel only', icon: <Building2 className="w-4 h-4" /> },
                { key: 'both', label: 'Hostel + Mess', icon: <ArrowRightLeft className="w-4 h-4" /> },
              ] as Array<{ key: ConfigMode; label: string; icon: React.ReactNode }>).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConfigMode(opt.key)}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 border transition-all"
                  style={
                    configMode === opt.key
                      ? { background: BRAND.gold, borderColor: BRAND.gold, color: '#fff' }
                      : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                  }
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="mp-display text-xl font-semibold text-foreground">{configCopy[configMode].title}</h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{configCopy[configMode].blurb}</p>
                  <Link
                    to="/login"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: BRAND.gold }}
                  >
                    <span>Set up this configuration</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mp-ledger-rule rounded-xl">
                  <ul className="divide-y divide-transparent">
                    {MODULES.map((m) => {
                      const active = m.appliesTo.includes(configMode);
                      return (
                        <li
                          key={m.key}
                          className="flex items-center justify-between py-[13.5px] px-3 text-sm transition-opacity"
                          style={{ opacity: active ? 1 : 0.35 }}
                        >
                          <span className="flex items-center gap-2.5 font-medium text-foreground">
                            <span style={{ color: active ? BRAND.gold : 'var(--muted-foreground)' }}>{m.icon}</span>
                            {m.label}
                          </span>
                          {active ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
                          ) : (
                            <span className="mp-mono text-[10px] text-muted-foreground">off</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Role panels ───────────────────────────────────────────────── */}
      <section id="panels" className="py-16 md:py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="mp-eyebrow" style={{ color: BRAND.steel }}>Everyone gets their own screen</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              A panel for admins, one for managers, one for students
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              Nobody sees more than their role needs — and nobody has to ask IT to find anything.
            </p>
          </div>

          <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex border-b border-border bg-muted/60 overflow-x-auto">
              {([
                { key: 'admin', label: 'Admin / Warden', icon: <ShieldCheck className="w-4 h-4" /> },
                { key: 'manager', label: 'Mess & Hall Manager', icon: <UserCog className="w-4 h-4" /> },
                { key: 'student', label: 'Student / Resident', icon: <Users className="w-4 h-4" /> },
              ] as Array<{ key: RolePanel; label: string; icon: React.ReactNode }>).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRolePanel(tab.key)}
                  className="px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap"
                  style={
                    rolePanel === tab.key
                      ? { borderColor: BRAND.gold, color: BRAND.gold, background: 'var(--card)' }
                      : { borderColor: 'transparent', color: 'var(--muted-foreground)' }
                  }
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {rolePanel === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Banknote className="w-4 h-4" />, t: 'Full financial control', d: 'Generate, edit or void invoices across every hostel wing and mess shift.' },
                    { icon: <UserCog className="w-4 h-4" />, t: 'Staff & duty rosters', d: 'Assign supervisors to gates and shifts, and see who scanned what.' },
                    { icon: <Layers className="w-4 h-4" />, t: 'User & role management', d: 'Add wardens, managers or students, and set exactly what each role can touch.' },
                    { icon: <BadgeCheck className="w-4 h-4" />, t: 'Cross-property audits', d: 'Compare occupancy, waste and collections across every property you run.' },
                  ].map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 flex gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND.goldSoft, color: BRAND.gold }}>{c.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {rolePanel === 'manager' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <QrCode className="w-4 h-4" />, t: 'Run the attendance gate', d: 'Scan QR, sync biometric devices, or tally by hand — all from one screen.' },
                    { icon: <Utensils className="w-4 h-4" />, t: 'Set the weekly menu', d: 'Publish meals ahead of time so students know what to expect, and what to skip.' },
                    { icon: <Wrench className="w-4 h-4" />, t: 'Log cleaning & repairs', d: 'Mark rooms as cleaned or under maintenance so nobody is allotted a room mid-fix.' },
                    { icon: <ClipboardList className="w-4 h-4" />, t: 'Resolve complaints', d: 'Move a ticket from received to resolved, with a note the student can see.' },
                  ].map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 flex gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND.steelSoft, color: BRAND.steel }}>{c.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {rolePanel === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <QrCode className="w-4 h-4" />, t: 'A rotating meal pass', d: 'Show the QR on your phone at the gate — it refreshes so it can\'t be screenshotted and shared.' },
                    { icon: <Receipt className="w-4 h-4" />, t: 'A bill you can actually read', d: 'See meals, rent and any fine broken out — not just a total to argue about.' },
                    { icon: <Utensils className="w-4 h-4" />, t: 'Skip a meal in advance', d: 'Toggle off dinner before you leave for the weekend, and you won\'t be billed for it.' },
                    { icon: <ClipboardList className="w-4 h-4" />, t: 'File a complaint with a photo', d: 'Report a leak or a hygiene issue and track it until it\'s marked resolved.' },
                  ].map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/40 flex gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: BRAND.greenSoft, color: BRAND.green }}>{c.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Attendance: three methods, one ledger ────────────────────────── */}
      <section id="attendance" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="mp-eyebrow" style={{ color: BRAND.green }}>Attendance, your way</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              Mark it by QR, by thumbprint, or by hand — it all lands in one count
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              Run one method or all three side by side. Every gate syncs to the same live tally, so kitchen quotas and bills never have to be reconciled afterward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: <ScanLine className="w-5 h-5" />,
                title: 'QR scan',
                d: 'A time-rotating code on the student\'s own phone. It expires within seconds, so a screenshot can\'t be shared or reused.',
                color: BRAND.gold,
                soft: BRAND.goldSoft,
              },
              {
                icon: <Fingerprint className="w-5 h-5" />,
                title: 'Biometric device',
                d: 'Connect existing hardware — ZKTeco, Hikvision and similar readers — and every thumbprint syncs straight into the same ledger.',
                color: BRAND.green,
                soft: BRAND.greenSoft,
              },
              {
                icon: <ListChecks className="w-5 h-5" />,
                title: 'Manual tally',
                d: 'For a forgotten phone or a queue moving fast, a supervisor finds the resident by name or room and taps once.',
                color: BRAND.steel,
                soft: BRAND.steelSoft,
              },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: m.soft, color: m.color }}>
                  {m.icon}
                </div>
                <h3 className="mp-display text-lg font-semibold text-foreground">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-dashed p-5 flex items-center justify-center gap-3 text-sm font-medium" style={{ borderColor: 'rgba(46,107,87,0.35)', color: BRAND.green, background: BRAND.greenSoft }}>
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <span>All three methods sync in real time into one attendance record — no end-of-day reconciling between devices.</span>
          </div>
        </div>
      </section>

      <div className="mp-perforation" style={{ ['--mp-perf-color' as any]: 'rgba(79,107,133,0.22)' }} />

      {/* ── 6. Operations grid: cleaning, complaints, staff, users ──────────── */}
      <section className="py-16 md:py-24 bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="mp-eyebrow" style={{ color: BRAND.steel }}>Beyond the ledger</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              The day-to-day running of the building, covered too
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Wrench className="w-5 h-5" />, t: 'Cleaning & maintenance', d: 'Log a room as cleaned, due, or under repair, and track recurring inspection schedules per wing.' },
              { icon: <ClipboardList className="w-5 h-5" />, t: 'Complaints desk', d: 'Food, hygiene, plumbing or internet — residents file with a photo, and it\'s tracked to resolved.' },
              { icon: <UserCog className="w-5 h-5" />, t: 'Staff management', d: 'Build duty rosters, assign gates and shifts, and see which staff member scanned or resolved what.' },
              { icon: <Layers className="w-5 h-5" />, t: 'User management', d: 'Bulk-import a whole batch from Excel, and set role-based access for every account you create.' },
            ].map((c, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: BRAND.steelSoft, color: BRAND.steel }}>
                  {c.icon}
                </div>
                <h3 className="text-sm font-bold text-foreground">{c.t}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Interactive Demo Sandbox ──────────────────────────────────────── */}
      <section id="interactive-demo" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3"
              style={{ color: BRAND.gold, borderColor: 'rgba(184,132,42,0.3)', background: BRAND.goldSoft }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive feature sandbox</span>
            </div>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Test it right in your browser
            </h2>
            <p className="text-base text-muted-foreground mt-2">
              Click through the tabs below to feel how each module actually works.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden max-w-5xl mx-auto">
            <div className="flex border-b border-border bg-muted/60 overflow-x-auto">
              {([
                { key: 'attendance', label: '1. Attendance gate', icon: <QrCode className="w-4 h-4" />, color: BRAND.gold },
                { key: 'billing', label: '2. Monthly ledger', icon: <Receipt className="w-4 h-4" />, color: BRAND.steel },
                { key: 'pricing', label: '3. Meal pricing', icon: <DollarSign className="w-4 h-4" />, color: BRAND.green },
                { key: 'rooms', label: '4. Room allocator', icon: <BedDouble className="w-4 h-4" />, color: BRAND.brick },
              ] as Array<{ key: typeof activeSimTab; label: string; icon: React.ReactNode; color: string }>).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSimTab(tab.key)}
                  className="px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap"
                  style={
                    activeSimTab === tab.key
                      ? { borderColor: tab.color, color: tab.color, background: 'var(--card)' }
                      : { borderColor: 'transparent', color: 'var(--muted-foreground)' }
                  }
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {activeSimTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="mp-display font-semibold text-base text-foreground">Live meal attendance gate</h4>
                      <p className="text-xs text-muted-foreground">QR, biometric or manual — verified in under a second.</p>
                    </div>
                    <button
                      onClick={handleSimulateScan}
                      disabled={isSimulatingScan}
                      className="px-4 py-2 rounded-lg text-white font-semibold text-xs flex items-center gap-2"
                      style={{ background: BRAND.gold }}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isSimulatingScan ? 'Verifying...' : '+ Scan next student'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border" style={{ background: BRAND.goldSoft, borderColor: 'rgba(184,132,42,0.25)' }}>
                      <p className="text-xs font-medium" style={{ color: BRAND.gold }}>Total plates served</p>
                      <p className="mp-mono text-3xl font-semibold text-foreground mt-1">{scanCount}</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ background: BRAND.greenSoft, borderColor: 'rgba(46,107,87,0.25)' }}>
                      <p className="text-xs font-medium" style={{ color: BRAND.green }}>Guest meals</p>
                      <p className="mp-mono text-3xl font-semibold text-foreground mt-1">14</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ background: BRAND.steelSoft, borderColor: 'rgba(79,107,133,0.25)' }}>
                      <p className="text-xs font-medium" style={{ color: BRAND.steel }}>Hall capacity</p>
                      <p className="mp-mono text-3xl font-semibold text-foreground mt-1">82%</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">Roll number</th>
                          <th className="p-3">Room</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentScans.map((s, idx) => (
                          <tr key={idx} className="hover:bg-muted/40 transition-colors">
                            <td className="p-3 font-semibold text-foreground">{s.name}</td>
                            <td className="p-3 mp-mono text-muted-foreground">{s.roll}</td>
                            <td className="p-3">{s.room}</td>
                            <td className="p-3 text-muted-foreground">{s.via}</td>
                            <td className="p-3">
                              <span
                                className="px-2 py-0.5 rounded-full border text-[10px] font-bold"
                                style={{ background: BRAND.greenSoft, borderColor: 'rgba(46,107,87,0.25)', color: BRAND.green }}
                              >
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSimTab === 'billing' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="mp-display font-semibold text-base text-foreground">Monthly ledger &amp; invoices</h4>
                      <p className="text-xs text-muted-foreground">Meals, room fees and custom charges, calculated automatically.</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-white font-semibold text-xs flex items-center gap-2" style={{ background: BRAND.steel }}>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export full Excel ledger</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3">Resident</th>
                          <th className="p-3">Meals</th>
                          <th className="p-3">Mess charge</th>
                          <th className="p-3">Arrears</th>
                          <th className="p-3">Total payable</th>
                          <th className="p-3">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { n: 'Ali Hassan (2022-CS-41)', m: '54 meals', c: '$162.00', a: '$0.00', t: '$162.00', paid: true },
                          { n: 'Hamza Tariq (2023-EE-19)', m: '62 meals', c: '$186.00', a: '$25.00', t: '$211.00', paid: false },
                          { n: 'Bilal Ahmed (2021-ME-88)', m: '48 meals', c: '$144.00', a: '$0.00', t: '$144.00', paid: true },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-muted/40">
                            <td className="p-3 font-semibold text-foreground">{row.n}</td>
                            <td className="p-3">{row.m}</td>
                            <td className="p-3 mp-mono">{row.c}</td>
                            <td className="p-3 mp-mono" style={{ color: BRAND.brick }}>{row.a}</td>
                            <td className="p-3 font-bold mp-mono text-foreground">{row.t}</td>
                            <td className="p-3">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={
                                  row.paid
                                    ? { background: BRAND.greenSoft, color: BRAND.green }
                                    : { background: BRAND.goldSoft, color: BRAND.gold }
                                }
                              >
                                {row.paid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSimTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mp-display font-semibold text-base text-foreground">Automatic cost-per-meal split</h4>
                    <p className="text-xs text-muted-foreground">Enter today's kitchen spend — it divides accurately across attending students.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                      <p className="text-xs font-bold text-foreground">Daily grocery spend</p>
                      <p className="mp-mono text-2xl font-semibold" style={{ color: BRAND.green }}>$640.00</p>
                      <p className="text-[11px] text-muted-foreground">Vegetables, meat, spices and gas, entered once.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                      <p className="text-xs font-bold text-foreground">Rate per plate</p>
                      <p className="mp-mono text-2xl font-semibold" style={{ color: BRAND.gold }}>$3.20 <span className="text-xs font-normal text-muted-foreground">/ meal</span></p>
                      <p className="text-[11px] text-muted-foreground">Applied automatically to 200 checked-in students.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSimTab === 'rooms' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mp-display font-semibold text-base text-foreground">Visual bed &amp; room allocator</h4>
                    <p className="text-xs text-muted-foreground">Vacant, occupied, or under cleaning — at a glance.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { r: 'Room 101 (Triple)', s: '3/3 occupied', color: BRAND.green, soft: BRAND.greenSoft },
                      { r: 'Room 102 (Double)', s: '1 bed available', color: BRAND.steel, soft: BRAND.steelSoft },
                      { r: 'Room 103 (Single)', s: '1/1 occupied', color: BRAND.green, soft: BRAND.greenSoft },
                      { r: 'Room 104 (Double)', s: 'Under cleaning', color: BRAND.gold, soft: BRAND.goldSoft },
                    ].map((room, i) => (
                      <div key={i} className="p-3 rounded-xl border" style={{ background: room.soft, borderColor: `${room.color}40` }}>
                        <p className="text-xs font-bold text-foreground">{room.r}</p>
                        <p className="text-[11px] font-semibold mt-1" style={{ color: room.color }}>{room.s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Savings & ROI Calculator ──────────────────────────────────────── */}
      <section id="savings-calculator" className="py-16 md:py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="mp-eyebrow" style={{ color: BRAND.green }}>The other reason to switch</p>
              <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                What it's actually worth to you
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                This isn't just less paperwork — it's less grocery wasted on meals nobody ate, fewer proxy
                check-ins, and no more billing mistakes eating into collections. Move the sliders to match your hostel.
              </p>

              <div className="space-y-5 pt-2">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Number of residents</span>
                    <span className="mp-mono text-base" style={{ color: BRAND.gold }}>{studentCapacity}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1000"
                    step="10"
                    value={studentCapacity}
                    onChange={(e) => setStudentCapacity(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: BRAND.gold }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Average daily meal cost per student</span>
                    <span className="mp-mono text-base" style={{ color: BRAND.green }}>${avgDailyExpense}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="25"
                    value={avgDailyExpense}
                    onChange={(e) => setAvgDailyExpense(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: BRAND.green }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl border-2 bg-card shadow-2xl relative" style={{ borderColor: 'rgba(184,132,42,0.3)' }}>
                <p className="mp-eyebrow" style={{ color: BRAND.gold }}>Estimated operational impact</p>
                <h3 className="mp-display text-4xl font-semibold text-foreground mb-6 mt-2">
                  ${roiMetrics.monthlySavings}{' '}
                  <span className="text-base font-normal text-muted-foreground">saved / month</span>
                </h3>

                <div className="space-y-4 text-sm border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: BRAND.steel }} />
                      Staff admin hours saved
                    </span>
                    <span className="mp-mono font-bold text-foreground">{roiMetrics.hoursSaved} hrs / mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" style={{ color: BRAND.brick }} />
                      Disputed invoices prevented
                    </span>
                    <span className="mp-mono font-bold text-foreground">{roiMetrics.disputesPrevented} / mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" style={{ color: BRAND.green }} />
                      Kitchen food waste cut
                    </span>
                    <span className="mp-mono font-bold text-foreground">~18% to 25%</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to="/login"
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5"
                    style={{ background: BRAND.gold }}
                  >
                    <span>Get started for your hostel</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Plans, scoped to your setup ──────────────────────────────────── */}
      <section id="plans" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="mp-eyebrow" style={{ color: BRAND.gold }}>Pricing</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              No fixed tiers. Your plan is scoped to your setup.
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              Two things decide the number: how many residents you manage, and which modules you turn on. Start from wherever you sit today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Utensils className="w-5 h-5" />,
                name: 'Mess only',
                d: 'For a dining hall or canteen with no rooms to manage.',
                items: ['Attendance: QR, biometric & manual', 'Weekly menu & waste forecast', 'Cost-per-plate splitting', 'Monthly billing', 'Complaints desk'],
                color: BRAND.gold,
                soft: BRAND.goldSoft,
              },
              {
                icon: <Building2 className="w-5 h-5" />,
                name: 'Hostel only',
                d: 'For managing rooms and residents, food handled elsewhere.',
                items: ['Room & bed allocation', 'Cleaning & maintenance logs', 'Rent & fine billing', 'Complaints desk', 'Staff & user management'],
                color: BRAND.steel,
                soft: BRAND.steelSoft,
              },
              {
                icon: <ArrowRightLeft className="w-5 h-5" />,
                name: 'Hostel + Mess',
                d: 'The full residence — beds and meals on one invoice.',
                items: ['Everything in Mess only', 'Everything in Hostel only', 'One combined invoice per resident', 'Cross-property reporting', 'Priority onboarding'],
                color: BRAND.green,
                soft: BRAND.greenSoft,
                featured: true,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className="rounded-2xl border p-7 flex flex-col relative"
                style={
                  plan.featured
                    ? { borderColor: BRAND.green, boxShadow: `0 0 0 1px ${BRAND.green}` }
                    : { borderColor: 'var(--border)' }
                }
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3 left-7 mp-mono text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
                    style={{ background: BRAND.green }}
                  >
                    Most complete
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: plan.soft, color: plan.color }}>
                  {plan.icon}
                </div>
                <h3 className="mp-display text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-5">{plan.d}</p>
                <ul className="space-y-2.5 text-sm flex-1">
                  {plan.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className="mt-7 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                  style={
                    plan.featured
                      ? { background: plan.color, color: '#fff' }
                      : { border: `1px solid ${plan.color}`, color: plan.color }
                  }
                >
                  <span>Get a quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5" style={{ color: BRAND.gold }} />
            Every plan includes staff management, user roles, and free migration of your existing student list.
          </p>
        </div>
      </section>

      {/* ── 10. FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-24 bg-muted/40 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="mp-eyebrow" style={{ color: BRAND.steel }}>Questions</p>
            <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2">
              Straight answers for wardens and mess managers
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 flex items-start justify-between gap-4 text-left"
                  >
                    <span className="font-bold text-sm sm:text-base text-foreground flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BRAND.gold }} />
                      {item.q}
                    </span>
                    {isOpen ? (
                      <Minus className="w-4 h-4 shrink-0 mt-1 text-muted-foreground" />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0 mt-1 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-sm text-muted-foreground px-5 pb-5 pl-[42px] leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 11. Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{ background: `radial-gradient(500px 260px at 50% 0%, ${BRAND.gold}, transparent)` }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="mp-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Ready to close the register for good?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Tell us whether you run a mess, a hostel, or both — we'll scope a plan and have your list imported the same day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ background: BRAND.gold }}
            >
              <span>Launch MessPro</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt="MessPro Logo"
              className="w-6 h-6 rounded-md object-contain border border-border/40 bg-card p-0.5"
            />
            <span className="mp-display font-semibold text-foreground">MessPro 2.0</span>
            <span>· Hostel &amp; Mess, run from one ledger</span>
          </div>
          <p>© {new Date().getFullYear()} MessPro Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
