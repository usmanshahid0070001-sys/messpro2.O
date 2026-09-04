import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { SetupHostelModal } from './components/SetupHostelModal';
import type { SectionId } from './types';

const LANDING_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://messpro.app/#webpage',
      url: 'https://messpro.app/',
      name: 'MessPro 2.0 — Smart Hostel & Mess Management SaaS System',
      description:
        'MessPro 2.0 is a modern SaaS platform designed for university and private hostel mess operations. Automate meal scheduling, QR & biometric attendance, billing, room management, and analytics.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://messpro.app/#website',
        name: 'MessPro 2.0',
        url: 'https://messpro.app',
      },
      about: {
        '@type': 'SoftwareApplication',
        name: 'MessPro 2.0',
        applicationCategory: 'BusinessApplication',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can I use MessPro for just Mess Dining or just Hostel Room management?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. MessPro is built with modular feature switches. If your facility only provides dining meals, you can toggle off room allocations and use the QR Gate, menu planner, and meal billing modules exclusively. Likewise, residence-only hostels can disable meal tracking.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does QR attendance prevent students from sharing screenshot passes with friends?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MessPro uses rolling dynamic QR tokens refreshed with verified timestamps and device hashes. A screenshot taken 30 seconds ago is automatically rejected at the scanner terminal. Terminals also display the student photo and roll number for rapid visual verification.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if the dining hall loses internet connectivity during meal hours?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MessPro is designed with local caching and offline-first queueing. The gate scanner continues to record meal passes locally and automatically pushes all synchronized records to the cloud database the moment internet connectivity is restored.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the billing system handle guest meals, late fines, and variable plate prices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can configure daily variable rates (e.g., meat days vs vegetable days) or fixed monthly rates. When generating bills, the engine automatically multiplies verified plate counts, adds recorded guest meals, applies automated late payment fines, and compiles an itemized PDF statement.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can we export financial reports and student attendance rosters to Excel / CSV?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Every table in MessPro — including monthly meal counts, financial ledgers, resident rosters, and complaint logs — can be exported in one click to Excel (.xlsx) or CSV for institutional audits.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do hostel residents need expensive smartphones to view their passes and bills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not at all. MessPro is a hyper-optimized responsive Progressive Web App (PWA) that loads in under 2 seconds even on entry-level Android devices and 3G connections. Students can also be issued a physical laminated QR card if they do not have a smartphone.',
          },
        },
      ],
    },
  ],
};

export const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useSEO({
    title: 'MessPro 2.0 — Smart Hostel & Mess Management System',
    description:
      'Automate meal scheduling, QR & biometric attendance, dynamic plate pricing, student ledgers, room allocation, and analytics with MessPro 2.0 SaaS.',
    keywords:
      'hostel management system, mess management software, meal attendance QR, biometric mess attendance, student dining portal, hostel billing SaaS, MessPro',
    canonicalUrl: '/',
    robots: 'index, follow',
    ogType: 'website',
    structuredData: LANDING_STRUCTURED_DATA,
  });

  // IntersectionObserver for scroll spy
  useEffect(() => {
    const sectionIds: SectionId[] = ['hero', 'problem', 'solution', 'how-it-works', 'faqs', 'cta'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          root: null,
          rootMargin: '-25% 0px -35% 0px',
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleNavigate = (id: SectionId) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 75; // Height of compact floating header + margin
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary scroll-smooth relative overflow-x-hidden">
      
      {/* ── Lethal Texture Stack (Grain + Scanlines) ───────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-40 select-none">
        {/* Film grain noise overlay */}
        <div className="absolute inset-0 film-grain-layer opacity-[0.035] mix-blend-overlay" />
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines-layer opacity-[0.02] mix-blend-soft-light" />
      </div>

      {/* Floating Apple Liquid Glass Island Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSetupClick={() => setIsSetupModalOpen(true)}
      />

      {/* Main Sections */}
      <main className="flex-1 relative z-10">
        <HeroSection
          onExploreClick={() => handleNavigate('solution')}
          onCalculateClick={() => handleNavigate('problem')}
          onSetupClick={() => setIsSetupModalOpen(true)}
        />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection onSetupClick={() => setIsSetupModalOpen(true)} />
      </main>

      {/* Branded Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Public Hostel Setup Modal */}
      <SetupHostelModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;

