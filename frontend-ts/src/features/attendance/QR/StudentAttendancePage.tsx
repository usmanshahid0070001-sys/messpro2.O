import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  Scan,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Camera,
  Send,
  Loader2,
  Info,
  RotateCcw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useScanManagerQR,
  useRequestGuestPermission,
  type ScanManagerQRPermissionResponse,
} from '@/hooks/mutations/useMealMutations';
import QRCodeSVG from './components/QRCodeSVG';
import { QRReaderEngine } from './utils/qrReaderEngine';
import { playScanSuccessSound, playScanNoticeSound, triggerHaptic } from './utils/qrFeedback';

// ── Helper: Safe Manager QR Payload Parser ──────────────────────────────
export function parseManagerQRPayload(rawText: string): { h: string; s?: string } | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();

  // 1. Plain 24-character hexadecimal MongoDB ObjectId
  if (/^[a-f0-9]{24}$/i.test(trimmed)) {
    return { h: trimmed };
  }

  // 2. Direct JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const h = parsed.hostelId || parsed.h || parsed.hostel || parsed._id;
      const s = parsed.s || parsed.secret || parsed.qrSecret;
      if (h) {
        return { h: String(h).trim(), s: s ? String(s).trim() : undefined };
      }
    }
  } catch {
    // Continue to query / regex parsing
  }

  // 3. Query param or URL format (?hostelId=... or ?h=...)
  try {
    if (trimmed.includes('h=') || trimmed.includes('hostelId=')) {
      const queryString = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed;
      const params = new URLSearchParams(queryString);
      const h = params.get('hostelId') || params.get('h');
      const s = params.get('s') || params.get('secret');
      if (h) {
        return { h: h.trim(), s: s ? s.trim() : undefined };
      }
    }
  } catch {
    // Continue
  }

  // 4. Regex extraction for malformed JSON or key-value pairs
  const hMatch = trimmed.match(/"?(?:hostelId|h)"?\s*[:=]\s*"?([a-f0-9]{24}|[a-zA-Z0-9_-]+)"?/i);
  const sMatch = trimmed.match(/"?(?:secret|s)"?\s*[:=]\s*"?([a-zA-Z0-9_-]+)"?/i);
  if (hMatch && hMatch[1]) {
    return { h: hMatch[1].trim(), s: sMatch && sMatch[1] ? sMatch[1].trim() : undefined };
  }

  return null;
}

