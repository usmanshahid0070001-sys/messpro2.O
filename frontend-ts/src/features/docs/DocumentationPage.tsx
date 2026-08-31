import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  Search,
  Building2,
  Utensils,
  QrCode,
  Receipt,
  AlertCircle,
  Users,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Sparkles,
  HelpCircle,
  FileText,
  Sliders,
  Layers,
  Activity,
  UserCheck,
  Printer
} from 'lucide-react';
import type { RootState } from '@/store';
import logoUrl from '@/assets/pwa-192x192.png';

interface DocSection {
  id: string;
  category: string;
  categoryIcon: React.ReactNode;
  categoryColor: string;
  title: string;
  summary: string;
  readTime: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  keyPoints: string[];
  roles: ('Superadmin' | 'Admin' | 'Manager' | 'Student')[];
  faqs?: { q: string; a: string }[];
}

const DOCS_DATA: DocSection[] = [
  {
    id: 'getting-started',
    category: 'Architecture & Setup',
    categoryIcon: <Sparkles className="w-4 h-4" />,
    categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: 'Getting Started with MessPro 2.0',
    summary: 'A complete overview of the MessPro ecosystem, role hierarchies, first-time hostel onboarding, and PWA setup.',
    readTime: '4 min read',
    roles: ['Superadmin', 'Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Understand the Role Hierarchy',
        description: 'MessPro is organized into 4 distinct permission tiers: Superadmin (Multi-tenant SaaS controller), Admin (Hostel owner/director with full config rights), Manager (Warden/Mess supervisor for day-to-day operations), and Student/Resident (Self-service portal for QR, room, and meal records).',
        tip: 'Admins can delegate granular permissions like "QR Attendance Only" or "Bill Management" to specific staff members.'
      },
      {
        title: '2. Initial Hostel Onboarding Checklist',
        description: 'When initializing a new hostel, complete the 3 core setup steps in order: (1) Configure Hostel Profile & Wings in Hostel Configuration, (2) Set Meal Schedule & Base Pricing in Mess Settings, and (3) Add or import Resident roster.',
        tip: 'Batch student import is available via CSV / Excel in the Manage Users section.'
      },
      {
        title: '3. Install as PWA (Progressive Web App)',
        description: 'MessPro works on Android, iOS, Windows, and macOS as an installable standalone app with offline caching and biometric hardware support. Simply tap "Add to Home Screen" or the browser install prompt.',
      }
    ],
    keyPoints: [
      'Multi-tenant architecture with isolated data per hostel organization',
      'Real-time synchronization across staff mobile devices and dining gates',
      'Offline resilience with local IndexedDB queuing for scan logs'
    ],
    faqs: [
      {
        q: 'Can multiple managers scan student meals at the same time?',
        a: 'Yes. Multiple devices can run the QR scanner simultaneously on different dining gates without duplicate meal counts.'
      },
      {
        q: 'What happens if internet connectivity drops during lunch hour?',
        a: 'The PWA scanner caches valid token keys locally. Once connection restores, offline scan logs automatically sync with the central server.'
      }
    ]
  },
  {
    id: 'residence',
    category: 'Residence & Rooms',
    categoryIcon: <Building2 className="w-4 h-4" />,
    categoryColor: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    title: 'Room & Bed Allocation Guide',
    summary: 'Manage wings, floors, room capacities, student check-ins, bed swapping, and housekeeping logs.',
    readTime: '5 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Define Hostel Wings & Floors',
        description: 'Navigate to "Residence Management" > "Room Allocation". Create wings (e.g., North Wing, Block B) and configure floors with single, double, or triple sharing room types.',
        tip: 'Setting max capacity prevents accidental over-allocation of beds.'
      },
      {
        title: '2. Assign Residents to Beds',
        description: 'Click on any available room tile to view bed slots. Click "Allocate Resident", search for an onboarded student by name or roll number, and confirm assignment with an effective start date.',
      },
      {
        title: '3. Bed Transfer & Room Swaps',
        description: 'To relocate a student, open their active room allocation, select "Transfer Bed", choose the new target room, and verify the difference in monthly base rent.',
      },
      {
        title: '4. Cleaning & Service Logs',
        description: 'Housekeeping staff and managers can mark room sanitization, pest control, and AC filter service dates in the "Room Service" tab to maintain hygiene compliance audits.',
        tip: 'Students can see the latest cleaning timestamp of their allocated room directly on their "My Room" portal.'
      }
    ],
    keyPoints: [
      'Interactive visual room map showing occupancy status (Vacant, Partially Occupied, Full)',
      'Automated room rent calculation attached to monthly student invoices',
      'Instant resident eviction / check-out with automatic security deposit clearance notes'
    ]
  },
  {
    id: 'dining-mess',
    category: 'Food & Meals',
    categoryIcon: <Utensils className="w-4 h-4" />,
    categoryColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    title: 'Mess Schedule & Meal Control',
    summary: 'Configure weekly menu rotations, dietary meal pricing, meal skip deadlines, and dining operational windows.',
    readTime: '6 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Build the Weekly Menu Schedule',
        description: 'Go to "Dining Management" > "Manage Meal Schedule". Define daily breakfast, lunch, and dinner menus with item descriptions and special dietary tags (e.g. Vegetarian, High Protein).',
        tip: 'Publishing weekly schedules updates the student mobile feed in real-time, reducing kitchen inquiry congestion.'
      },
      {
        title: '2. Set Meal Rates & Fixed vs Variable Billing',
        description: 'In "Finance" > "Meal Prices", configure whether your hostel uses Fixed Monthly Mess Billing (e.g., Flat $150/month) or Per-Plate Variable Billing (e.g., Breakfast $2, Lunch $4, Dinner $4).',
      },
      {
        title: '3. Meal Skip / Leave Cutoff Windows',
        description: 'Students can toggle meal cancellation in their dashboard before the designated cutoff time (e.g., Dinner must be skipped before 4:00 PM). This automatically deducts plate costs from their invoice and informs kitchen prep quantities.',
        tip: 'Kitchen managers can view the "Expected Plate Headcount" 1 hour before every meal to prevent food waste.'
      }
    ],
    keyPoints: [
      'Eliminates food wastage by projecting exact headcount based on active non-skipped subscriptions',
      'Customizable breakfast, lunch, tea/snack, and dinner time windows',
      'Supports guest meal booking and special holiday feast schedules'
    ]
  },
  {
    id: 'attendance',
    category: 'Attendance & Access',
    categoryIcon: <QrCode className="w-4 h-4" />,
    categoryColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    title: 'Multi-Mode Attendance System',
    summary: 'Operate QR gate scanners, biometric fingerprint/face terminals, or manual supervisor roll-call with zero proxy scans.',
    readTime: '5 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Dynamic Rotating QR Scanner (Gate Mode)',
        description: 'Mount any smartphone or tablet running the MessPro Scanner at the dining gate entrance. When a student approaches, they present their student digital ID. The scanner verifies identity, room number, active meal plan, and plays a positive audio chime in under 300 milliseconds.',
        tip: 'Dynamic QR codes regenerate periodically to prevent screenshots and proxy sharing between friends.'
      },
      {
        title: '2. Biometric Integration',
        description: 'Connect standard optical/capacitive USB fingerprint readers or supported network biometric devices. Scans sync directly to the meal verification log.',
      },
      {
        title: '3. Manual Attendance & Override',
        description: 'If a student lost their phone, managers can open "Manual Attendance", search by roll number or room, verify the student photo, and mark attendance with a supervisor note.',
      }
    ],
    keyPoints: [
      'Sub-300ms verification rate keeps long dining queues moving seamlessly',
      'Strict double-scan prevention: Attempts to scan twice in the same meal window trigger an instant alert',
      'Live attendance dashboard displays real-time student count vs expected capacity'
    ],
    faqs: [
      {
        q: 'Can a student scan for dinner after the dining window closes?',
        a: 'No. The gate scanner automatically locks outside designated meal hours unless an authorized manager inputs a manual override code.'
      }
    ]
  },
  {
    id: 'billing-finance',
    category: 'Finance & Invoicing',
    categoryIcon: <Receipt className="w-4 h-4" />,
    categoryColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    title: 'Automated Billing & Ledger Generation',
    summary: 'Run 1-click monthly billing calculations, add custom penalties or discounts, record payments, and export PDF statements.',
    readTime: '7 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Monthly Calculation Engine',
        description: 'Navigate to "Finance" > "Generate Bills". Select billing month and year. MessPro automatically tallies: (Room Base Rent) + (Actual Meals Consumed / Fixed Mess Fee) + (Any Fines/Add-ons) - (Prepaid Credits/Discounts).',
        tip: 'You can review draft bills before locking and publishing them to residents.'
      },
      {
        title: '2. Applying Custom Fines & Maintenance Deductions',
        description: 'Under "Bill Management", add individual itemized adjustments such as key replacement fees, room repair damages, or early payment rebates.',
      },
      {
        title: '3. Recording Cash, Bank Transfer, & Online Payments',
        description: 'When a resident pays, click "Record Payment", specify transaction reference (Cash/Bank Transfer/UPI), and MessPro generates an instant digital receipt.',
      },
      {
        title: '4. 1-Click PDF Ledger & WhatsApp Sharing',
        description: 'Export itemized PDF invoices for parents and hostel accounting records. Students can download receipts directly from their "My Bills" portal.',
      }
    ],
    keyPoints: [
      'Zero manual calculator math: Every single meal timestamp is attached to the invoice proof',
      'Overdue tracking with automated late fee calculation',
      'Full accounting export compatible with Excel and institutional ledger software'
    ]
  },
  {
    id: 'complaints',
    category: 'Alerts & Maintenance',
    categoryIcon: <AlertCircle className="w-4 h-4" />,
    categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: 'Complaints & Maintenance Desk',
    summary: 'Track student facility tickets, categorize plumbing/electrical issues, assign technicians, and log resolution proofs.',
    readTime: '4 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Student Ticket Submission',
        description: 'Students open "Complaints" on their mobile portal, select issue category (Electrical, Plumbing, Mess Food Quality, Wi-Fi, Furniture), add room details, description, and optional photo attachment.',
      },
      {
        title: '2. Manager Triage & Dispatch',
        description: 'Hostel managers receive notification, prioritize ticket urgency (Low, Medium, High, Urgent), and assign an in-house or external technician.',
        tip: 'Tickets remain highlighted with status badges: Open, In Progress, Resolved, or Closed.'
      },
      {
        title: '3. Resolution & Feedback',
        description: 'Once fixed, the manager marks the ticket resolved with completion notes. The student is prompted to rate the resolution quality.',
      }
    ],
    keyPoints: [
      'Full audit trail of hostel maintenance responsiveness and resolution times',
      'Automatic escalation for critical safety tickets pending over 24 hours',
      'Improves student retention and eliminates forgotten verbal complaints'
    ]
  },
  {
    id: 'user-management',
    category: 'People & Access',
    categoryIcon: <Users className="w-4 h-4" />,
    categoryColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    title: 'User Management & Role Permissions',
    summary: 'Add staff members, onboard hundreds of students via Excel rosters, manage passwords, and configure permissions.',
    readTime: '4 min read',
    roles: ['Superadmin', 'Admin'],
    steps: [
      {
        title: '1. Roster Import via Excel / CSV',
        description: 'Download the standard student template from "Manage Users", paste student details (Full Name, Roll Number, Phone, Email, Guardian Contact, Emergency Info), and click "Batch Upload".',
        tip: 'The system validates duplicate email addresses and phone numbers automatically before committing.'
      },
      {
        title: '2. Staff Credential Provisioning',
        description: 'Create accounts for wardens, mess head chefs, and accountants with scoped feature toggles so they only access the screens relevant to their duties.',
      },
      {
        title: '3. Password Reset & Account Deactivation',
        description: 'Quickly generate one-time passwords for students who locked their accounts or deactivate alumni students who have graduated.',
      }
    ],
    keyPoints: [
      'Encrypted password storage and secure JWT authentication',
      'Granular permission toggles per staff member',
      'Emergency contact directory accessible by hostel wardens in 1-click'
    ]
  },
  {
    id: 'pwa-mobile',
    category: 'Mobile & Offline',
    categoryIcon: <Smartphone className="w-4 h-4" />,
    categoryColor: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    title: 'Mobile PWA & Offline Operation',
    summary: 'Install MessPro on Android, iPhone, iPad, and desktop computers with offline sync capabilities.',
    readTime: '3 min read',
    roles: ['Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Installing on iOS (iPhone/iPad)',
        description: 'Open MessPro in Safari, tap the "Share" icon at the bottom of the screen, and select "Add to Home Screen". MessPro launches in full-screen standalone mode.',
      },
      {
        title: '2. Installing on Android & Chrome',
        description: 'Open MessPro in Google Chrome. An "Install App" banner will appear at the bottom. Tap "Install", or tap the three dots in Chrome and select "Install MessPro".',
        tip: 'Installed PWA opens instantly with zero browser address bar clutter.'
      },
      {
        title: '3. Offline Storage & Background Sync',
        description: 'MessPro caches critical asset bundles and recent token data in IndexedDB storage. If Wi-Fi disconnects, the gate scanner continues to record dining check-ins and pushes them once reconnected.',
      }
    ],
    keyPoints: [
      'Zero storage overhead (< 5MB initial footprint vs heavy app store downloads)',
      'Automatic silent background updates whenever new features are released',
      'Native camera access for lightning-fast QR scanning'
    ]
  }
];

