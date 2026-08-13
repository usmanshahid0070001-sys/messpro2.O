import { useState, useEffect, useRef } from'react';
import { useNavigate } from'react-router-dom';
import { motion, AnimatePresence } from'framer-motion';
import {
 Shield,
 ChevronRight,
 ArrowLeft,
 Scale,
 FileText,
 Users,
 Lock,
 CreditCard,
 Database,
 AlertTriangle,
 Phone,
 UserCheck,
 Briefcase,
 GraduationCap,
} from'lucide-react';
import { LEGAL_SECTIONS, LEGAL_META, ROLE_TABLE } from'../utils/legalContent';

// ─── Icon map per section id ────────────────────────────────────────────────
const SECTION_ICONS = {
 overview: FileText,
 roles: Users,
 tos: Scale,
'admin-agreement': Briefcase,
'manager-agreement': UserCheck,
'student-agreement': GraduationCap,
 privacy: Lock,
'data-retention': Database,
 liability: AlertTriangle,
 payments: CreditCard,
 amendments: Phone,
};

// ─── Badge color map ─────────────────────────────────────────────────────────
const BADGE_STYLES = {
'All Users':'bg-background dark:bg-background text-muted-foreground',
'Admins Only':'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
'Managers Only':'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
'Students Only':'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

// ─── Sub-component: Subsection renderer ─────────────────────────────────────
function Subsection({ sub }) {
 return (
 <div className="mb-5 last:mb-0">
 {sub.title && (
 <h4 className="text-[13px] font-bold text-foreground mb-2 tracking-wide uppercase">
 {sub.title}
 </h4>
 )}
 {sub.content && (
 <p className="text-sm leading-relaxed text-foreground dark:text-foreground mb-2">
 {sub.content}
 </p>
 )}
 {sub.isList && sub.items && (
 <ul className="space-y-1.5 mt-2">
 {sub.items.map((item, i) => (
 <li key={i} className="flex items-start gap-2.5 text-sm text-foreground dark:text-foreground leading-relaxed">
 <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-background dark:bg-background"/>
 {item}
 </li>
 ))}
 </ul>
 )}
 </div>
 );
}

// ─── Sub-component: Role hierarchy table ─────────────────────────────────────
function RoleTable() {
 return (
 <div className="overflow-x-auto rounded-xl border border-border mt-3">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-background dark:bg-background">
 <th className="px-4 py-3 text-left font-bold text-foreground border-b border-border whitespace-nowrap">Role</th>
 <th className="px-4 py-3 text-left font-bold text-foreground border-b border-border whitespace-nowrap">Authority Level</th>
 <th className="px-4 py-3 text-left font-bold text-foreground border-b border-border">Core Responsibilities</th>
 </tr>
 </thead>
 <tbody>
 {ROLE_TABLE.map((row, i) => (
 <tr key={i} className="border-b border-border last:border-0 hover:bg-background dark:hover:bg-background transition-colors">
 <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{row.role}</td>
 <td className="px-4 py-3 text-foreground dark:text-foreground whitespace-nowrap">{row.authority}</td>
 <td className="px-4 py-3 text-muted-foreground leading-relaxed">{row.responsibilities}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LegalPage() {
 const navigate = useNavigate();
 const [activeSection, setActiveSection] = useState(LEGAL_SECTIONS[0].id);
 const [expandedSections, setExpandedSections] = useState(
 () => Object.fromEntries(LEGAL_SECTIONS.map((s) => [s.id, true]))
 );
 const sectionRefs = useRef({});
 const observerRef = useRef(null);

 // ── Intersection Observer for active TOC highlight ───────────────────────
 useEffect(() => {
 observerRef.current = new IntersectionObserver(
 (entries) => {
 const visible = entries
 .filter((e) => e.isIntersecting)
 .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
 if (visible.length > 0) {
 setActiveSection(visible[0].target.dataset.sectionId);
 }
 },
 { rootMargin:'-20% 0px -70% 0px', threshold: 0 }
 );

 Object.values(sectionRefs.current).forEach((el) => {
 if (el) observerRef.current.observe(el);
 });

 return () => observerRef.current?.disconnect();
 }, []);

 const scrollToSection = (id) => {
 sectionRefs.current[id]?.scrollIntoView({ behavior:'smooth', block:'start'});
 };

 const toggleSection = (id) => {
 setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
 };

 return (
 <div className="min-h-screen bg-background dark:bg-background text-foreground">
 {/* ── Header ─────────────────────────────────────────────────────────── */}
 <header className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-border dark:border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
 <button
 onClick={() => navigate(-1)}
 className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
 >
 <ArrowLeft className="w-4 h-4"/>
 Back
 </button>
 <div className="h-4 w-px bg-background dark:bg-background"/>
 <div className="flex items-center gap-2 min-w-0">
 <Shield className="w-4 h-4 shrink-0 text-foreground"/>
 <span className="text-sm font-bold text-foreground truncate">
 MessPro Legal Agreements
 </span>
 </div>
 <div className="ml-auto shrink-0 flex items-center gap-2">
 <span className="text-[11px] font-medium text-muted-foreground bg-background dark:bg-background px-2.5 py-1 rounded-full">
 {LEGAL_META.version}
 </span>
 <span className="hidden sm:block text-[11px] text-muted-foreground">
 Effective {LEGAL_META.effectiveDate}
 </span>
 </div>
 </div>
 </header>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:flex lg:gap-10">

 {/* ── Sticky TOC Sidebar ──────────────────────────────────────────── */}
 <aside className="hidden lg:block w-64 shrink-0">
 <div className="sticky top-20">
 <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
 Table of Contents
 </p>
 <nav className="space-y-0.5">
 {LEGAL_SECTIONS.map((section) => {
 const Icon = SECTION_ICONS[section.id] || FileText;
 const isActive = activeSection === section.id;
 return (
 <button
 key={section.id}
 onClick={() => scrollToSection(section.id)}
 className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] font-medium transition-all ${
 isActive
 ?'bg-primary text-primary-foreground'
 :'text-foreground dark:text-foreground hover:bg-background dark:hover:bg-background hover:text-foreground'
 }`}
 >
 <Icon className="w-3.5 h-3.5 shrink-0"/>
 <span className="truncate">
 §{section.number} {section.title}
 </span>
 </button>
 );
 })}
 </nav>
 </div>
 </aside>

 {/* ── Main Content ─────────────────────────────────────────────────── */}
 <main className="flex-1 min-w-0 space-y-4">
 {/* Hero banner */}
 <div className="card p-6 sm:p-8 mb-6 border border-border dark:border-border rounded-2xl">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
 <Shield className="w-5 h-5 text-primary-foreground"/>
 </div>
 <div>
 <h1 className="text-xl font-bold text-foreground">MessPro Legal Agreements</h1>
 <p className="text-sm text-muted-foreground">Complete policy bundle for all user roles</p>
 </div>
 </div>
 <p className="text-sm text-muted-foreground leading-relaxed">
 This document governs the use of the MessPro platform for all users — SuperAdmins, Hostel Admins,
 Managers, and Students. By accessing or using MessPro, you agree to be bound by these terms.
 Please read each section applicable to your role carefully.
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 {['All Users','Admins Only','Managers Only','Students Only'].map((badge) => (
 <span key={badge} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE_STYLES[badge]}`}>
 {badge}
 </span>
 ))}
 </div>
 </div>

 {/* Sections */}
 {LEGAL_SECTIONS.map((section) => {
 const Icon = SECTION_ICONS[section.id] || FileText;
 const isExpanded = expandedSections[section.id];
 return (
 <section
 key={section.id}
 id={`section-${section.id}`}
 data-section-id={section.id}
 ref={(el) => (sectionRefs.current[section.id] = el)}
 className="card border border-border dark:border-border rounded-2xl overflow-hidden scroll-mt-20"
 >
 {/* Section Header */}
 <button
 onClick={() => toggleSection(section.id)}
 className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-background dark:hover:bg-background transition-colors group"
 >
 <div className="shrink-0 w-9 h-9 bg-background dark:bg-background rounded-xl flex items-center justify-center group-hover:bg-background dark:group-hover:bg-background transition-colors">
 <Icon className="w-4 h-4 text-foreground dark:text-foreground"/>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
 §{section.number}
 </span>
 <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[section.badge]}`}>
 {section.badge}
 </span>
 </div>
 <h2 className="text-base font-bold text-foreground mt-0.5">
 {section.title}
 </h2>
 </div>
 <ChevronRight
 className={`shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-200 ${
 isExpanded ?'rotate-90':''
 }`}
 />
 </button>

 {/* Section Body */}
 <AnimatePresence initial={false}>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height:'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.22, ease:'easeInOut'}}
 className="overflow-hidden"
 >
 <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-border pt-5 space-y-5">
 {section.isTable && <RoleTable />}
 {section.subsections.map((sub, i) => (
 <Subsection key={i} sub={sub} />
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </section>
 );
 })}

 {/* Footer */}
 <div className="mt-6 py-6 border-t border-border dark:border-border text-center">
 <p className="text-xs text-muted-foreground">
 MessPro — {LEGAL_META.version} Beta &nbsp;|&nbsp; Effective {LEGAL_META.effectiveDate} &nbsp;|&nbsp; Last Reviewed {LEGAL_META.lastReviewed}
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 These agreements constitute the entire legal relationship between MessPro and its users.
 </p>
 </div>
 </main>
 </div>
 </div>
 );
}
