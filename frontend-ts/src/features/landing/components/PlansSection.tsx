import React, { useState, useRef } from 'react';
import {
  Check,
  Sparkles,
  ArrowRight,
  Headphones,
  Lock,
  Flame,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SupportContextReason } from '@/components/SupportUpgradeModal';
import { PRICING_PLANS, type PricingPlanTier } from '../data/plansData';

interface PlansSectionProps {
  /** Callback triggered when a user selects a plan for hostel workspace setup */
  onSetupClick?: (requestedPlan?: string) => void;
  /** Callback triggered when a user requests custom plan consultation or priority support */
  onSupportClick?: (reason: SupportContextReason, featureName?: string) => void;
}

/**
 * PlansSection Component
 *
 * Renders the 5 SaaS pricing tiers with:
 * - Monthly vs. Annual billing toggle (20% discount highlight).
 * - Desktop multi-column grid layout with glassmorphic cards and highlight borders.
 * - Mobile horizontal touch carousel with smooth scroll snap, quick-jump pill tabs, and pagination dots.
 * - Direct deep-link integration to the Setup Hostel modal.
 */
export const PlansSection: React.FC<PlansSectionProps> = ({ onSetupClick, onSupportClick }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePlanAction = (plan: PricingPlanTier) => {
    if (plan.actionType === 'setup') {
      onSetupClick?.(plan.name);
    } else {
      onSupportClick?.('upgrade', plan.name);
    }
  };

  // Scroll to a specific plan card on mobile smoothly
  const scrollToPlan = (index: number) => {
    setActivePlanIdx(index);
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.children;
    if (cards[index]) {
      const targetCard = cards[index] as HTMLElement;
      targetCard.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  // Track scroll position on mobile to update active dot / pill
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 280;
    const newIdx = Math.round(scrollLeft / (cardWidth + 16));
    if (newIdx >= 0 && newIdx < PRICING_PLANS.length && newIdx !== activePlanIdx) {
      setActivePlanIdx(newIdx);
    }
  };

  return (
    <section id="plans" className="scroll-mt-20 py-16 sm:py-24 relative overflow-hidden bg-muted/10 border-t border-border/40">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Transparent, Scalable SaaS Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Simple Plans Built For Your Facility's Exact Needs
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Whether you operate a <strong className="text-foreground">residence-only hostel</strong>, an <strong className="text-foreground">independent mess canteen</strong>, or a <strong className="text-foreground">large university campus</strong> with biometric gates — MessPro has the right modular plan.
          </p>

          {/* Monthly / Annual Billing Switch */}
          <div className="pt-3 flex items-center justify-center gap-3 select-none">
            <span
              className={`text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                !isAnnual ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing discount"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isAnnual ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-xs sm:text-sm font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                isAnnual ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Save 20%
              </span>
            </span>
          </div>

          {/* Mobile Quick Plan Switcher Tabs & Swipe Hint */}
          <div className="flex md:hidden flex-col items-center gap-2 pt-2 select-none">
            <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full -mx-2 px-2">
              {PRICING_PLANS.map((plan, idx) => {
                const isActive = activePlanIdx === idx;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => scrollToPlan(idx)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-105'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted/60'
                    }`}
                  >
                    {plan.name} {plan.isPopular && '⭐'}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground/80 flex items-center gap-1">
              <span>Swipe left or right to compare all 5 plans</span>
              <span className="text-primary font-bold">↔</span>
            </span>
          </div>
        </div>

        {/* Swipeable Carousel Container (Mobile) / Grid (Desktop) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0 px-2 -mx-2 sm:mx-0 sm:px-0 items-stretch touch-pan-x overscroll-x-contain"
        >
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`w-[85vw] max-w-[320px] sm:w-[340px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none relative rounded-2xl bg-card/90 backdrop-blur-md border flex flex-col justify-between p-5 sm:p-5.5 transition-all duration-300 ${
                  plan.isPopular
                    ? 'border-amber-500/80 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40 bg-gradient-to-b from-amber-500/10 via-card to-card hover:shadow-amber-500/20'
                    : 'border-border/70 hover:border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between gap-1 min-h-[24px]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${plan.badgeColor}`}
                    >
                      {plan.isPopular && <Flame className="w-3 h-3 fill-black text-black" />}
                      <span>{plan.badge}</span>
                    </span>
                  </div>

                  {/* Plan Name & Tagline */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                        {price}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {plan.billingPeriod}
                      </span>
                    </div>
                    {isAnnual && price !== '$0' && !plan.isCustom && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold inline-block mt-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Billed annually (Save 20%)
                      </span>
                    )}
                  </div>

                  {/* Capacity & Limits Highlight */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                        <span>{plan.id === 'mess_basic' ? 'Diners Limit:' : 'Resident Limit:'}</span>
                      </span>
                      <span className="font-bold text-foreground text-xs">{plan.limits.students}</span>
                    </div>
                    <div className="h-px bg-border/40" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>Staff Logins:</span>
                      </span>
                      <span className="font-bold text-foreground text-xs">{plan.limits.managers}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
                      Included Modules:
                    </span>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {plan.features.included.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span className="leading-snug text-foreground/90 font-normal">{feature}</span>
                        </li>
                      ))}

                      {plan.features.excluded?.map((feature, idx) => (
                        <li key={`ex-${idx}`} className="flex items-start gap-2 opacity-40">
                          <Lock className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="leading-snug line-through text-[11px]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-5 mt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant={plan.isPopular ? 'default' : plan.buttonVariant}
                    onClick={() => handlePlanAction(plan)}
                    className={`w-full text-xs font-bold h-10 rounded-xl cursor-pointer gap-2 transition-all duration-200 ${
                      plan.isPopular
                        ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md border-0'
                        : 'bg-card hover:bg-muted/80 text-foreground border border-border/80 hover:border-foreground/20 shadow-xs'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Pagination Dots & Controls */}
        <div className="flex md:hidden items-center justify-between pt-3 pb-1 select-none">
          <button
            type="button"
            onClick={() => scrollToPlan(Math.max(0, activePlanIdx - 1))}
            disabled={activePlanIdx === 0}
            className="p-2 rounded-full border border-border bg-card disabled:opacity-30 cursor-pointer text-foreground shadow-xs"
            aria-label="Previous plan"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {PRICING_PLANS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => scrollToPlan(dotIdx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activePlanIdx === dotIdx ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Go to plan ${dotIdx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToPlan(Math.min(PRICING_PLANS.length - 1, activePlanIdx + 1))}
            disabled={activePlanIdx === PRICING_PLANS.length - 1}
            className="p-2 rounded-full border border-border bg-card disabled:opacity-30 cursor-pointer text-foreground shadow-xs"
            aria-label="Next plan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Plan Builder & Consultation Banner */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 hidden sm:block">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                Need a Custom Plan for 200, 500, or 1,000+ Residents?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                We can tailor custom student capacity limits, dedicated hardware biometric gate terminals, white-label branding, and custom billing models specifically for your institution.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => onSupportClick && onSupportClick('upgrade', 'Custom Institutional Plan')}
            className="shrink-0 h-9 px-4 text-xs font-semibold border-border/80 hover:bg-muted text-foreground rounded-xl cursor-pointer gap-1.5"
          >
            <Headphones className="w-4 h-4" />
            <span>Request Custom Plan Quote</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

