import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  QrCode,
  Scan,
  Activity,
  Calendar,
  Utensils,
  AlertCircle,
  Download,
  Users,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Check,
  Loader2,
  Info,
  Printer,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
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
import QRCodeSVG from './components/QRCodeSVG';
import PrintQRCodeModal from './components/PrintQRCodeModal';
import { Skeleton } from '@/components/ui/skeleton';
import { QRReaderEngine } from './utils/qrReaderEngine';
import { playScanSuccessSound, playScanNoticeSound, triggerHaptic } from './utils/qrFeedback';
import { socketClient } from '@/lib/socket';

type ActiveTab = 'counter' | 'scanner' | 'live' | 'overview';

export default function QRAttendancePage() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  // ── Print Modal State ───────────────────────────────────────────────────
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // ── Tab State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('counter');

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
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{
    name?: string;
    rollNumber: string;
    message: string;
    timestamp: string;
    isPending?: boolean;
    isError?: boolean;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrEngineRef = useRef<QRReaderEngine | null>(null);

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

  // ── Real-Time Socket Attendance Refetch ──────────────────────────────────
  useEffect(() => {
    socketClient.connect();
    const unbind = socketClient.on('attendance_success', (payload: any) => {
      if (!payload || !payload.mealType) return;

      const updateData = (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        
        // Deep clone to ensure React state updates trigger correctly
        const newData = JSON.parse(JSON.stringify(oldData));
        
        if (!newData.data[payload.mealType]) {
          newData.data[payload.mealType] = { data: [], summary: { totalSelections: 0, totalAttendance: 0 } };
        }
        
        const mealData = newData.data[payload.mealType];
        
        const existingStudentIdx = mealData.data.findIndex(
          (s: any) => String(s.rollNumber).toLowerCase() === String(payload.rollNumber).toLowerCase()
        );

        if (existingStudentIdx >= 0) {
          const current = mealData.data[existingStudentIdx];
          const oldAttCount = current.attendanceCount || (current.hasAttended ? 1 : 0) || 0;
          const newAttCount = payload.count !== undefined ? payload.count : (oldAttCount + 1);
          const attDiff = newAttCount - oldAttCount;

          if (mealData.summary) {
            mealData.summary.totalAttendance = Math.max(0, (mealData.summary.totalAttendance || 0) + attDiff);
          }
          
          mealData.data[existingStudentIdx] = {
            ...current,
            attendanceCount: newAttCount,
            hasAttended: newAttCount > 0,
            selectionCount: payload.selectionCount !== undefined ? payload.selectionCount : current.selectionCount,
            isSelected: (payload.selectionCount !== undefined ? payload.selectionCount : current.selectionCount) > 0,
          };
        } else {
          const newAttCount = payload.count !== undefined ? payload.count : 1;
          const selCount = payload.selectionCount || 0;
          
          if (mealData.summary) {
            mealData.summary.totalAttendance = (mealData.summary.totalAttendance || 0) + newAttCount;
            if (selCount > 0) {
              mealData.summary.totalSelections = (mealData.summary.totalSelections || 0) + selCount;
            }
          }
          
          // Add to beginning of the list for instant visibility
          mealData.data.unshift({
            name: payload.name || (payload.isGuest ? 'Guest Entry' : 'Walk-in Student'),
            rollNumber: payload.rollNumber,
            isGuest: payload.isGuest || false,
            attendanceCount: newAttCount,
            selectionCount: selCount,
            hasAttended: newAttCount > 0,
            isSelected: selCount > 0
          });
        }
        
        return newData;
      };

      // 1. Update Live QR Attendance Cache (No API calls!)
      queryClient.setQueryData(['liveQRAttendance', selectedDate], updateData);
      
      // 2. Update Daily Overview Cache (No API calls!)
      queryClient.setQueryData(['dailyOverview', selectedDate], updateData);
    });

    return () => {
      unbind();
    };
  }, [queryClient, selectedDate]);

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

  // QR Payload String for counter screen (pure hostelId)
  const counterQRPayload = useMemo(() => {
    const rawHostelId =
      managerQRData?.h ||
      managerQRData?.hostelId ||
      user?.hostelId ||
      (typeof currentHostel?._id === 'string'
        ? currentHostel._id
        : currentHostel?._id?.$oid);
    if (!rawHostelId) return '';
    const cleanHostelId = String(rawHostelId).trim();
    return JSON.stringify({
      hostelId: cleanHostelId,
      h: cleanHostelId,
      s: managerQRData?.s || undefined,
    });
  }, [managerQRData, currentHostel, user]);

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
    if (qrEngineRef.current) {
      qrEngineRef.current.stop();
      qrEngineRef.current = null;
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

  // Barcode / QR detection loop using high performance QRReaderEngine
  useEffect(() => {
    if (isScanning && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .then(() => {
          if (videoRef.current) {
            qrEngineRef.current = new QRReaderEngine(videoRef.current, (detectedText) => {
              handleStudentScanned(detectedText);
            });
            qrEngineRef.current.start();
          }
        })
        .catch(() => {});
    }
  }, [isScanning]);

  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const handleStudentScanned = (rawText: string) => {
    if (!rawText || !rawText.trim() || isProcessingScan || scanStudentMutation.isPending) return;
    const trimmed = rawText.trim();
    let roll = trimmed;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        roll =
          parsed.rollNumber ||
          parsed.id ||
          parsed.studentRollNumber ||
          parsed.studentId ||
          trimmed;
      }
    } catch {
      // not JSON, use direct string
    }

    if (!roll) return;

    // Temporarily pause engine loop to give time for scan processing
    if (qrEngineRef.current) {
      qrEngineRef.current.pause();
    }
    setIsProcessingScan(true);

    // Instant Feedback (< 10ms)
    playScanSuccessSound();
    triggerHaptic('success');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    // Optimistic status update
    setLastScannedResult({
      rollNumber: roll,
      message: 'Verifying student attendance...',
      timestamp: new Date().toLocaleTimeString(),
      isPending: true,
    });

    scanStudentMutation.mutate(
      { studentRollNumber: roll },
      {
        onSuccess: (res) => {
          setIsProcessingScan(false);
          if (res.status === 'requires_permission') {
            playScanNoticeSound();
            triggerHaptic('warning');
            setGuestPrompt(res.student);
            setLastScannedResult(null);
          } else {
            setLastScannedResult({
              rollNumber: roll,
              message: res.message || 'Attendance verified (Meal logged)',
              timestamp: new Date().toLocaleTimeString(),
              isPending: false,
            });
            // Resume engine after brief delay for next student
            setTimeout(() => {
              if (qrEngineRef.current) {
                qrEngineRef.current.resume();
              }
            }, 1200);
          }
        },
        onError: (err: any) => {
          setIsProcessingScan(false);
          triggerHaptic('error');
          setLastScannedResult({
            rollNumber: roll,
            message: err?.response?.data?.message || err?.message || 'Verification failed',
            timestamp: new Date().toLocaleTimeString(),
            isPending: false,
            isError: true,
          });
          // Resume engine after brief delay to allow next scan
          setTimeout(() => {
            if (qrEngineRef.current) {
              qrEngineRef.current.resume();
            }
          }, 1500);
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
    const hostelIdStr =
      typeof currentHostel?._id === 'string'
        ? currentHostel._id
        : currentHostel?._id?.$oid;
    const targetHostel = user?.hostelId || hostelIdStr || '';
    const uniqueReqId = `manager_scan_${guestPrompt._id}_${Date.now()}`;

    respondPermissionMutation.mutate(
      {
        requestId: uniqueReqId,
        studentId: guestPrompt._id,
        isApproved,
        hostelId: targetHostel,
      },
      {
        onSuccess: () => {
          if (isApproved) {
            playScanSuccessSound();
            triggerHaptic('success');
            setLastScannedResult({
              name: guestPrompt.name,
              rollNumber: guestPrompt.rollNumber,
              message: 'Approved guest entry & attendance marked',
              timestamp: new Date().toLocaleTimeString(),
              isPending: false,
            });
          } else {
            toast.info('Guest attendance declined');
          }
          setGuestPrompt(null);
          // Resume engine for next scan
          setTimeout(() => {
            if (qrEngineRef.current) {
              qrEngineRef.current.resume();
            }
          }, 1000);
        },
        onError: () => {
          setGuestPrompt(null);
          setTimeout(() => {
            if (qrEngineRef.current) {
              qrEngineRef.current.resume();
            }
          }, 1000);
        },
      }
    );
  };

  // ── Live Stream Computations ─────────────────────────────────────────────
  const currentMealName =
    liveData?.currentMeal && liveData.currentMeal !== 'None'
      ? liveData.currentMeal
      : 'Active Meal';
  const availableMealTypes =
    liveData?.mealTypes && liveData.mealTypes.length > 0
      ? liveData.mealTypes
      : dailyOverview?.mealTypes && dailyOverview.mealTypes.length > 0
      ? dailyOverview.mealTypes
      : ['Breakfast', 'Lunch', 'Dinner'];

  // ── Meal-by-Meal Statistics for Session Performance ──────────────────────
  const mealPerformanceList = useMemo(() => {
    // 1. Resolve meal session names: from liveData, dailyOverview, or standard defaults
    let types: string[] = [];
    if (liveData?.mealTypes && liveData.mealTypes.length > 0) {
      types = liveData.mealTypes;
    } else if (dailyOverview?.mealTypes && dailyOverview.mealTypes.length > 0) {
      types = dailyOverview.mealTypes;
    } else if (liveData?.data && Object.keys(liveData.data).length > 0) {
      types = Object.keys(liveData.data);
    } else if (dailyOverview?.data && Object.keys(dailyOverview.data).length > 0) {
      types = Object.keys(dailyOverview.data);
    } else {
      types = ['Breakfast', 'Lunch', 'Dinner'];
    }

    return types.map((mealName) => {
      // Look up mealData from liveData first, then fallback to dailyOverview
      const mealData =
        liveData?.data?.[mealName] ||
        dailyOverview?.data?.[mealName] || {
          summary: { totalSelections: 0, totalAttendance: 0 },
          data: [],
        };
      const students = mealData.data || [];

      // Calculate accurate counts per student
      let preReservedCount = 0;
      let preReservedAttendanceCount = 0;
      let walkInCount = 0;
      let guestCount = 0;
      let totalAttendance = 0;

      students.forEach((s) => {
        const sel = s.isGuest ? 0 : (s.selectionCount || (s.isSelected ? 1 : 0) || 0);
        const att = s.attendanceCount || (s.hasAttended ? 1 : 0) || 0;

        preReservedCount += sel;
        totalAttendance += att;

        if (s.isGuest) {
          // All outer-hostel guest attendance belongs to guest count
          guestCount += att;
        } else {
          // Resident student
          if (sel > 0) {
            // Student pre-reserved: attendance up to reservation is reserved marked
            const reservedMarked = Math.min(att, sel);
            // Any attendance beyond reservation is extra portion (treated as guest/walk-in)
            const extraPortions = Math.max(0, att - sel);

            preReservedAttendanceCount += reservedMarked;
            guestCount += extraPortions;
          } else {
            // Student did not pre-reserve: walk-in resident
            walkInCount += att;
          }
        }
      });

      // Fallback to mealData.summary if students list is empty or summary has more recorded reservations
      if (students.length === 0 && mealData.summary) {
        preReservedCount = mealData.summary.totalSelections || 0;
        totalAttendance = mealData.summary.totalAttendance || 0;
      } else if (mealData.summary?.totalSelections && mealData.summary.totalSelections > preReservedCount) {
        preReservedCount = mealData.summary.totalSelections;
      }

      const walkInOrGuestCount = walkInCount + guestCount;

      // Percentage of pre-reserved attendees claimed
      const claimRate =
        preReservedCount > 0
          ? Math.round((preReservedAttendanceCount / preReservedCount) * 100)
          : 0;

      // Overall turnout percentage
      const turnoutPercent =
        preReservedCount > 0
          ? Math.round((totalAttendance / preReservedCount) * 100)
          : totalAttendance > 0
          ? 100
          : 0;

      const isCurrent =
        currentMealName !== 'None' &&
        currentMealName !== 'Active Meal' &&
        mealName.toLowerCase() === currentMealName?.toLowerCase();

      return {
        mealName,
        isCurrent,
        preReservedCount,
        preReservedAttendanceCount,
        walkInCount,
        guestCount,
        walkInOrGuestCount,
        totalAttendance,
        claimRate,
        turnoutPercent,
        totalRecords: students.length,
      };
    });
  }, [liveData, dailyOverview, currentMealName]);

  const activeMealData = useMemo(() => {
    if (!liveData?.data) return { summary: { totalSelections: 0, totalAttendance: 0 }, data: [] };
    if (selectedMealFilter === 'all') {
      // Combine all meals
      let totalSel = 0;
      let totalAtt = 0;
      const allStudents: LiveStudentAttendanceItem[] = [];

      Object.values(liveData.data).forEach((val) => {
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

  // ── Tab config ───────────────────────────────────────────────────────────
  const TABS: { id: ActiveTab; icon: React.ReactNode; label: string; short: string }[] = [
    { id: 'counter',  icon: <QrCode className="w-4 h-4" />,   label: 'Counter QR',  short: 'QR'    },
    { id: 'scanner',  icon: <Scan className="w-4 h-4" />,     label: 'Scanner',     short: 'Scan'  },
    { id: 'live',     icon: <Activity className="w-4 h-4" />, label: 'Live Feed',   short: 'Live'  },
    { id: 'overview', icon: <Calendar className="w-4 h-4" />, label: 'Overview',    short: 'Stats' },
  ];

  return (
    <div className="space-y-4 pb-20 w-full max-w-full min-w-0 animate-in fade-in duration-300">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                QR Attendance
              </h1>
              <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full hidden sm:inline-flex">
                {currentHostel?.name || 'Main Hostel'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
              Display QR codes, scan badges, and monitor live turnout.
            </p>
          </div>
        </div>

        {/* Compact action tray */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
            title="Print Counter QR Code"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print QR</span>
          </button>

          <button
            onClick={() => { refetchQR(); refetchLive(); refetchOverview(); toast.success('Refreshed'); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQRFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs — 4-col equal grid, icon+short on mobile ─── */}
      <div className="grid grid-cols-4 gap-1 p-1.5 bg-muted/60 border border-border/80 rounded-2xl shadow-xs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id !== 'scanner') stopCamera();
              setActiveTab(tab.id);
            }}
            className={`py-2.5 px-2 sm:px-4 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer min-w-0 ${
              activeTab === tab.id
                ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span className="truncate leading-tight">
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: COUNTER DISPLAY (ROLLING QR FORTRESS) ────────────────────── */}
      {activeTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Large QR Display Card (Left Column) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-card border border-border p-4 sm:p-6 rounded-3xl shadow-md text-center space-y-4 relative overflow-hidden lg:sticky lg:top-6 min-w-0">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/70 pb-4 gap-2">
              <div className="flex items-center gap-2 text-left min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                    Dining Counter QR
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Students scan at `/app/meals/qr`
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono shrink-0 whitespace-nowrap">
                {currentMealName}
              </span>
            </div>

            {/* QR Code SVG */}
            {isQRLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <span className="text-xs text-muted-foreground">Generating secure token...</span>
              </div>
            ) : counterQRPayload ? (
              <div className="py-1 space-y-4 flex flex-col items-center">
                {/* max-w uses min() so on mobile up to 80vw, capped at 260px on larger screens */}
                <div className="p-3.5 sm:p-5 bg-white rounded-3xl shadow-lg border-4 border-emerald-500/30 flex items-center justify-center w-full max-w-[min(80vw,260px)] sm:max-w-[260px] aspect-square mx-auto">
                  <QRCodeSVG
                    value={counterQRPayload}
                    size={240}
                    className="w-full h-full object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer w-full"
                  title="Print poster or counter placard"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Placard / Stand</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-rose-500 text-xs font-semibold">
                Unable to load hostel QR secret. Please verify hostel configuration.
              </div>
            )}
          </div>

          {/* Right Column: Separated Session Performance by Meal */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 min-w-0">
            <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-4 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      Session Performance
                    </h3>
                    <p className="text-[11px] text-muted-foreground hidden sm:block">
                      Real-time turnout by meal session
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {/* Meal Cards List */}
              {isLiveLoading && isOverviewLoading ? (
                <div className="space-y-4">
                  <div className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border" />
                  <div className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border" />
                </div>
              ) : mealPerformanceList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  No meal sessions active or scheduled for today.
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPerformanceList.map((meal) => (
                    <div
                      key={meal.mealName}
                      className={`p-3.5 sm:p-5 rounded-2xl border transition-all ${
                        meal.isCurrent
                          ? 'bg-emerald-500/[0.04] border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-muted/20 border-border/70 hover:border-border'
                      } space-y-3`}
                    >
                      {/* Meal Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              meal.isCurrent
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm sm:text-base text-foreground">
                                {meal.mealName}
                              </h4>
                              {meal.isCurrent && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {meal.turnoutPercent}% Turnout ({meal.totalAttendance} of {meal.preReservedCount} reserved)
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground font-mono">
                            Total: {meal.totalAttendance} Served
                          </span>
                        </div>
                      </div>

                      {/* 4 Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* 1. Reserved */}
                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-0.5">
                          <span className="text-[10px] font-medium text-muted-foreground block">Reserved</span>
                          <div className="text-xl font-bold text-foreground font-mono">{meal.preReservedCount}</div>
                          <span className="text-[10px] text-muted-foreground/80 block">Pre-Booked</span>
                        </div>

                        {/* 2. Reserved Marked */}
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-0.5">
                          <span className="text-[10px] font-medium text-muted-foreground block">Rsv. Marked</span>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                            {meal.preReservedAttendanceCount}
                          </div>
                          <span className="text-[10px] text-muted-foreground/80 block">{meal.claimRate}% claimed</span>
                        </div>

                        {/* 3. Walk-in / Guest */}
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-0.5">
                          <span className="text-[10px] font-medium text-muted-foreground block">Walk-in/Guest</span>
                          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                            {meal.walkInOrGuestCount}
                          </div>
                          <span
                            className="text-[10px] text-muted-foreground/80 block truncate"
                            title={`${meal.walkInCount} walk-in, ${meal.guestCount} guest`}
                          >
                            {meal.walkInCount}W · {meal.guestCount}G
                          </span>
                        </div>

                        {/* 4. Total */}
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-0.5">
                          <span className="text-[10px] font-medium text-muted-foreground block">Total Served</span>
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {meal.totalAttendance}
                          </div>
                          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium block">
                            All portions
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className="text-muted-foreground">Claim Progress</span>
                          <span className="text-foreground font-mono">
                            {meal.preReservedCount > 0
                              ? `${Math.min(100, Math.round((meal.preReservedAttendanceCount / meal.preReservedCount) * 100))}% reserved claimed`
                              : `${meal.totalAttendance} served`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                meal.preReservedCount > 0
                                  ? (meal.preReservedAttendanceCount / meal.preReservedCount) * 100
                                  : 0
                              )}%`,
                            }}
                            title={`Reserved Marked: ${meal.preReservedAttendanceCount}`}
                          />
                          <div
                            className="h-full bg-amber-500/80 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100 -
                                  (meal.preReservedCount > 0
                                    ? (meal.preReservedAttendanceCount / meal.preReservedCount) * 100
                                    : 0),
                                meal.preReservedCount > 0
                                  ? (meal.walkInOrGuestCount / meal.preReservedCount) * 100
                                  : meal.totalAttendance > 0
                                  ? 100
                                  : 0
                              )}%`,
                            }}
                            title={`Walk-in / Guest: ${meal.walkInOrGuestCount}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
        <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Guest Permission Prompt Modal / Dialog */}
          {guestPrompt ? (
            <div className="p-5 sm:p-6 bg-card border-2 border-amber-500/40 rounded-3xl shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Cross-Hostel Guest Detected
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">{guestPrompt.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{guestPrompt.rollNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This student belongs to an external hostel. Approve meal access as guest?
                </p>
              </div>

              {/* 2-col grid — large thumbable buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleGuestDecision(false)}
                  disabled={respondPermissionMutation.isPending}
                  className="py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleGuestDecision(true)}
                  disabled={respondPermissionMutation.isPending}
                  className="py-3.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {respondPermissionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden">
              {isScanning ? (
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Camera Viewfinder */}
                  <div className="relative w-full max-w-sm aspect-square mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-md">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

                    {/* Flash effect */}
                    {isFlashing && (
                      <div className="absolute inset-0 bg-emerald-400/40 backdrop-blur-xs transition-opacity duration-300 pointer-events-none z-10" />
                    )}

                    {/* Corner frames */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg pointer-events-none" />

                    <div className="absolute left-6 right-6 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none top-1/2" />

                    {scanStudentMutation.isPending && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">Logging Attendance...</span>
                      </div>
                    )}
                  </div>

                  {/* Full-width stop button for easy tapping */}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="w-full py-3 text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <Camera className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">Point Camera at Student Badge</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Scan student QR codes or type their Roll Number below for instant logging.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 max-w-sm mx-auto flex items-start gap-2 text-left">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Full-width big tap target */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-4 text-sm font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Launch Staff Camera</span>
                  </button>
                </div>
              )}

              {/* Manual Input Form */}
              <div className="border-t border-border/70 px-4 sm:px-6 py-4">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-wide">Manual Entry</p>
                <form onSubmit={handleManualRollSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Roll No. (e.g. CS-2024-001)"
                    value={manualRollInput}
                    onChange={(e) => setManualRollInput(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-xl py-3 px-3.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={scanStudentMutation.isPending || !manualRollInput.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Mark
                  </button>
                </form>
              </div>

              {/* Last Scanned Feedback */}
              {lastScannedResult && (
                <div className="px-4 sm:px-6 pb-4">
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in ${
                      lastScannedResult.isPending
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : lastScannedResult.isError
                        ? 'bg-destructive/10 border-destructive/20'
                        : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          lastScannedResult.isPending
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : lastScannedResult.isError
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {lastScannedResult.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : lastScannedResult.isError ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground text-xs block truncate">
                          {lastScannedResult.name
                            ? `${lastScannedResult.name} (${lastScannedResult.rollNumber})`
                            : lastScannedResult.rollNumber}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            lastScannedResult.isPending
                              ? 'text-amber-600 dark:text-amber-400'
                              : lastScannedResult.isError
                              ? 'text-destructive'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {lastScannedResult.message}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">{lastScannedResult.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LIVE STREAM FEED ─────────────────────────────────────────── */}
      {activeTab === 'live' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Filters & Search */}
          <div className="flex flex-col gap-2.5 bg-card border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-foreground shrink-0">Session:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedMealFilter('all')}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedMealFilter === 'all'
                      ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {availableMealTypes.map((mt) => (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => setSelectedMealFilter(mt)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or roll number…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-input rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {isLiveLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filteredStudentStream.length === 0 ? (
            <div className="p-10 bg-card border border-border rounded-2xl text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="font-semibold text-xs text-muted-foreground">No active logs for this filter</p>
            </div>
          ) : (
            <>
              {/* Mobile card list — hidden on md+ */}
              <div className="md:hidden space-y-2">
                {filteredStudentStream.map((item, idx) => (
                  <div
                    key={`${item.rollNumber}_${idx}`}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                      item.hasAttended ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card border-border/70'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        item.hasAttended
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{item.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.isGuest ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>{item.isGuest ? 'Guest' : 'Resident'}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">{item.rollNumber}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      {item.hasAttended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" />{item.attendanceCount}×
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs">Pending</span>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {item.selectionCount > 0 ? `${item.selectionCount} reserved` : 'walk-in'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table — hidden below md */}
              <div className="hidden md:block rounded-2xl bg-card border border-border/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                        <th className="px-5 py-3.5">Student</th>
                        <th className="px-5 py-3.5">Roll Number</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5 text-center">Reserved</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredStudentStream.map((item, idx) => (
                        <tr
                          key={`${item.rollNumber}_${idx}`}
                          className={`transition-colors ${
                            item.hasAttended ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-muted/30'
                          }`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                item.hasAttended ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                              }`}>{item.name ? item.name.charAt(0).toUpperCase() : 'S'}</div>
                              <span className="font-semibold text-foreground text-sm">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-muted-foreground">{item.rollNumber}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.isGuest
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}>{item.isGuest ? 'Guest Entry' : 'Resident'}</span>
                          </td>
                          <td className="px-5 py-3 text-center font-mono font-bold text-foreground">{item.selectionCount}</td>
                          <td className="px-5 py-3 text-center">
                            {item.hasAttended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Check className="w-3 h-3" />
                                Eaten ({item.attendanceCount})
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 text-xs">Unattended</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 4: DAILY OVERVIEW MATRIX ────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3.5 sm:p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-foreground shrink-0">Date:</label>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-3 text-sm text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              onClick={exportOverviewExcel}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer sm:shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
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

      {/* ── Print QR Modal ──────────────────────────────────────────────── */}
      <PrintQRCodeModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        qrPayload={counterQRPayload}
        hostelName={currentHostel?.name || user?.hostelName || 'Hostel Dining Hall'}
        hostelId={
          managerQRData?.h ||
          managerQRData?.hostelId ||
          user?.hostelId ||
          (typeof currentHostel?._id === 'string'
            ? currentHostel._id
            : currentHostel?._id?.$oid) ||
          ''
        }
        currentMealName={currentMealName}
      />
    </div>
  );
}
