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
    billingPeriod: '10 Days Access',
    tagline: 'Instant workspace provision to explore MessPro live',
    description:
      'Experience dynamic QR attendance, weekly menu scheduling, room allotments, and automated ledger calculation.',
    limits: {
      students: '100 Residents',
      defaultStudents: 100,
      managers: '2 Managers',
      defaultManagers: 2,
    },
    features: {
      included: [
        'Complete Mess Weekly Menu & Timings',
        'Anti-Passback QR Attendance Scanner',
        'Manual Attendance Register Log',
        'Residence & Bed Allotment',
        'Room Sanitation & Housekeeping Logs',
        'Complaint & Maintenance Ticketing',
        'Student Dues & Billing Calculation',
        'Excel / CSV Roster & Ledger Exports',
      ],
      excluded: [
        'Biometric Terminal Hardware Sync',
        'White-label Custom Domain Slug',
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
    priceMonthly: '$69',
    priceAnnual: '$55',
    billingPeriod: '/ month',
    tagline: 'Tailored for private hostels & dorms without mess dining',
    description:
      'Manage room occupancy, student check-ins, housekeeping logs, and room rent invoicing with zero mess clutter.',
    limits: {
      students: '150 Residents',
      defaultStudents: 150,
      managers: '2 Managers',
      defaultManagers: 2,
    },
    features: {
      included: [
        'Full Residence & Room Allocation',
        'Bed Capacity & Occupancy Matrix',
        'Daily Room Sanitation & Cleaning Logs',
        'Resident Member Directory & CNIC Fields',
        'Maintenance & Complaint Ticket Board',
        'Hostel Fee Billing & Rent Invoicing',
        'Manager Operational Permission Gates',
        'Excel Resident Rosters & Room Reports',
      ],
      excluded: [
        'Mess Menu & Meal Controls',
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
    priceMonthly: '$79',
    priceAnnual: '$65',
    billingPeriod: '/ month',
    tagline: 'Built for independent dining mess halls & student caterers',
    description:
      'Prevent meal leakage with rolling QR scans, configure weekly menus, apply counter blockouts, and calculate monthly bills.',
    limits: {
      students: '250 Diners',
      defaultStudents: 250,
      managers: '3 Staff / Cashiers',
      defaultManagers: 3,
    },
    features: {
      included: [
        'Weekly Menu Planner & Dining Hours',
        'Dynamic Anti-Passback QR Scanner',
        'Counter Meal Restrictions & Dues Blocking',
        'Manual Roll-Call Attendance Register',
        'Student Mess Pass Digital PWA Tokens',
        'Dynamic Plate Pricing & Guest Meal Billing',
        'Automated Monthly Student Food Invoices',
        'Dispute Prevention & Plate Count Audits',
      ],
      excluded: [
        'Room & Bed Allotment',
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
    priceMonthly: '$119',
    priceAnnual: '$95',
    billingPeriod: '/ month',
    tagline: 'The complete unified operating system for modern residences',
    description:
      'Unify room allocation, meal attendance, housekeeping, and combined billing in one single intuitive dashboard.',
    isPopular: true,
    limits: {
      students: '400 Residents',
      defaultStudents: 400,
      managers: '5 Managers',
      defaultManagers: 5,
    },
    features: {
      included: [
        'Everything in Hostel Basic + Mess Basic',
        'Unified Student Ledgers (Rent + Food Dues)',
        'Dynamic QR Code Dining Attendance Scanner',
        'Manual Register & Emergency Offline Queue',
        'Weekly Menu & Meal Timing Configuration',
        'Room Sanitation & Housekeeping Tracking',
        'Complaint Ticketing & Resolution Pipeline',
        'Custom Registration Fields (CNIC, Blood Group)',
        'Automated Monthly Billing & PDF Invoices',
        'Priority Technical Support (WhatsApp & Email)',
      ],
      excluded: [
        'Hardware Biometric Terminal Integration',
      ],
    },
    accentColor: 'text-amber-600 dark:text-amber-400',
    cardBorder: 'border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10',
    bgGlow: 'from-amber-500/15 via-card to-card',
    buttonText: 'Get Complete Suite',
    buttonVariant: 'default',
    actionType: 'setup',
  },

  // ── 5. Hostel & Mess Premium / Custom ────────────────────────────────────
  {
    id: 'premium_enterprise',
    name: 'Premium Custom',
    badge: 'Enterprise & Biometrics',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    priceMonthly: '$139',
    priceAnnual: '$110',
    billingPeriod: '/ month or Custom',
    tagline: 'Tailored limits, biometric gate sync & dedicated account manager',
    description:
      'For university campuses, multi-block hostel chains, and institutions requiring biometric scanner hardware synchronization.',
    isCustom: true,
    limits: {
      students: '500+ / Unlimited',
      defaultStudents: 500,
      managers: 'Unlimited Staff',
      defaultManagers: 10,
    },
    features: {
      included: [
        'All MessPro 2.0 Features Unlocked',
        'Hardware Biometric Terminal Sync Integration',
        'QR Code, Biometric & Manual Multi-Channel Attendance',
        'Fine-Grained Custom Permission Delegation',
        'Multi-Hostel Branch Switching & Management',
        'Custom Registration Fields & Verification Rules',
        'Automated Billing, Variable Tariffs & Fines Engine',
        'Dedicated WhatsApp Account Manager 24/7',
        'Custom Institutional Data Migration & Training',
        '99.9% Uptime SLA & Direct Engineering Helpline',
      ],
    },
    accentColor: 'text-blue-600 dark:text-blue-400',
    cardBorder: 'border-blue-500/40 hover:border-blue-500/80',
    bgGlow: 'from-blue-500/15 via-card to-card',
    buttonText: 'Request Custom Plan',
    buttonVariant: 'outline',
    actionType: 'support',
  },
];
