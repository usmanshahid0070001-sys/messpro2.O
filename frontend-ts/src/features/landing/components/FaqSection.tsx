import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Mail
} from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'mess' | 'hostel' | 'billing';
}

const FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'Can I use MessPro for just Mess Dining or just Hostel Room management?',
    answer: 'Absolutely. MessPro is built with modular feature switches. If your facility only provides dining meals, you can toggle off room allocations and use the QR Gate, menu planner, and meal billing modules exclusively. Likewise, residence-only hostels can disable meal tracking.',
    category: 'general',
  },
  {
    id: 2,
    question: 'How does QR attendance prevent students from sharing screenshot passes with friends?',
    answer: 'MessPro uses rolling dynamic QR tokens refreshed with verified timestamps and device hashes. A screenshot taken 30 seconds ago is automatically rejected at the scanner terminal. Terminals also display the student photo and roll number for rapid visual verification.',
    category: 'mess',
  },
  {
    id: 3,
    question: 'What happens if the dining hall loses internet connectivity during meal hours?',
    answer: 'MessPro is designed with local caching and offline-first queueing. The gate scanner continues to record meal passes locally and automatically pushes all synchronized records to the cloud database the moment internet connectivity is restored.',
    category: 'mess',
  },
  {
    id: 4,
    question: 'How does the billing system handle guest meals, late fines, and variable plate prices?',
    answer: 'You can configure daily variable rates (e.g., meat days vs vegetable days) or fixed monthly rates. When generating bills, the engine automatically multiplies verified plate counts, adds recorded guest meals, applies automated late payment fines, and compiles an itemized PDF statement.',
    category: 'billing',
  },
  {
    id: 5,
    question: 'Can we export financial reports and student attendance rosters to Excel / CSV?',
    answer: 'Yes! Every table in MessPro — including monthly meal counts, financial ledgers, resident rosters, and complaint logs — can be exported in one click to Excel (.xlsx) or CSV for institutional audits.',
    category: 'billing',
  },
  {
    id: 6,
    question: 'Do hostel residents need expensive smartphones to view their passes and bills?',
    answer: 'Not at all. MessPro is a hyper-optimized responsive Progressive Web App (PWA) that loads in under 2 seconds even on entry-level Android devices and 3G connections. Students can also be issued a physical laminated QR card if they do not have a smartphone.',
    category: 'hostel',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faqs" className="py-20 sm:py-28 lg:py-32 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide glass-bevel">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to know about setting up MessPro, device requirements, and billing automation.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          {/* Search Bar with Glass Finish */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. offline, QR, billing, Excel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-xs glass-bevel"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All Questions' },
              { key: 'mess', label: 'Mess & Dining' },
              { key: 'hostel', label: 'Rooms & Residence' },
              { key: 'billing', label: 'Billing & Reports' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-foreground text-background dark:bg-white dark:text-black shadow-xs'
                    : 'bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-3xl border transition-all duration-300 backdrop-blur-xl glass-bevel ${
                    isOpen
                      ? 'border-primary/50 dark:border-primary/40 bg-card/80 dark:bg-neutral-900/80 shadow-md'
                      : 'border-border/70 dark:border-white/10 bg-card/50 dark:bg-neutral-900/40 hover:border-border'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-foreground cursor-pointer focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <div className="p-1.5 rounded-full bg-muted/60 dark:bg-white/10 text-muted-foreground ml-3 shrink-0">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 dark:border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 text-xs text-muted-foreground glass-bevel">
              No questions found matching "{searchQuery}". Please contact our support team.
            </div>
          )}
        </div>

        {/* Extended Support & Docs Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/80 dark:border-white/10 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-xs glass-bevel">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-sm sm:text-base font-bold text-foreground block">
              Still have questions about how MessPro works?
            </span>
            <span className="text-xs text-muted-foreground block">
              Explore our step-by-step feature guides, setup walk-throughs, and role permissions.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Docs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <a
              href="mailto:support@messpro.io"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/70 bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Email Team</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
