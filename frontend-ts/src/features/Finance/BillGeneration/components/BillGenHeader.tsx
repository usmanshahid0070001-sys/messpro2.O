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
    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 transition-all min-w-0">
      {/* Title & Metadata with Purple Icon */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className='flex gap-2 items-center'>
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0 shadow-xs mt-0.5">
              <Receipt className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Bill Generation
            </h1>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-2xl">
            Audit consumed meal records, define dynamic bill methods and charges, and issue invoices across all hostel members.
          </p>
        </div>
      </div>

      {/* Controls: Date Picker & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        {/* Date Selector Box */}
        <div className="flex flex-col gap-2 bg-muted/30 border border-border p-3 rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Billing Period
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onApplyPreset('thisMonth')}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('lastMonth')}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('last14Days')}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer hidden sm:inline-block"
              >
                14 Days
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Input
              type="date"
              value={startDateInput}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-8.5 text-xs bg-background rounded-xl w-36 font-medium border-border"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs font-semibold">to</span>
            <Input
              type="date"
              value={endDateInput}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-8.5 text-xs bg-background rounded-xl w-36 font-medium border-border"
              title="End Date"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col items-center justify-between sm:justify-center gap-2.5">
          {/* Save Settings */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveSettings}
            disabled={!isSettingsDirty || isSettingsSaving}
            className={`h-9 px-3.5 text-xs font-semibold rounded-xl border-border cursor-pointer shadow-xs transition-all w-full sm:w-auto ${isSettingsDirty
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

          {/* Generate Bills Trigger */}
          <Button
            type="button"
            size="sm"
            onClick={onOpenConfirmModal}
            disabled={!isDateRangeSelected || isGenerating}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-all disabled:opacity-50 w-full sm:w-auto"
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
    </div>
  )
}

export default React.memo(BillGenHeader)
