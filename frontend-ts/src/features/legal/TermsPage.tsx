import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building,
  CreditCard,
  Lock,
  Printer,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import logoUrl from '@/assets/pwa-192x192.png';

export const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

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
    { id: 'acceptance', label: '1. Acceptance of Terms' },
    { id: 'saas-scope', label: '2. Platform Service Scope' },
    { id: 'accounts', label: '3. User Accounts & Credentials' },
    { id: 'hostel-duties', label: '4. Hostel Operator Responsibilities' },
    { id: 'resident-duties', label: '5. Student & Resident Code' },
    { id: 'attendance-dining', label: '6. Dining & QR Attendance Rules' },
    { id: 'billing-fees', label: '7. Invoicing, Payments & Fees' },
    { id: 'ip-rights', label: '8. Intellectual Property' },
    { id: 'data-privacy', label: '9. Data Ownership & Privacy' },
    { id: 'limitation-liability', label: '10. Limitation of Liability' },
    { id: 'termination', label: '11. Suspension & Termination' },
    { id: 'governing-law', label: '12. Governing Law & Dispute Resolution' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-border/80 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity group">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 p-1 flex items-center justify-center">
              <img src={logoUrl} alt="MessPro" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm text-foreground">MessPro</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                Legal
              </span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1.5 pl-2 border-l border-border/60">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">Terms of Service</span>
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="p-5 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 backdrop-blur-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Scale className="w-4 h-4 text-primary" />
              <span>Terms Table of Contents</span>
            </div>

            <nav className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                    activeSection === sec.id
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="truncate">{sec.label}</span>
                  {activeSection === sec.id && <ChevronRight className="w-3 h-3 shrink-0 text-primary" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 text-xs space-y-2">
            <span className="font-bold text-foreground block">Related Policies</span>
            <div className="space-y-1.5 text-muted-foreground">
              <Link to="/privacy" className="flex items-center justify-between hover:text-primary transition-colors">
                <span>Privacy Policy</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link to="/docs" className="flex items-center justify-between hover:text-primary transition-colors">
                <span>Feature Documentation</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-8 space-y-10">
          
          {/* Document Header Card */}
          <div className="rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/80 dark:border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xs space-y-4 glass-bevel">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Standard SaaS Agreement</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Terms of Service & Usage Agreement
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Effective: March 1, 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Version 2.4</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              These Terms of Service ("Agreement") govern the access and use of the MessPro 2.0 platform, including web applications, Progressive Web App (PWA) client software, automated dining gates, attendance hardware integrations, and billing engines provided by MessPro Technologies ("MessPro", "we", "us", or "our").
            </p>
          </div>

          {/* Section Clauses */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            
            <section id="acceptance" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>1. Acceptance of Terms</span>
              </h2>
              <p>
                By registering an organization, creating an administrator or student account, installing the Progressive Web Application (PWA), or utilizing the digital dining gate scanner, you agree to be bound by these Terms of Service. If you are accepting on behalf of an educational institution, university hostel, or private residential facility, you represent and warrant that you possess full administrative authority to bind that entity.
              </p>
            </section>

            <section id="saas-scope" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>2. Platform Service Scope</span>
              </h2>
              <p>
                MessPro provides cloud-hosted and edge-cached software for managing student housing inventory, floor and bed allocations, dining hall weekly menu schedules, dynamic QR code attendance validation, meal cancellation/skipping cutoffs, billing calculation, maintenance ticketing, and audit-proof ledger reports.
              </p>
              <p>
                MessPro reserves the right to introduce feature enhancements, performance optimizations, and security patches at any time. We maintain a target uptime service level agreement (SLA) of 99.9% for core dining attendance verification services.
              </p>
            </section>

            <section id="accounts" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>3. User Accounts & Credentials</span>
              </h2>
              <p>
                Each hostel organization operates within a dedicated tenant sandbox. Users are strictly responsible for maintaining the confidentiality of their authentication credentials (passwords, session tokens, and student PINs).
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Sharing student digital QR codes or screenshots to facilitate proxy meal collection is strictly prohibited.</li>
                <li>Administrator accounts with "Superadmin" or "Bill Management" privileges must adhere to standard security protocols.</li>
                <li>Hostel operators must immediately revoke credentials of departed staff members or alumni.</li>
              </ul>
            </section>

            <section id="hostel-duties" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>4. Hostel Operator Responsibilities</span>
              </h2>
              <p>
                Hostel Administrators and wardens represent that student roster information imported via batch CSV or manual entry is accurate, lawfully collected, and compliant with applicable regional educational privacy laws.
              </p>
              <p>
                The hostel operator maintains sole responsibility for food preparation hygiene, actual meal serving standards, room condition warranties, and the physical safety of resident students.
              </p>
            </section>

            <section id="resident-duties" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>5. Student & Resident Code of Conduct</span>
              </h2>
              <p>
                Residents must utilize the student portal in good faith. Falsifying maintenance complaint photos, attempting to tamper with attendance scanner tokens, or abusing dietary meal leave rules to defraud the mess ledger may result in disciplinary suspension by the hostel warden.
              </p>
            </section>

            <section id="attendance-dining" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>6. Dining & QR Attendance Rules</span>
              </h2>
              <p>
                MessPro attendance records generated via cryptographic dynamic QR scan or biometric hardware timestamp serve as prima facie verification of meal consumption.
              </p>
              <p>
                Meal cancellation/skip cutoffs set by hostel administrators are enforced automatically by the server clock. Cancellation requests made after designated cutoff hours cannot be retroactively adjusted unless authorized by an administrator override.
              </p>
            </section>

            <section id="billing-fees" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>7. Invoicing, Payments & SaaS Fees</span>
              </h2>
              <p>
                MessPro computes monthly bills based on pricing parameters defined by the hostel operator (e.g. room rent, meal consumption counts, fines, late fees, and amenities).
              </p>
              <p>
                Subscription billing for the MessPro SaaS platform is billed according to active resident capacity or institutional tier packages. All subscription fees are non-refundable once the billing cycle commences.
              </p>
            </section>

            <section id="ip-rights" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>8. Intellectual Property</span>
              </h2>
              <p>
                The MessPro brand, interface design, scanning algorithms, billing mathematical engines, source code, documentation, and database schemas remain the sole proprietary intellectual property of MessPro Technologies.
              </p>
            </section>

            <section id="data-privacy" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>9. Data Ownership & Privacy</span>
              </h2>
              <p>
                Hostel operators retain exclusive ownership of resident identity records, phone numbers, room history, and payment ledgers. MessPro does not sell, lease, or monetize tenant student data. For comprehensive data handling practices, refer to our <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section id="limitation-liability" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>10. Limitation of Liability</span>
              </h2>
              <p>
                To the maximum extent permitted by applicable law, MessPro shall not be held liable for indirect, incidental, punitive, or consequential damages resulting from local network outages, food preparation disputes between students and kitchen contractors, or unverified manual attendance overrides.
              </p>
            </section>

            <section id="termination" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>11. Suspension & Termination</span>
              </h2>
              <p>
                Either party may terminate the SaaS subscription with 30 days written notice. Upon termination, hostel operators have 60 days to export student attendance archives, ledger balance sheets, and complaint records in Excel/PDF formats.
              </p>
            </section>

            <section id="governing-law" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>12. Governing Law & Dispute Resolution</span>
              </h2>
              <p>
                This Agreement shall be governed by and construed in accordance with the commercial laws of the jurisdiction in which the principal SaaS contracting entity is registered. Disputes will first be subjected to good-faith mediation prior to formal arbitration.
              </p>
            </section>

          </div>

          {/* Contact Support Footer Card */}
          <div className="p-6 rounded-3xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-foreground block text-sm">Questions about our Terms?</span>
              <span className="text-muted-foreground">Our legal and compliance team is available to assist your institution.</span>
            </div>
            <a
              href="mailto:legal@messpro.io"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              <span>Contact Legal Team</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </main>

      </div>

      {/* Footer minimal */}
      <footer className="border-t border-border/80 dark:border-white/10 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} MessPro Technologies. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Landing Page</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