export default function StudentAttendancePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentHostel } = useSelector((state: RootState) => state.hostel);

  const [activeTab, setActiveTab] = useState<'scan' | 'my-qr'>('scan');

  // ── Camera Scanner State ─────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // ── Results, Prompts & Errors ────────────────────────────────────────
  const [permissionPrompt, setPermissionPrompt] =
    useState<ScanManagerQRPermissionResponse | null>(null);
  const [successRecord, setSuccessRecord] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWaitingForManager, setIsWaitingForManager] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrEngineRef = useRef<QRReaderEngine | null>(null);

  const scanManagerMutation = useScanManagerQR();
  const requestPermissionMutation = useRequestGuestPermission();

  // ── 1. Process Scanned QR Payload (Instant Execution) ────────────────
  const processScannedData = (rawScannedText: string) => {
    if (isVerifying || permissionPrompt || successRecord) return;

    const qrData = parseManagerQRPayload(rawScannedText);

    // If frame doesn't contain a valid manager payload, keep scanning silently
    if (!qrData) {
      return;
    }

    // Immediate Audio & Haptic Feedback (< 10ms)
    playScanSuccessSound();
    triggerHaptic('success');
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    // Stop camera stream once successfully captured
    stopCamera();
    setIsVerifying(true);
    setErrorMessage(null);

    scanManagerMutation.mutate(
      {
        h: qrData.h,
        s: qrData.s,
      },
      {
        onSuccess: (res) => {
          setIsVerifying(false);

          if (res.status === 'requires_permission') {
            playScanNoticeSound();
            triggerHaptic('warning');
            setPermissionPrompt(res);
          } else {
            playScanSuccessSound();
            triggerHaptic('success');
            setSuccessRecord((res as any).record || (res as any).data);
          }
        },
        onError: (err: any) => {
          setIsVerifying(false);
          triggerHaptic('error');
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Meal verification was rejected by the server.';
          setErrorMessage(msg);
          toast.error(msg);
        },
      }
    );
  };

  // ── 2. Camera Stream & QR Engine Controller ──────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    setPermissionPrompt(null);
    setSuccessRecord(null);
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera API is not supported by your browser or connection is not secure (requires HTTPS or localhost).'
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try environment camera (ideal for mobile phone scanning)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        // Fallback to any available camera (for laptops, webcams, desktop browsers)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please enable camera access in your browser settings.'
          : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Unable to access camera.'
      );
      setIsScanning(false);
    }
  };

  // Attach stream to video element and launch fast QR reader engine
  useEffect(() => {
    if (isScanning && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .then(() => {
          if (videoRef.current) {
            qrEngineRef.current = new QRReaderEngine(videoRef.current, (detectedText) => {
              processScannedData(detectedText);
            });
            qrEngineRef.current.start();
          }
        })
        .catch((e) => console.log('Video play interrupted:', e));
    }
  }, [isScanning]);

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

  // ── 3. Permission Handlers ────────────────────────────────────────────
  const handleRequestPermission = () => {
    if (!permissionPrompt) return;

    setIsWaitingForManager(true);
    requestPermissionMutation.mutate(
      {
        managerHostelId: permissionPrompt.managerHostelId,
        reason: permissionPrompt.reason,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setIsWaitingForManager(false);
            setPermissionPrompt(null);
          }, 3000);
        },
        onError: () => {
          setIsWaitingForManager(false);
        },
      }
    );
  };

  // Student QR Code Payload for Manager Scanner
  const studentQRPayload = useMemo(() => {
    const sId = user?._id || user?.id || '';
    const rNum = user?.id || '';
    const hId = user?.hostelId || currentHostel?._id || '';
    return JSON.stringify({
      studentId: sId,
      rollNumber: rNum,
      id: rNum,
      name: user?.name || 'Resident',
      hostelId: hId,
    });
  }, [user, currentHostel]);

  return (
    <div className="space-y-5 pb-16 w-full max-w-full min-w-0 animate-in fade-in duration-300">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Mark Meal Attendance
            </h1>
            <p className="text-xs text-muted-foreground">
              Scan the manager&apos;s dining hall counter QR code or present your student QR badge.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Scan Manager QR vs My QR Code */}
      <div className="flex items-center p-1.5 bg-muted/60 border border-border/80 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('scan');
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Scan Manager QR</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('my-qr');
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'my-qr'
              ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>My Student QR Code</span>
        </button>
      </div>

      {/* ── TAB 1: SCAN MANAGER QR ───────────────────────────────────── */}
      {activeTab === 'scan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Success State */}
          {successRecord ? (
            <div className="bg-card border border-emerald-500/30 p-6 sm:p-8 rounded-2xl shadow-lg text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Verification Successful
                </span>
                <h2 className="text-2xl font-bold text-foreground mt-1">
                  Attendance Marked!
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Your meal portion has been claimed and registered in the hostel ledger.
                </p>
              </div>

              {/* Meal Details Box */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Meal Session:</span>
                  <span className="font-bold text-foreground">
                    {successRecord.mealType} &bull; {successRecord.mealInfo?.name || successRecord.meal || 'Standard Menu'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Portions Taken:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {successRecord.attendance?.count || successRecord.count || 1} portion(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Claimed & Logged</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessRecord(null);
                    startCamera();
                  }}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessRecord(null);
                  }}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : permissionPrompt ? (
            /* Permission Required Dialog */
            <div className="bg-card border border-amber-500/30 p-6 sm:p-8 rounded-2xl shadow-lg text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Manager Approval Required
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  {permissionPrompt.reason === 'guest'
                    ? 'Cross-Hostel Dining Request'
                    : permissionPrompt.reason === 'extra_meal'
                    ? 'Extra Meal Limit Reached'
                    : 'Unreserved Walk-In Meal'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  {permissionPrompt.message}
                </p>
              </div>

              {isWaitingForManager ? (
                <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-center gap-3 text-xs font-semibold text-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Request transmitted. Awaiting manager approval on their terminal...</span>
                </div>
              ) : (
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPermissionPrompt(null);
                      startCamera();
                    }}
                    className="px-5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    disabled={requestPermissionMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {requestPermissionMutation.isPending ? 'Sending...' : 'Send Request to Manager'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : errorMessage ? (
            /* Error / Outside Serving Hours Dialog */
            <div className="bg-card border border-destructive/30 p-6 sm:p-8 rounded-2xl shadow-lg text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto shadow-xs">
                {errorMessage.includes('suspended') ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : errorMessage.includes('serving') || errorMessage.includes('time') ? (
                  <Clock className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                  Meal Access Notice
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  {errorMessage.includes('suspended')
                    ? 'Account Suspended'
                    : errorMessage.includes('serving') || errorMessage.includes('time')
                    ? 'Dining Hall Currently Closed'
                    : 'Attendance Not Marked'}
                </h2>
                <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    startCamera();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Scan Again</span>
                </button>
              </div>
            </div>
          ) : (
            /* Camera Viewfinder & Scan Controller */
            <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs text-center space-y-6">
              {isScanning ? (
                <div className="space-y-4">
                  {/* Live Video Viewfinder */}
                  <div className="relative w-full max-w-sm aspect-square mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-md flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        videoRef.current?.play().catch(() => {});
                      }}
                    />

                    {/* Flash effect upon scan */}
                    {isFlashing && (
                      <div className="absolute inset-0 bg-emerald-400/40 backdrop-blur-xs transition-opacity duration-300 pointer-events-none z-10" />
                    )}

                    {/* Framing corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-lg pointer-events-none" />

                    {/* Scanning Laser Line */}
                    <div className="absolute left-6 right-6 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none" />

                    {isVerifying && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">
                          Verifying Attendance...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-6">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <Camera className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Dining Hall QR Scanner
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Scan the manager&apos;s dining hall counter QR code with your camera for instant meal claiming.
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
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY STUDENT QR CODE ───────────────────────────────── */}
      {activeTab === 'my-qr' && (
        <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xs text-center space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Resident Identification
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              Personal Meal Badge
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show this QR code to the mess manager to have your attendance scanned directly.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-6 bg-white rounded-2xl inline-block shadow-md border border-border/80">
            <QRCodeSVG
              value={studentQRPayload}
              size={220}
              className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
            />
          </div>

          {/* Student Profile Snapshot */}
          <div className="max-w-sm mx-auto p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs text-left">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-bold text-foreground">{user?.name || 'Resident'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Roll Number / ID:</span>
              <span className="font-bold font-mono text-foreground">
                {user?.id || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hostel:</span>
              <span className="font-semibold text-foreground">
                {currentHostel?.name || 'Enrolled Hostel'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted/20 border border-border/60 rounded-xl text-[11px] text-muted-foreground max-w-sm mx-auto flex items-center gap-2 text-left">
            <Info className="w-4 h-4 text-purple-500 shrink-0" />
            <span>
              Ensure your screen brightness is turned up when the manager scans your code.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
