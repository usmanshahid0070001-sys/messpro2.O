import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Clock, Utensils, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TimeWindow } from '@/hooks/queries/useMealQueries'

interface MealTimingModalProps {
  isOpen: boolean
  onClose: () => void
  mealNames: string[]
  selectionTiming: Array<TimeWindow | string>
  servingTiming?: Array<TimeWindow>
  onSave: (
    names: string[],
    selectionTiming: Array<{ start: string; end: string }>,
    servingTiming: Array<{ start: string; end: string }>
  ) => void
}

interface MealSlotItem {
  id: string
  name: string
  selectionStart: string
  selectionEnd: string
  servingStart: string
  servingEnd: string
}

export default function MealTimingModal({
  isOpen,
  onClose,
  mealNames,
  selectionTiming,
  servingTiming,
  onSave,
}: MealTimingModalProps) {
  const [slots, setSlots] = useState<MealSlotItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (mealNames && mealNames.length > 0) {
        setSlots(
          mealNames.map((name, index) => {
            const rawSel = selectionTiming?.[index]
            const selStart = typeof rawSel === 'object' && rawSel?.start ? rawSel.start : (index === 0 ? '06:00' : index === 1 ? '06:00' : '06:00')
            const selEnd = typeof rawSel === 'object' && rawSel?.end ? rawSel.end : (typeof rawSel === 'string' ? rawSel : (index === 0 ? '07:00' : index === 1 ? '11:30' : '18:30'))

            const servStart = servingTiming?.[index]?.start || (index === 0 ? '07:30' : index === 1 ? '12:30' : '19:30')
            const servEnd = servingTiming?.[index]?.end || (index === 0 ? '10:00' : index === 1 ? '15:00' : '22:00')

            return {
              id: `slot-${index}-${Date.now()}`,
              name,
              selectionStart: selStart,
              selectionEnd: selEnd,
              servingStart: servStart,
              servingEnd: servEnd,
            }
          })
        )
      } else {
        // Defaults
        setSlots([
          { id: '1', name: 'Breakfast', selectionStart: '06:00', selectionEnd: '07:00', servingStart: '07:30', servingEnd: '10:00' },
          { id: '2', name: 'Lunch', selectionStart: '06:00', selectionEnd: '11:30', servingStart: '12:30', servingEnd: '15:00' },
          { id: '3', name: 'Dinner', selectionStart: '06:00', selectionEnd: '18:30', servingStart: '19:30', servingEnd: '22:00' },
        ])
      }
      setError(null)
    }
  }, [isOpen, mealNames, selectionTiming, servingTiming])

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
        selectionStart: '06:00',
        selectionEnd: '17:00',
        servingStart: '17:30',
        servingEnd: '20:30',
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

  const handleUpdateField = (index: number, field: keyof MealSlotItem, val: string) => {
    setSlots((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  const handleSave = () => {
    const invalid = slots.some((s) => !s.name.trim())
    if (invalid) {
      setError('All meal slots must have a valid title.')
      return
    }
    onSave(
      slots.map((s) => s.name.trim()),
      slots.map((s) => ({ start: s.selectionStart || '06:00', end: s.selectionEnd || '12:00' })),
      slots.map((s) => ({ start: s.servingStart || '08:00', end: s.servingEnd || '10:00' }))
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-2xl rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Configure Daily Meal Slots</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {slots.length} Active Slots
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define pre-order selection time windows and dining hall serving time ranges.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Slots list */}
        <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3.5 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-[11px] font-bold flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Meal Slot #{index + 1}
                  </span>
                </div>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Slot</span>
                  </button>
                )}
              </div>

              {/* Slot Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Meal Name (e.g. Breakfast, Lunch, Dinner, Iftar)
                </label>
                <Input
                  value={slot.name}
                  onChange={(e) => handleUpdateField(index, 'name', e.target.value)}
                  placeholder="e.g. Breakfast"
                  className="h-9 text-xs rounded-xl font-medium"
                />
              </div>

              {/* Time Ranges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Selection Window */}
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Selection Time Range
                    </span>
                    <span className="text-[10px] text-muted-foreground">Order Window</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Opens At</label>
                      <Input
                        type="time"
                        value={slot.selectionStart}
                        onChange={(e) => handleUpdateField(index, 'selectionStart', e.target.value)}
                        className="h-8 text-xs rounded-lg font-mono [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Closes (Cutoff)</label>
                      <Input
                        type="time"
                        value={slot.selectionEnd}
                        onChange={(e) => handleUpdateField(index, 'selectionEnd', e.target.value)}
                        className="h-8 text-xs rounded-lg font-mono [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Serving Window */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      Serving Time Range
                    </span>
                    <span className="text-[10px] text-muted-foreground">Dining Hall</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Serving Starts</label>
                      <Input
                        type="time"
                        value={slot.servingStart}
                        onChange={(e) => handleUpdateField(index, 'servingStart', e.target.value)}
                        className="h-8 text-xs rounded-lg font-mono [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Serving Ends</label>
                      <Input
                        type="time"
                        value={slot.servingEnd}
                        onChange={(e) => handleUpdateField(index, 'servingEnd', e.target.value)}
                        className="h-8 text-xs rounded-lg font-mono [color-scheme:dark]"
                      />
                    </div>
                  </div>
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
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
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
            className="h-9 px-5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
          >
            Apply Meal Slots
          </Button>
        </div>
      </div>
    </div>
  )
}
