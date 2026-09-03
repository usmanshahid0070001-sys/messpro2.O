import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSEO } from '@/hooks/useSEO';
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
    id: 'student-guide',
    category: 'Student Portal',
    categoryIcon: <Smartphone className="w-4 h-4" />,
    categoryColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    title: 'Student & Resident Portal Guide',
    summary: 'Complete self-service guide for hostel residents: rolling QR meal pass, room inspection, meal skips, billing receipts, and maintenance requests.',
    readTime: '6 min read',
    roles: ['Student'],
    steps: [
      {
        title: '1. Accessing Your Dynamic QR Meal Pass (/app/meals/qr)',
        description: 'Navigate to "Meals" > "QR Pass" or the quick pass button on your phone. Present the rotating dynamic QR code to the dining gate scanner. A new secure token generates automatically every 30 seconds to prevent unauthorized screenshots or proxy passes.',
        tip: 'Ensure screen brightness is adequate when presenting your phone to the gate scanner.'
      },
      {
        title: '2. Checking Room & Roommate Details (/app/my-room)',
        description: 'Open "My Room" to view your assigned hostel wing, room number, floor, and bed slot. You can see your registered roommates, contact details, and the real-time housekeeping log detailing when your room was last cleaned or inspected.',
      },
      {
        title: '3. Reviewing Weekly Menu & Skipping Meals (/app/meals/schedule)',
        description: 'Check the daily breakfast, lunch, and dinner menus for the week. If you plan to dine out or travel, toggle "Skip Meal" before the daily cutoff deadline (e.g. 4:00 PM for dinner). Plate charges are automatically waived from your monthly ledger.',
        tip: 'Skipping meals in advance assists kitchen chefs in calculating exact headcounts and preventing food waste.'
      },
      {
        title: '4. Tracking Meal Consumption History (/app/meals/history)',
        description: 'View an itemized record of every meal you checked into, with exact dates, entry timestamps, meal types (breakfast/lunch/dinner), and registered guest plates. Filter by date to cross-check your monthly consumption.',
      },
      {
        title: '5. Inspecting Dues & Downloading Invoices (/app/my-bills)',
        description: 'Check your current outstanding balance, paid invoices, and upcoming payment due dates. Click on any invoice to view a complete breakdown: (Room Rent) + (Meal Charges) + (Custom Fines/Discounts). Click "Download PDF" to save or print official institutional receipts for parents.',
      },
      {
        title: '6. Submitting & Tracking Maintenance Complaints (/app/complaints)',
        description: 'If you have issues with Wi-Fi, plumbing, electrical fixtures, or furniture, click "New Complaint", choose category and priority, add details and photos, and track manager updates until the issue is marked resolved.',
      }
    ],
    keyPoints: [
      'Rotating QR tokens eliminate lost plastic mess cards and prevent proxy scans',
      'Full financial transparency: every plate timestamp is visible on your ledger',
      'Direct maintenance escalation with instant resolution notifications'
    ],
    faqs: [
      {
        q: 'What should I do if my phone battery dies before meal time?',
        a: 'Inform the mess supervisor at the gate. They can verify your photo and roll number via the Manual Attendance terminal and mark your meal on the spot.'
      },
      {
        q: 'Can I cancel a meal skip if my plans change?',
        a: 'Yes, as long as the cancellation window has not passed. Simply return to the Weekly Schedule and toggle your meal back on.'
      }
    ]
  },
  {
    id: 'manager-guide',
    category: 'Manager Operations',
    categoryIcon: <UserCheck className="w-4 h-4" />,
    categoryColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    title: 'Hostel Manager & Warden Operational Guide',
    summary: 'Master daily hostel operations: gate QR scanner terminals, manual meal overrides, headcount forecasts, room sanitization logs, and ledger payments.',
    readTime: '8 min read',
    roles: ['Manager', 'Admin'],
    steps: [
      {
        title: '1. Operating Gate Scanner Terminal (/app/attendance/qr)',
        description: 'Mount any tablet or phone running the MessPro Scanner at the dining entrance. When a resident scans, the terminal verifies identity in <300ms, displays the resident photo, plays an audible chime, and records the entry. Double-scan attempts within the same meal window trigger a visual warning.',
        tip: 'The terminal works seamlessly offline; scan records sync automatically once network re-establishes.'
      },
      {
        title: '2. Performing Manual Attendance Roll-Call (/app/attendance/manual)',
        description: 'If a resident forgets their phone or has hardware camera issues, search by roll number or room number, verify their resident portrait, select meal type, and record attendance with a supervisor reason code.',
      },
      {
        title: '3. Meal Control & Headcount Planning (/app/meals/control)',
        description: 'Access real-time dining statistics: expected turnouts (active subscriptions minus skips) vs actual checked-in counts. Use this live data to signal kitchen chefs for replenishments or to shut dining windows on schedule.',
      },
      {
        title: '4. Logging Housekeeping & Room Inspections (/app/residence/services)',
        description: 'Maintain hygiene audits by selecting room numbers and recording dates for routine cleaning, sanitization, AC maintenance, or pest control. Residents immediately see updated service timestamps on their portal.',
      },
      {
        title: '5. Triaging & Resolving Student Complaints (/app/complaints)',
        description: 'Review incoming tickets filtered by category (Plumbing, Electrical, Food Quality, Internet). Assign tickets to staff technicians, update ticket status to "In Progress", and close tickets with resolution notes once inspected.',
      },
      {
        title: '6. Managing Resident Ledgers & Offline Cash (/app/finance/bills)',
        description: 'Search resident accounts, filter by unpaid or overdue status, and record offline cash payments or bank wire references. You can also append custom fines (e.g. late return fines or property damage fees) with itemized notes.',
      }
    ],
    keyPoints: [
      'Sub-300ms gate scanning prevents bottleneck queues during peak dining hours',
      'Accurate kitchen headcount forecasts prevent food surplus and budget deficits',
      'Complete accountability trail for facility upkeep and student fee collections'
    ]
  },
  {
    id: 'admin-guide',
    category: 'Hostel Admin',
    categoryIcon: <Sliders className="w-4 h-4" />,
    categoryColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    title: 'Hostel Admin: System Configuration & Financial Governance',
    summary: 'Complete administrative control: hostel wing setup, bed allocation matrices, meal pricing models, staff permission scoping, and 1-click monthly billing.',
    readTime: '9 min read',
    roles: ['Admin', 'Superadmin'],
    steps: [
      {
        title: '1. Comprehensive Hostel Setup (/app/hostel-configuration)',
        description: 'Define your hostel profile, wings, floors, room categories (single, double, triple), dining operation windows (Breakfast, Lunch, Snacks, Dinner), meal skip cutoff rules, and attendance gate policies.',
      },
      {
        title: '2. User Management & Batch Roster Import (/app/users)',
        description: 'Add individual students and staff or onboard hundreds in seconds using the Excel/CSV batch upload tool. Assign roles (Admin, Manager, Student) and configure granular permissions (e.g. "qr_attendance", "residence_management", "bill_generation").',
        tip: 'The importer validates email uniqueness and roll numbers automatically before committing.'
      },
      {
        title: '3. Visual Room & Bed Allocation Matrix (/app/residence/allocation)',
        description: 'View an interactive capacity grid of every room. Allocate residents to specific beds, process room transfers when residents request bed swaps, and complete check-outs with security deposit clearance records.',
      },
      {
        title: '4. Meal Pricing Models (/app/finance/meal-prices)',
        description: 'Choose between Fixed Monthly Flat Dining Rates or Per-Plate Variable Pricing. Set rates for breakfast, lunch, and dinner, including variable rate overrides for special holiday feasts or premium weekend meals.',
      },
      {
        title: '5. Automated Monthly Invoicing Engine (/app/finance/generate-bills)',
        description: 'Launch the batch bill calculation wizard. Select billing month and year. MessPro tallies (Base Room Rent) + (Actual Verified Meals / Flat Rate) + (Applied Penalties) - (Credits/Discounts). Review draft statements, then lock and publish bills to all residents in 1 click.',
      },
      {
        title: '6. Superadmin SaaS Governance (/app/superadmin/hostels)',
        description: 'For institutional owners managing multiple hostel branches: provision new tenant organizations, assign subscription tiers, configure feature flags, and oversee centralized revenue metrics.',
      }
    ],
    keyPoints: [
      'Unified command center for residential facilities, food logistics, and revenue management',
      'Automated batch billing eliminates manual invoice compilation errors',
      'Granular permission toggles protect sensitive financial and administrative controls'
    ]
  },
  {
    id: 'data-extraction',
    category: 'Data & Reports',
    categoryIcon: <Receipt className="w-4 h-4" />,
    categoryColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    title: 'Data Extraction, Reports & Excel Exports',
    summary: 'How to extract and export student rosters, meal logs, financial ledgers, audit trails, and PDF statements from MessPro 2.0.',
    readTime: '5 min read',
    roles: ['Superadmin', 'Admin', 'Manager', 'Student'],
    steps: [
      {
        title: '1. Exporting Student Rosters & Directory to Excel / CSV',
        description: 'In "Manage Users" (/app/users), click the "Export" button above the table. Select whether to export the full roster or currently filtered search results. MessPro generates a clean .xlsx spreadsheet containing student names, roll numbers, room numbers, contact info, and registration status.',
        tip: 'Use column filters in the table first to export specific subsets (e.g. only 3rd-floor residents).'
      },
      {
        title: '2. Exporting Meal Attendance Logs & Audit Proofs',
        description: 'Navigate to "Meal History" (/app/meals/history). Set your desired date range (e.g. past month or past semester). Click "Export Logs" to download an audit trail with exact scan timestamps, gate terminal IDs, meal types, and student IDs.',
      },
      {
        title: '3. Extracting Financial Ledgers & Outstanding Fee Reports',
        description: 'Under "Bill Management" (/app/finance/bills), filter by "Unpaid" or "Overdue". Click "Export Ledger" to obtain a comprehensive Excel report of all outstanding debts, collected payments, payment methods (Cash/Bank), and late penalties.',
      },
      {
        title: '4. Generating & Printing Student PDF Invoices & Receipts',
        description: 'Both administrators and residents can generate print-ready PDF statements from "Bill Management" or "My Bills". Click the receipt icon on any invoice row to render an institutional PDF with hostel header, student details, itemized line items, and payment proof.',
      },
      {
        title: '5. Exporting Complaint & Maintenance Audit Logs',
        description: 'From "Complaints" (/app/complaints), administrators can export ticket histories to evaluate vendor response times, recurring plumbing/electrical breakdown frequencies, and resident satisfaction ratings.',
      }
    ],
    keyPoints: [
      '1-click export to Excel (.xlsx) and CSV across all major tables',
      'Institutional-grade PDF receipts ready for accounting audits and parent billing',
      'Custom date range and status filtering before initiating data extraction'
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
  const [selectedRole, setSelectedRole] = useState<'All' | 'Student' | 'Manager' | 'Admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const activeDoc = useMemo(() => {
    return DOCS_DATA.find((d) => d.id === activeSectionId) || DOCS_DATA[0];
  }, [activeSectionId]);

  useSEO({
    title: `${activeDoc.title} — Documentation — MessPro 2.0`,
    description: `${activeDoc.summary} Learn how to configure and operate ${activeDoc.category} in MessPro 2.0.`,
    keywords: 'MessPro documentation, hostel management guide, mess setup tutorial, QR dining docs, hostel billing guide',
    canonicalUrl: `/docs?section=${activeDoc.id}`,
    robots: 'index, follow',
    ogType: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: activeDoc.title,
          description: activeDoc.summary,
          articleSection: activeDoc.category,
          url: `https://messpro.app/docs?section=${activeDoc.id}`,
          publisher: {
            '@type': 'Organization',
            name: 'MessPro Technologies',
            url: 'https://messpro.app',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://messpro.app/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Documentation',
              item: 'https://messpro.app/docs',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: activeDoc.title,
              item: `https://messpro.app/docs?section=${activeDoc.id}`,
            },
          ],
        },
      ],
    },
  });

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

  // Filter docs by role and search query
  const filteredDocs = useMemo(() => {
    return DOCS_DATA.filter((doc) => {
      const matchesRole =
        selectedRole === 'All' ||
        doc.roles.includes(selectedRole as any) ||
        (selectedRole === 'Admin' && doc.roles.includes('Superadmin'));

      if (!matchesRole) return false;
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.keyPoints.some((p) => p.toLowerCase().includes(query)) ||
        doc.steps.some(
          (s) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
        )
      );
    });
  }, [searchQuery, selectedRole]);

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
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
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

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 dark:bg-neutral-900/80 rounded-2xl border border-border/70 dark:border-white/10 text-xs">
            {(['All', 'Student', 'Manager', 'Admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center text-[11px] cursor-pointer ${
                  selectedRole === role
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {role === 'All' ? 'All Roles' : role}
              </button>
            ))}
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
