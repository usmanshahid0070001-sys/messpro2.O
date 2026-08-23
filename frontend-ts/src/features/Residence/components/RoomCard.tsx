import { BedDouble, UserPlus, UserMinus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Room } from '@/hooks/queries/useResidenceQueries'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'

interface RoomCardProps {
  room: Room
  residents: ManageableUser[]
  isDeletePending: boolean
  onAllot: (room: Room) => void
  onDisallot: (studentId: string, studentName: string) => void
  onDelete: (roomId: string, roomName: string) => void
}

export default function RoomCard({
  room,
  residents,
  isDeletePending,
  onAllot,
  onDisallot,
  onDelete,
}: RoomCardProps) {
  const isFull = room.occupants >= room.capacity
  const isAvailable = room.status === 'Available' && !isFull
  const occupancyPct = Math.round((room.occupants / room.capacity) * 100)

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-xs hover:border-teal-500/40 transition-all group h-full">
      {/* Top: Room Name, Status Badge & Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-teal-500" />
            {room.roomName}
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Capacity: <strong className="text-foreground">{room.capacity} beds</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isFull
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : room.status === 'Maintenance'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
            }`}
          >
            {isFull ? 'Full' : room.status}
          </span>

          <button
            type="button"
            disabled={isDeletePending}
            onClick={() => onDelete(room._id, room.roomName)}
            className="text-muted-foreground hover:text-rose-600 p-1 rounded-md transition-colors"
            title="Delete room"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground text-[11px]">Occupancy</span>
          <span className="font-mono font-semibold text-foreground text-[11px]">
            {room.occupants} / {room.capacity} ({occupancyPct}%)
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isFull ? 'bg-rose-500' : occupancyPct >= 75 ? 'bg-amber-500' : 'bg-teal-500'
            }`}
            style={{ width: `${Math.min(100, occupancyPct)}%` }}
          />
        </div>
      </div>

      {/* Allotted Residents */}
      <div className="space-y-1.5 pt-2 border-t border-border/60 flex-1">
        <span className="text-[11px] font-medium text-muted-foreground block">
          Allotted Residents ({residents.length}):
        </span>
        {residents.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70 italic">No residents assigned</p>
        ) : (
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {residents.map((res) => (
              <div
                key={res._id}
                className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/40 border border-border/40"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-foreground truncate">{res.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({res.id || res.role})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDisallot(res._id, res.name)}
                  className="text-muted-foreground hover:text-rose-500 p-0.5 rounded transition-colors"
                  title="Remove resident from room"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA pinned to the bottom */}
      <div className="pt-2 mt-auto">
        {isAvailable ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAllot(room)}
            className="w-full h-8 text-xs gap-1 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/10 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Allot Student</span>
          </Button>
        ) : (
          <div className="w-full h-8 text-xs gap-1 flex items-center justify-center text-muted-foreground/80 py-1 bg-muted/20 rounded-md">
            {isFull ? 'Room is Full' : 'Under Maintenance'}
          </div>
        )}
      </div>
    </div>
  )
}
