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
    (s) => s.date === todayDateStr && (s.count > 0 || s.hasSelected)
  ).length
  const totalMealsCount = mealNames.length

  // Total current unpaid dues
  const totalRemainingDues = currentBills.reduce((acc, curr) => acc + (curr.remainingBill || 0), 0)

  // Active open complaints
  const activeTickets = complaints.filter((c) => c.status !== 'Resolved')

  const studentShortcuts = extractQuickActions(navMain)

  return (
    <div className="space-y-6">
      {/* 1. Student Welcome Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Student Resident
            </span>
            {hasResidenceFeature && (
              <button
                type="button"
                onClick={() => navigate('/app/my-room')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 transition-colors cursor-pointer"
              >
                <BedDouble className="h-3 w-3" />
                {displayRoomName}
              </button>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              &bull; {todayDayName}, {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Student'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Resident of <strong className="text-foreground">{hostelName}</strong> &bull; Roll / ID:{' '}
            <span className="font-mono text-foreground font-semibold">
              {user?.id || user?._id || 'STD-8841'}
            </span>
          </p>
        </div>

        {hasQrFeature && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              size="sm"
              onClick={() => navigate('/app/meals/qr')}
              className="gap-2 shadow-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        )}
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
                  const dishName =
                    (menuItem as any)?.meal ||
                    (menuItem as any)?.name ||
                    "Chef's Choice Daily Special"
                  const price = menuItem?.price || 0
                  const timeWindow = timings[idx] || 'Scheduled Dining Session'

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
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              hasEaten
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

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{timeWindow}</span>
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
