import React, { useState, useEffect } from 'react'
import { BedDouble, X, Loader2, Edit3, ShieldAlert, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Room, RoomStatus } from '@/hooks/queries/useResidenceQueries'

interface RoomFormModalProps {
  isOpen: boolean
  onClose: () => void
  isPending: boolean
  initialData?: Room | null
  onSubmit: (data: { roomName: string; capacity: number; status?: RoomStatus }) => Promise<void>
}

export default function RoomFormModal({
  isOpen,
  onClose,
  isPending,
  initialData,
  onSubmit,
}: RoomFormModalProps) {
  const isEditMode = Boolean(initialData)
  const currentOccupants = initialData?.occupants || 0

  const [roomName, setRoomName] = useState('')
  const [capacity, setCapacity] = useState(2)
  const [status, setStatus] = useState<RoomStatus>('Available')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setRoomName(initialData.roomName || '')
      setCapacity(initialData.capacity || 2)
      setStatus(initialData.status || 'Available')
    } else {
      setRoomName('')
      setCapacity(2)
      setStatus('Available')
    }
    setErrorMsg(null)
  }, [initialData, isOpen])

  if (!isOpen) return null

  // Dynamic status evaluation preview
  const willBeFull = currentOccupants >= capacity
  const isUnderCapacity = capacity < currentOccupants

  const handleCapacityChange = (val: number) => {
    setCapacity(val)
    if (isEditMode && val < currentOccupants) {
      setErrorMsg(
        `Capacity cannot be less than ${currentOccupants} (current allotted resident count). Please disallot residents first.`
      )
    } else {
      setErrorMsg(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return

    if (isEditMode && capacity < currentOccupants) {
      setErrorMsg(`Capacity must be at least ${currentOccupants} to accommodate current residents.`)
      return
    }

    // Determine target status
    let targetStatus = status
    if (status !== 'Maintenance') {
      targetStatus = willBeFull ? 'Full' : 'Available'
    }

    await onSubmit({
      roomName: roomName.trim(),
      capacity: Number(capacity),
      status: targetStatus,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <BedDouble className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEditMode ? `Edit Room: ${initialData?.roomName}` : 'Add New Room'}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isEditMode
                  ? 'Update room identification, bed capacity, or maintenance status.'
                  : 'Configure a new room and its maximum bed capacity.'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Occupancy Callout (in Edit mode) */}
        {isEditMode && initialData && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground font-medium block text-[11px]">
                Current Residents Allotted:
              </span>
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    initialData.occupants >= initialData.capacity ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                {initialData.occupants} / {initialData.capacity} Beds Occupied
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                initialData.status === 'Full'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : initialData.status === 'Maintenance'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {initialData.status}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Room Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Room Name / Number <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="E.g., Room 101, A-1, B-12"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Bed Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Bed Capacity <span className="text-rose-500">*</span>
              </label>
              {isEditMode && currentOccupants > 0 && (
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  Minimum required: {currentOccupants} beds
                </span>
              )}
            </div>
            <Input
              type="number"
              min={isEditMode ? Math.max(1, currentOccupants) : 1}
              max={30}
              value={capacity}
              onChange={(e) => handleCapacityChange(Number(e.target.value))}
              className={`text-xs h-9 ${isUnderCapacity ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
              required
            />
            {errorMsg ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Maximum number of students this room can accommodate.
              </p>
            )}
          </div>

          {/* Status Selection (in Edit Mode) */}
          {isEditMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Room Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Available / Auto */}
                <button
                  type="button"
                  onClick={() => setStatus(willBeFull ? 'Full' : 'Available')}
                  disabled={willBeFull}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none text-xs ${
                    status === 'Available' && !willBeFull
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : willBeFull
                      ? 'opacity-40 cursor-not-allowed border-border/50 bg-muted/20 text-muted-foreground'
                      : 'border-border bg-card hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-500" />
                  <span className="block text-[11px] font-bold">Available</span>
                  <span className="block text-[9px] text-muted-foreground">Has vacancy</span>
                </button>

                {/* Full */}
                <button
                  type="button"
                  onClick={() => setStatus('Full')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none text-xs ${
                    status === 'Full' || willBeFull
                      ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-500/20'
                      : 'border-border bg-card hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mx-auto mb-1 text-rose-500" />
                  <span className="block text-[11px] font-bold">Full</span>
                  <span className="block text-[9px] text-muted-foreground">100% Occupied</span>
                </button>

                {/* Maintenance */}
                <button
                  type="button"
                  onClick={() => setStatus('Maintenance')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer select-none text-xs ${
                    status === 'Maintenance'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20'
                      : 'border-border bg-card hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
                  <span className="block text-[11px] font-bold">Maintenance</span>
                  <span className="block text-[9px] text-muted-foreground">Repairs / Clean</span>
                </button>
              </div>

              {/* Status Hint */}
              <p className="text-[10px] text-muted-foreground pt-1">
                {willBeFull
                  ? '⚡ Occupancy is at 100% — status will automatically register as Full.'
                  : '💡 Status automatically tracks occupancy unless set to Maintenance.'}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold border-border hover:bg-muted text-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !roomName.trim() || isUnderCapacity}
              className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  {isEditMode ? 'Saving Changes...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Room'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

