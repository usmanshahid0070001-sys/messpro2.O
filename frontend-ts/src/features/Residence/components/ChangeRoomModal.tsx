import React, { useState, useMemo } from 'react'
import { ArrowLeftRight, X, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Room } from '@/hooks/queries/useResidenceQueries'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'

interface ChangeRoomModalProps {
  isOpen: boolean
  onClose: () => void
  isPending: boolean
  rooms: Room[]
  assignedResidents: ManageableUser[]
  onSubmit: (studentId: string, newRoomId: string) => Promise<void>
}

export default function ChangeRoomModal({
  isOpen,
  onClose,
  isPending,
  rooms,
  assignedResidents,
  onSubmit,
}: ChangeRoomModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<ManageableUser | null>(null)
  const [targetRoomId, setTargetRoomId] = useState('')

  // Reset states on open/close
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedStudent(null)
      setTargetRoomId('')
    }
  }, [isOpen])

  // Filter assigned residents based on name/roll number/email
  const filteredResidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return assignedResidents.slice(0, 10) // default list

    return assignedResidents.filter((res) => {
      const nameMatch = res.name.toLowerCase().includes(query)
      const rollMatch = res.id ? res.id.toLowerCase().includes(query) : false
      const emailMatch = res.email ? res.email.toLowerCase().includes(query) : false
      const roomMatch = res.room?.roomName ? res.room.roomName.toLowerCase().includes(query) : false
      return nameMatch || rollMatch || emailMatch || roomMatch
    })
  }, [assignedResidents, searchQuery])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !targetRoomId) return
    await onSubmit(selectedStudent._id, targetRoomId)
    setSelectedStudent(null)
    setTargetRoomId('')
    setSearchQuery('')
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
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Swap / Change Room</h2>
              <p className="text-[11px] text-muted-foreground">Move a resident to another available room.</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Search & Select Resident */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Select Resident to Move <span className="text-rose-500">*</span>
            </label>

            {assignedResidents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border">
                No residents are currently assigned to any room.
              </p>
            ) : selectedStudent ? (
              // Selected Resident
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{selectedStudent.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Current Room: <strong className="text-foreground">{selectedStudent.room?.roomName || 'Room'}</strong>
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedStudent(null)}
                  className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              // Search Input & List
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Type name, roll number, or current room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8.5 h-9 text-xs"
                    autoFocus
                  />
                </div>

                {/* Results List */}
                <div className="border border-border rounded-lg max-h-40 overflow-y-auto divide-y divide-border bg-background/50">
                  {filteredResidents.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">No assigned residents match "{searchQuery}"</p>
                  ) : (
                    filteredResidents.map((res) => (
                      <button
                        key={res._id}
                        type="button"
                        onClick={() => setSelectedStudent(res)}
                        className="w-full text-left p-2 hover:bg-muted/60 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                            {res.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {res.id ? `Roll: ${res.id}` : `Role: ${res.role}`} • Current: {res.room?.roomName}
                          </p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground shrink-0">
                          Move
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Destination Room */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              New Destination Room <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:ring-1 focus:ring-purple-500 cursor-pointer"
              required
            >
              <option value="">Select target room...</option>
              {rooms
                .filter(
                  (r) =>
                    r.status === 'Available' &&
                    r.occupants < r.capacity &&
                    (!selectedStudent || r._id !== selectedStudent.room?._id)
                )
                .map((rm) => (
                  <option key={rm._id} value={rm._id}>
                    {rm.roomName} ({rm.capacity - rm.occupants} vacant / {rm.capacity} total)
                  </option>
                ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedStudent || !targetRoomId}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Swapping...
                </>
              ) : (
                'Confirm Swap'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
