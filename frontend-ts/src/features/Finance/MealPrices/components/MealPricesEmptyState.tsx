import { Calendar, Utensils, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MealPricesEmptyStateProps {
  isRangeSelected: boolean
  onApplyPreset: (preset: 'thisMonth' | 'lastMonth' | 'last14Days' | 'last30Days') => void
}

export default function MealPricesEmptyState({
  isRangeSelected,
  onApplyPreset,
}: MealPricesEmptyStateProps) {
  if (!isRangeSelected) {
    return (
      <div className="p-10 sm:p-14 text-center border border-dashed border-border/80 rounded-2xl bg-card flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Calendar className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-bold text-foreground">
            Select a Date Range to Load Consumed Meals
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Choose the start and end date of the billing period above (or pick <strong className="text-foreground">"This Month"</strong>) and click <strong className="text-foreground">"Load"</strong> to review and edit meal prices.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset('thisMonth')}
            className="h-8.5 text-xs rounded-xl cursor-pointer font-semibold border-border/80 hover:bg-muted"
          >
            Load Current Month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset('lastMonth')}
            className="h-8.5 text-xs rounded-xl cursor-pointer font-semibold border-border/80 hover:bg-muted"
          >
            Load Last Month
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card flex flex-col items-center justify-center gap-3">
      <div className="p-3.5 rounded-2xl bg-muted text-muted-foreground border border-border/70">
        <Utensils className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-foreground">No Meal Records Found</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          No meal attendance records were logged for the selected dates matching your filter criteria.
        </p>
      </div>
    </div>
  )
}
