import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Clock, Utensils, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MealTimingModalProps {
  isOpen: boolean
  onClose: () => void
  mealNames: string[]
  selectionTiming: string[]
  onSave: (names: string[], timings: string[]) => void
}

interface MealSlotItem {
  id: string
  name: string
  cutoffTime: string
}

export default function MealTimingModal({
  isOpen,
  onClose,
  mealNames,
  selectionTiming,
  onSave,
}: MealTimingModalProps) {
  const [slots, setSlots] = useState<MealSlotItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (mealNames && mealNames.length > 0) {
        setSlots(
          mealNames.map((name, index) => ({
            id: `slot-${index}-${Date.now()}`,
            name: name,
            cutoffTime: selectionTiming[index] || '11:00 AM',
          }))
        )
      } else {
        // Defaults
        setSlots([
          { id: '1', name: 'Breakfast', cutoffTime: '07:00 AM' },
          { id: '2', name: 'Lunch', cutoffTime: '11:30 AM' },
          { id: '3', name: 'Dinner', cutoffTime: '06:30 PM' },
        ])
      }
      setError(null)
    }
  }, [isOpen, mealNames, selectionTiming])

  if (!isOpen) return null

  const handleAddSlot = () => {
    if (slots.length >= 6) {
      setError('You can configure up to 6 meals per day.')
      return
    }
    setSlots((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}`,
        name: `Meal ${prev.length + 1}`,
        cutoffTime: '05:00 PM',
      },
    ])
    setError(null)
  }

  const handleRemoveSlot = (index: number) => {
    if (slots.length <= 1) {
      setError('You must have at least 1 meal slot per day.')
      return
    }
    setSlots((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const handleUpdateName = (index: number, name: string) => {
    setSlots((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], name }
      return copy
    })
  }

  const handleUpdateTiming = (index: number, cutoffTime: string) => {
    setSlots((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], cutoffTime }
      return copy
    })
  }

  const handleSave = () => {
    const invalid = slots.some((s) => !s.name.trim() || !s.cutoffTime.trim())
    if (invalid) {
      setError('All meal slots must have a valid title and cutoff time.')
      return
    }
    onSave(
      slots.map((s) => s.name.trim()),
      slots.map((s) => s.cutoffTime.trim())
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Configure Daily Meal Types</h2>
              <p className="text-xs text-muted-foreground">
                Set active meal slots and student pre-order cutoff times
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Slots list */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Slot #{index + 1}
                </span>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Meal Name
                  </label>
                  <Input
                    value={slot.name}
                    onChange={(e) => handleUpdateName(index, e.target.value)}
                    placeholder="e.g. Breakfast, Lunch"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>Cutoff Time</span>
                  </label>
                  <Input
                    value={slot.cutoffTime}
                    onChange={(e) => handleUpdateTiming(index, e.target.value)}
                    placeholder="e.g. 07:00 AM, 11:30 AM"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Slot CTA */}
        {slots.length < 6 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSlot}
            className="w-full gap-1.5 h-9 text-xs rounded-xl border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Another Meal Slot</span>
          </Button>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-9 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
          >
            Apply Meal Types
          </Button>
        </div>
      </div>
    </div>
  )
}
