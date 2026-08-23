import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import {
  Scan,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Utensils,
  MapPin,
  Camera,
  RotateCcw,
  Send,
  X,
  Radio,
  Loader2,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useScanManagerQR,
  useRequestGuestPermission,
  type ScanManagerQRPermissionResponse,
  type ScanManagerQRSuccessResponse,
} from '@/hooks/mutations/useMealMutations'
import QRCodeSVG from './components/QRCodeSVG'

export default function StudentAttendancePage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentHostel } = useSelector((state: RootState) => state.hostel)

  const [activeTab, setActiveTab] = useState<'scan' | 'my-qr'>('scan')

  // ── Camera Scanner State ─────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCodeInput, setManualCodeInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // ── Results & Prompts ────────────────────────────────────────────────
  const [permissionPrompt, setPermissionPrompt] =
    useState<ScanManagerQRPermissionResponse | null>(null)
  const [successRecord, setSuccessRecord] = useState<any | null>(null)
  const [isWaitingForManager, setIsWaitingForManager] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<number | null>(null)

  const scanManagerMutation = useScanManagerQR()
  const requestPermissionMutation = useRequestGuestPermission()

  // ── 1. Geolocation Helper ─────────────────────────────────────────────
  const getCoordinates = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {
          // Fallback if denied or unavailable
          resolve(null)
        },
        { timeout: 8000, enableHighAccuracy: true }
      )
    })
  }

  // ── 2. Process Scanned QR Payload ────────────────────────────────────
  const processScannedData = async (rawScannedText: string) => {
    if (isVerifying || permissionPrompt || successRecord) return

    setIsVerifying(true)
    const toastId = toast.loading('Verifying dining hall QR code...')

    let qrData: { h?: string; s?: string } | null = null

    try {
      // Parse JSON string
      const parsed = JSON.parse(rawScannedText)
      if (parsed.h && parsed.s) {
        qrData = parsed
      }
    } catch {
      // Try URL parameters fallback or comma-separated
      if (rawScannedText.includes('h=') && rawScannedText.includes('s=')) {
        const urlParams = new URLSearchParams(rawScannedText.split('?')[1] || rawScannedText)
        qrData = {
          h: urlParams.get('h') || undefined,
          s: urlParams.get('s') || undefined,
        }
      }
    }

    if (!qrData?.h || !qrData?.s) {
      toast.error('Invalid QR Code. Please scan the official Manager QR code.', {
        id: toastId,
      })
      setIsVerifying(false)
      return
    }

    // Stop camera once valid QR found
    stopCamera()

    // Retrieve Geolocation coordinates
    const coords = await getCoordinates()

    scanManagerMutation.mutate(
      {
        h: qrData.h,
        s: qrData.s,
        lat: coords?.lat,
        lng: coords?.lng,
      },
      {
        onSuccess: (res) => {
          setIsVerifying(false)
          toast.dismiss(toastId)

          if ('status' in res && res.status === 'requires_permission') {
            setPermissionPrompt(res)
          } else if ('success' in res && res.success) {
            toast.success(res.message || 'Meal successfully claimed!')
            setSuccessRecord(res.record)
          }
        },
        onError: (err: any) => {
          setIsVerifying(false)
          toast.dismiss(toastId)
          const msg = err?.response?.data?.message || 'Attendance scan rejected by server.'
          toast.error(msg)
        },
      }
    )
  }

  // ── 3. Camera Stream & Barcode Detection ──────────────────────────────
  const startCamera = async () => {
    setCameraError(null)
    setPermissionPrompt(null)
    setSuccessRecord(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported by your browser or connection is not secure (requires HTTPS or localhost).')
      return
    }

    try {
      let stream: MediaStream
      try {
        // Try environment camera (ideal for mobile phone scanning)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch {
        // Fallback to any available camera (for laptops, webcams, desktop browsers)
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = stream
      setIsScanning(true)
    } catch (err: any) {
      console.error('Camera error:', err)
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please enable camera access in your browser settings.'
          : err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Unable to access camera. You can also paste the QR code string manually below.'
      )
      setIsScanning(false)
    }
  }

  // Attach stream to video element whenever isScanning is true
  useEffect(() => {
    if (isScanning && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current
        .play()
        .catch((e) => console.log('Video play interrupted or auto-play prevented:', e))

      // Start BarcodeDetector loop if supported by browser
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        })

        scanIntervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current)
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                processScannedData(barcodes[0].rawValue)
              }
            } catch {
              // Ignore frame detection errors
            }
          }
        }, 350)
      }
    }
  }, [isScanning])

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // ── 4. Permission Handlers ────────────────────────────────────────────
  const handleRequestPermission = () => {
    if (!permissionPrompt) return

    setIsWaitingForManager(true)
    requestPermissionMutation.mutate(
      {
        managerHostelId: permissionPrompt.managerHostelId,
        reason: permissionPrompt.reason,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setIsWaitingForManager(false)
            setPermissionPrompt(null)
          }, 3000)
        },
        onError: () => {
          setIsWaitingForManager(false)
        },
      }
    )
  }

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCodeInput.trim()) return
    processScannedData(manualCodeInput.trim())
    setManualCodeInput('')
  }

  // Student QR Code Payload for Manager Scanner
  const studentQRPayload = JSON.stringify({
    studentRollNumber: user?.id,
    rollNumber: user?.id,
    name: user?.name,
    hostelId: user?.hostelId,
  })

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Mark Meal Attendance
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Live QR Fortress
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Scan the manager&apos;s dining hall QR code or display your personal student badge.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Scan Manager QR vs My QR Code */}
      <div className="flex items-center p-1.5 bg-muted/60 border border-border/80 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('scan')
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'scan'
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
            stopCamera()
            setActiveTab('my-qr')
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'my-qr'
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
                    {successRecord.mealType} &bull; {successRecord.mealInfo?.name || 'Standard Menu'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Portions Taken:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {successRecord.attendance?.count || 1} portion(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold text-foreground">Geofenced QR Verification</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessRecord(null)
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
                    onClick={() => setPermissionPrompt(null)}
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
                        videoRef.current?.play().catch(() => { })
                      }}
                    />

                    {/* Framing corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-lg pointer-events-none" />

                    {/* Scanning Laser Line */}
                    <div className="absolute left-6 right-6 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none" />

                    {isVerifying && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">
                          Verifying Geofence & Session...
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
                      Scan the manager&apos;s dining hall QR code with your camera. GPS geofencing will automatically verify your location.
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
  )
}
