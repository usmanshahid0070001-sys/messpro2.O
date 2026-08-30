import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import type { SectionId } from './types';

export const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('hero');

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
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Sections */}
      <main className="flex-1 relative z-10">
        <HeroSection
          onExploreClick={() => handleNavigate('solution')}
          onCalculateClick={() => handleNavigate('problem')}
        />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection />
      </main>

      {/* Branded Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default LandingPage;
