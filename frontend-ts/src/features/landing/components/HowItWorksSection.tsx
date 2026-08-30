import React from 'react';
import {
  Building2,
  Users,
  QrCode,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const STEPS = [
    {
      step: '01',
      title: 'Configure Wings & Pricing',
      subtitle: '5-minute initial setup',
      description: 'Define your hostel wings, room numbers, bed capacities, and fixed or variable meal billing rates with zero technical knowledge required.',
      icon: <Building2 className="w-5 h-5 text-primary" />,
      benefit: 'Custom tailored to your specific hostel rules',
    },
    {
      step: '02',
      title: 'Import & Onboard Residents',
      subtitle: '1-click roster import',
      description: 'Upload your student list via Excel or add them individually. MessPro instantly generates unique QR identity cards and student mobile credentials.',
      icon: <Users className="w-5 h-5 text-primary" />,
      benefit: 'No manual card printing or paperwork delays',
    },
    {
      step: '03',
      title: 'Automate Daily Operations',
      subtitle: 'Zero-effort dining gate validation',
      description: 'Students scan their QR at dining doors, meal counts update in real-time, and housekeeping logs room cleaning with verified timestamps.',
      icon: <QrCode className="w-5 h-5 text-primary" />,
      benefit: 'Eliminates lines and stops ghost proxy eating',
    },
    {
      step: '04',
      title: '1-Click Invoicing & Ledger',
      subtitle: 'Audit-proof monthly statements',
      description: 'At month-end, click "Generate Bills". MessPro compiles every consumed plate, rent fee, and fine into transparent PDF and WhatsApp invoices.',
      icon: <Receipt className="w-5 h-5 text-primary" />,
      benefit: 'Zero calculator errors, zero billing arguments',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 lg:py-32 bg-muted/20 dark:bg-neutral-950/40 border-y border-border/60 dark:border-white/10 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide glass-bevel">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Friction-Free Onboarding</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Up and running in 4 straightforward steps
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Transitioning from physical registers to MessPro takes less than an afternoon. No complicated hardware contracts or IT consultants needed.
          </p>
        </div>

        {/* 4 Steps Grid with Step Connectors */}
        <div className="relative">
          {/* Subtle connecting progress gradient line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -translate-y-8 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((item, index) => (
              <div
                key={index}
                className="relative p-7 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 hover:border-primary/40 backdrop-blur-xl transition-all duration-300 shadow-sm flex flex-col justify-between group glass-bevel"
              >
                <div className="space-y-4">
                  {/* Step Marker & Icon with Glitch Hover */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-foreground/20 dark:text-white/20 group-hover:text-primary glitch-hover cursor-default transition-colors tracking-tighter">
                      {item.step}
                    </span>
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground block mt-1">
                      {item.subtitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Benefit Footer */}
                <div className="mt-6 pt-3.5 border-t border-border/60 dark:border-white/10 flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Fear Reliever Card */}
        <div className="p-6 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 max-w-2xl mx-auto text-center space-y-2 backdrop-blur-xl shadow-xs glass-bevel">
          <span className="text-xs font-bold text-foreground block">
            Worried about disrupting your ongoing term?
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You can run MessPro in parallel with your existing register for 3 days to verify accuracy before switching completely.
          </p>
        </div>

      </div>
    </section>
  );
};
