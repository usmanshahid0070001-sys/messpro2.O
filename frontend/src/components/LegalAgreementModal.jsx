import { useState, useRef, useEffect } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Shield, X, CheckCircle, ExternalLink, ChevronDown } from'lucide-react';
import { useNavigate } from'react-router-dom';
import toast from'react-hot-toast';
import { LEGAL_META } from'../utils/legalContent';
import { useSignAgreementMutation } from'../hooks/mutations/useAuthMutations';


// ─── Role-specific key points shown in the modal summary ─────────────────────
const ROLE_HIGHLIGHTS = {
 admin: {
 color:'text-blue-700 dark:text-blue-400',
 bg:'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
 label:'Hostel Admin',
 points: [
'You are responsible for all hostel configuration, meal pricing, and fine parameters set in MessPro.',
'You warrant that you have the legal authority to onboard your students onto this platform.',
'You are accountable for all actions taken by Managers you authorize.',
'All bills generated are mathematical outputs of your configuration — MessPro bears no billing liability.',
'MessPro does not process any payments. Subscription fees and student bills are settled entirely offline.',
 ],
 },
 manager: {
 color:'text-amber-700 dark:text-amber-400',
 bg:'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
 label:'Manager',
 points: [
'Your access is granted by your Hostel Admin and can be revoked at any time.',
'You are responsible for the accuracy of all attendance data you record, including manual entries.',
'You may not modify billing configurations, fine parameters, or meal pricing — these are Admin-only.',
'You must not share your login credentials or mark attendance for students who are not physically present.',
'MessPro collects no payment information. All bill settlements happen offline through your hostel.',
 ],
 },
 student: {
 color:'text-emerald-700 dark:text-emerald-400',
 bg:'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
 label:'Student',
 points: [
'Your MessPro account is managed by your Hostel Admin. Access ends when you leave the hostel.',
'Meal selections are locked after the Admin-configured cutoff time — locked selections are binding.',
'Your bill on MessPro is an estimate only. Actual payment is made offline to your hostel.',
'MessPro does not collect any payments, bank details, or financial information from you.',
'To request data deletion or correction, contact your Hostel Admin through official channels.',
 ],
 },
 superadmin: {
 color:'text-muted-foreground',
 bg:'bg-secondary border-border',
 label:'SuperAdmin',
 points: [
'Your role is limited to creating, managing, and applying subscription plans to hostel tenants.',
'You do not have authority to alter individual hostel operational data or student records.',
'All platform use must comply with MessPro\'s Acceptable Use Policy and these agreements.',
'MessPro does not use any payment gateways — all subscription fees are collected offline.',
 ],
 },
};

/**
 * LegalAgreementModal
 *
 * Props:
 * isOpen {boolean} — controls visibility
 * onAccept {function} — called when user clicks"I Agree"
 * onClose {function} — called when user closes without agreeing (optional)
 * userRole {string} —'admin'|'manager'|'student'|'superadmin'
 */
