import React from 'react'
import { CheckCircle2, Calendar } from 'lucide-react'

interface CleaningLogProps {
  cleaningDates: string[]
  maxHeightClass?: string
}

export default function CleaningLog({ cleaningDates, maxHeightClass = 'max-h-56' }: CleaningLogProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!cleaningDates || cleaningDates.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/80 italic p-3 text-center bg-muted/20 rounded-lg">
        No cleaning logs recorded yet.
      </p>
    )
  }

  return (
    <div className={`space-y-1.5 overflow-y-auto pr-1 ${maxHeightClass}`}>
      {[...cleaningDates]
        .reverse()
        .map((dateStr, idx) => {
          const d = new Date(dateStr)
          const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()

          const formatted = d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-2 rounded-lg bg-background border border-border"
            >
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {formatted}
              </span>
              {isToday && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Today
                </span>
              )}
            </div>
          )
        })}
    </div>
  )
}
