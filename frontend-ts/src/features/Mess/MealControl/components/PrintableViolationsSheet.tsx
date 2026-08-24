import React from 'react'
import { Printer, X, Utensils, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MealViolationRecord } from '@/hooks/queries/useMealQueries'

interface PrintableViolationsSheetProps {
  isOpen: boolean
  onClose: () => void
  records: MealViolationRecord[]
  selectedDate: string
  hostelName?: string
  totalExtraMeals: number
  totalMissedMeals: number
}

export default function PrintableViolationsSheet({
  isOpen,
  onClose,
  records,
  selectedDate,
  hostelName = 'Hostel Dining Hall',
  totalExtraMeals,
  totalMissedMeals,
}: PrintableViolationsSheetProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card text-card-foreground border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Printable Daily Meal Control Sheet
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Formatted for kitchen managers, audit records, and daily shift sign-offs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Now
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:m-0" id="printable-violations-content">
          {/* Document Header */}
          <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Official Mess Dining Control Sheet
              </span>
              <h2 className="text-xl font-bold text-foreground mt-0.5">
                {hostelName}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground block">Audit Date</span>
              <span className="text-sm font-bold font-mono text-foreground">{selectedDate}</span>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[11px] text-muted-foreground block">Total Violations</span>
              <span className="text-lg font-bold font-mono text-foreground">{records.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              <span className="text-[11px] block">Unselected Extra Meals</span>
              <span className="text-lg font-bold font-mono">+{totalExtraMeals}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
              <span className="text-[11px] block">Missed / Wasted Meals</span>
              <span className="text-lg font-bold font-mono">{totalMissedMeals}</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border/70 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border/70 uppercase text-[10px] text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Meal Slot</th>
                  <th className="py-2.5 px-3 text-center">Selected</th>
                  <th className="py-2.5 px-3 text-center">Attended</th>
                  <th className="py-2.5 px-3">Violation Category</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground font-sans">
                      Zero violations recorded for {selectedDate}. All meals verified.
                    </td>
                  </tr>
                ) : (
                  records.map((rec, i) => (
                    <tr key={rec._id || i} className="hover:bg-muted/20">
                      <td className="py-2 px-3 text-muted-foreground font-sans">{i + 1}</td>
                      <td className="py-2 px-3 font-bold text-foreground">{rec.rollNumber}</td>
                      <td className="py-2 px-3 font-sans text-foreground">{rec.studentName || 'Student'}</td>
                      <td className="py-2 px-3 font-sans">{rec.mealType}</td>
                      <td className="py-2 px-3 text-center">{rec.selectionCount}</td>
                      <td className="py-2 px-3 text-center">{rec.attendanceCount}</td>
                      <td className="py-2 px-3 font-sans">
                        {rec.extraMeals > 0 ? 'Extra / Unselected' : 'Missed / Wasted'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        {rec.extraMeals > 0 ? `+${rec.extraMeals}` : `-${rec.missedMeals}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signature Block for Print */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-muted-foreground">
            <div className="border-t border-border/80 pt-2">
              <span>Mess Supervisor / Head Cook Signature</span>
            </div>
            <div className="border-t border-border/80 pt-2 text-right">
              <span>Hostel Warden / Manager Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
