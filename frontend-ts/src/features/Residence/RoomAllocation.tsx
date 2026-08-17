import { useState, useMemo, useDeferredValue } from 'react'
import {
  BedDouble,
  Building2,
  Users,
  Plus,
  CheckCircle2,
  Sparkles,
  Loader2,
  UserPlus,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGetRooms, type Room } from '@/hooks/queries/useResidenceQueries'
import { useGetUsers } from '@/hooks/queries/useUserQueries'
import {
  useCreateRoom,
  useDeleteRoom,
  useAlloteRoom,
  useDisalloteRoom,
  useChangeRoom,
} from '@/hooks/mutations/useResidenceMutations'

// Extracted Components
import ResidenceMetrics, { type MetricConfig } from './components/ResidenceMetrics'
import RoomCard from './components/RoomCard'
import RoomFilterBar from './components/RoomFilterBar'
import RoomFormModal from './components/RoomFormModal'
import AllotModal from './components/AllotModal'
import ChangeRoomModal from './components/ChangeRoomModal'

type SortOrder = 'name-asc' | 'name-desc' | 'occupancy'

export default function RoomAllocation() {
  // Data Fetching
  const { data: rooms = [], isLoading: isRoomsLoading } = useGetRooms()
  const { data: users = [], isLoading: isUsersLoading } = useGetUsers()

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('name-asc')

  // Modals state
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [isAlloteOpen, setIsAlloteOpen] = useState(false)
  const [isChangeOpen, setIsChangeOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Mutations
  const createRoomMutation = useCreateRoom()
  const deleteRoomMutation = useDeleteRoom()
  const alloteRoomMutation = useAlloteRoom()
  const disalloteRoomMutation = useDisalloteRoom()
  const changeRoomMutation = useChangeRoom()

  // Segments of Residents
  const unassignedResidents = useMemo(() => {
    return users.filter(
      (u) => (u.role === 'student' || u.role === 'manager') && (!u.room || !u.room._id)
    )
  }, [users])

  const assignedResidents = useMemo(() => {
    return users.filter(
      (u) => (u.role === 'student' || u.role === 'manager') && u.room && u.room._id
    )
  }, [users])

  // Metric Configuration
  const metricConfigs = useMemo<MetricConfig[]>(() => {
    let totalCapacity = 0
    let totalOccupants = 0
    let availableCount = 0
    let fullCount = 0
    let maintenanceCount = 0

    rooms.forEach((r) => {
      totalCapacity += r.capacity
      totalOccupants += r.occupants
      if (r.status === 'Available') availableCount++
      else if (r.status === 'Full') fullCount++
      else if (r.status === 'Maintenance') maintenanceCount++
    })

    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0
    const availableBeds = Math.max(0, totalCapacity - totalOccupants)

    return [
      {
        label: 'Total Rooms',
        value: rooms.length,
        subtext: `${availableCount} Available • ${fullCount} Full`,
        icon: Building2,
        iconColor: 'text-teal-500',
        borderHover: 'hover:border-teal-500/30',
      },
      {
        label: 'Bed Capacity',
        value: totalCapacity,
        subtext: 'Max hostel residents',
        icon: BedDouble,
        iconColor: 'text-blue-500',
        borderHover: 'hover:border-blue-500/30',
        valueColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Allotted Residents',
        value: totalOccupants,
        subtext: `${assignedResidents.length} in rooms`,
        icon: Users,
        iconColor: 'text-purple-500',
        borderHover: 'hover:border-purple-500/30',
        valueColor: 'text-purple-600 dark:text-purple-400',
      },
      {
        label: 'Available Beds',
        value: availableBeds,
        subtext: 'Ready for allocation',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        borderHover: 'hover:border-emerald-500/30',
        valueColor: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        subtext: `${unassignedResidents.length} unassigned`,
        icon: Sparkles,
        iconColor: 'text-amber-500',
        borderHover: 'hover:border-amber-500/30',
        valueColor: 'text-amber-600 dark:text-amber-400',
        wideOnMobile: true,
      },
    ]
  }, [rooms, assignedResidents, unassignedResidents])

  // Filtered & Sorted Rooms list
  const filteredRooms = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase()
    return rooms.filter((r) => {
      const matchSearch = !term || r.roomName.toLowerCase().includes(term)
      const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase()
      return matchSearch && matchStatus
    })
  }, [rooms, deferredSearchTerm, statusFilter])

  const sortedRooms = useMemo(() => {
    const list = [...filteredRooms]
    if (sortOrder === 'name-asc') {
      list.sort((a, b) => a.roomName.localeCompare(b.roomName, undefined, { numeric: true }))
    } else if (sortOrder === 'name-desc') {
      list.sort((a, b) => b.roomName.localeCompare(a.roomName, undefined, { numeric: true }))
    } else if (sortOrder === 'occupancy') {
      list.sort((a, b) => b.occupants / b.capacity - a.occupants / a.capacity)
    }
    return list
  }, [filteredRooms, sortOrder])

  // Handlers for Modals / Mutations
  const handleCreateRoom = async (roomName: string, capacity: number) => {
    await createRoomMutation.mutateAsync({ roomName, capacity })
    setIsAddRoomOpen(false)
  }

  const handleAlloteSubmit = async (studentId: string, roomId: string) => {
    await alloteRoomMutation.mutateAsync({ studentId, roomId })
    setIsAlloteOpen(false)
  }

  const handleChangeRoomSubmit = async (studentId: string, newRoomId: string) => {
    await changeRoomMutation.mutateAsync({ studentId, newRoomId })
    setIsChangeOpen(false)
  }

  const handleQuickDisallote = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this room?`)) {
      await disalloteRoomMutation.mutateAsync({ studentId })
    }
  }

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (window.confirm(`Are you sure you want to delete "${roomName}"? All occupants will be deallocated.`)) {
      await deleteRoomMutation.mutateAsync(roomId)
    }
  }

  const openAlloteForRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsAlloteOpen(true)
  }

  return (
    <div className="space-y-4 pb-12 w-full max-w-full min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Room Allocation & Capacity
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage residence rooms, allot beds to students, and oversee hostel capacity.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => {
              setSelectedRoom(null)
              setIsAlloteOpen(true)
            }}
            variant="outline"
            className="h-9 text-xs gap-1.5 font-medium border-border hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Allot Resident</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsChangeOpen(true)}
            variant="outline"
            className="h-9 text-xs gap-1.5 font-medium border-border hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Room</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddRoomOpen(true)}
            className="h-9 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Room</span>
          </Button>
        </div>
      </div>

      {/* Metrics strip */}
      <ResidenceMetrics metrics={metricConfigs} />

      {/* Filter and Search Bar */}
      <RoomFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Grid of Room Cards */}
      {isRoomsLoading || isUsersLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-xs text-muted-foreground">Loading room allocations...</p>
        </div>
      ) : sortedRooms.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <BedDouble className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No rooms found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'No rooms match your search or filter criteria.'
              : 'You have not configured any rooms yet. Click "New Room" to build your first hostel room.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {sortedRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              residents={users.filter((u) => u.room && u.room._id === room._id)}
              isDeletePending={deleteRoomMutation.isPending}
              onAllot={openAlloteForRoom}
              onDisallot={handleQuickDisallote}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {/* Form Modals */}
      <RoomFormModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        isPending={createRoomMutation.isPending}
        onSubmit={handleCreateRoom}
      />

      <AllotModal
        isOpen={isAlloteOpen}
        onClose={() => {
          setIsAlloteOpen(false)
          setSelectedRoom(null)
        }}
        isPending={alloteRoomMutation.isPending}
        rooms={rooms}
        unassignedResidents={unassignedResidents}
        selectedRoom={selectedRoom}
        onSubmit={handleAlloteSubmit}
      />

      <ChangeRoomModal
        isOpen={isChangeOpen}
        onClose={() => setIsChangeOpen(false)}
        isPending={changeRoomMutation.isPending}
        rooms={rooms}
        assignedResidents={assignedResidents}
        onSubmit={handleChangeRoomSubmit}
      />
    </div>
  )
}
