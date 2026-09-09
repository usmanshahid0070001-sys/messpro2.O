import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import {
  Fingerprint,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  ChevronRight,
  Info,
  FileCheck2,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowLeftRight,
  Edit2,
  Check,
  X,
} from 'lucide-react'

import { useGetMealSchedule } from '@/hooks/queries/useMealQueries'
import { useGetUsers } from '@/hooks/queries/useUserQueries'
import {
  useChunkedBiometricSync,
  type BiometricAttendanceItem,
  BIOMETRIC_CHUNK_SIZE,
} from '@/hooks/mutations/useAttendanceMutations'
import { resetSyncState } from '@/store/slices/BiometricSyncSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BiometricAttendancePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: schedule } = useGetMealSchedule()
  const { data: usersList = [] } = useGetUsers()

  const { startSync, biometricSyncState } = useChunkedBiometricSync()

  // ── Step State ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Automatically keep Step 4 active if sync is running in background or completed
  useEffect(() => {
    if (biometricSyncState.isSyncing || biometricSyncState.isCompleted) {
      setCurrentStep(4)
    }
  }, [biometricSyncState.isSyncing, biometricSyncState.isCompleted])

  // ── Step 1: Raw File & Parsed Data ───────────────────────────────────────
  const [file, setFile] = useState<File | null>(null)
  const [rawRows, setRawRows] = useState<any[][]>([])
  const [hasHeader, setHasHeader] = useState<boolean>(false)
  const [columnNames, setColumnNames] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ── Step 2: Column Mapping Configurations ────────────────────────────────
  const [rollColIdx, setRollColIdx] = useState<number>(0)
  const [dateMode, setDateMode] = useState<'separate' | 'merged' | 'explicit_meal'>('separate')
  const [dateColIdx, setDateColIdx] = useState<number>(1)
  const [timeColIdx, setTimeColIdx] = useState<number>(2)
  const [mealColIdx, setMealColIdx] = useState<number>(-1)
  const [countColIdx, setCountColIdx] = useState<number>(-1) // Optional count column

  // Policies
  const [unrecognizedAction, setUnrecognizedAction] = useState<'guest' | 'skip'>('guest')
  const [deduplicateStrategy, setDeduplicateStrategy] = useState<'deduplicate' | 'accumulate'>('deduplicate')

  // Meal slot time windows (derived from schedule or sensible defaults)
  const configuredMealNames = useMemo(() => {
    return schedule?.mealNames?.length ? schedule.mealNames : ['Breakfast', 'Lunch', 'Dinner']
  }, [schedule])

  // Time boundaries for each meal slot in HH:mm
  const [customServingWindows, setCustomServingWindows] = useState<Record<string, { start: string; end: string }>>(() => {
    const defaults: Record<string, { start: string; end: string }> = {}
    if (configuredMealNames.length === 2) {
      defaults[configuredMealNames[0]] = { start: '11:00', end: '15:30' } // Lunch
      defaults[configuredMealNames[1]] = { start: '18:00', end: '22:30' } // Dinner
    } else {
      defaults['Breakfast'] = { start: '06:00', end: '10:30' }
      defaults['Lunch'] = { start: '11:00', end: '15:30' }
      defaults['Dinner'] = { start: '18:00', end: '22:30' }
    }
    return defaults
  })

  // ── Step 4: Final Sync Result ────────────────────────────────────────────
  const [syncResult, setSyncResult] = useState<{
    totalSubmitted: number
    totalProcessed: number
    recordsCreated: number
    recordsUpdated: number
    guestsMarked: number
    skippedCount: number
  } | null>(null)

  // Enrolled student lookup map (case-insensitive)
  const enrolledStudentRolls = useMemo(() => {
    const map = new Map<string, any>()
    usersList.forEach((u) => {
      if (u.id) {
        map.set(String(u.id).trim().toLowerCase(), u)
        map.set(String(u.id).trim(), u)
      }
      if (u.rollNumber) {
        map.set(String(u.rollNumber).trim().toLowerCase(), u)
        map.set(String(u.rollNumber).trim(), u)
      }
      if (u.email) {
        map.set(String(u.email).trim().toLowerCase(), u)
      }
    })
    return map
  }, [usersList])

  // ── Helper: Parse Date String into ISO YYYY-MM-DD ────────────────────────
  const parseToISODate = (val: any): string | null => {
    if (!val) return null
    if (val instanceof Date) {
      const y = val.getFullYear()
      const m = String(val.getMonth() + 1).padStart(2, '0')
      const d = String(val.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    const str = String(val).trim()
    // Check if it's already YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    // Check DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    // Fallback Date.parse
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear()
      const m = String(parsed.getMonth() + 1).padStart(2, '0')
      const d = String(parsed.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    return null
  }

  // ── Helper: Classify Punch Time into Meal Slot ───────────────────────────
  const resolveMealSlot = (timeStr: any, explicitMeal?: any): string => {
    if (explicitMeal && typeof explicitMeal === 'string') {
      const found = configuredMealNames.find(
        (m) => m.toLowerCase() === explicitMeal.toLowerCase().trim()
      )
      if (found) return found
    }

    if (!timeStr) return configuredMealNames[0] || 'Meal'

    // Extract HH:mm from time string
    let hours = 0
    let minutes = 0

    if (timeStr instanceof Date) {
      hours = timeStr.getHours()
      minutes = timeStr.getMinutes()
    } else {
      const t = String(timeStr).trim()
      const timeMatch = t.match(/(\d{1,2}):(\d{2})/)
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10)
        minutes = parseInt(timeMatch[2], 10)
        if (/pm/i.test(t) && hours < 12) hours += 12
        if (/am/i.test(t) && hours === 12) hours = 0
      }
    }

    const currentTotalMinutes = hours * 60 + minutes

    // Match against serving windows
    for (const [mName, win] of Object.entries(customServingWindows)) {
      const [sH, sM] = win.start.split(':').map((v) => parseInt(v, 10))
      const [eH, eM] = win.end.split(':').map((v) => parseInt(v, 10))
      const startMin = (sH || 0) * 60 + (sM || 0)
      const endMin = (eH || 23) * 60 + (eM || 59)

      if (currentTotalMinutes >= startMin && currentTotalMinutes <= endMin) {
        return mName
      }
    }

    // Default closest slot
    if (currentTotalMinutes < 660) return configuredMealNames[0] || 'Breakfast' // < 11:00 AM
    if (currentTotalMinutes < 1020) return configuredMealNames[1] || 'Lunch' // < 05:00 PM
    return configuredMealNames[configuredMealNames.length - 1] || 'Dinner'
  }

  // ── Step 1: File Parsing via SheetJS ──────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let uploadedFile: File | null = null

    if ('dataTransfer' in e) {
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadedFile = e.dataTransfer.files[0]
      }
    } else if (e.target.files && e.target.files[0]) {
      uploadedFile = e.target.files[0]
    }

    if (!uploadedFile) return

    // Limit maximum file size to 5MB to prevent memory exhaustion / DoS
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please upload a smaller file.')
      return
    }

    setFile(uploadedFile)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const XLSX = await import('xlsx')
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        if (!data || data.length === 0) {
          toast.error('The uploaded file is empty.')
          return
        }

        // Filter out completely blank lines
        const filteredData = data.filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined))

        // Check if first row looks like header
        const firstRow = filteredData[0] || []
        const hasTextHeaders = firstRow.some(
          (c) => typeof c === 'string' && /roll|student|date|time|meal|id/i.test(c)
        )

        setHasHeader(hasTextHeaders)
        const cols = (hasTextHeaders ? firstRow : firstRow).map(
          (c, idx) => (hasTextHeaders && c ? String(c) : `Column ${idx + 1}`)
        )
        setColumnNames(cols)
        setRawRows(filteredData)

        // Auto-detect column mapping based on first few data rows
        const sampleRow = hasTextHeaders ? filteredData[1] || [] : filteredData[0] || []
        if (sampleRow.length >= 3) {
          setRollColIdx(0)
          setDateColIdx(1)
          setTimeColIdx(2)
        }

        toast.success(`Loaded ${filteredData.length} records from ${uploadedFile.name}`)
        setCurrentStep(2)
      } catch (err: any) {
        console.error('File parsing error:', err)
        toast.error('Unable to parse file. Please verify it is a valid CSV or Excel document.')
      }
    }

    reader.readAsBinaryString(uploadedFile)
  }

  // ── Roll Number Find & Replace Override State ───────────────────────────
  const [rollOverrides, setRollOverrides] = useState<Record<string, string>>({})
  const [isReplacePanelOpen, setIsReplacePanelOpen] = useState<boolean>(false)
  const [findRollInput, setFindRollInput] = useState<string>('')
  const [replaceRollInput, setReplaceRollInput] = useState<string>('')

  // ── Step 3: Dry-Run Transformation of Rows ────────────────────────────────
  const previewData = useMemo(() => {
    if (rawRows.length === 0)
      return {
        validItems: [],
        invalidCount: 0,
        mealCounts: {},
        uniqueDates: [],
        uniqueRolls: new Set<string>(),
        residentsCount: 0,
        guestsCount: 0,
        unmatchedRollsList: [] as string[],
      }

    const dataRows = hasHeader ? rawRows.slice(1) : rawRows
    const validItems: Array<{
      rawIndex: number
      rollNumber: string
      originalRollNumber: string
      isOverridden: boolean
      date: string
      mealType: string
      timeStr: string
      isEnrolled: boolean
      studentName: string
      count: number
    }> = []

    let invalidCount = 0
    let residentsCount = 0
    let guestsCount = 0
    const mealCounts: Record<string, number> = {}
    const datesSet = new Set<string>()
    const rollsSet = new Set<string>()
    const unmatchedRolls = new Set<string>()

    dataRows.forEach((row, idx) => {
      const rawRoll = String(row[rollColIdx] || '').trim()
      if (!rawRoll) {
        invalidCount++
        return
      }

      let parsedDate: string | null = null
      let timeStr = ''

      if (dateMode === 'merged') {
        const mergedVal = row[dateColIdx]
        parsedDate = parseToISODate(mergedVal)
        timeStr = String(mergedVal || '')
      } else {
        parsedDate = parseToISODate(row[dateColIdx])
        timeStr = String(row[timeColIdx] || '')
      }

      if (!parsedDate) {
        invalidCount++
        return
      }

      const explicitMeal = mealColIdx >= 0 ? row[mealColIdx] : undefined
      const resolvedMeal = resolveMealSlot(timeStr, explicitMeal)
      const countVal = countColIdx >= 0 ? Number(row[countColIdx]) || 1 : 1

      // ── Apply Find & Replace Overrides ───────────────────────────────────
      const normRawRoll = rawRoll.toLowerCase()
      const effectiveRoll =
        rollOverrides[normRawRoll] || rollOverrides[rawRoll] || rawRoll
      const isOverridden = effectiveRoll !== rawRoll
      const normRoll = effectiveRoll.toLowerCase()

      const enrolledUser =
        enrolledStudentRolls.get(normRoll) ||
        enrolledStudentRolls.get(effectiveRoll)

      const isEnrolled = !!enrolledUser
      const studentName = enrolledUser?.name || 'Unrecognized (Guest)'

      if (isEnrolled) {
        residentsCount++
      } else {
        guestsCount++
        unmatchedRolls.add(rawRoll)
      }

      datesSet.add(parsedDate)
      rollsSet.add(effectiveRoll)
      mealCounts[resolvedMeal] = (mealCounts[resolvedMeal] || 0) + 1

      validItems.push({
        rawIndex: idx + 1,
        rollNumber: enrolledUser?.id || effectiveRoll,
        originalRollNumber: rawRoll,
        isOverridden,
        date: parsedDate,
        mealType: resolvedMeal,
        timeStr,
        isEnrolled,
        studentName,
        count: countVal,
      })
    })

    return {
      validItems,
      invalidCount,
      mealCounts,
      uniqueDates: Array.from(datesSet),
      uniqueRolls: rollsSet,
      residentsCount,
      guestsCount,
      unmatchedRollsList: Array.from(unmatchedRolls),
    }
  }, [
    rawRows,
    hasHeader,
    rollColIdx,
    dateMode,
    dateColIdx,
    timeColIdx,
    mealColIdx,
    countColIdx,
    customServingWindows,
    enrolledStudentRolls,
    rollOverrides,
  ])

  // ── Find & Replace Handler ───────────────────────────────────────────────
  const handleApplyRollReplacement = () => {
    const findStr = findRollInput.trim()
    const replaceStr = replaceRollInput.trim()

    if (!findStr || !replaceStr) {
      toast.error('Please specify both the original and target roll numbers.')
      return
    }

    const normFind = findStr.toLowerCase()
    setRollOverrides((prev) => ({
      ...prev,
      [normFind]: replaceStr,
      [findStr]: replaceStr,
    }))

    // Count how many records are affected
    const affectedCount = previewData.validItems.filter(
      (i) => i.originalRollNumber.toLowerCase() === normFind
    ).length

    toast.success(
      `Replaced "${findStr}" with "${replaceStr}" across ${affectedCount || 1} records!`
    )
    setFindRollInput('')
    setReplaceRollInput('')
  }

  const handleRemoveRollOverride = (findKey: string) => {
    setRollOverrides((prev) => {
      const copy = { ...prev }
      delete copy[findKey]
      delete copy[findKey.toLowerCase()]
      return copy
    })
    toast.info(`Removed roll number replacement for "${findKey}".`)
  }

  const handleClearAllOverrides = () => {
    setRollOverrides({})
    toast.info('All roll number replacements have been reset.')
  }

  // ── Step 3: Pagination & Quick Filtering ─────────────────────────────────
  const [previewPage, setPreviewPage] = useState<number>(1)
  const [previewFilter, setPreviewFilter] = useState<'all' | 'residents' | 'guests'>('all')
  const [previewSearch, setPreviewSearch] = useState<string>('')
  const PREVIEW_PAGE_SIZE = 100

  // Filter validItems based on active filter and search text
  const filteredPreviewItems = useMemo(() => {
    let list = previewData.validItems
    if (previewFilter === 'residents') {
      list = list.filter((i) => i.isEnrolled)
    } else if (previewFilter === 'guests') {
      list = list.filter((i) => !i.isEnrolled)
    }

    if (previewSearch.trim()) {
      const q = previewSearch.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.rollNumber.toLowerCase().includes(q) ||
          i.originalRollNumber.toLowerCase().includes(q) ||
          i.studentName.toLowerCase().includes(q) ||
          i.date.includes(q) ||
          i.mealType.toLowerCase().includes(q)
      )
    }
    return list
  }, [previewData.validItems, previewFilter, previewSearch])

  const totalPreviewPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPreviewItems.length / PREVIEW_PAGE_SIZE))
  }, [filteredPreviewItems.length])

  // Current page records (100 per page)
  const paginatedPreviewItems = useMemo(() => {
    const startIdx = (previewPage - 1) * PREVIEW_PAGE_SIZE
    return filteredPreviewItems.slice(startIdx, startIdx + PREVIEW_PAGE_SIZE)
  }, [filteredPreviewItems, previewPage])

  // Reset page when filter or search changes
  useEffect(() => {
    setPreviewPage(1)
  }, [previewFilter, previewSearch, previewData.validItems.length])

  // ── Step 4: Commit to API via Chunked Upload ───────────────────────────
  const handleCommitBiometricSync = async () => {
    if (previewData.validItems.length === 0) {
      toast.error('No valid attendance rows to sync.')
      return
    }

    const payloadRecords: BiometricAttendanceItem[] = previewData.validItems.map((item) => ({
      rollNumber: item.rollNumber,
      date: item.date,
      mealType: item.mealType,
      count: item.count,
      punchTime: item.timeStr,
    }))

    setCurrentStep(4)

    try {
      await startSync({
        records: payloadRecords,
        unrecognizedStudentAction: unrecognizedAction,
        duplicatePunchStrategy: deduplicateStrategy,
        fileName: file?.name || 'biometric_data.xlsx',
      })
    } catch {
      // Error handled inside hook/store
    }
  }

  return (
    <div className="space-y-5 pb-16 w-full max-w-full min-w-0 animate-in fade-in duration-300">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Biometric Hardware Attendance
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload punch machine logs (CSV/Excel), map timing windows, and sync meal turnout records.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold self-start sm:self-auto">
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 1 ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}>
            1. Upload
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 2 ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}>
            2. Map & Tuning
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 3 ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}>
            3. Preview
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 4 ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}>
            4. Sync
          </span>
        </div>
      </div>

      {/* ── STEP 1: FILE UPLOAD ZONE ────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileUpload}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-slate-500/50 bg-card hover:bg-muted/10 transition-all rounded-3xl p-10 sm:p-14 text-center space-y-4 cursor-pointer group shadow-xs"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .tsv, .txt, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground">
                Drop your Biometric Device Extract here
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Supports CSV, TSV, Text, or Excel files from ZKTeco, Realtime, eSSL, Hikvision, and any punch machine.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files on Computer</span>
            </div>
          </div>

          {/* Quick Format Compatibility Card */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Compatible Hardware Extract Formats:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="font-semibold text-foreground block">Format A: Standard Log</span>
                <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                  2025-CS-650, 2026/06/22, 12:26, 0
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="font-semibold text-foreground block">Format B: Merged DateTime</span>
                <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                  STD-101, 2026-06-22 13:05:00
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="font-semibold text-foreground block">Format C: Labeled Headers</span>
                <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                  RollNo, PunchDate, MealName
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: SMART COLUMN MAPPER & MEAL WINDOW TUNING ─────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* File Snapshot Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-slate-500" />
              <div>
                <span className="font-bold text-foreground text-xs block">{file?.name || 'Uploaded File'}</span>
                <span className="text-[11px] text-muted-foreground">
                  {rawRows.length} total rows detected &bull; {hasHeader ? 'Headers present' : 'Headerless file'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null)
                setRawRows([])
                setCurrentStep(1)
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Raw Sample Table Preview */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">File Sample Preview (First 4 Rows)</span>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded border-input text-slate-600 focus:ring-slate-500"
                />
                <span>First row contains column headers</span>
              </label>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    {columnNames.map((col, idx) => (
                      <th key={idx} className="p-2.5 text-[11px] text-muted-foreground">
                        [{idx}] {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rawRows.slice(hasHeader ? 1 : 0, (hasHeader ? 1 : 0) + 4).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/20">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-foreground truncate max-w-[160px]">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Mapping Grid */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-foreground">Map Columns to Data Fields</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Roll Number Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Student Roll / ID Column *</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {columnNames[rollColIdx] ? `Column ${rollColIdx + 1}: ${columnNames[rollColIdx]}` : 'Select Column'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Roll Number Column
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(rollColIdx)}
                      onValueChange={(val) => setRollColIdx(Number(val))}
                    >
                      {columnNames.map((c, idx) => (
                        <DropdownMenuRadioItem key={idx} value={String(idx)} className="text-xs cursor-pointer">
                          Column {idx + 1}: {c}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Date & Time Layout Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date & Time Structure *</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {dateMode === 'separate'
                          ? 'Separate Date & Time'
                          : dateMode === 'merged'
                          ? 'Merged Single Timestamp'
                          : 'Direct Meal Name Column'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Timestamp Structure
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={dateMode}
                      onValueChange={(val: any) => setDateMode(val)}
                    >
                      <DropdownMenuRadioItem value="separate" className="text-xs cursor-pointer">
                        Separate Date & Time Columns
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="merged" className="text-xs cursor-pointer">
                        Merged Single Timestamp Column
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="explicit_meal" className="text-xs cursor-pointer">
                        Direct Meal Name Column
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Date Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date Column *</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {columnNames[dateColIdx] ? `Column ${dateColIdx + 1}: ${columnNames[dateColIdx]}` : 'Select Column'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Date Column
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(dateColIdx)}
                      onValueChange={(val) => setDateColIdx(Number(val))}
                    >
                      {columnNames.map((c, idx) => (
                        <DropdownMenuRadioItem key={idx} value={String(idx)} className="text-xs cursor-pointer">
                          Column {idx + 1}: {c}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Time Column (if separate) */}
              {dateMode === 'separate' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Time of Marking Column *</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                      >
                        <span className="truncate">
                          {columnNames[timeColIdx] ? `Column ${timeColIdx + 1}: ${columnNames[timeColIdx]}` : 'Select Column'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                        Time Column
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={String(timeColIdx)}
                        onValueChange={(val) => setTimeColIdx(Number(val))}
                      >
                        {columnNames.map((c, idx) => (
                          <DropdownMenuRadioItem key={idx} value={String(idx)} className="text-xs cursor-pointer">
                            Column {idx + 1}: {c}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Explicit Meal Column (if chosen) */}
              {dateMode === 'explicit_meal' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Meal Name Column *</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                      >
                        <span className="truncate">
                          {mealColIdx >= 0 && columnNames[mealColIdx]
                            ? `Column ${mealColIdx + 1}: ${columnNames[mealColIdx]}`
                            : '-- Select Column --'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                        Meal Name Column
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={String(mealColIdx)}
                        onValueChange={(val) => setMealColIdx(Number(val))}
                      >
                        <DropdownMenuRadioItem value="-1" className="text-xs cursor-pointer">
                          -- Select Column --
                        </DropdownMenuRadioItem>
                        {columnNames.map((c, idx) => (
                          <DropdownMenuRadioItem key={idx} value={String(idx)} className="text-xs cursor-pointer">
                            Column {idx + 1}: {c}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Optional Count Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Count Column (Optional)</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground font-medium hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {countColIdx >= 0 && columnNames[countColIdx]
                          ? `Column ${countColIdx + 1}: ${columnNames[countColIdx]}`
                          : 'None (Default 1 plate)'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Portion Count Column
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(countColIdx)}
                      onValueChange={(val) => setCountColIdx(Number(val))}
                    >
                      <DropdownMenuRadioItem value="-1" className="text-xs cursor-pointer">
                        None (Default 1 plate per entry)
                      </DropdownMenuRadioItem>
                      {columnNames.map((c, idx) => (
                        <DropdownMenuRadioItem key={idx} value={String(idx)} className="text-xs cursor-pointer">
                          Column {idx + 1}: {c}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Meal Serving Time Window Classifiers */}
          {dateMode !== 'explicit_meal' && (
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">
                    Meal Slot Serving Time Windows (Hostel Settings)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {configuredMealNames.length} active meal slots configured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {configuredMealNames.map((mName) => {
                  const win = customServingWindows[mName] || { start: '08:00', end: '10:00' }
                  return (
                    <div key={mName} className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{mName}</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          Active Slot
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-muted-foreground block">From</label>
                          <input
                            type="time"
                            value={win.start}
                            onChange={(e) =>
                              setCustomServingWindows((prev) => ({
                                ...prev,
                                [mName]: { ...win, start: e.target.value },
                              }))
                            }
                            className="w-full bg-background border border-input rounded-lg py-1 px-2 text-xs text-foreground font-mono [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block">To</label>
                          <input
                            type="time"
                            value={win.end}
                            onChange={(e) =>
                              setCustomServingWindows((prev) => ({
                                ...prev,
                                [mName]: { ...win, end: e.target.value },
                              }))
                            }
                            className="w-full bg-background border border-input rounded-lg py-1 px-2 text-xs text-foreground font-mono [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Policy Settings: Deduplication & Guest Handling */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Import Sync Policies</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unrecognized Student Action */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/70 space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  When a Roll Number is NOT in Hostel Roster:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="unrecognized"
                      checked={unrecognizedAction === 'guest'}
                      onChange={() => setUnrecognizedAction('guest')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span className="font-semibold">Mark as Guest Entry</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="unrecognized"
                      checked={unrecognizedAction === 'skip'}
                      onChange={() => setUnrecognizedAction('skip')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span>Skip Unrecognized Roll Numbers</span>
                  </label>
                </div>
              </div>

              {/* Deduplicate Punches Strategy */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/70 space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Multiple Punches in Same Meal Window:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="dedupe"
                      checked={deduplicateStrategy === 'deduplicate'}
                      onChange={() => setDeduplicateStrategy('deduplicate')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span className="font-semibold">Deduplicate (1 plate max)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="dedupe"
                      checked={deduplicateStrategy === 'accumulate'}
                      onChange={() => setDeduplicateStrategy('accumulate')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span>Accumulate (+1 per punch)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>Review & Dry-Run Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: DRY-RUN INSPECTION & SUMMARY TERMINAL ────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">Total Punches</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">
                {previewData.validItems.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Residents Matched
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {previewData.residentsCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
                Guests (Unrecognized)
              </span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
                {previewData.guestsCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">Slot Distribution</span>
              <div className="text-xs font-semibold text-foreground mt-1 truncate">
                {Object.entries(previewData.mealCounts)
                  .map(([m, c]) => `${m}: ${c}`)
                  .join(' • ') || 'None'}
              </div>
            </div>
          </div>

          {/* Filter, Search & Replace Toolbar */}
          <div className="flex flex-col gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPreviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    previewFilter === 'all'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Punches ({previewData.validItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFilter('residents')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    previewFilter === 'residents'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Residents ({previewData.residentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFilter('guests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    previewFilter === 'guests'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Guests ({previewData.guestsCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search roll, name, date..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="w-full sm:w-56 bg-background border border-input rounded-xl py-1.5 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                {previewSearch && (
                  <button
                    type="button"
                    onClick={() => setPreviewSearch('')}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsReplacePanelOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    isReplacePanelOpen || Object.keys(rollOverrides).length > 0
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-2xs'
                      : 'border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Replace Roll Numbers</span>
                  {Object.keys(rollOverrides).length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-mono">
                      {Math.ceil(Object.keys(rollOverrides).length / 2)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── FIND & REPLACE EXPANDABLE PANEL ───────────────────────────── */}
            {isReplacePanelOpen && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-foreground">
                      Batch Replace Roll Numbers (e.g. 2025-CE-07 ➔ 2025-CE-7)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReplacePanelOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      1. Original Roll Number (In Biometric File)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2025-CE-07"
                      value={findRollInput}
                      onChange={(e) => setFindRollInput(e.target.value)}
                      className="w-full bg-background border border-input rounded-xl py-1.5 px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {previewData.unmatchedRollsList.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 overflow-x-auto text-[10px] text-muted-foreground">
                        <span className="shrink-0">Unmatched:</span>
                        {previewData.unmatchedRollsList.slice(0, 4).map((unm) => (
                          <button
                            key={unm}
                            type="button"
                            onClick={() => setFindRollInput(unm)}
                            className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono hover:underline cursor-pointer shrink-0"
                          >
                            {unm}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      2. Replace With (MessPro Resident ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2025-CE-7"
                      value={replaceRollInput}
                      onChange={(e) => setReplaceRollInput(e.target.value)}
                      className="w-full bg-background border border-input rounded-xl py-1.5 px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="mt-1 text-[10px] text-muted-foreground truncate">
                      {replaceRollInput && enrolledStudentRolls.get(replaceRollInput.trim().toLowerCase()) ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 inline" /> Matches:{' '}
                          {enrolledStudentRolls.get(replaceRollInput.trim().toLowerCase())?.name}
                        </span>
                      ) : (
                        'Enter the exact student roll number in MessPro'
                      )}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleApplyRollReplacement}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Replace All</span>
                    </button>
                  </div>
                </div>

                {/* Active Overrides Tag Chips */}
                {Object.keys(rollOverrides).length > 0 && (
                  <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Active Replacements:
                    </span>
                    {Object.entries(rollOverrides)
                      .filter(([k], idx, arr) => arr.findIndex(([k2]) => k2.toLowerCase() === k.toLowerCase()) === idx)
                      .map(([orig, target]) => (
                        <span
                          key={orig}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                        >
                          <span>{orig}</span>
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                          <span className="font-bold">{target}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRollOverride(orig)}
                            className="ml-1 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    <button
                      type="button"
                      onClick={handleClearAllOverrides}
                      className="text-[11px] text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
                    >
                      Reset All Replacements
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Parsed Table */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Parsed Records ({filteredPreviewItems.length} matching rows)
                </h3>
              </div>

              {previewData.invalidCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-3 h-3" />
                  {previewData.invalidCount} rows skipped (invalid date/roll)
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/80 backdrop-blur-xs border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Raw Punch Time</th>
                    <th className="px-4 py-3">Classified Meal</th>
                    <th className="px-4 py-3">Roster Status</th>
                    <th className="px-4 py-3 text-center">Portion</th>
                    <th className="px-4 py-3 text-right">Fix / Remap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {paginatedPreviewItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground font-sans">
                        No records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedPreviewItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {(previewPage - 1) * PREVIEW_PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-foreground">
                          {item.rollNumber}
                          {item.isOverridden && (
                            <span className="block text-[10px] font-normal text-blue-600 dark:text-blue-400 font-sans">
                              (from {item.originalRollNumber})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-foreground font-sans">{item.studentName}</td>
                        <td className="px-4 py-2.5 text-foreground">{item.date}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{item.timeStr || 'N/A'}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-sans">
                            {item.mealType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-sans ${
                              item.isEnrolled
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.isEnrolled ? 'Resident (isGuest: false)' : 'Guest (isGuest: true)'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-foreground">
                          {item.count}
                        </td>
                        <td className="px-4 py-2.5 text-right font-sans">
                          {!item.isEnrolled ? (
                            <button
                              type="button"
                              onClick={() => {
                                setFindRollInput(item.originalRollNumber)
                                setIsReplacePanelOpen(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Remap</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                              ✓ Matched
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPreviewPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="text-xs text-muted-foreground">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {(previewPage - 1) * PREVIEW_PAGE_SIZE + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-foreground">
                    {Math.min(previewPage * PREVIEW_PAGE_SIZE, filteredPreviewItems.length)}
                  </span>{' '}
                  of <span className="font-semibold text-foreground">{filteredPreviewItems.length}</span> records (Page {previewPage} of {totalPreviewPages})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    disabled={previewPage === 1}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPreviewPages) }, (_, i) => {
                      let pageNum = i + 1
                      if (totalPreviewPages > 5) {
                        if (previewPage > 3) {
                          pageNum = previewPage - 2 + i
                          if (pageNum > totalPreviewPages) pageNum = totalPreviewPages - (4 - i)
                        }
                      }
                      if (pageNum < 1 || pageNum > totalPreviewPages) return null
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setPreviewPage(pageNum)}
                          className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                            previewPage === pageNum
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                    disabled={previewPage === totalPreviewPages}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>

                  {/* Dropdown / Direct Page Selector */}
                  <select
                    value={previewPage}
                    onChange={(e) => setPreviewPage(Number(e.target.value))}
                    className="bg-background border border-input rounded-lg py-1 px-2 text-xs text-foreground font-semibold focus:outline-none ml-1"
                  >
                    {Array.from({ length: totalPreviewPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Page {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={biometricSyncState.isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mapping</span>
            </button>

            <button
              onClick={handleCommitBiometricSync}
              disabled={biometricSyncState.isSyncing}
              className="inline-flex items-center gap-2 px-7 py-3 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {biometricSyncState.isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing Chunks ({biometricSyncState.progressPct}%)...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Commit & Sync to Database ({previewData.validItems.length} records)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: POST-SYNC CELEBRATION, LIVE PROGRESS & REPORT ────────────── */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200 max-w-3xl mx-auto">
          {/* SYNC IN PROGRESS STATE */}
          {biometricSyncState.isSyncing && (
            <div className="bg-card border border-border/80 p-8 rounded-3xl shadow-xl text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Chunked Database Sync in Progress
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                  Uploading Attendance Records
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Batching attendance logs in chunks of {BIOMETRIC_CHUNK_SIZE} to ensure smooth processing and database reliability.
                </p>
              </div>

              {/* Progress Metric and Bar */}
              <div className="max-w-md mx-auto space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Batch {biometricSyncState.currentChunkIndex} of {biometricSyncState.totalChunks}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">
                    {biometricSyncState.progressPct}%
                  </span>
                </div>

                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${biometricSyncState.progressPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>{biometricSyncState.processedRecords} of {biometricSyncState.totalRecords} records committed</span>
                  <span>{biometricSyncState.fileName}</span>
                </div>
              </div>

              {/* Background safe notice */}
              <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl max-w-md mx-auto flex items-start gap-2.5 text-left text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Background Sync Active:</strong> You can safely browse other sections of MessPro. Uploading will continue in the background and notify you when complete.
                </span>
              </div>
            </div>
          )}

          {/* SYNC ERROR STATE */}
          {biometricSyncState.error && !biometricSyncState.isSyncing && (
            <div className="bg-card border border-rose-500/30 p-8 rounded-3xl shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  Sync Encountered An Error
                </span>
                <h2 className="text-2xl font-bold text-foreground mt-1">
                  Upload Interrupted
                </h2>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 max-w-md mx-auto bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-mono">
                  {biometricSyncState.error}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Preview</span>
                </button>
                <button
                  onClick={handleCommitBiometricSync}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Sync</span>
                </button>
              </div>
            </div>
          )}

          {/* SYNC COMPLETED STATE */}
          {biometricSyncState.isCompleted && !biometricSyncState.isSyncing && (
            <div className="bg-card border border-emerald-500/30 p-8 rounded-3xl shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Sync Completed Successfully
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                  Biometric Attendance Integrated
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  All biometric machine logs have been processed in chunks, meal selections preserved, and attendance counts logged.
                </p>
              </div>

              {/* Sync Stats Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs">
                <div className="p-4 bg-muted/40 rounded-2xl border border-border/80">
                  <span className="text-muted-foreground text-[11px] block">Total Processed</span>
                  <span className="text-xl font-bold text-foreground font-mono mt-1 block">
                    {biometricSyncState.aggregatedStats.totalProcessed}
                  </span>
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block">Updated (Pre-selected)</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    {biometricSyncState.aggregatedStats.recordsUpdated}
                  </span>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <span className="text-blue-600 dark:text-blue-400 text-[11px] block">Created (Walk-ins)</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1 block">
                    {biometricSyncState.aggregatedStats.recordsCreated}
                  </span>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <span className="text-amber-600 dark:text-amber-400 text-[11px] block">Guests / Skipped</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                    {biometricSyncState.aggregatedStats.guestsMarked} / {biometricSyncState.aggregatedStats.skippedCount}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => {
                    dispatch(resetSyncState())
                    setFile(null)
                    setRawRows([])
                    setSyncResult(null)
                    setCurrentStep(1)
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Import Another Extract</span>
                </button>

                <button
                  onClick={() => navigate('/app/attendance/qr')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>View Attendance Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

