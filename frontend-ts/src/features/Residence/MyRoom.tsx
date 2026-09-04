import React from 'react'
import { useSelector } from 'react-redux'
import {
  BedDouble,
  Users,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RootState } from '@/store'
import type { PlanFeature } from '@/store/slices/HostelSlice'
import { useGetMyRoom } from '@/hooks/queries/useResidenceQueries'
import { useMarkRoomCleaning } from '@/hooks/mutations/useResidenceMutations'

// Extracted Components
import CleaningLog from './components/CleaningLog'

export default function MyRoom() {
  const { user } = useSelector((s: RootState) => s.auth)
  const { currentHostel } = useSelector((s: RootState) => s.hostel)

  // ── Feature flags from hostel plan ───────────────────────────────────────
  const features: PlanFeature[] = currentHostel?.plan?.features || []
  const hasFeature = (name: string): boolean => {
    const f = features.find(
      (item) => item.name.toLowerCase().replace(/\s+/g, '_') === name
    )
    return f?.isEnabled === true
  }

  const hasResidence = hasFeature('residence_management')
  const hasService = hasFeature('service_management')   // cleaning attendance only when true

  const { data: myRoom, isLoading, isError, error } = useGetMyRoom(hasResidence)
  const markCleaningMutation = useMarkRoomCleaning()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if cleaning attendance was already marked today
  const isCleanedToday = React.useMemo(() => {
    if (!myRoom?.cleaningDates) return false
    return myRoom.cleaningDates.some((d) => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === today.getTime()
    })
  }, [myRoom?.cleaningDates])

  const handleMarkCleaning = async () => {
    await markCleaningMutation.mutateAsync()
  }

  // ── Feature disabled guard ────────────────────────────────────────────────
  if (!hasResidence) {
    return (
      <div className="space-y-4 pb-12 w-full max-w-full min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">My Room & Residence</h1>
            <p className="text-xs text-muted-foreground">Room allotment, roommates, and service logs.</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="p-4 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <BedDouble className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-foreground">Residence Management Not Available</h2>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            Your hostel plan does not include the Residence Management feature. Contact your administrator for more information.
          </p>
        </div>
      </div>
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-xs text-muted-foreground">Loading your room details...</p>
      </div>
    )
  }

  // ── No room allotted state ────────────────────────────────────────────────
  if (isError || !myRoom) {
    const errorMsg =
      (error as any)?.response?.data?.message ||
      'You do not have a room allotted yet. Please contact your hostel administrator or manager to assign you a room.'

    return (
      <div className="space-y-4 pb-12 w-full max-w-full min-w-0">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">My Room & Residence</h1>
              <p className="text-xs text-muted-foreground">Room allotment, roommates, and service logs.</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-foreground">No Room Allotted</h2>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    )
  }

  const roommates = myRoom.roommates || []

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {myRoom.roomName}
            </h1>
            <p className="text-xs text-muted-foreground">
              Capacity:{' '}
              <span className="font-mono text-foreground">{myRoom.occupants} / {myRoom.capacity} beds</span>
              {' • '}Status: <strong className="text-foreground">{myRoom.status}</strong>
            </p>
          </div>
        </div>

        {/* Cleaning quick action — only if service_management is enabled */}
        {hasService && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCleanedToday ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cleaned Today</span>
              </div>
            ) : (
              <Button
                size="sm"
                disabled={markCleaningMutation.isPending}
                onClick={handleMarkCleaning}
                className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {markCleaningMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mark Room Cleaned</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:gap-6 items-start ${hasService ? 'lg:grid-cols-12' : ''}`}>
        {/* Left Column: Room Overview & Roommates */}
        <div className={`space-y-4 ${hasService ? 'lg:col-span-7' : ''}`}>
          {/* Room Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-teal-500" />
                Bed Capacity
              </span>
              <div className="text-xl font-bold font-mono text-foreground">{myRoom.capacity} Beds</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Total Occupants
              </span>
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {myRoom.occupants} Residents
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Room Status
              </span>
              <div
                className={`text-xl font-bold capitalize ${
                  myRoom.status === 'Available'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : myRoom.status === 'Full'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {myRoom.status}
              </div>
            </div>
          </div>

          {/* Roommates Directory */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-500" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">Roommates Directory</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {roommates.length} of {myRoom.capacity} allotted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roommates.map((mate) => {
                const isCurrentUser = mate._id === user?._id

                return (
                  <div
                    key={mate._id}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isCurrentUser
                        ? 'border-teal-500/40 bg-teal-500/10 ring-1 ring-teal-500/20'
                        : 'border-border bg-background'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-teal-500/20 shrink-0">
                      {mate.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">{mate.name}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-600 text-white">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {mate.id ? `Roll No: ${mate.id}` : `Role: ${mate.role}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Room Service & Cleaning Log */}
        {hasService && (
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">Room Cleaning Service</h2>
              </div>
            </div>

            {/* Today's Status */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Today's Status:</span>
                {isCleanedToday ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marked Clean
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </div>

              {!isCleanedToday && (
                <Button
                  size="sm"
                  disabled={markCleaningMutation.isPending}
                  onClick={handleMarkCleaning}
                  className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 cursor-pointer"
                >
                  {markCleaningMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Cleaning Completed
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Cleaning History log */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Cleaning Logs ({myRoom.cleaningDates?.length || 0})
              </span>
              <CleaningLog cleaningDates={myRoom.cleaningDates} maxHeightClass="max-h-56" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
