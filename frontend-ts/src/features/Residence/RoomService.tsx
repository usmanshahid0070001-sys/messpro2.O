import { useState, useMemo, useDeferredValue } from 'react'
import {
  Sparkles,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  X,
  AlertCircle,
  Loader2,
  BedDouble,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGetRooms, type Room } from '@/hooks/queries/useResidenceQueries'

// Extracted Components
import ResidenceMetrics, { type MetricConfig } from './components/ResidenceMetrics'
import ServiceFilterBar from './components/ServiceFilterBar'
import CleaningLog from './components/CleaningLog'

type ServiceFilterType = 'all' | 'cleaned-today' | 'pending-today' | 'never'
type ServiceSortType = 'recent' | 'name' | 'least'

export default function RoomService() {
  const { data: rooms = [], isLoading } = useGetRooms()

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [cleaningFilter, setCleaningFilter] = useState<ServiceFilterType>('all')
  const [sortOrder, setSortOrder] = useState<ServiceSortType>('recent')

  // Selected Room for History Modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isRoomCleanedToday = (room: Room): boolean => {
    if (!room.cleaningDates || room.cleaningDates.length === 0) return false
    return room.cleaningDates.some((d) => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === today.getTime()
    })
  }

  const isRoomCleanedThisWeek = (room: Room): boolean => {
    if (!room.cleaningDates || room.cleaningDates.length === 0) return false
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return room.cleaningDates.some((d) => new Date(d).getTime() >= oneWeekAgo.getTime())
  }

  // Summary Metrics Computation
  const metrics = useMemo(() => {
    let cleanedToday = 0
    let cleanedThisWeek = 0
    let neverCleaned = 0

    rooms.forEach((r) => {
      if (isRoomCleanedToday(r)) cleanedToday++
      if (isRoomCleanedThisWeek(r)) cleanedThisWeek++
      if (!r.cleaningDates || r.cleaningDates.length === 0) neverCleaned++
    })

    const pendingToday = Math.max(0, rooms.length - cleanedToday)
    const complianceRate = rooms.length > 0 ? Math.round((cleanedToday / rooms.length) * 100) : 0

    return {
      totalRooms: rooms.length,
      cleanedToday,
      pendingToday,
      cleanedThisWeek,
      neverCleaned,
      complianceRate,
    }
  }, [rooms])

  // Metrics configurations
  const metricConfigs = useMemo<MetricConfig[]>(() => {
    return [
      {
        label: 'Cleaned Today',
        value: metrics.cleanedToday,
        subtext: `${metrics.complianceRate}% of hostel rooms`,
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        borderHover: 'hover:border-emerald-500/30',
        valueColor: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Pending Today',
        value: metrics.pendingToday,
        subtext: 'Awaiting sanitation',
        icon: Clock,
        iconColor: 'text-amber-500',
        borderHover: 'hover:border-amber-500/30',
        valueColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Cleaned This Week',
        value: metrics.cleanedThisWeek,
        subtext: 'Sanitized within 7 days',
        icon: Sparkles,
        iconColor: 'text-teal-500',
        borderHover: 'hover:border-teal-500/30',
        valueColor: 'text-teal-600 dark:text-teal-400',
      },
      {
        label: 'Total Rooms',
        value: metrics.totalRooms,
        subtext: 'Registered rooms',
        icon: Building2,
        iconColor: 'text-blue-500',
        borderHover: 'hover:border-blue-500/30',
        valueColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'No History',
        value: metrics.neverCleaned,
        subtext: 'Never marked clean',
        icon: AlertCircle,
        iconColor: 'text-rose-500',
        borderHover: 'hover:border-rose-500/30',
        valueColor: 'text-rose-600 dark:text-rose-400',
        wideOnMobile: true,
      },
    ]
  }, [metrics])

  // Filtered & Sorted Rooms list
  const filteredRooms = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase()
    return rooms.filter((r) => {
      const matchSearch = !term || r.roomName.toLowerCase().includes(term)

      const cleanedToday = isRoomCleanedToday(r)
      const hasCleanings = r.cleaningDates && r.cleaningDates.length > 0

      if (cleaningFilter === 'cleaned-today' && !cleanedToday) return false
      if (cleaningFilter === 'pending-today' && cleanedToday) return false
      if (cleaningFilter === 'never' && hasCleanings) return false

      return matchSearch
    })
  }, [rooms, deferredSearchTerm, cleaningFilter])

  const sortedRooms = useMemo(() => {
    const list = [...filteredRooms]
    if (sortOrder === 'name') {
      list.sort((a, b) => a.roomName.localeCompare(b.roomName, undefined, { numeric: true }))
    } else if (sortOrder === 'recent') {
      list.sort((a, b) => {
        const lastA = a.cleaningDates?.length ? new Date(a.cleaningDates[a.cleaningDates.length - 1]).getTime() : 0
        const lastB = b.cleaningDates?.length ? new Date(b.cleaningDates[b.cleaningDates.length - 1]).getTime() : 0
        return lastB - lastA
      })
    } else if (sortOrder === 'least') {
      list.sort((a, b) => (a.cleaningDates?.length || 0) - (b.cleaningDates?.length || 0))
    }
    return list
  }, [filteredRooms, sortOrder])

  return (
    <div className="space-y-4 pb-12 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Room Services & Sanitation
            </h1>
            <p className="text-xs text-muted-foreground">
              Track daily room sanitation attendance, cleaning logs, and hygiene compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <ResidenceMetrics metrics={metricConfigs} />

      {/* Filter and Search Bar */}
      <ServiceFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={cleaningFilter}
        onFilterChange={setCleaningFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        totalCount={rooms.length}
        cleanedCount={metrics.cleanedToday}
        pendingCount={metrics.pendingToday}
      />

      {/* Table List */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-xs text-muted-foreground">Loading room cleaning records...</p>
        </div>
      ) : sortedRooms.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No room records found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            No rooms match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Room Name</th>
                  <th className="py-3 px-4">Today's Status</th>
                  <th className="py-3 px-4">Last Cleaned</th>
                  <th className="py-3 px-4">Total Logs</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedRooms.map((room) => {
                  const cleanedToday = isRoomCleanedToday(room)
                  const totalLogs = room.cleaningDates?.length || 0

                  const lastCleanDate =
                    totalLogs > 0 ? new Date(room.cleaningDates[totalLogs - 1]) : null

                  const formattedLastDate = lastCleanDate
                    ? lastCleanDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Never'

                  return (
                    <tr
                      key={room._id}
                      onClick={() => setSelectedRoom(room)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-teal-500" />
                          <span>{room.roomName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {cleanedToday ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cleaned Today
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formattedLastDate}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-foreground">
                        {totalLogs} logs
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {room.occupants} / {room.capacity} beds
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRoom(room)}
                          className="h-7 px-2 text-xs gap-1 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>History</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Cleaning History */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Cleaning Log: {selectedRoom.roomName}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    Total {selectedRoom.cleaningDates?.length || 0} sanitation records
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRoom(null)}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 bg-background/50">
              <CleaningLog cleaningDates={selectedRoom.cleaningDates} maxHeightClass="max-h-72" />
            </div>

            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedRoom(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
