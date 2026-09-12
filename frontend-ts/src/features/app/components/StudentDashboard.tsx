import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Utensils,
  AlertCircle,
  Clock,
  QrCode,
  ShieldCheck,
  BedDouble,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  Moon,
} from 'lucide-react'
import type { PlanFeature } from '@/store/slices/HostelSlice'
import {
  useGetMealSchedule,
  useGetStudentSelections,
  type StudentSelectionRecord,
} from '@/hooks/queries/useMealQueries'
import { useGetBills } from '@/hooks/queries/useBillingQueries'
import { useGetStudentComplaints } from '@/hooks/queries/useComplaintQueries'
import { useGetMyRoom } from '@/hooks/queries/useResidenceQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { extractQuickActions, getGreeting } from './dashboard-types.ts'

interface StudentDashboardProps {
  user: any
  hostel: any
  navMain: any[]
}

export default function StudentDashboard({
  user,
  hostel,
  navMain,
}: StudentDashboardProps) {
  const navigate = useNavigate()
  const hostelName = hostel?.name || 'Campus Residence'

  // Student features driven strictly by hostel.plan.features
  const features: PlanFeature[] = hostel?.plan?.features || []
  const hasFeature = (name: string): boolean => {
    const f = features.find((item) => item.name.toLowerCase().replace(/\s+/g, '_') === name)
    return f?.isEnabled === true
  }

  const hasMealFeature = hasFeature('meal_settings')
  const hasResidenceFeature = hasFeature('residence_management')
  const hasComplaintFeature = hasFeature('complaint_management')
  const hasQrFeature = hasFeature('qr_attendance')

  // ── Date Computations ────────────────────────────────────────────────
  const now = new Date()
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const
  const todayDayName = daysOfWeek[now.getDay()]
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`


  // ── Real Data Queries ────────────────────────────────────────────────
  const { data: myRoom } = useGetMyRoom(hasResidenceFeature)
  const { data: schedule, isLoading: isScheduleLoading } = useGetMealSchedule(hasMealFeature)
  const { data: todaySelections = [], isLoading: isSelectionsLoading } = useGetStudentSelections(
    todayDateStr,
    todayDateStr
  )
  const { data: currentBills = [], isLoading: isBillsLoading } = useGetBills({ demand: 'current' })
  const { data: complaints = [], isLoading: isComplaintsLoading } = useGetStudentComplaints(hasComplaintFeature)

  // ── Derived Summaries ────────────────────────────────────────────────
  const displayRoomName = useMemo(() => {
    if (myRoom?.roomName) return myRoom.roomName
    if (typeof user?.room === 'object' && user?.room?.roomName) return user.room.roomName
    if (typeof user?.room === 'string' && !/^[0-9a-fA-F]{24}$/.test(user.room)) return user.room
    return 'Room Pending'
  }, [myRoom, user?.room])

  const mealNames = schedule?.mealNames?.length ? schedule.mealNames : ['Breakfast', 'Lunch', 'Dinner']
  const todayMenuItems = schedule?.menu?.[todayDayName] || []
  const timings = schedule?.selectionTiming || []

  // Count how many meals are reserved/claimed for today
  const reservedCount = todaySelections.filter(
    (s) => s.date === todayDateStr && ((s.count ?? 0) > 0 || s.hasSelected)
  ).length
  const totalMealsCount = mealNames.length

  // Total current unpaid dues
  const totalRemainingDues = currentBills.reduce((acc, curr) => acc + (curr.remainingBill || 0), 0)

  // Active open complaints
  const activeTickets = complaints.filter((c) => c.status !== 'Resolved')

  const studentShortcuts = extractQuickActions(navMain)

  // ── Determine Contextual Insight ──────────────────────────────────────
  let contextualInsight = { text: 'You are all set for the day! 🎉', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' }
  if (totalRemainingDues > 0) {
    contextualInsight = { text: `You have Rs. ${totalRemainingDues.toLocaleString()} in pending dues.`, color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' }
  } else if (reservedCount > 0) {
    contextualInsight = { text: `You have ${reservedCount} meals reserved for today.`, color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' }
  } else if (activeTickets.length > 0) {
    contextualInsight = { text: `You have ${activeTickets.length} active complaints being processed.`, color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' }
  }

  return (
    <div className="space-y-6">
      {/* 1. Student Welcome Header (Pulse Insight Card) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border shadow-xs group">
        {/* Breathing Glowing Orb */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 blur-[80px] animate-[pulse_4s_ease-in-out_infinite]" />

        {/* Animated Border gradient on bottom */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">

          <div className="space-y-4">
            {/* Contextual Subtitle */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/80 dark:bg-muted/50 border border-border/80 shadow-xs backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${contextualInsight.dot} animate-pulse`} />
                <span className={contextualInsight.color}>{contextualInsight.text}</span>
              </span>

              {hasResidenceFeature && (
                <button
                  type="button"
                  onClick={() => navigate('/app/my-room')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 transition-colors cursor-pointer"
                >
                  <BedDouble className="h-3.5 w-3.5" />
                  {displayRoomName}
                </button>
              )}
            </div>

            {/* Greeting Text */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                <span className="text-muted-foreground mr-2">{getGreeting()},</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-400 dark:to-cyan-400">
                  {user?.name || 'Student'}
                </span>
              </h1>
            </div>

            {/* Sub-info */}
            <p className="text-sm text-muted-foreground font-medium">
              Resident of <strong className="text-foreground">{hostelName}</strong> &bull; Roll / ID:{' '}
              <span className="font-mono text-foreground font-bold bg-muted px-1.5 py-0.5 rounded-md border border-border/50">
                {user?.id || user?._id || 'STD-8841'}
              </span>
            </p>
          </div>

          {/* Action Area */}
          {hasQrFeature && (
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 mt-2 md:mt-0">
              <Button
                size="lg"
                onClick={() => navigate('/app/meals/qr')}
                className="gap-2.5 shadow-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl cursor-pointer hover:scale-105 transition-all border-none"
              >
                <QrCode className="h-5 w-5" />
                Mark Attendance
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Real-Time Connected Stat Highlights (Mobile-Optimized Compact Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* A. Today's Mess Status (Emerald Green) */}
        {hasMealFeature && (
          <div
            onClick={() => navigate('/app/meals/schedule')}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
          >
            <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Utensils className="h-4 w-4" />
              </div>
              <div className="sm:hidden">
                <div className="text-xs font-semibold text-foreground">
                  Today&apos;s Meals
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  {todayDayName} Menu
                </div>
              </div>
              <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Today&apos;s Meals ({todayDayName})
              </span>
            </div>

            <div className="text-right sm:text-left shrink-0 sm:shrink">
              <div className="text-sm sm:text-2xl font-bold text-foreground">
                {isSelectionsLoading || isScheduleLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 ml-auto sm:ml-0" />
                ) : (
                  `${reservedCount}/${totalMealsCount} Reserved`
                )}
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
                {reservedCount === totalMealsCount
                  ? 'All meals reserved for today'
                  : 'Tap to update today\'s selections'}
              </p>
            </div>
          </div>
        )}

        {/* B. Monthly Dues & Pending Balance (Purple / Violet) */}
        <div
          onClick={() => navigate('/app/my-bills')}
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-purple-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
        >
          <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="sm:hidden">
              <div className="text-xs font-semibold text-foreground">
                Current Dues
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">
                Billing Cycle
              </div>
            </div>
            <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Current Cycle Dues
            </span>
          </div>

          <div className="text-right sm:text-left shrink-0 sm:shrink">
            <div className="text-sm sm:text-2xl font-bold text-foreground">
              {isBillsLoading ? (
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-28 ml-auto sm:ml-0" />
              ) : totalRemainingDues > 0 ? (
                <span className="text-purple-600 dark:text-purple-400 font-mono">
                  Rs. {totalRemainingDues.toLocaleString()}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">All Clear</span>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
              {totalRemainingDues > 0
                ? `${currentBills.length} active invoice statement(s)`
                : 'Zero outstanding dues on file'}
            </p>
          </div>
        </div>

        {/* C. Maintenance & Complaints (Warm Amber) */}
        {hasComplaintFeature && (
          <div
            onClick={() => navigate('/app/complaints')}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/80 hover:border-amber-500/40 transition-all shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-2"
          >
            <div className="flex items-center gap-2.5 sm:justify-between w-auto sm:w-full">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="sm:hidden">
                <div className="text-xs font-semibold text-foreground">
                  Complaints
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  Hostel Tickets
                </div>
              </div>
              <span className="hidden sm:inline text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Maintenance Tickets
              </span>
            </div>

            <div className="text-right sm:text-left shrink-0 sm:shrink">
              <div className="text-sm sm:text-2xl font-bold text-foreground">
                {isComplaintsLoading ? (
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 ml-auto sm:ml-0" />
                ) : activeTickets.length > 0 ? (
                  `${activeTickets.length} Open`
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">All Resolved</span>
                )}
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground/80 font-normal mt-0.5">
                {activeTickets.length > 0
                  ? `Latest: ${activeTickets[0].category} (${activeTickets[0].status})`
                  : 'Zero pending maintenance issues'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Today's Real Dining Schedule & Quick Launch Grid */}
      <div
        className={`grid grid-cols-1 ${hasMealFeature ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4 items-start`}
      >
        {/* Today's Real Meals from Weekly Schedule */}
        {hasMealFeature && (
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/80 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Today&apos;s Dining Schedule ({todayDayName})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Live menu and attendance reservation for today
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/meals/schedule')}
                className="text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                Weekly Menu <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {isScheduleLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {mealNames.map((mealName, idx) => {
                  const menuItem =
                    todayMenuItems[idx] ||
                    todayMenuItems.find(
                      (m: any) =>
                        (m.mealType || m.type || '').toLowerCase() ===
                        mealName.toLowerCase()
                    )
                  const servingItem = schedule?.servingTiming?.[idx]
                  const dishName =
                    menuItem?.meal && menuItem.meal !== 'none'
                      ? menuItem.meal
                      : menuItem?.name || 'Standard Menu'
                  const price = menuItem?.price || 0
                  const servingWindow = servingItem?.start && servingItem?.end
                    ? `${servingItem.start} – ${servingItem.end}`
                    : (mealName.toLowerCase().includes('breakfast')
                      ? '07:30 AM – 10:00 AM'
                      : mealName.toLowerCase().includes('lunch')
                        ? '12:30 PM – 03:00 PM'
                        : '07:30 PM – 10:00 PM')

                  // Find today's student selection/attendance record
                  const selRecord = todaySelections.find(
                    (s: StudentSelectionRecord) =>
                      s.mealType.toLowerCase() === mealName.toLowerCase() &&
                      s.date === todayDateStr
                  )

                  const hasEaten = selRecord?.attendance?.hasEaten === true
                  const isReserved =
                    Boolean(selRecord?.hasSelected || selRecord?.selection?.hasSelected) &&
                    (selRecord?.count || selRecord?.selection?.count || 0) > 0

                  return (
                    <div
                      key={mealName}
                      className="p-4 rounded-xl border border-border/70 bg-muted/20 flex flex-col justify-between gap-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{mealName}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasEaten
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isReserved
                                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {hasEaten ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Claimed
                              </>
                            ) : isReserved ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                                Reserved (x{selRecord?.count || selRecord?.selection?.count || 1})
                              </>
                            ) : (
                              'Not Reserved'
                            )}
                          </span>
                        </div>

                        <div className="text-xs text-foreground font-medium pt-1">
                          {dishName}
                        </div>

                        {price > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            Rs. {price}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-medium">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Serving: {servingWindow}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Resident Portal Shortcuts */}
        <div className="rounded-2xl bg-card border border-border/80 p-5 space-y-3.5 shadow-xs">
          <h2 className="text-base font-semibold text-foreground">Resident Portal</h2>
          {studentShortcuts.length > 0 ? (
            <div className="space-y-2">
              {studentShortcuts.map((s, idx) => {
                const Icon = s.icon
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (s.url && s.url !== '#') {
                        navigate(s.url)
                      }
                    }}
                    className={`p-3.5 rounded-xl border border-border/80 ${s.borderHover} hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${s.color} ${s.hoverBg}`}
                      >
                        <Icon className="h-4 w-4 transition-colors group-hover:text-white dark:group-hover:text-white" />
                      </div>
                      <div>
                        <div
                          className={`text-xs font-semibold text-foreground ${s.hoverText} transition-colors`}
                        >
                          {s.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground ${s.hoverText} group-hover:translate-x-0.5 transition-transform`}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              No additional portals available in your plan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
