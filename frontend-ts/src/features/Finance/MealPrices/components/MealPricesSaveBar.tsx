import { Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MealPricesSaveBarProps {
  isDirty: boolean
  changedCount: number
  isPending: boolean
  onSave: () => void
  onDiscard: () => void
}

export default function MealPricesSaveBar({
  isDirty,
  changedCount,
  isPending,
  onSave,
  onDiscard,
}: MealPricesSaveBarProps) {
  if (!isDirty) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg p-3 sm:p-3.5 rounded-2xl bg-card/95 backdrop-blur-md border border-purple-500/40 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
        <span className="font-semibold text-foreground">
          {changedCount} unsaved price adjustment{changedCount > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscard}
          disabled={isPending}
          className="h-8 text-xs rounded-xl cursor-pointer border-border/80 hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          <span>Discard</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isPending}
          className="h-8 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm transition-all"
        >
          <Save className="h-3 w-3 mr-1" />
          <span>{isPending ? 'Saving...' : 'Save Prices'}</span>
        </Button>
      </div>
    </div>
  )
}
