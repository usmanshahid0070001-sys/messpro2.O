import React, { useState } from 'react'
import { BedDouble, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RoomFormModalProps {
  isOpen: boolean
  onClose: () => void
  isPending: boolean
  onSubmit: (roomName: string, capacity: number) => Promise<void>
}

export default function RoomFormModal({ isOpen, onClose, isPending, onSubmit }: RoomFormModalProps) {
  const [roomName, setRoomName] = useState('')
  const [capacity, setCapacity] = useState(2)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || capacity < 1) return
    await onSubmit(roomName.trim(), Number(capacity))
    setRoomName('')
    setCapacity(2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <BedDouble className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Add New Room</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Bed Capacity <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              max={12}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="text-xs h-9"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Number of students this room can accommodate.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !roomName.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
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
