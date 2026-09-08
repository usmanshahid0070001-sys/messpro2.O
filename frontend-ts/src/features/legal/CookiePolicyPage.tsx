import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import {
  Cookie,
  ShieldCheck,
  Lock,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Printer,
  CheckCircle2,
  Sliders,
  Database,
  Trash2,
} from 'lucide-react';
import logoUrl from '@/assets/pwa-192x192.png';
import { COOKIE_CONSENT_KEY } from '@/components/CookieConsentBanner';
import { toast } from 'sonner';

export const CookiePolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('what-are-cookies');

  useSEO({
    title: 'Cookie Policy — MessPro 2.0',
    description:
      'Understand how MessPro 2.0 uses cookies and browser storage for secure authentication, session management, and interface preferences.',
    keywords: 'MessPro cookie policy, SaaS cookie consent, HTTP-only auth cookies, privacy standards',
    canonicalUrl: '/cookies',
    robots: 'index, follow',
    ogType: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'Cookie Policy',
          description: 'Official Cookie Policy and Browser Storage Disclosure for MessPro 2.0',
          url: 'https://messpro.app/cookies',
          isPartOf: {
            '@type': 'WebSite',
            name: 'MessPro 2.0',
            url: 'https://messpro.app',
          },
        },
      ],
    },
  });

  const handleResetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    toast.success('Cookie preferences reset. Reloading page...', { duration: 1500 });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const sections = [
    { id: 'what-are-cookies', label: '1. What Are Cookies?' },
    { id: 'cookies-we-use', label: '2. Cookies & Storage We Use' },
    { id: 'why-we-use-them', label: '3. Why We Use Cookies' },
    { id: 'third-party', label: '4. Third-Party & Ad Cookies' },
    { id: 'managing-cookies', label: '5. Managing & Clearing Cookies' },
    { id: 'contact', label: '6. Contact & Inquiries' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logoUrl} alt="MessPro Logo" className="w-8 h-8 rounded-lg shadow-xs" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                MessPro 2.0
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Legal & Privacy
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/privacy"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
            >
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Print Policy</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Legal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Cookie Policy</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Cookie className="w-3.5 h-3.5" />
                <span>Cookie Disclosure</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Cookie Policy
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Transparency regarding how MessPro 2.0 uses strictly necessary cookies and local storage tokens to deliver safe, reliable SaaS operations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card p-3 rounded-xl border border-border shadow-2xs">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="font-semibold block text-foreground">Last Updated</span>
                <span>September 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Layout ──────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── Left Sidebar Navigation ─────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Policy Sections
              </span>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeSection === sec.id
                        ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Preference Reset Box */}
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Your Cookie Preferences</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                You can reset your cookie consent choices at any time to re-evaluate optional preferences.
              </p>
              <button
                type="button"
                onClick={handleResetConsent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer w-full justify-center shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset Cookie Consent</span>
              </button>
            </div>
          </aside>

          {/* ── Document Body ────────────────────────────────────────── */}
          <article className="lg:col-span-3 space-y-10 text-sm leading-relaxed text-foreground/90">
            {/* Section 1: What Are Cookies */}
            <section id="what-are-cookies" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-4 h-4 text-primary" />
                1. What Are Cookies & Local Storage?
              </h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. Local Storage and Session Storage are modern HTML5 web technologies that allow applications to store data directly inside your browser.
              </p>
              <p className="text-muted-foreground">
                At MessPro, we adhere strictly to the principle of <strong>minimal data storage</strong>. We only use browser storage when it is technically essential for security, authentication, and user experience.
              </p>
            </section>

            {/* Section 2: Cookies & Storage We Use */}
            <section id="cookies-we-use" className="space-y-4 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Database className="w-4 h-4 text-emerald-500" />
                2. Breakdown of Cookies & Storage We Use
              </h2>
              <p className="text-muted-foreground">
                The following table outlines every cookie and browser storage key used across the MessPro web application:
              </p>

              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 border-b border-border font-bold text-muted-foreground">
                      <tr>
                        <th className="p-3">Identifier / Name</th>
                        <th className="p-3">Type & Storage</th>
                        <th className="p-3">Lifespan</th>
                        <th className="p-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="p-3 font-mono font-bold text-foreground">jwt / token</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            Strictly Essential
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">HTTP-Only Cookie</span>
                        </td>
                        <td className="p-3 text-muted-foreground">Session / 7 Days</td>
                        <td className="p-3 text-muted-foreground">
                          Cryptographically signed authentication session token. Kept in an HTTP-only cookie inaccessible to malicious JavaScript (XSS protection).
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-foreground">sidebar_state</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Functional Preference
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">Cookie</span>
                        </td>
                        <td className="p-3 text-muted-foreground">7 Days</td>
                        <td className="p-3 text-muted-foreground">
                          Remembers whether you collapsed or expanded the left application sidebar so your preference persists across reloads.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-foreground">vite-ui-theme</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            Functional Preference
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">Local Storage</span>
                        </td>
                        <td className="p-3 text-muted-foreground">Persistent</td>
                        <td className="p-3 text-muted-foreground">
                          Saves your color scheme preference (Dark Mode, Light Mode, or System Default).
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-foreground">messpro_cookie_consent</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Consent Record
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">Local Storage</span>
                        </td>
                        <td className="p-3 text-muted-foreground">Persistent</td>
                        <td className="p-3 text-muted-foreground">
                          Records your cookie banner acknowledgment to avoid repeatedly prompting you on future visits.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Why We Use Cookies */}
            <section id="why-we-use-them" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Lock className="w-4 h-4 text-purple-500" />
                3. Why We Use Cookies
              </h2>
              <p className="text-muted-foreground">
                We use cookies and browser storage solely for the following technical operational needs:
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Authentication & Session Security:</strong> Verifying who is logged in and preventing unauthorized access to student records and financial ledgers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">User Preferences:</strong> Retaining display preferences such as dark mode and responsive navigation state.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Offline Gate Scanner Caching:</strong> Storing local queues in IndexedDB/PWA cache so QR gate scanning operates uninterrupted even during dining hall network drops.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4: Third-Party & Ad Cookies */}
            <section id="third-party" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                4. Third-Party & Advertising Cookies
              </h2>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Zero Third-Party Advertising Trackers</span>
                </div>
                <p>
                  MessPro is a dedicated institutional hostel SaaS platform. We do <strong>NOT</strong> sell user data, nor do we embed third-party advertising cookies, cross-site tracking pixels (e.g., Facebook Pixel, TikTok pixel), or behavioral advertising engines.
                </p>
              </div>
            </section>

            {/* Section 5: Managing & Clearing Cookies */}
            <section id="managing-cookies" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                5. Managing & Clearing Cookies in Your Browser
              </h2>
              <p className="text-muted-foreground">
                You have the right to accept or decline non-essential cookies. You can also configure your web browser settings to block or delete cookies at any time:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground pl-1">
                <li>
                  <strong>Google Chrome:</strong> Settings → Privacy and Security → Third-party cookies.
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong> Options → Privacy & Security → Enhanced Tracking Protection.
                </li>
                <li>
                  <strong>Apple Safari:</strong> Preferences → Privacy → Block all cookies.
                </li>
                <li>
                  <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies.
                </li>
              </ul>
              <p className="text-[11px] text-muted-foreground italic">
                Note: If you disable strictly essential cookies (such as auth session tokens), you will not be able to log in or access your MessPro portal.
              </p>
            </section>

            {/* Section 6: Contact */}
            <section id="contact" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-4 h-4 text-primary" />
                6. Questions & Contact
              </h2>
              <p className="text-muted-foreground">
                If you have questions regarding our Cookie Policy or data storage practices, please contact our support and compliance team:
              </p>
              <div className="p-4 rounded-xl border border-border bg-card text-xs space-y-1">
                <span className="font-bold text-foreground block">MessPro Legal & Security Desk</span>
                <span className="text-muted-foreground block font-mono">Email: manan12345ch@gmail.com</span>
                <span className="text-muted-foreground block font-mono">Support Lines: +92 326 1678545 / +92 308 3460558</span>
              </div>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
