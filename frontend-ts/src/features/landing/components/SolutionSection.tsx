import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  BedDouble,
  Wrench,
  Utensils,
  Receipt,
  ClipboardList,
  Layers,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface FeatureTab {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  title: string;
  benefit: string;
  description: string;
  bullets: string[];
}

const FEATURES: FeatureTab[] = [
  {
    id: 'attendance',
    name: '3-Way Attendance',
    category: 'Dining & Security',
    icon: <QrCode className="w-3.5 h-3.5" />,
    title: 'Instant QR Gate, Biometric & Bulk Manual Marking',
    benefit: 'Eliminate long dining queues and proxy signatures in < 1 second.',
    description: 'Hostelites scan their unique dynamic QR code at the mess counter or use biometric fingerprint verification. Wardens can also mark or upload bulk rosters in seconds when needed.',
    bullets: [
      'Anti-screenshot dynamic QR passes prevent meal theft',
      'Real-time biometric device hardware integration',
      'Instant offline fallbacks & batch Excel upload',
    ],
  },
  {
    id: 'rooms',
    name: 'Room & Bed Allocations',
    category: 'Residence',
    icon: <BedDouble className="w-3.5 h-3.5" />,
    title: 'Visual Floor Maps & Instant Bed Assignment',
    benefit: 'Zero double-booking and complete clarity over vacant beds.',
    description: 'Get an interactive bird’s-eye view of every wing, floor, room, and individual bed slot. Allot beds with single-click student lookups and track check-ins.',
    bullets: [
      'Visual occupancy status (Occupied, Reserved, Cleaning)',
      'Multi-wing and custom room type management (Single, Double, Suite)',
      'Automated check-in, room shifting, and clearance receipts',
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    category: 'Facilities',
    icon: <Wrench className="w-3.5 h-3.5" />,
    title: 'Housekeeping Logs & Verified Room Service',
    benefit: 'Keep hostel facilities spotless with proof of service.',
    description: 'Track scheduled deep cleanings, room maintenance requests, and staff duty logs. Never lose track of a broken fixture or overdue room sanitation.',
    bullets: [
      'Housekeeping checklists with completion timestamps',
      'Resident room service request logging and status tracking',
      'Facility maintenance alerts directly to warden dashboard',
    ],
  },
  {
    id: 'meals',
    name: 'Meal Control & Booking',
    category: 'Mess Ops',
    icon: <Utensils className="w-3.5 h-3.5" />,
    title: 'Weekly Menu Schedules & Food Waste Forecasts',
    benefit: 'Save 15-20% on groceries by cooking for exact headcounts.',
    description: 'Publish weekly menus, allow residents to toggle meal plans ahead of time, and forecast kitchen grocery requirements accurately before cooking starts.',
    bullets: [
      'Advance meal opt-in/opt-out locks to avoid surplus cooking',
      'Real-time portion counts for kitchen cooking staff',
      'Dietary violation tracking and audit logs',
    ],
  },
  {
    id: 'billing',
    name: 'Automated Billing & Ledger',
    category: 'Finance',
    icon: <Receipt className="w-3.5 h-3.5" />,
    title: 'Dispute-Free Invoicing & Automated Fines',
    benefit: 'Zero calculator errors, instant monthly PDF bill generation.',
    description: 'Calculate monthly dues automatically based on verified meal consumption, fixed room rent, utilities, and late fines. Export to Excel or share PDF receipts instantly.',
    bullets: [
      'Variable and fixed meal pricing calculation models',
      'Automated late payment fines & security deposit ledgers',
      'Itemized student invoices with exact date and plate breakdowns',
    ],
  },
  {
    id: 'complaints',
    name: 'Complaints & Grievances',
    category: 'Support',
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    title: 'Mobile Grievance Desk & Resolution Tracker',
    benefit: 'Fast problem resolution that boosts resident satisfaction.',
    description: 'Hostelites lodge tickets for plumbing, electricity, WiFi, or food quality directly from their phone. Wardens prioritize and assign them with verified resolution times.',
    bullets: [
      'Priority categorization (Urgent, High, Normal)',
      'Direct assignment to maintenance staff',
      'Resident confirmation upon ticket closure',
    ],
  },
  {
    id: 'governance',
    name: 'Role-Based Governance',
    category: 'Multi-Tenant',
    icon: <Layers className="w-3.5 h-3.5" />,
    title: 'Tailored Portals for Admin, Wardens & Students',
    benefit: 'Complete operational security with isolated role permissions.',
    description: 'Everyone sees exactly what they need: Superadmins manage multiple hostels, Wardens govern operations, Kitchen staff check meals, and Students track their own bills.',
    bullets: [
      'Granular permission toggles for every hostel feature',
      'Dedicated mobile-friendly student portal',
      'Audit trails for all administrative overrides',
    ],
  },
];

export const SolutionSection: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('attendance');
  const activeFeature = FEATURES.find((f) => f.id === activeTabId) || FEATURES[0];

  return (
    <section id="solution" className="py-20 sm:py-28 lg:py-32 bg-background relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide glass-bevel">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The MessPro Operating Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Everything your hostel needs in one unified workspace
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Engineered specifically for university dorms, private hostels, and mess clubs. Say goodbye to scattered spreadsheets and isolated apps.
          </p>
        </div>

        {/* Feature Selector Chips (Responsive Flex Wrap - No Cutoff, No Stuck Scroll) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto px-2">
          {FEATURES.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer glass-bevel ${
                  isActive
                    ? 'bg-foreground text-background dark:bg-white dark:text-black shadow-md scale-[1.03] ring-2 ring-primary/30'
                    : 'bg-card/70 dark:bg-neutral-900/70 border border-border/70 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Panel (Aceternity Glass Frame) */}
        <div className="rounded-3xl border border-border/80 dark:border-white/10 bg-card/60 dark:bg-neutral-950/60 p-7 sm:p-12 shadow-2xl backdrop-blur-2xl glass-bevel">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left: Detailed Copy & Value Points with Smooth Keyed Transition */}
            <div key={`copy-${activeTabId}`} className="lg:col-span-6 space-y-6 text-left animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="space-y-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  {activeFeature.category} Pillar
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-snug">
                  {activeFeature.title}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {activeFeature.benefit}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeFeature.description}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 pt-1">
                {activeFeature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline group"
                >
                  <span>Ready to deploy {activeFeature.name}?</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <Link
                  to={`/docs?section=${
                    activeTabId === 'rooms'
                      ? 'residence'
                      : activeTabId === 'meals'
                      ? 'dining-mess'
                      : activeTabId === 'billing'
                      ? 'billing-finance'
                      : activeTabId === 'governance'
                      ? 'user-management'
                      : activeTabId
                  }`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Feature Guide &rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive Visual Mockup with Smooth Crossfade & Scale */}
            <div className="lg:col-span-6">
              <div
                key={`mockup-${activeTabId}`}
                className="rounded-2xl border border-border/80 dark:border-white/10 bg-muted/40 dark:bg-neutral-900/60 p-6 space-y-4 backdrop-blur-md glass-bevel animate-in fade-in zoom-in-95 duration-250"
              >
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 dark:border-white/10 text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    {activeFeature.icon}
                    <span>{activeFeature.name} Preview</span>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live Component
                  </span>
                </div>

                {/* Conditional Visuals Based on Selected Feature */}
                {activeTabId === 'attendance' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">Dynamic QR Verification</span>
                          <span className="text-[11px] text-muted-foreground">Scanned at Dining Hall Terminal 1</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        MATCHED (0.4s)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-3.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                        <span className="text-muted-foreground text-[10px] block">Biometric Hardware Sync</span>
                        <span className="font-bold text-foreground mt-0.5 block">Active • 99.8%</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                        <span className="text-muted-foreground text-[10px] block">Manual Roster Override</span>
                        <span className="font-bold text-foreground mt-0.5 block">Audit Logged</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'rooms' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                        <span className="font-bold text-foreground">Wing A</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">96% Full</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                        <span className="font-bold text-foreground">Wing B</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">88% Full</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                        <span className="font-bold text-foreground">Wing C</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">4 Vacant</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 space-y-2">
                      <span className="font-bold text-foreground block text-[11px]">Room 204 • Twin Occupancy</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Bed A: Usman Shahid (CS-22)</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Occupied</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Bed B: Available</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Assign Now</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'cleaning' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground block">Floor 2 Deep Sanitation</span>
                        <span className="text-[10px] text-muted-foreground">Assigned to: Housekeeping Team 1</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        COMPLETED (10:30 AM)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground block">Room 108 AC Servicing</span>
                        <span className="text-[10px] text-muted-foreground">Resident ticket #TK-84</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        IN PROGRESS
                      </span>
                    </div>
                  </div>
                )}

                {activeTabId === 'meals' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Today's Menu & Portion Forecast</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Dinner Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2.5 rounded-lg bg-muted/60 dark:bg-white/5">
                          <span className="text-muted-foreground block text-[10px]">Dish:</span>
                          <span className="font-bold text-foreground">Chicken Biryani + Salad</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/60 dark:bg-white/5">
                          <span className="text-muted-foreground block text-[10px]">Confirmed Portions:</span>
                          <span className="font-bold text-foreground">184 Plates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'billing' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 space-y-2">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>Automated Billing Engine</span>
                        <span className="text-emerald-600 dark:text-emerald-400">100% Reconciled</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Generated 240 monthly student PDF statements with zero calculator disputes.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted/60 dark:bg-white/10 font-bold text-foreground">
                          PDF Download
                        </span>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted/60 dark:bg-white/10 font-bold text-foreground">
                          WhatsApp Share
                        </span>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-muted/60 dark:bg-white/10 font-bold text-foreground">
                          Excel Ledger
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTabId === 'complaints' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Ticket #409 • WiFi Speed In Wing C</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Urgent Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Reported by Hamza (Room C-302) • Dispatched to Network Tech
                      </p>
                    </div>
                  </div>
                )}

                {activeTabId === 'governance' && (
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                      <span className="font-bold text-foreground block">Admin / Warden</span>
                      <span className="text-[10px] text-muted-foreground">Full Operations Control</span>
                    </div>
                    <div className="p-4 rounded-xl bg-card/80 dark:bg-neutral-950/80 border border-border/60 dark:border-white/10">
                      <span className="font-bold text-foreground block">Student Portal</span>
                      <span className="text-[10px] text-muted-foreground">Bills, QR Pass & Menu</span>
                    </div>
                  </div>
                )}

                {/* Sub-strip */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/60 dark:border-white/10">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Built for low-latency speed
                  </span>
                  <span>React 19 + Vite</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
