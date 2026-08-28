import React from 'react'
import { Calendar, Save, Send, CheckCheck, Loader2, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BillGenHeaderProps {
  startDateInput: string
  endDateInput: string
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
  onApplyPreset: (preset: 'thisMonth' | 'lastMonth' | 'last14Days' | 'last30Days') => void
  isDateRangeSelected: boolean
  isSettingsDirty: boolean
  isSettingsSaving: boolean
  isGenerating: boolean
  onSaveSettings: () => void
  onOpenConfirmModal: () => void
}

function BillGenHeader({
  startDateInput,
  endDateInput,
  onStartDateChange,
  onEndDateChange,
  onApplyPreset,
  isDateRangeSelected,
  isSettingsDirty,
  isSettingsSaving,
  isGenerating,
  onSaveSettings,
  onOpenConfirmModal,
}: BillGenHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bill Generation
            </h1>
            <p className="text-xs text-muted-foreground">
              Audit consumed meal records, define dynamic billing methods, and issue invoices across all hostel residents.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveSettings}
            disabled={!isSettingsDirty || isSettingsSaving}
            className={`h-9 px-3.5 text-xs font-semibold rounded-xl border-border cursor-pointer shadow-xs transition-all ${
              isSettingsDirty
                ? 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10'
                : 'opacity-75'
            }`}
            title="Save custom charges as default hostel billing configuration"
          >
            {isSettingsSaving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin text-purple-600" />
            ) : isSettingsDirty ? (
              <Save className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            )}
            <span>{isSettingsSaving ? 'Saving...' : isSettingsDirty ? 'Save Methods' : 'Methods Saved'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenConfirmModal}
            disabled={!isDateRangeSelected || isGenerating}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Bills'}</span>
          </Button>
        </div>
      </div>

      {/* ── Billing Period Toolbar ───────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Billing Period:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onApplyPreset('thisMonth')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('lastMonth')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 transition-colors cursor-pointer"
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('last14Days')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 transition-colors cursor-pointer hidden sm:inline-block"
            >
              14 Days
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDateInput}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 text-xs bg-background rounded-xl w-34 font-medium border-border/80"
            title="Start Date"
          />
          <span className="text-muted-foreground text-xs font-semibold">to</span>
          <Input
            type="date"
            value={endDateInput}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 text-xs bg-background rounded-xl w-34 font-medium border-border/80"
            title="End Date"
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(BillGenHeader)