export const DocumentationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'getting-started';
  const [activeSectionId, setActiveSectionId] = useState<string>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Sync with search params
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam && DOCS_DATA.some((d) => d.id === sectionParam)) {
      setActiveSectionId(sectionParam);
    }
  }, [searchParams]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setSearchParams({ section: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/docs?section=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Filter docs by search query
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_DATA;
    const query = searchQuery.toLowerCase();
    return DOCS_DATA.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.keyPoints.some((p) => p.toLowerCase().includes(query)) ||
        doc.steps.some(
          (s) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  const activeDoc = useMemo(() => {
    return DOCS_DATA.find((d) => d.id === activeSectionId) || DOCS_DATA[0];
  }, [activeSectionId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Floating Docs Header */}
      <header className="sticky top-0 z-40 bg-background/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-border/80 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity group"
            title="Return to Home"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 p-1 flex items-center justify-center">
              <img src={logoUrl} alt="MessPro" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm text-foreground">MessPro</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                Docs
              </span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1.5 pl-2 border-l border-border/60">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">Documentation</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            title="Print documentation"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print Guide</span>
          </button>

          {isAuthenticated ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </header>

      {/* Docs Body Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Navigation & Search */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, setup, billing..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-card border border-border/80 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table of Contents List */}
          <div className="space-y-1 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 p-3 backdrop-blur-xl shadow-xs">
            <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Modules & Guides</span>
              <span className="text-[10px] lowercase font-normal">({filteredDocs.length})</span>
            </div>

            <div className="space-y-1 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isActive = doc.id === activeDoc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectSection(doc.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 group ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl border shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 border-white/30 text-white'
                          : doc.categoryColor
                      }`}
                    >
                      {doc.categoryIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {doc.title}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {doc.category}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}

              {filteredDocs.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No matching guides found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="p-4 rounded-3xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Need Direct Guidance?</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Our deployment engineers assist with CSV student rosters and hardware gate scanner pairing.
            </p>
            <a
              href="mailto:support@messpro.io"
              className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1 text-[11px]"
            >
              <span>support@messpro.io</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-8 space-y-8">
          {/* Active Guide Article Container */}
          <article className="rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/80 dark:border-white/10 p-6 sm:p-10 backdrop-blur-xl shadow-sm space-y-8 glass-bevel">
            
            {/* Header / Meta */}
            <div className="space-y-4 border-b border-border/70 dark:border-white/10 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${activeDoc.categoryColor}`}>
                    {activeDoc.categoryIcon}
                    <span>{activeDoc.category}</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {activeDoc.readTime}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLink(activeDoc.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Copy direct guide link"
                >
                  {copiedSection === activeDoc.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {activeDoc.title}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {activeDoc.summary}
              </p>

              {/* Roles badge list */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  Applies to:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDoc.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground border border-border/60"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Advantages Pill Strip */}
            <div className="space-y-3 bg-muted/40 dark:bg-white/5 p-4 rounded-2xl border border-border/60 dark:border-white/10">
              <span className="text-xs font-bold text-foreground block">
                Key System Capabilities
              </span>
              <ul className="space-y-2">
                {activeDoc.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>Step-by-Step Implementation</span>
              </h2>

              <div className="space-y-5">
                {activeDoc.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 space-y-2.5 transition-all hover:border-primary/30 shadow-2xs"
                  >
                    <h3 className="text-sm font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <span><strong>Pro-Tip:</strong> {step.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs if present */}
            {activeDoc.faqs && activeDoc.faqs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/60">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <div className="space-y-3">
                  {activeDoc.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5 text-xs"
                    >
                      <span className="font-bold text-foreground block">
                        Q: {faq.q}
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next / Previous Navigation */}
            <div className="pt-6 border-t border-border/70 dark:border-white/10 flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>Open in App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>Try It in Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

          </article>
        </main>

      </div>

      {/* Footer minimal */}
      <footer className="border-t border-border/80 dark:border-white/10 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} MessPro 2.0 Documentation. Built for modern hostel living.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Landing Page</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentationPage;
