import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Server,
  UserCheck,
  HardDrive,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Printer,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Mail,
  Smartphone
} from 'lucide-react';
import logoUrl from '@/assets/pwa-192x192.png';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('data-collected');

  useSEO({
    title: 'Privacy Policy — MessPro 2.0',
    description:
      'Learn how MessPro 2.0 safeguards resident biometric data, attendance logs, billing information, and institutional privacy.',
    keywords: 'MessPro privacy policy, student data protection, hostel biometric security, GDPR hostel SaaS',
    canonicalUrl: '/privacy',
    robots: 'index, follow',
    ogType: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'Privacy Policy',
          description: 'Official Privacy Policy and Data Security Standards for MessPro 2.0',
          url: 'https://messpro.app/privacy',
          isPartOf: {
            '@type': 'WebSite',
            name: 'MessPro 2.0',
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
              name: 'Privacy Policy',
              item: 'https://messpro.app/privacy',
            },
          ],
        },
      ],
    },
  });

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const SECTIONS = [
    { id: 'data-collected', label: '1. Information We Collect' },
    { id: 'attendance-data', label: '2. Attendance & Biometric Data' },
    { id: 'usage-purpose', label: '3. How We Use Information' },
    { id: 'data-storage', label: '4. Storage, Encryption & Security' },
    { id: 'pwa-offline', label: '5. Offline Storage & PWA Caching' },
    { id: 'third-party', label: '6. Third-Party Service Providers' },
    { id: 'retention-policy', label: '7. Data Retention & Archival' },
    { id: 'user-rights', label: '8. Student & Resident Data Rights' },
    { id: 'children-minors', label: '9. Student Minors & Institutional Consent' },
    { id: 'policy-updates', label: '10. Changes to This Privacy Policy' },
    { id: 'dpo-contact', label: '11. Contact the Data Protection Officer' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Floating Privacy Header */}
      <header className="sticky top-0 z-40 bg-background/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-border/80 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity group">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 p-1 flex items-center justify-center">
              <img src={logoUrl} alt="MessPro" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm text-foreground">MessPro</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Privacy
              </span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1.5 pl-2 border-l border-border/60">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">Privacy Policy</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Print Document</span>
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="p-5 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 backdrop-blur-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privacy Sections</span>
            </div>

            <nav className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                    activeSection === sec.id
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="truncate">{sec.label}</span>
                  {activeSection === sec.id && <ChevronRight className="w-3 h-3 shrink-0 text-emerald-500" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 text-xs space-y-2">
            <span className="font-bold text-foreground block">Quick Navigation</span>
            <div className="space-y-1.5 text-muted-foreground">
              <Link to="/terms" className="flex items-center justify-between hover:text-primary transition-colors">
                <span>Terms of Service</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link to="/docs" className="flex items-center justify-between hover:text-primary transition-colors">
                <span>Feature Documentation</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-8 space-y-10">
          
          {/* Hero Header Card */}
          <div className="rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/80 dark:border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xs space-y-4 glass-bevel">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Monetization Student Data Shield</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Privacy & Data Protection Policy
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Effective Date: March 1, 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GDPR & Educational Privacy Compliant</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              MessPro Technologies ("MessPro", "we", "our") is dedicated to safeguarding the personal identity, attendance logs, dietary preferences, and financial ledgers of educational institutions, hostel operators, managers, and resident students. We never sell or share resident data with ad networks.
            </p>
          </div>

          {/* Clauses List */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            
            <section id="data-collected" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>1. Information We Collect</span>
              </h2>
              <p>
                To provide our automated hostel management capabilities, we process the following categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Resident Identity Data:</strong> Full name, institutional roll number, email address, phone number, and allocated room/bed identifier.</li>
                <li><strong>Guardian & Emergency Contacts:</strong> Parent or guardian phone numbers, emergency contact addresses provided during onboarding.</li>
                <li><strong>Staff & Administrator Credentials:</strong> Authorized email address, hashed passwords, and assigned feature permissions.</li>
                <li><strong>Financial & Invoice Records:</strong> Room rent ledger, meal cost calculations, payment receipts, discount allowances, and fee status.</li>
                <li><strong>Maintenance Reports:</strong> Student submitted ticket descriptions, category tags, and optional uploaded facility issue images.</li>
              </ul>
            </section>

            <section id="attendance-data" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>2. Attendance & Biometric Data Handling</span>
              </h2>
              <p>
                Dining attendance is recorded via cryptographic rotating QR tokens or integrated biometric scanners.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>QR Code Scans:</strong> Each scan stores the meal type (Breakfast, Lunch, Dinner), exact timestamp, gate device ID, and resident ID.</li>
                <li><strong>Biometric Data:</strong> If your hostel utilizes hardware biometric terminals, MessPro processes mathematical cryptographic template hashes only. Raw raw fingerprint images or facial photographs are NEVER captured or stored on our servers.</li>
              </ul>
            </section>

            <section id="usage-purpose" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>3. How We Use Information</span>
              </h2>
              <p>
                Information is strictly used for core operational workflows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Validating dining hall access during active meal windows.</li>
                <li>Preventing duplicate proxy scans and food resource wastage.</li>
                <li>Calculating transparent, dispute-free monthly resident billing statements.</li>
                <li>Dispatching maintenance personnel to resolve resident room complaints.</li>
                <li>Providing emergency resident location registers to hostel wardens.</li>
              </ul>
            </section>

            <section id="data-storage" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>4. Storage, Encryption & Security</span>
              </h2>
              <p>
                All data is encrypted in transit using TLS 1.3 and at rest utilizing AES-256 industry-standard encryption algorithms. Passwords are salted and hashed with Argon2/Bcrypt. We implement role-based access control (RBAC) ensuring staff members only see information required for their specific job duties.
              </p>
            </section>

            <section id="pwa-offline" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>5. Offline Storage & PWA Caching</span>
              </h2>
              <p>
                When using the MessPro Progressive Web App (PWA), the application securely caches user session authentication tokens and active weekly meal schedules in browser IndexedDB. Offline scans made during network interruptions are encrypted locally and pushed to the central server immediately upon reconnection.
              </p>
            </section>

            <section id="third-party" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                <span>6. Third-Party Service Providers</span>
              </h2>
              <p>
                We do not sell user data. We engage limited enterprise infrastructure partners (such as cloud hosting providers and transactional SMS/email delivery gateways) strictly under confidential Data Processing Agreements (DPAs).
              </p>
            </section>

            <section id="retention-policy" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>7. Data Retention & Archival</span>
              </h2>
              <p>
                Student attendance and dining logs are retained for the duration of the student's active enrollment plus an institutional statutory audit period (standard 24 months) unless the hostel administrator requests earlier archival and purge.
              </p>
            </section>

            <section id="user-rights" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>8. Student & Resident Data Rights</span>
              </h2>
              <p>
                Students and residents have the following privacy rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Right to Access:</strong> View all logged meal timestamps and itemized charges directly on the mobile app.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate room numbers or phone numbers via their hostel administrator.</li>
                <li><strong>Right to Export:</strong> Download full PDF billing ledgers and meal history records.</li>
              </ul>
            </section>

            <section id="children-minors" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>9. Student Minors & Institutional Consent</span>
              </h2>
              <p>
                Where MessPro is utilized in secondary schools or junior hostels with students under the age of majority, the educational institution or hostel operator acts as the designated agent and warrants that appropriate guardian consent has been obtained.
              </p>
            </section>

            <section id="policy-updates" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>10. Changes to This Privacy Policy</span>
              </h2>
              <p>
                We may revise this Privacy Policy periodically to reflect technical enhancements or regulatory adjustments. Material modifications will be signaled via an in-app notice on the administrator and student dashboards.
              </p>
            </section>

            <section id="dpo-contact" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>11. Contact the Data Protection Officer</span>
              </h2>
              <p>
                If you have inquiries regarding privacy compliance, data deletion requests, or security vulnerability reports, please reach out directly:
              </p>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1 text-xs">
                <div className="font-bold text-foreground">MessPro Security & Privacy Office</div>
                <div>Email: <a href="mailto:privacy@messpro.io" className="text-primary font-bold hover:underline">privacy@messpro.io</a></div>
                <div>Support Hotline: <a href="mailto:support@messpro.io" className="text-primary hover:underline">support@messpro.io</a></div>
              </div>
            </section>

          </div>

          {/* Bottom Reassurance Card */}
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-sm">Need a signed Data Processing Agreement (DPA)?</span>
              <span className="text-emerald-800 dark:text-emerald-300">We furnish standard enterprise DPAs for universities and hostel chains.</span>
            </div>
            <a
              href="mailto:privacy@messpro.io?subject=Enterprise%20DPA%20Request"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shrink-0"
            >
              <span>Request DPA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </main>

      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-border/80 dark:border-white/10 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} MessPro Technologies. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Landing Page</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
