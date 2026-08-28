import React from 'react'
import { Calendar, ArrowRight, Utensils } from 'lucide-react'
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
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Edit Meal Prices
            </h1>
            <p className="text-xs text-muted-foreground">
              Review consumed meals, adjust per-meal rates, and recalculate billing charges before generating invoices.
            </p>
          </div>
        </div>
      </div>

      {/* ── Date Range & Period Toolbar ───────────────────────────────────── */}
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

        <form onSubmit={onLoadRecords} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
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
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !startDateInput || !endDateInput}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-all"
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

