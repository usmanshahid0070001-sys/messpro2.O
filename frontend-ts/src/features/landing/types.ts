export type SectionId = 'hero' | 'problem' | 'solution' | 'how-it-works' | 'faqs' | 'cta';

export interface NavItem {
  id: SectionId;
  label: string;
}

export interface RecentScan {
  name: string;
  roll: string;
  room: string;
  time: string;
  via: 'QR' | 'Biometric' | 'Manual';
  meal: string;
}

export interface RoiMetrics {
  monthlySavings: string;
  hoursSaved: number;
  disputesPrevented: number;
  wasteReductionKg: number;
}

export interface FeaturePillar {
  id: string;
  title: string;
  shortDesc: string;
  benefit: string;
  category: 'attendance' | 'rooms' | 'cleaning' | 'meals' | 'billing' | 'complaints' | 'governance';
  tag: string;
}
