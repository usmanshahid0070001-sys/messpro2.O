import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  Utensils, 
  ShieldCheck, 
  Trash2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { RootState } from '@/store';
import { socketClient } from '@/lib/socket';
import { useRespondGuestPermission } from '@/hooks/mutations/useAttendanceMutations';

export interface QRNotificationItem {
  requestId: string;
  studentId: string;
  rollNumber: string;
  name: string;
  sourceHostelId?: string;
  targetHostelId?: string;
  reason: 'guest' | 'unselected' | 'extra_meal' | string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  isRead: boolean;
}

const STORAGE_KEY = 'messpro_qr_notifications';

// Helper to play a clean Web Audio chime without external MP3 dependencies
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export default function NotificationBell() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  const [notifications, setNotifications] = useState<QRNotificationItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<QRNotificationItem | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const previewTimerRef = useRef<any>(null);

  const respondMutation = useRespondGuestPermission();

  // Check if current user is authorized to manage QR dining requests
  const canReceiveRequests = useMemo(() => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role === 'admin') return true;
    if (user.role === 'manager') {
      return Array.isArray(user.permissions) && user.permissions.includes('qr_attendance');
    }
    return false;
  }, [user]);

  // Synchronize state with sessionStorage
  const updateNotifications = (updater: (prev: QRNotificationItem[]) => QRNotificationItem[]) => {
    setNotifications((prev) => {
      const next = updater(prev);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save notifications to sessionStorage', e);
      }
      return next;
    });
  };

  // Heartbeat ticker to advance time for live expiration countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Auto-expire pending requests whose 30s window has lapsed
      setNotifications((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (item.status === 'pending' && now >= item.expiresAt) {
            changed = true;
            return { ...item, status: 'expired' as const };
          }
          return item;
        });

        if (changed) {
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Connect to WebSocket & attach real-time listeners
  useEffect(() => {
    if (!canReceiveRequests) return;

    // Connect socket with user credentials
    socketClient.connect();

    // Listen for incoming guest / unreserved meal permission requests
    const unbindRequest = socketClient.on('guest_permission_request', (payload: any) => {
      if (!payload || !payload.requestId) return;

      playNotificationChime();

      const newItem: QRNotificationItem = {
        requestId: payload.requestId,
        studentId: payload.studentId,
        rollNumber: payload.rollNumber || 'Resident',
        name: payload.name || 'Student',
        sourceHostelId: payload.sourceHostelId,
        targetHostelId: payload.targetHostelId,
        reason: payload.reason || 'guest',
        createdAt: payload.createdAt || Date.now(),
        expiresAt: payload.expiresAt || Date.now() + 30000,
        status: 'pending',
        isRead: false,
      };

      updateNotifications((prev) => {
        // Prevent duplicates
        const exists = prev.some((p) => p.requestId === newItem.requestId);
        if (exists) return prev;
        return [newItem, ...prev];
      });

      // Show floating preview card under the Bell button
      setPreviewNotification(newItem);

      // Auto-hide floating preview card after 5 seconds
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        setPreviewNotification(null);
      }, 5000);
    });

    // Listen for resolution updates from other manager terminals
    const unbindUpdated = socketClient.on('guest_permission_updated', (payload: any) => {
      if (!payload || !payload.requestId) return;

      updateNotifications((prev) =>
        prev.map((item) => {
          if (item.requestId === payload.requestId) {
            return {
              ...item,
              status: payload.status === 'accepted' ? 'accepted' : 'declined',
            };
          }
          return item;
        })
      );

      // Clear preview if this item was being previewed
      setPreviewNotification((prev) => (prev?.requestId === payload.requestId ? null : prev));
    });

    return () => {
      unbindRequest();
      unbindUpdated();
      clearTimeout(previewTimerRef.current);
    };
  }, [canReceiveRequests]);

  // Outside click handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle responding to a request (Accept / Decline)
  const handleRespond = (item: QRNotificationItem, isApproved: boolean) => {
    if (respondingId) return; // Prevent double-submission
    setRespondingId(item.requestId);

    const hostelIdStr =
      typeof currentHostel?._id === 'string'
        ? currentHostel._id
        : currentHostel?._id?.$oid;
    const targetHostel = item.targetHostelId || user?.hostelId || hostelIdStr || '';

    respondMutation.mutate(
      {
        requestId: item.requestId,
        studentId: item.studentId,
        isApproved,
        hostelId: targetHostel,
      },
      {
        onSuccess: () => {
          setRespondingId(null);
          updateNotifications((prev) =>
            prev.map((p) =>
              p.requestId === item.requestId
                ? { ...p, status: isApproved ? 'accepted' : 'declined', isRead: true }
                : p
            )
          );
          if (previewNotification?.requestId === item.requestId) {
            setPreviewNotification(null);
          }
        },
        onError: () => {
          setRespondingId(null);
        },
      }
    );
  };

  const handleClearAll = () => {
    updateNotifications(() => []);
    setPreviewNotification(null);
  };

  const hasUnread = notifications.some((n) => !n.isRead || n.status === 'pending');
  const pendingCount = notifications.filter((n) => n.status === 'pending').length;

  if (!canReceiveRequests) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Button with Green Dot Indicator ── */}
      <button
        type="button"
        aria-label="Dining Notifications"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setPreviewNotification(null); // Dismiss preview on direct bell click
          // Mark viewed
          updateNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? 'bg-muted text-foreground border-border'
            : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Bell className="h-4 w-4" />

        {/* Dynamic Glowing Green Dot when notifications available */}
        {hasUnread && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-background" />
          </span>
        )}
      </button>

      {/* ── 5-Second Floating Request Preview Card (Pops below the Bell) ── */}
      {previewNotification && !isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/30 shadow-2xl backdrop-blur-md space-y-2.5 ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>New Meal Request</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNotification(null)}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="font-semibold text-sm text-foreground">
                {previewNotification.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="font-mono">{previewNotification.rollNumber}</span>
                <span>•</span>
                <span className="capitalize font-medium text-amber-600 dark:text-amber-400">
                  {previewNotification.reason === 'guest'
                    ? 'Guest Dining'
                    : previewNotification.reason === 'extra_meal'
                    ? 'Extra Portion'
                    : 'Walk-In'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(true);
                  setPreviewNotification(null);
                }}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Review</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={respondingId === previewNotification.requestId}
                  onClick={() => handleRespond(previewNotification, false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  disabled={respondingId === previewNotification.requestId}
                  onClick={() => handleRespond(previewNotification, true)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Notifications Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-88 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-muted/40 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Meal Approvals
              </h3>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {pendingCount} Pending
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  No active dining requests in this session.
                </div>
                <div className="text-[10px] text-muted-foreground/70">
                  New scans requiring approval will appear here instantly.
                </div>
              </div>
            ) : (
              notifications.map((item) => {
                const remainingSec = Math.max(0, Math.ceil((item.expiresAt - currentTime) / 1000));
                const isPending = item.status === 'pending' && remainingSec > 0;
                const isExpired = item.status === 'expired' || (item.status === 'pending' && remainingSec <= 0);

                return (
                  <div
                    key={item.requestId}
                    className={`p-3.5 sm:p-4 transition-colors space-y-2.5 ${
                      isPending ? 'bg-muted/20 hover:bg-muted/30' : 'bg-card opacity-80'
                    }`}
                  >
                    {/* Header Row: Student Info & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{item.rollNumber}</span>
                          <span>•</span>
                          <span className="capitalize font-medium text-foreground/80">
                            {item.reason === 'guest'
                              ? 'Cross-Hostel Guest'
                              : item.reason === 'extra_meal'
                              ? 'Extra Meal'
                              : 'Unreserved Walk-In'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {item.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            <span>Accepted</span>
                          </span>
                        ) : item.status === 'declined' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            <X className="w-3 h-3" />
                            <span>Declined</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-muted text-muted-foreground border border-border">
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>{remainingSec}s left</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Pending Requests */}
                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={respondingId === item.requestId}
                          onClick={() => handleRespond(item, false)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={respondingId === item.requestId}
                          onClick={() => handleRespond(item, true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Notice */}
          <div className="p-2.5 px-4 bg-muted/20 border-t border-border/80 text-[10px] text-muted-foreground text-center">
            Session storage active • Cleared when tab closes
          </div>
        </div>
      )}
    </div>
  );
}
