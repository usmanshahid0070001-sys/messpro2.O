/**
 * @file plansData.ts
 * @description Centralized Single Source of Truth for MessPro 2.0 Pricing Tiers & Subscription Plans.
 * Used across the Landing Page (PlansSection), Setup Hostel Modal, and Superadmin Plan references.
 */

export interface PricingPlanTier {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  priceMonthly: string;
  priceAnnual: string;
  billingPeriod: string;
  tagline: string;
  description: string;
  isPopular?: boolean;
  isCustom?: boolean;
  limits: {
    students: string;
    defaultStudents: number;
    managers: string;
    defaultManagers: number;
  };
  features: {
    included: string[];
    excluded?: string[];
  };
  accentColor: string;
  cardBorder: string;
  bgGlow: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  actionType: 'setup' | 'support';
}

export const PRICING_PLANS: PricingPlanTier[] = [
  // ── 1. 10-Day Free Trial (Explorer Tier) ──────────────────────────────────
  {
    id: 'free_trial',
    name: '10-Day Free Trial',
    badge: 'Explorer Tier',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    priceMonthly: '$0',
    priceAnnual: '$0',
    billingPeriod: '10 Days Full Access',
    tagline: 'Instant workspace provision to explore MessPro live',
    description:
      'Experience dynamic QR attendance, weekly menu scheduling, room allotments, and automated ledger calculation with zero commitment.',
    limits: {
      students: '50 Residents',
      defaultStudents: 50,
      managers: '2 Staff Logins',
      defaultManagers: 2,
    },
    features: {
      included: [
        'Complete Mess Weekly Menu & Timings',
        'Anti-Passback QR Attendance Scanner',
        'Manual Attendance Register Log',
        'Residence & Bed Allotment Matrix',
        'Room Sanitation & Housekeeping Logs',
        'Complaint & Maintenance Ticketing',
        'Student Dues & Billing Calculation',
        'Excel / CSV Roster & Ledger Exports',
      ],
      excluded: [
        'Hardware Biometric Gate Sync',
        'Multi-Hostel Branch Switching',
        'Dedicated WhatsApp Account Manager',
      ],
    },
    accentColor: 'text-blue-600 dark:text-blue-400',
    cardBorder: 'border-border/80 hover:border-blue-500/40',
    bgGlow: 'from-blue-500/10 via-card to-card',
    buttonText: 'Start Free 10-Day Trial',
    buttonVariant: 'outline',
    actionType: 'setup',
  },

  // ── 2. Hostel Basic (Residence Focus) ────────────────────────────────────
  {
    id: 'hostel_basic',
    name: 'Hostel Basic',
    badge: 'Residence Only',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    priceMonthly: '$49',
    priceAnnual: '$39',
    billingPeriod: '/ month',
    tagline: 'Tailored for private dorms & residences without mess dining',
    description:
      'Manage bed occupancy, student check-ins, room sanitation logs, and monthly room rent invoicing with zero mess clutter.',
    limits: {
      students: '100 Residents',
      defaultStudents: 100,
      managers: '2 Staff Logins',
      defaultManagers: 2,
    },
    features: {
      included: [
        'Full Residence, Wing & Floor Allocation',
        'Bed Capacity & Visual Occupancy Matrix',
        'Daily Room Sanitation & Cleaning Logs',
        'Resident Member Directory & CNIC Records',
        'Maintenance & Complaint Ticket Board',
        'Monthly Hostel Rent Invoicing & PDF Receipts',
        'Staff Operational Permission Gates',
        'Excel Resident Rosters & Room Reports',
      ],
      excluded: [
        'Mess Menu & Dining Controls',
        'QR & Biometric Mess Attendance',
      ],
    },
    accentColor: 'text-teal-600 dark:text-teal-400',
    cardBorder: 'border-teal-500/30 hover:border-teal-500/60',
    bgGlow: 'from-teal-500/10 via-card to-card',
    buttonText: 'Choose Hostel Basic',
    buttonVariant: 'outline',
    actionType: 'setup',
  },

  // ── 3. Mess Basic (Dining Focus) ─────────────────────────────────────────
  {
    id: 'mess_basic',
    name: 'Mess Basic',
    badge: 'Dining Focus',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    priceMonthly: '$69',
    priceAnnual: '$55',
    billingPeriod: '/ month',
    tagline: 'Built for independent dining mess halls & student caterers',
    description:
      'Eliminate meal leakage with rolling QR scans, configure weekly menus, apply dues blockouts, and automate monthly food billing.',
    limits: {
      students: '200 Diners',
      defaultStudents: 200,
      managers: '3 Cashiers / Staff',
      defaultManagers: 3,
    },
    features: {
      included: [
        '7-Day Weekly Menu Planner & Dining Hours',
        'Dynamic Anti-Passback QR Code Scanner',
        'Meal Cutoff Deadlines & Advance Meal Skips',
        'Counter Meal Restrictions & Dues Blocking',
        'Manual Roll-Call Attendance Register',
        'Student Mess Pass Digital PWA Tokens',
        'Dynamic Plate Pricing & Guest Meal Billing',
        'Automated Monthly Food Ledgers & Invoicing',
      ],
      excluded: [
        'Room & Bed Allotment Matrix',
        'Room Sanitation Housekeeping Logs',
      ],
    },
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    cardBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
    bgGlow: 'from-emerald-500/10 via-card to-card',
    buttonText: 'Choose Mess Basic',
    buttonVariant: 'outline',
    actionType: 'setup',
  },

  // ── 4. Hostel & Mess Standard (Most Popular ⭐) ──────────────────────────
  {
    id: 'standard_complete',
    name: 'Hostel & Mess Standard',
    badge: 'Most Popular ⭐',
    badgeColor: 'bg-amber-500 text-black font-extrabold shadow-xs',
    priceMonthly: '$129',
    priceAnnual: '$99',
    billingPeriod: '/ month',
    tagline: 'The complete unified operating system for modern residences',
    description:
      'Unify room allocation, meal attendance, housekeeping, and combined billing in one seamless, high-performance dashboard.',
    isPopular: true,
    limits: {
      students: '350 Residents',
      defaultStudents: 350,
      managers: '5 Staff Logins',
      defaultManagers: 5,
    },
    features: {
      included: [
        'Everything in Hostel Basic + Mess Basic',
        'Unified Student Ledgers (Rent + Dining + Fines)',
        'Dynamic QR Dining Scanner + Emergency Offline Queue',
        'Room Sanitation & Housekeeping Tracking',
        'Complaint Ticketing & Resolution Pipeline',
        'Custom Registration Fields (CNIC, Guardian, Blood Group)',
        'Automated Monthly Billing & PDF Invoices',
        'WhatsApp & Email Notification Alerts',
        'Priority Technical Support (WhatsApp & Email)',
      ],
      excluded: [
        'Hardware Biometric Terminal Gate Sync',
        'Multi-Hostel Branch Switching',
      ],
    },
    accentColor: 'text-amber-600 dark:text-amber-400',
    cardBorder: 'border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10',
    bgGlow: 'from-amber-500/15 via-card to-card',
    buttonText: 'Get Complete Suite',
    buttonVariant: 'default',
    actionType: 'setup',
  },

  // ── 5. Hostel & Mess Premium / Enterprise ────────────────────────────────
  {
    id: 'premium_enterprise',
    name: 'Premium Enterprise',
    badge: 'Enterprise & Biometrics',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    priceMonthly: '$249',
    priceAnnual: '$199',
    billingPeriod: '/ month',
    tagline: 'Multi-block campuses, biometric sync & dedicated account manager',
    description:
      'For university dorms, institutional hostel chains, and facilities requiring hardware biometric gate synchronization and high-concurrency throughput.',
    isCustom: true,
    limits: {
      students: '750+ Residents',
      defaultStudents: 750,
      managers: 'Unlimited Staff',
      defaultManagers: 15,
    },
    features: {
      included: [
        'All MessPro 2.0 Features Unlocked',
        'Hardware Biometric Terminal Sync (Fingerprint, Face & RFID)',
        'Multi-Channel Attendance (Biometric + QR + Roll-Call)',
        'Multi-Hostel Branch Switching & Centralized Management',
        'Granular Role-Based Permission Delegation',
        'Automated Billing, Variable Tariffs & Fines Engine',
        'Custom Data Migration from Excel/Legacy Systems',
        'On-demand Staff Training & Onboarding Workshops',
        'Dedicated 24/7 WhatsApp Account Manager',
        '99.9% Uptime SLA & Direct Engineering Helpline',
      ],
    },
    accentColor: 'text-blue-600 dark:text-blue-400',
    cardBorder: 'border-blue-500/40 hover:border-blue-500/80',
    bgGlow: 'from-blue-500/15 via-card to-card',
    buttonText: 'Request Enterprise Setup',
    buttonVariant: 'outline',
    actionType: 'setup',
  },
];
