import React, { useState, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/store'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import {
  Fingerprint,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  ShieldAlert,
  Users,
  Utensils,
  ChevronRight,
  Info,
  Check,
  X,
  FileCheck2,
  Calendar,
  Layers,
  ArrowLeft,
  Loader2,
  Download,
} from 'lucide-react'

import { useGetMealSchedule } from '@/hooks/queries/useMealQueries'
import { useGetUsers } from '@/hooks/queries/useUserQueries'
import {
  useProcessBiometricAttendance,
  type BiometricAttendanceItem,
} from '@/hooks/mutations/useAttendanceMutations'

export default function BiometricAttendancePage() {
  const navigate = useNavigate()
  const { currentHostel } = useSelector((state: RootState) => state.hostel)
  const { data: schedule } = useGetMealSchedule()
  const { data: usersList = [] } = useGetUsers()

  const processBiometricMutation = useProcessBiometricAttendance()

  // ── Step State ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

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

  // Date Parsing Settings
  const [dateFormat, setDateFormat] = useState<'AUTO' | 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY'>('AUTO')

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

  // Enrolled student lookup set
  const enrolledStudentRolls = useMemo(() => {
    const set = new Set<string>()
    usersList.forEach((u) => {
      if (u.id) set.add(u.id.trim())
    })
    return set
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

    setFile(uploadedFile)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
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

  // ── Step 3: Dry-Run Transformation of Rows ────────────────────────────────
  const previewData = useMemo(() => {
    if (rawRows.length === 0) return { validItems: [], invalidCount: 0, mealCounts: {}, uniqueDates: [], uniqueRolls: new Set() }

    const dataRows = hasHeader ? rawRows.slice(1) : rawRows
    const validItems: Array<{
      rawIndex: number
      rollNumber: string
      date: string
      mealType: string
      timeStr: string
      isEnrolled: boolean
      count: number
    }> = []

    let invalidCount = 0
    const mealCounts: Record<string, number> = {}
    const datesSet = new Set<string>()
    const rollsSet = new Set<string>()

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
      const isEnrolled = enrolledStudentRolls.has(rawRoll)

      datesSet.add(parsedDate)
      rollsSet.add(rawRoll)
      mealCounts[resolvedMeal] = (mealCounts[resolvedMeal] || 0) + 1

      validItems.push({
        rawIndex: idx + 1,
        rollNumber: rawRoll,
        date: parsedDate,
        mealType: resolvedMeal,
        timeStr,
        isEnrolled,
        count: countVal,
      })
    })

    return {
      validItems,
      invalidCount,
      mealCounts,
      uniqueDates: Array.from(datesSet),
      uniqueRolls: rollsSet,
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
  ])

  // ── Step 4: Commit to API ────────────────────────────────────────────────
  const handleCommitBiometricSync = () => {
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

    processBiometricMutation.mutate(
      {
        records: payloadRecords,
        unrecognizedStudentAction: unrecognizedAction,
        duplicatePunchStrategy: deduplicateStrategy,
      },
      {
        onSuccess: (res) => {
          setSyncResult(res.stats)
          setCurrentStep(4)
        },
      }
    )
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* ── Top Header Banner ──────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-xs">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Biometric Hardware Attendance
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                <Sparkles className="w-3 h-3 text-slate-500" />
                Universal Import Engine
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Upload biometric device logs (CSV, Excel), map time windows to hostel meals, and sync attendance with zero data loss.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold">
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
                <select
                  value={rollColIdx}
                  onChange={(e) => setRollColIdx(Number(e.target.value))}
                  className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                >
                  {columnNames.map((c, idx) => (
                    <option key={idx} value={idx}>
                      Column {idx + 1}: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Layout Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date & Time Structure *</label>
                <select
                  value={dateMode}
                  onChange={(e) => setDateMode(e.target.value as any)}
                  className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                >
                  <option value="separate">Separate Date & Time Columns</option>
                  <option value="merged">Merged Single Timestamp Column</option>
                  <option value="explicit_meal">Direct Meal Name Column</option>
                </select>
              </div>

              {/* Date Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date Column *</label>
                <select
                  value={dateColIdx}
                  onChange={(e) => setDateColIdx(Number(e.target.value))}
                  className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                >
                  {columnNames.map((c, idx) => (
                    <option key={idx} value={idx}>
                      Column {idx + 1}: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Column (if separate) */}
              {dateMode === 'separate' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Time of Marking Column *</label>
                  <select
                    value={timeColIdx}
                    onChange={(e) => setTimeColIdx(Number(e.target.value))}
                    className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                  >
                    {columnNames.map((c, idx) => (
                      <option key={idx} value={idx}>
                        Column {idx + 1}: {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Explicit Meal Column (if chosen) */}
              {dateMode === 'explicit_meal' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Meal Name Column *</label>
                  <select
                    value={mealColIdx}
                    onChange={(e) => setMealColIdx(Number(e.target.value))}
                    className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                  >
                    <option value={-1}>-- Select Column --</option>
                    {columnNames.map((c, idx) => (
                      <option key={idx} value={idx}>
                        Column {idx + 1}: {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Count Column */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Count Column (Optional)</label>
                <select
                  value={countColIdx}
                  onChange={(e) => setCountColIdx(Number(e.target.value))}
                  className="w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-slate-500/20 font-medium cursor-pointer"
                >
                  <option value={-1}>None (Default 1 plate per entry)</option>
                  {columnNames.map((c, idx) => (
                    <option key={idx} value={idx}>
                      Column {idx + 1}: {c}
                    </option>
                  ))}
                </select>
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
              <span className="text-[11px] font-semibold text-muted-foreground block">Valid Punches</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">
                {previewData.validItems.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">Unique Residents</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">
                {previewData.uniqueRolls.size}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">Dates Range</span>
              <div className="text-sm font-bold text-foreground font-mono mt-2 truncate">
                {previewData.uniqueDates.join(', ') || 'None'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block">Slot Distribution</span>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {Object.entries(previewData.mealCounts)
                  .map(([m, c]) => `${m}: ${c}`)
                  .join(' • ') || 'None'}
              </div>
            </div>
          </div>

          {/* Preview Parsed Table */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Parsed Attendance Records Preview ({previewData.validItems.length} rows)
                </h3>
              </div>

              {previewData.invalidCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-3 h-3" />
                  {previewData.invalidCount} rows skipped (missing roll/date)
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60 max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Raw Punch Time</th>
                    <th className="px-4 py-3">Classified Meal</th>
                    <th className="px-4 py-3">Roster Status</th>
                    <th className="px-4 py-3 text-center">Portion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {previewData.validItems.slice(0, 100).map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-muted-foreground">{item.rawIndex}</td>
                      <td className="px-4 py-2.5 font-bold text-foreground">{item.rollNumber}</td>
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
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {item.isEnrolled ? 'Resident' : 'Unrecognized (Guest)'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-foreground">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.validItems.length > 100 && (
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Showing first 100 of {previewData.validItems.length} records. All rows will be committed.
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mapping</span>
            </button>

            <button
              onClick={handleCommitBiometricSync}
              disabled={processBiometricMutation.isPending}
              className="inline-flex items-center gap-2 px-7 py-3 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {processBiometricMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Biometric Batch...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Commit & Sync to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: POST-SYNC CELEBRATION & REPORT ───────────────────────────── */}
      {currentStep === 4 && syncResult && (
        <div className="bg-card border border-emerald-500/30 p-8 rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
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
              All biometric machine logs have been processed, meal selections preserved, and attendance counts logged.
            </p>
          </div>

          {/* Sync Stats Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/80">
              <span className="text-muted-foreground text-[11px] block">Total Processed</span>
              <span className="text-xl font-bold text-foreground font-mono mt-1 block">
                {syncResult.totalProcessed}
              </span>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block">Updated (Pre-selected)</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                {syncResult.recordsUpdated}
              </span>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <span className="text-blue-600 dark:text-blue-400 text-[11px] block">Created (Walk-ins)</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1 block">
                {syncResult.recordsCreated}
              </span>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <span className="text-amber-600 dark:text-amber-400 text-[11px] block">Guests / Skipped</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                {syncResult.guestsMarked} / {syncResult.skippedCount}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => {
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
  )
}
