import React, { useState, useMemo } from 'react'
import { UserPlus, X, Loader2, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Room } from '@/hooks/queries/useResidenceQueries'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'

interface AllotModalProps {
  isOpen: boolean
  onClose: () => void
  isPending: boolean
  rooms: Room[]
  unassignedResidents: ManageableUser[]
  selectedRoom: Room | null
  onSubmit: (studentId: string, roomId: string) => Promise<void>
}

export default function AllotModal({
  isOpen,
  onClose,
  isPending,
  rooms,
  unassignedResidents,
  selectedRoom,
  onSubmit,
}: AllotModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<ManageableUser | null>(null)
  const [targetRoomId, setTargetRoomId] = useState('')

  // Initialize targetRoomId if selectedRoom is passed
  React.useEffect(() => {
    if (selectedRoom) {
      setTargetRoomId(selectedRoom._id)
    } else {
      setTargetRoomId('')
    }
  }, [selectedRoom, isOpen])

  // Reset student and search on open/close
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedStudent(null)
    }
  }, [isOpen])

  // Filter unassigned residents as user types (matches name or rollnumber/email/id)
  const filteredResidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return unassignedResidents.slice(0, 10) // Show first 10 by default to keep it clean

    return unassignedResidents.filter((res) => {
      const nameMatch = res.name.toLowerCase().includes(query)
      const rollMatch = res.id ? res.id.toLowerCase().includes(query) : false
      const emailMatch = res.email ? res.email.toLowerCase().includes(query) : false
      return nameMatch || rollMatch || emailMatch
    })
  }, [unassignedResidents, searchQuery])

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
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Allot Room to Resident</h2>
              <p className="text-[11px] text-muted-foreground">Assign a room to an unassigned student or manager.</p>
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
              Select Resident <span className="text-rose-500">*</span>
            </label>
            
            {unassignedResidents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border">
                All registered students & managers are already allotted to rooms!
              </p>
            ) : selectedStudent ? (
              // Selected Student Badge
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-teal-500/30 bg-teal-500/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{selectedStudent.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {selectedStudent.id ? `Roll No: ${selectedStudent.id}` : `Email: ${selectedStudent.email}`}
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
                    placeholder="Type name, roll number, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8.5 h-9 text-xs"
                    autoFocus
                  />
                </div>
                
                {/* Search Results List */}
                <div className="border border-border rounded-lg max-h-40 overflow-y-auto divide-y divide-border bg-background/50">
                  {filteredResidents.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">No residents match "{searchQuery}"</p>
                  ) : (
                    filteredResidents.map((res) => (
                      <button
                        key={res._id}
                        type="button"
                        onClick={() => setSelectedStudent(res)}
                        className="w-full text-left p-2 hover:bg-muted/60 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                            {res.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {res.id ? `Roll: ${res.id}` : `Email: ${res.email}`}
                          </p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground group-hover:bg-teal-500/10 group-hover:text-teal-600 dark:group-hover:text-teal-400 capitalize shrink-0">
                          {res.role}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/80 font-normal">
                  Showing matches as you type. Match names or roll numbers.
                </p>
              </div>
            )}
          </div>

          {/* Select Target Room */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Destination Room <span className="text-rose-500">*</span>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs font-medium text-foreground hover:bg-muted/40 transition-colors inline-flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span className="truncate">
                    {targetRoomId
                      ? rooms.find((r) => r._id === targetRoomId)?.roomName
                      : 'Select target room...'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 max-h-60 overflow-y-auto">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Available Vacant Rooms
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={targetRoomId}
                  onValueChange={(val) => setTargetRoomId(val)}
                >
                  {rooms
                    .filter((r) => r.status === 'Available' && r.occupants < r.capacity)
                    .map((rm) => (
                      <DropdownMenuRadioItem key={rm._id} value={rm._id} className="text-xs cursor-pointer flex items-center justify-between">
                        <span className="font-semibold">{rm.roomName}</span>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                          {rm.capacity - rm.occupants} vacant / {rm.capacity} total
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedStudent || !targetRoomId}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Allotting...
                </>
              ) : (
                'Allot Room'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
