import React from 'react'
import {
  Calendar,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Utensils,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MealControlHeaderProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onApplyPreset: (preset: 'today' | 'yesterday') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  activeTab: 'violations' | 'headcount'
  onTabChange: (tab: 'violations' | 'headcount') => void
  violationsCount: number
  isRefetching: boolean
  onRefresh: () => void
  onPrint: () => void
}

export default function MealControlHeader({
  selectedDate,
  onDateChange,
  onApplyPreset,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  violationsCount,
  isRefetching,
  onRefresh,
  onPrint,
}: MealControlHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Meal Control & Audit
              </h1>
              {violationsCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                  {violationsCount} {violationsCount === 1 ? 'Violation' : 'Violations'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Live dining control, meal attendance validation, and food waste audit sheet.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefetching}
            className="h-9 px-3 rounded-xl border-border/80 hover:bg-muted/80 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="h-9 px-3 rounded-xl border-border/80 hover:bg-muted/80 text-xs font-semibold cursor-pointer shadow-xs text-foreground"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* ── Filter Bar: Date Controls, Search & Tab Toggle ── */}
      <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Date Selector & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-9 h-9 w-38 sm:w-42 text-xs rounded-xl bg-background border-border/80 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onApplyPreset('today')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('yesterday')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Yesterday
            </button>
          </div>
        </div>

        {/* Right: Search & View Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search student or roll number..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8.5 h-9 text-xs rounded-xl bg-background border-border/80"
            />
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('violations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'violations'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Violations & Audit
            </button>
            <button
              type="button"
              onClick={() => onTabChange('headcount')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'headcount'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              Live Headcount
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