export default function LegalAgreementModal({ isOpen, onAccept, onClose, userRole ='student'}) {
 const navigate = useNavigate();
 const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
 const scrollRef = useRef(null);

 const signMutation = useSignAgreementMutation();
 const roleData = ROLE_HIGHLIGHTS[userRole] || ROLE_HIGHLIGHTS.student;

 // Reset state when modal opens
 useEffect(() => {
 if (isOpen) {
 setHasScrolledToBottom(false);
 signMutation.reset();
 setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
 }
 }, [isOpen]);

 // Detect scroll to bottom to enable the Agree button
 const handleScroll = () => {
 const el = scrollRef.current;
 if (!el) return;
 const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
 if (atBottom) setHasScrolledToBottom(true);
 };

 const handleAgree = () => {
 signMutation.mutate(undefined, {
 onSuccess: (data) => {
 toast.success('Agreement signed. Welcome to MessPro!');
 onAccept?.(data.data); // pass the updated user object up
 },
 onError: (error) => {
 toast.error(error?.response?.data?.message ||'Failed to sign agreement. Please try again.');
 },
 });
 };

 const isAgreeing = signMutation.isPending;


 const handleViewFull = () => {
 navigate('/legal');
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 key="legal-modal-overlay"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
 >
 {/* Backdrop */}
 <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>

 {/* Modal */}
 <motion.div
 key="legal-modal-content"
 role="dialog"
 aria-modal="true"
 aria-labelledby="legal-modal-title"
 initial={{ opacity: 0, scale: 0.96, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 12 }}
 transition={{ type:'spring', damping: 26, stiffness: 320 }}
 className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col border border-border overflow-hidden max-h-[90vh]"
 >
 {/* ── Header ───────────────────────────────────────────────────── */}
 <div className="shrink-0 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-border">
 <div className="flex items-center gap-3 min-w-0">
 <div className="shrink-0 w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
 <Shield className="w-4 h-4 text-primary-foreground"/>
 </div>
 <div className="min-w-0">
 <h2 id="legal-modal-title"className="text-base font-bold text-foreground">
 Legal Agreement
 </h2>
 <p className="text-[12px] text-muted-foreground mt-0.5">
 MessPro {LEGAL_META.version} · Effective {LEGAL_META.effectiveDate}
 </p>
 </div>
 </div>
 {onClose && (
 <button
 type="button"
 onClick={onClose}
 className="shrink-0 p-2 rounded-lg text-foreground hover:text-foreground hover:bg-accent transition-colors"
 aria-label="Close"
 >
 <X className="w-4 h-4"/>
 </button>
 )}
 </div>

 {/* ── Role badge ───────────────────────────────────────────────── */}
 <div className="shrink-0 px-5 sm:px-6 py-3 border-b border-border bg-muted">
 <p className="text-[12px] text-muted-foreground">
 You are agreeing as a{''}
 <span className={`font-bold ${roleData.color}`}>{roleData.label}</span>.
 Please read the key terms below that apply to your role.
 </p>
 </div>

 {/* ── Scrollable body ──────────────────────────────────────────── */}
 <div
 ref={scrollRef}
 onScroll={handleScroll}
 className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6 py-5 space-y-5 [scrollbar-width:thin]"
 >
 {/* Role-specific highlights */}
 <div className={`border rounded-xl p-4 ${roleData.bg}`}>
 <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${roleData.color}`}>
 Key Terms for {roleData.label}s
 </p>
 <ul className="space-y-2">
 {roleData.points.map((point, i) => (
 <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
 <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${roleData.color}`} />
 {point}
 </li>
 ))}
 </ul>
 </div>

 {/* Universal points */}
 <div className="border border-border rounded-xl p-4">
 <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-muted-foreground">
 Applies to All Users
 </p>
 <ul className="space-y-2">
 {[
'MessPro is not a food provider, financial institution, or property manager.',
'No payment gateway is used. MessPro never collects card, bank, or wallet information.',
'All student bill payments and Admin subscription fees are settled offline.',
'Biometric hardware data (e.g., fingerprints) never enters MessPro\'s systems.',
'Your data is multi-tenant isolated — one hostel cannot access another\'s data.',
'Continued use of the platform constitutes acceptance of these terms.',
 ].map((point, i) => (
 <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
 <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground"/>
 {point}
 </li>
 ))}
 </ul>
 </div>

 {/* Scroll prompt */}
 {!hasScrolledToBottom && (
 <motion.div
 animate={{ y: [0, 4, 0] }}
 transition={{ repeat: Infinity, duration: 1.5 }}
 className="flex flex-col items-center gap-1 py-2 text-muted-foreground"
 >
 <ChevronDown className="w-4 h-4"/>
 <span className="text-[11px]">Scroll to continue</span>
 </motion.div>
 )}
 </div>

 {/* ── Footer ───────────────────────────────────────────────────── */}
 <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-border bg-background/80 backdrop-blur-sm space-y-3">
 {/* View Full Agreement */}
 <button
 type="button"
 onClick={handleViewFull}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
 >
 <ExternalLink className="w-3.5 h-3.5"/>
 View Full Agreement (11 Sections)
 </button>

 {/* Action Buttons */}
 <div className="flex gap-3">
 {onClose && (
 <button
 type="button"
 onClick={onClose}
 disabled={isAgreeing}
 className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-secondary-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
 >
 Decline
 </button>
 )}
 <button
 id="legal-agree-btn"
 type="button"
 onClick={handleAgree}
 disabled={!hasScrolledToBottom || isAgreeing}
 className="flex-1 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 {isAgreeing ? (
 <>
 <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"/>
 Confirming...
 </>
 ) : (
 <>
 <CheckCircle className="w-4 h-4"/>
 I Agree
 </>
 )}
 </button>
 </div>

 {!hasScrolledToBottom && (
 <p className="text-[11px] text-center text-muted-foreground">
 Please scroll through the terms above to enable agreement.
 </p>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
