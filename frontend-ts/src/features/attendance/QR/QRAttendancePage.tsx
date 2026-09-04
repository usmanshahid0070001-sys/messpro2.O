import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  QrCode,
  Scan,
  Activity,
  Calendar,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  RotateCcw,
  Check,
  X,
  Radio,
  Loader2,
  Info,
  Shield,
  Download,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetManagerQR,
  useGetLiveQRAttendance,
  useGetDailyOverview,
  type LiveStudentAttendanceItem,
} from '@/hooks/queries/useAttendanceQueries';
import {
  useScanStudentQR,
  useRespondGuestPermission,
  type ScanStudentQRPermission,
} from '@/hooks/mutations/useAttendanceMutations';
import { useGetMealSchedule } from '@/hooks/queries/useMealQueries';
import QRCodeSVG from './components/QRCodeSVG';
import { Skeleton } from '@/components/ui/skeleton';

export default function QRAttendancePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  // ── Tab State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'counter' | 'scanner' | 'live' | 'overview'>('counter');

  // ── Date for Overview & Matrix ───────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [selectedMealFilter, setSelectedMealFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // ── Scanner Terminal State ───────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualRollInput, setManualRollInput] = useState('');
  const [guestPrompt, setGuestPrompt] = useState<ScanStudentQRPermission['student'] | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<{
    name?: string;
    rollNumber: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const {
    data: managerQRData,
    isLoading: isQRLoading,
    refetch: refetchQR,
    isFetching: isQRFetching,
  } = useGetManagerQR();

  const {
    data: liveData,
    isLoading: isLiveLoading,
    refetch: refetchLive,
  } = useGetLiveQRAttendance(selectedDate);

  const {
    data: dailyOverview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetDailyOverview(selectedDate);

  const { data: mealSchedule } = useGetMealSchedule();

  // ── Mutations ────────────────────────────────────────────────────────────
  const scanStudentMutation = useScanStudentQR();
  const respondPermissionMutation = useRespondGuestPermission();

  // ── Fullscreen toggle ───────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // QR Payload String for counter screen
  const counterQRPayload = useMemo(() => {
    if (!managerQRData?.h || !managerQRData?.s) return '';
    return JSON.stringify({
      h: managerQRData.h,
      s: managerQRData.s,
    });
  }, [managerQRData]);

  // ── Camera Scanner Logic for Staff ──────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    setGuestPrompt(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API not available. Ensure HTTPS or localhost.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use manual roll number entry.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Barcode detection loop
  useEffect(() => {
    if (isScanning && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                handleStudentScanned(barcodes[0].rawValue);
              }
            } catch {
              // ignore frame read issues
            }
          }
        }, 400);
      }
    }
  }, [isScanning]);

  const handleStudentScanned = (rawText: string) => {
    let roll = rawText.trim();
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.studentRollNumber || parsed.rollNumber) {
        roll = parsed.studentRollNumber || parsed.rollNumber;
      }
    } catch {
      // not JSON, use direct string
    }

    if (!roll) return;

    scanStudentMutation.mutate(
      { studentRollNumber: roll },
      {
        onSuccess: (res) => {
          if (res.status === 'requires_permission') {
            setGuestPrompt(res.student);
          } else {
            setLastScannedResult({
              rollNumber: roll,
              message: res.message || 'Attendance verified',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        },
      }
    );
  };

  const handleManualRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRollInput.trim()) return;
    handleStudentScanned(manualRollInput.trim());
    setManualRollInput('');
  };

  const handleGuestDecision = (isApproved: boolean) => {
    if (!guestPrompt) return;
    respondPermissionMutation.mutate(
      {
        studentId: guestPrompt._id,
        isApproved,
      },
      {
        onSuccess: (res) => {
          if (isApproved) {
            setLastScannedResult({
              name: guestPrompt.name,
              rollNumber: guestPrompt.rollNumber,
              message: 'Approved guest entry & attendance marked',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            toast.info('Guest attendance declined');
          }
          setGuestPrompt(null);
        },
      }
    );
  };

  // ── Live Stream Computations ─────────────────────────────────────────────
  const currentMealName = liveData?.currentMeal || 'Active Meal';
  const availableMealTypes = liveData?.mealTypes || [];

  const activeMealData = useMemo(() => {
    if (!liveData?.data) return { summary: { totalSelections: 0, totalAttendance: 0 }, data: [] };
    if (selectedMealFilter === 'all') {
      // Combine all meals
      let totalSel = 0;
      let totalAtt = 0;
      const allStudents: LiveStudentAttendanceItem[] = [];

      Object.entries(liveData.data).forEach(([mType, val]) => {
        totalSel += val.summary.totalSelections;
        totalAtt += val.summary.totalAttendance;
        val.data.forEach((item) => {
          allStudents.push({ ...item, hasAttended: item.hasAttended });
        });
      });

      return {
        summary: { totalSelections: totalSel, totalAttendance: totalAtt },
        data: allStudents,
      };
    }

    return liveData.data[selectedMealFilter] || { summary: { totalSelections: 0, totalAttendance: 0 }, data: [] };
  }, [liveData, selectedMealFilter]);

  const filteredStudentStream = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeMealData.data;
    return activeMealData.data.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q)
    );
  }, [activeMealData, searchQuery]);

  const exportOverviewExcel = async () => {
    if (!dailyOverview?.data) {
      toast.error('No overview data available to export');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const rows: any[] = [];
      Object.entries(dailyOverview.data).forEach(([mType, mData]) => {
        mData.data.forEach((s) => {
          rows.push({
            Date: selectedDate,
            'Meal Slot': mType,
            'Student Name': s.name,
            'Roll Number': s.rollNumber,
            Type: s.isGuest ? 'Guest / External' : 'Resident',
            'Pre-Selected Portions': s.selectionCount,
            'Portions Consumed': s.attendanceCount,
            Status: s.hasAttended ? 'Served' : s.isSelected ? 'Pre-Selected (Absent)' : 'Not Attended',
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'QR_Attendance');
      XLSX.writeFile(wb, `QR_Attendance_${selectedDate}.xlsx`);
      toast.success(`Exported QR_Attendance_${selectedDate}.xlsx`);
    } catch (err: any) {
      toast.error('Export Failed', {
        description: err?.message || 'Could not generate Excel spreadsheet.',
      });
    }
  };

  return (
    <div className="space-y-5 pb-16 w-full max-w-full min-w-0 animate-in fade-in duration-300">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                QR Attendance Management
              </h1>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {currentHostel?.name || 'Main Hostel'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Display dynamic dining hall counter QR codes, scan resident badges, and monitor live turnout.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => {
              refetchQR();
              refetchLive();
              refetchOverview();
              toast.success('Refreshed QR sessions and feeds');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors cursor-pointer"
            title="Refresh active session data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQRFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors cursor-pointer"
            title="Toggle TV / Counter Fullscreen Display"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Counter Mode'}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center p-1.5 bg-muted/60 border border-border/80 rounded-2xl shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('counter');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'counter'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Counter Screen (QR)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('scanner');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Staff Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('live');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Stream Feed</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('overview');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Overview Matrix</span>
        </button>
      </div>

      {/* ── TAB 1: COUNTER DISPLAY (ROLLING QR FORTRESS) ────────────────────── */}
      {activeTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Large QR Display Card */}
          <div className="lg:col-span-7 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-md text-center space-y-5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2 text-left">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    Dining Counter Live QR
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Students scan this code with their camera on `/app/meals/qr`
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                {currentMealName}
              </span>
            </div>

            {/* QR Code SVG */}
            {isQRLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <span className="text-xs text-muted-foreground">Generating secure token...</span>
              </div>
            ) : counterQRPayload ? (
              <div className="py-4">
                <div className="p-6 sm:p-8 bg-white rounded-3xl inline-block shadow-xl border-4 border-emerald-500/30">
                  <QRCodeSVG
                    value={counterQRPayload}
                    size={280}
                    className="w-56 h-56 sm:w-72 sm:h-72 mx-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-rose-500 text-xs font-semibold">
                Unable to load hostel QR secret. Please verify hostel configuration.
              </div>
            )}

            <div className="p-3 bg-muted/40 border border-border/80 rounded-2xl flex items-center justify-between text-xs font-medium max-w-md mx-auto">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Geofencing Active &bull; Secret Token Embedded</span>
              </div>
              <button
                onClick={() => refetchQR()}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Refresh Secret
              </button>
            </div>
          </div>

          {/* Right Column: Live Turnout Snapshot */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Session Performance
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Live Counter
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Pre-Reserved
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono mt-1">
                    {activeMealData.summary.totalSelections}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Meals Claimed
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {activeMealData.summary.totalAttendance}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-muted-foreground">Dining Hall Progress</span>
                  <span className="text-foreground font-mono">
                    {activeMealData.summary.totalSelections > 0
                      ? `${Math.round(
                          (activeMealData.summary.totalAttendance / activeMealData.summary.totalSelections) * 100
                        )}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        activeMealData.summary.totalSelections > 0
                          ? (activeMealData.summary.totalAttendance / activeMealData.summary.totalSelections) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick action card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">Need to scan student badges?</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Switch to staff scanner mode to point camera at student screens.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('scanner')}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 cursor-pointer"
              >
                Open Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: STAFF SCANNER TERMINAL ───────────────────────────────────── */}
      {activeTab === 'scanner' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          {/* Guest Permission Prompt Modal / Dialog */}
          {guestPrompt ? (
            <div className="p-6 bg-card border-2 border-amber-500/40 rounded-3xl shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Cross-Hostel Guest Detected
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {guestPrompt.name} ({guestPrompt.rollNumber})
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This student belongs to an external hostel. Do you wish to approve meal access as a guest?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleGuestDecision(false)}
                  disabled={respondPermissionMutation.isPending}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleGuestDecision(true)}
                  disabled={respondPermissionMutation.isPending}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Mark Attendance</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs text-center space-y-6">
              {isScanning ? (
                <div className="space-y-4">
                  {/* Camera Viewfinder */}
                  <div className="relative w-full max-w-sm aspect-square mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-md flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

                    {/* Framing corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-lg pointer-events-none" />

                    <div className="absolute left-6 right-6 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none" />

                    {scanStudentMutation.isPending && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">Logging Attendance...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <Camera className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">Point Camera at Student Badge</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Scan student phone QR codes directly or type their Roll Number / ID below for instant logging.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto flex items-center gap-2 text-left">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Launch Staff Camera</span>
                  </button>
                </div>
              )}

              {/* Manual Input Form */}
              <div className="border-t border-border/70 pt-5">
                <form onSubmit={handleManualRollSubmit} className="flex items-center gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter Student Roll No. (e.g. CS-2024-001)"
                    value={manualRollInput}
                    onChange={(e) => setManualRollInput(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-xl py-2 px-3 text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={scanStudentMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Mark
                  </button>
                </form>
              </div>

              {/* Last Scanned Feedback Banner */}
              {lastScannedResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-xs block">
                        {lastScannedResult.name ? `${lastScannedResult.name} (${lastScannedResult.rollNumber})` : lastScannedResult.rollNumber}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {lastScannedResult.message}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {lastScannedResult.timestamp}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LIVE STREAM FEED ─────────────────────────────────────────── */}
      {activeTab === 'live' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters & Session Picker */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground">Session:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setSelectedMealFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedMealFilter === 'all'
                      ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Meals
                </button>
                {availableMealTypes.map((mt) => (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => setSelectedMealFilter(mt)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      selectedMealFilter === mt
                        ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mt}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search scanned students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-input rounded-xl py-1.5 pl-9 pr-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Stream Roster Table */}
          <div className="rounded-2xl bg-card border border-border/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                    <th className="px-5 py-3.5">Student Profile</th>
                    <th className="px-5 py-3.5">Roll Number</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5 text-center">Portions Pre-Selected</th>
                    <th className="px-5 py-3.5 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStudentStream.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="font-semibold text-xs">No active logs for this filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudentStream.map((item, idx) => (
                      <tr
                        key={`${item.rollNumber}_${idx}`}
                        className={`transition-colors ${
                          item.hasAttended ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                item.hasAttended
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <span className="font-semibold text-foreground text-sm">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-muted-foreground">{item.rollNumber}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.isGuest
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {item.isGuest ? 'Guest Entry' : 'Resident'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center font-mono font-bold text-foreground">
                          {item.selectionCount}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {item.hasAttended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Check className="w-3 h-3" />
                              <span>Eaten ({item.attendanceCount})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-xs">Unattended</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: DAILY OVERVIEW MATRIX ────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Control Bar with Date Selector & Excel Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-foreground shrink-0">Target Date:</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-background border border-input rounded-xl py-1.5 pl-9 pr-3 text-xs text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              onClick={exportOverviewExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Matrix (Excel)</span>
            </button>
          </div>

          {/* Matrix Cards for Each Meal Slot */}
          {isOverviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          ) : dailyOverview?.data && Object.keys(dailyOverview.data).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(dailyOverview.data).map(([mType, mData]) => {
                const totalSel = mData.summary.totalSelections;
                const totalAtt = mData.summary.totalAttendance;
                const percentage = totalSel > 0 ? Math.round((totalAtt / totalSel) * 100) : 0;

                return (
                  <div key={mType} className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-bold text-foreground text-sm">{mType}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {percentage}% Turnout
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-muted/40 rounded-xl">
                        <span className="text-muted-foreground text-[10px] block uppercase">Selections</span>
                        <span className="text-lg font-bold text-foreground font-mono">{totalSel}</span>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] block uppercase">
                          Served
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {totalAtt}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      {mData.data.length} student records tracked for this slot.
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-card border border-border rounded-2xl text-center text-xs text-muted-foreground">
              No meal schedule or sessions configured for {selectedDate}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
