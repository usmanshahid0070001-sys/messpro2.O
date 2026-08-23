import React from 'react'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MealPricesHeaderProps {
  startDateInput: string
  endDateInput: string
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
  onApplyPreset: (preset: 'thisMonth' | 'lastMonth' | 'last14Days' | 'last30Days') => void
  onLoadRecords: (e?: React.FormEvent) => void
  isLoading: boolean
  isFetching: boolean
}

export default function MealPricesHeader({
  startDateInput,
  endDateInput,
  onStartDateChange,
  onEndDateChange,
  onApplyPreset,
  onLoadRecords,
  isLoading,
  isFetching,
}: MealPricesHeaderProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs transition-all">
      {/* Title & Metadata Badges */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Finance & Dues
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Historical Rate Adjuster
          </span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Edit Meal Prices
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
            Review consumed meals, adjust per-meal rates or aggregate totals, and recalculate billing charges before generating invoices.
          </p>
        </div>
      </div>

      {/* Date Range Selector Box */}
      <div className="flex flex-col gap-2.5 bg-muted/40 border border-border/70 p-3.5 sm:p-4 rounded-2xl shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Billing Period
          </span>

          {/* Quick Preset Buttons */}
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

        <form onSubmit={onLoadRecords} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <Input
            type="date"
            value={startDateInput}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-8.5 text-xs bg-background rounded-xl w-32 font-medium border-border/80"
            title="Start Date"
          />
          <span className="text-muted-foreground text-xs font-semibold">to</span>
          <Input
            type="date"
            value={endDateInput}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-8.5 text-xs bg-background rounded-xl w-32 font-medium border-border/80"
            title="End Date"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !startDateInput || !endDateInput}
            className="h-8.5 px-3.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-all"
          >
            {isLoading || isFetching ? (
              <span className="inline-block animate-spin mr-1">⏳</span>
            ) : (
              <ArrowRight className="h-3.5 w-3.5 mr-1" />
            )}
            <span>Load</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
