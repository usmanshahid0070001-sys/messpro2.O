import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
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

  useSEO({
    title: 'Terms of Service — MessPro 2.0',
    description:
      'Review the official Terms of Service, Master Subscription Agreement, and SLA protocols governing use of the MessPro 2.0 SaaS platform.',
    keywords: 'MessPro terms of service, hostel SaaS agreement, mess management software license, student dining SLA',
    canonicalUrl: '/terms',
    robots: 'index, follow',
    ogType: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'Terms of Service',
          description: 'Official Terms of Service for MessPro 2.0',
          url: 'https://messpro.app/terms',
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
              name: 'Terms of Service',
              item: 'https://messpro.app/terms',
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
                <span>1. Acceptance of Terms & Master SaaS Agreement</span>
              </h2>
              <p>
                By registering an account, provisioning a hostel tenant, logging in as an administrator, manager, or resident, installing the Progressive Web Application (PWA), or connecting terminal hardware, you agree to be legally bound by these Terms of Service. If you access the platform on behalf of an educational institution, hostel organization, or enterprise residential facility, you represent and warrant that you possess full administrative authority to bind that entity.
              </p>
            </section>

            <section id="saas-scope" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>2. Platform Service Scope & Software Identity</span>
              </h2>
              <p>
                <strong>MessPro is strictly a Software-as-a-Service (SaaS) and IoT technology provider.</strong> MessPro is <em>not</em> a physical hostel operator, landlord, property manager, catering company, or educational board.
              </p>
              <p>
                MessPro delivers cloud computing software for room allocation tracking, weekly dining menu configuration, cryptographic dynamic QR attendance, biometric gate terminal synchronization, automated billing arithmetic, and maintenance ticketing. MessPro is not responsible for physical property management, food preparation quality, or offline financial dealings.
              </p>
            </section>

            <section id="accounts" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>3. User Accounts, Credentials & Initial Onboarding</span>
              </h2>
              <p>
                Each registered hostel operates within an isolated multi-tenant database sandbox. Users are strictly responsible for maintaining the confidentiality of their authentication credentials.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>One-Time Onboarding Credential Setup:</strong> Users may self-update their email and password during first-time login prior to signing the digital agreement. Once signed, self-modifications are locked, and credential resets must be authorized by an institutional administrator.</li>
                <li><strong>Non-Transferability:</strong> Personal user accounts, student PINs, and active session tokens are non-transferable and may not be shared, loaned, or sold.</li>
                <li><strong>Credential Revocation:</strong> Hostel administrators must immediately deactivate departing staff, alumni, or vacated residents.</li>
              </ul>
            </section>

            <section id="hostel-duties" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>4. Hostel Operator Responsibilities & Facility Authority</span>
              </h2>
              <p>
                Hostel Administrators and wardens represent that student roster information imported via batch CSV or manual entry is accurate, lawfully collected, and compliant with applicable educational privacy regulations.
              </p>
              <p>
                The hostel tenant maintains sole responsibility for physical building security, room hygiene, actual meal preparation quality, dietary health standards, offline fee collections, and student disciplinary actions. MessPro acts solely as the technical data processor.
              </p>
            </section>

            <section id="resident-duties" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>5. Acceptable Use, Cybersecurity & Anti-Abuse Policy</span>
              </h2>
              <p>
                Users agree to interact with the MessPro platform strictly in good faith and adhere to strict cybersecurity standards. The following activities are strictly prohibited and constitute grounds for immediate termination and legal referral:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>No Cyberattacks or Exploits:</strong> Attempting attack serialization/deserialization exploits, SQL/NoSQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), or buffer overflow attacks against MessPro servers or client interfaces.</li>
                <li><strong>No Attendance Spoofing or Replay Attacks:</strong> Forging, duplicating, intercepting, or replaying dynamic QR dining tokens, biometric sync payloads, or attendance API requests.</li>
                <li><strong>No Automated Scraping or Botting:</strong> Using automated bots, scrapers, crawlers, or headless scripts to extract platform data or bypass rate limits.</li>
                <li><strong>No Infrastructure Flooding or Denial of Service:</strong> Intentionally overloading, stressing, or launching Denial of Service (DoS/DDoS) attacks against MessPro APIs, gate endpoints, or hosting infrastructure.</li>
                <li><strong>No Reverse Engineering:</strong> Decompiling, disassembling, reverse engineering, or attempting to derive the source code or proprietary mathematical engines of MessPro.</li>
              </ul>
            </section>

            <section id="attendance-dining" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>6. Dining & Attendance Verification Records</span>
              </h2>
              <p>
                MessPro attendance records generated via cryptographic dynamic QR scan or biometric terminal synchronization serve as prima facie verification of meal consumption.
              </p>
              <p>
                Meal cancellation and skip cutoffs configured by hostel administrators are enforced automatically by the server clock. Cancellation requests submitted after designated cutoff hours cannot be retroactively adjusted unless authorized by an administrator override.
              </p>
            </section>

            <section id="billing-fees" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>7. Invoicing, Payments & SaaS Subscription Fees</span>
              </h2>
              <p>
                MessPro computes monthly resident bills mathematically based on pricing parameters defined by the hostel operator (e.g. room rent, meal pricing, fine adjustments, and amenities). MessPro does not hold resident escrow funds or manage physical bank transfers between students and hostels.
              </p>
              <p>
                Hostel subscriptions to the MessPro SaaS platform are billed according to active resident capacity or institutional plan tiers. All SaaS subscription fees are non-refundable once the active billing cycle commences.
              </p>
            </section>

            <section id="ip-rights" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>8. Proprietary Intellectual Property Rights</span>
              </h2>
              <p>
                The MessPro name, logos, UI designs, dynamic scanning algorithms, biometric sync protocols, billing mathematical models, source code, database architectures, and documentation remain the exclusive intellectual property of MessPro Technologies.
              </p>
            </section>

            <section id="data-privacy" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>9. Data Ownership & Multi-Tenant Privacy</span>
              </h2>
              <p>
                Hostel operators retain exclusive ownership of resident identity rosters, phone directories, room history, and payment ledgers. MessPro does not sell, lease, or monetize tenant student data. For comprehensive data handling practices, refer to our <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section id="limitation-liability" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>10. Limitation of Liability & Indemnification</span>
              </h2>
              <p>
                To the maximum extent permitted by applicable law, MessPro Technologies shall not be held liable for indirect, incidental, punitive, or consequential damages resulting from local network outages, kitchen food preparation disputes, landlord-resident lease disagreements, or off-platform physical payments.
              </p>
              <p>
                Hostel operators agree to indemnify and hold harmless MessPro from any third-party claims arising out of the hostel's physical facility operations, catering negligence, or unauthorized administrative actions.
              </p>
            </section>

            <section id="termination" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>11. Account Suspension & Service Termination</span>
              </h2>
              <p>
                MessPro reserves the right to immediately suspend or terminate any user account or tenant workspace that violates cybersecurity standards, attempts platform attacks, or engages in fraudulent activity.
              </p>
              <p>
                Upon regular institutional contract termination, hostel operators receive a 60-day data retrieval window to export student attendance logs, financial statements, and complaint records in standard formats.
              </p>
            </section>

            <section id="governing-law" className="rounded-3xl bg-card/40 dark:bg-neutral-900/40 border border-border/60 dark:border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>12. Governing Law & Dispute Resolution</span>
              </h2>
              <p>
                This Agreement shall be governed by and construed in accordance with applicable commercial software laws. Any dispute arising under this Agreement shall first be submitted to good-faith mediation prior to binding commercial arbitration.
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
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Landing Page</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
