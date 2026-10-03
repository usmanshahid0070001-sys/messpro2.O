import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  WifiOff,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Utensils,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';

export type ConfirmationStatusType = 'verified' | 'declined' | 'network_error';

export interface AttendanceConfirmationData {
  type: ConfirmationStatusType;
  mealCode?: string | null;
  date?: string;
  mealType?: string;
  mealName?: string;
  portionCount?: number;
  statusText?: string;
  studentName?: string;
  rollNumber?: string;
  message?: string;
}

interface AttendanceConfirmationCardProps {
  data: AttendanceConfirmationData;
  onScanAgain: () => void;
  onDone: () => void;
}

export const AttendanceConfirmationCard: React.FC<AttendanceConfirmationCardProps> = ({
  data,
  onScanAgain,
  onDone,
}) => {
  const {
    type,
    mealCode,
    date = new Date().toISOString().split('T')[0],
    mealType = 'Meal',
    mealName = 'Standard Menu',
    portionCount = 1,
    statusText,
    studentName,
    rollNumber,
    message,
  } = data;

  // Real-time ticking seconds clock to guarantee anti-screenshot authenticity to the manager
  const [liveClock, setLiveClock] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date for clear human readability
  const formattedDate = React.useMemo(() => {
    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return date;
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(parsed);
    } catch {
      return date;
    }
  }, [date]);

  // Color & Icon Configuration per Status Type
  const statusConfig = {
    verified: {
      accentBorder: 'border-emerald-500/40 dark:border-emerald-500/30',
      glowBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-200" />,
      tag: 'Verified & Recorded',
      title: 'Attendance Marked!',
      defaultSubtitle: 'Your dining portion has been registered in the hostel ledger.',
      codeBg: 'bg-emerald-500/[0.08] dark:bg-emerald-950/30 border-emerald-500/30',
      codeTextColor: 'text-emerald-600 dark:text-emerald-400',
      statusBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      defaultStatusText: 'Claimed & Logged',
    },
    declined: {
      accentBorder: 'border-rose-500/40 dark:border-rose-500/30',
      glowBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      icon: <XCircle className="w-9 h-9 sm:w-10 sm:h-10 text-rose-600 dark:text-rose-400 animate-in zoom-in-75 duration-200" />,
      tag: 'Access Declined',
      title: 'Attendance Not Marked',
      defaultSubtitle: message || 'Dining request was declined or unauthorized.',
      codeBg: 'bg-rose-500/[0.06] dark:bg-rose-950/20 border-rose-500/25',
      codeTextColor: 'text-rose-600 dark:text-rose-400',
      statusBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      defaultStatusText: statusText || 'Declined / Access Refused',
    },
    network_error: {
      accentBorder: 'border-amber-500/40 dark:border-amber-500/30',
      glowBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      icon: <WifiOff className="w-9 h-9 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400 animate-in zoom-in-75 duration-200" />,
      tag: 'Connection Problem',
      title: 'Network Error',
      defaultSubtitle: message || 'Unable to connect to mess server. Please check your internet connection and scan again.',
      codeBg: 'bg-amber-500/[0.06] dark:bg-amber-950/20 border-amber-500/25',
      codeTextColor: 'text-amber-600 dark:text-amber-400',
      statusBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      defaultStatusText: statusText || 'Unconfirmed (Offline)',
    },
  }[type];

  return (
    <div
      className={`w-full max-w-md mx-auto bg-card border ${statusConfig.accentBorder} p-5 sm:p-7 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 transition-all`}
    >
      {/* ── 1. VERIFICATION TICK / DECLINE / NETWORK ICON ─────────────────────── */}
      <div className="space-y-3">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl ${statusConfig.glowBg} flex items-center justify-center mx-auto shadow-sm transition-transform duration-300`}
        >
          {statusConfig.icon}
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${statusConfig.badgeBg}`}
          >
            {type === 'verified' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {type === 'declined' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            {type === 'network_error' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
            {statusConfig.tag}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1.5 tracking-tight">
            {statusConfig.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 px-2 leading-relaxed">
            {message || statusConfig.defaultSubtitle}
          </p>
        </div>
      </div>

      {/* ── 2. AUTHORITATIVE MEAL CODE DISPLAY (FOR MANAGER CROSS-CHECK) ────── */}
      <div
        className={`p-4 rounded-2xl border ${statusConfig.codeBg} space-y-2 relative overflow-hidden`}
      >
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Official Meal Code
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {liveClock}
          </span>
        </div>

        {/* Large Monospace Meal Code */}
        <div className="py-1">
          {type === 'verified' ? (
            <div
              className={`text-4xl sm:text-5xl font-black font-mono tracking-widest ${statusConfig.codeTextColor} select-all`}
            >
              {mealCode || '---'}
            </div>
          ) : type === 'declined' ? (
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-rose-500/80">
              VOID / DECLINED
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-amber-500/80">
              OFFLINE / NO CODE
            </div>
          )}
        </div>

        {/* Anti-spoof Security Legend */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/90 font-medium">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>
            {type === 'verified'
              ? 'Verifiable against manager counter display'
              : type === 'declined'
              ? 'This session is not authorized for dining'
              : 'Reconnect to internet and scan again'}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        </div>
      </div>

      {/* ── 3. STRUCTURED DETAILS: DATE, MEAL SESSION, NAME, PORTION & STATUS ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-2.5 text-xs">
        {/* Date & Meal Session */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Date & Session:</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-foreground text-right truncate">
            <span>{formattedDate}</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="capitalize px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-bold">
              {mealType}
            </span>
          </div>
        </div>

        {/* Meal Name */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Meal Name:</span>
          </div>
          <span className="font-bold text-foreground text-right truncate max-w-[200px]" title={mealName}>
            {mealName}
          </span>
        </div>

        {/* Portions & Status */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Portions:</span>
          </div>
          <span className="font-extrabold font-mono text-foreground">
            {type === 'verified' ? `${portionCount} portion(s)` : '0 portion'}
          </span>
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground font-medium">Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.statusBadge}`}
          >
            {statusText || statusConfig.defaultStatusText}
          </span>
        </div>

        {/* Student Roll / Name identification */}
        {(rollNumber || studentName) && (
          <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-muted-foreground/70" />
              <span>Student:</span>
            </div>
            <span className="font-semibold text-foreground truncate max-w-[210px]">
              {studentName ? `${studentName} ` : ''}
              {rollNumber ? `(${rollNumber})` : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── 4. ACTION BUTTONS: SCAN AGAIN OR DONE ────────────────────────────── */}
      <div className="pt-1 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onScanAgain}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted active:scale-95 text-foreground transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Scan Again</span>
        </button>

        <button
          type="button"
          onClick={onDone}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl active:scale-95 text-white transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            type === 'verified'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
