import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

export interface MenuItem {
  meal?: string
  name?: string
  price: number
}

export interface TimeWindow {
  start?: string
  end?: string
}

export interface MealSchedule {
  _id?: string
  hostelId: string
  groupId?: string | null
  numberOfMeals: number
  mealNames: string[]
  selectionTiming: Array<TimeWindow | string>
  servingTiming?: Array<TimeWindow>
  menu: {
    Monday: MenuItem[]
    Tuesday: MenuItem[]
    Wednesday: MenuItem[]
    Thursday: MenuItem[]
    Friday: MenuItem[]
    Saturday: MenuItem[]
    Sunday: MenuItem[]
  }
  maxMealSelection: number
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface StudentSelectionRecord {
  _id: string
  date: string
  mealType: string
  selection?: {
    hasSelected: boolean
    count: number
  }
  attendance?: {
    hasEaten: boolean
    count: number
    method: string
  }
  hasSelected?: boolean
  count?: number
}

// ── 1. Get Hostel Meal Schedule ──────────────────────────────────────────
export const useGetMealSchedule = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['mealSchedule'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: MealSchedule | null }>('/meal-schedule')
      return data.data
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ── 2. Get Student's Selections for Date Range ───────────────────────────
export const useGetStudentSelections = (startDate: string, endDate: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['studentSelections', startDate, endDate],
    queryFn: async () => {
      const { data } = await apiClient.get<{ status: string; data: StudentSelectionRecord[] }>(
        `/attendance/selections?startDate=${startDate}&endDate=${endDate}`
      )
      return data.data
    },
    enabled: Boolean(startDate && endDate && enabled),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export interface StudentMonthlyMealRecord {
  _id: string
  date: string
  mealType: string
  mealInfo: {
    name: string
    price: number
  }
  selection?: {
    hasSelected: boolean
    count: number
  }
  attendance?: {
    hasEaten: boolean
    count: number
    method?: string
  }
  isGuest?: boolean
}

export interface StudentMonthlyRecordsResponse {
  status: string
  data: StudentMonthlyMealRecord[]
}

// ── 3. Get Student's Monthly Meal Records for History & Billing ─────────
export const useGetStudentMonthlyRecords = (month: string, enabled: boolean = true) => {
  return useQuery<StudentMonthlyMealRecord[]>({
    queryKey: ['studentMonthlyRecords', month],
    queryFn: async () => {
      if (!month) return []
      const { data } = await apiClient.get<StudentMonthlyRecordsResponse>(
        `/attendance/monthly?month=${month}`
      )
      return data.data || []
    },
    enabled: Boolean(month && enabled),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

// ── 4. Meal Control & Violations Sheet ─────────────────────────────────
export interface MealViolationRecord {
  _id: string
  date: string
  mealType: string
  rollNumber: string
  studentName?: string
  selectionCount: number
  attendanceCount: number
  missedMeals: number
  extraMeals: number
  violationType: 'Extra/Unselected Eaten' | 'Missed/Wasted' | string
}

export interface MealViolationsResponse {
  status: string
  message: string
  results: number
  data: MealViolationRecord[]
}

export const useGetMealViolations = (date: string, enabled: boolean = true) => {
  return useQuery<MealViolationRecord[]>({
    queryKey: ['mealViolations', date],
    queryFn: async () => {
      if (!date) return []
      const { data } = await apiClient.get<MealViolationsResponse>(
        `/meal-schedule/violations?date=${encodeURIComponent(date)}`
      )
      return data.data || []
    },
    enabled: Boolean(date && enabled),
    staleTime: 1000 * 30, // 30 seconds
  })
}

// ── 5. Manager Live Daily Overview ───────────────────────────────────────
export interface LiveOverviewStudentItem {
  name: string
  rollNumber: string
  isGuest: boolean
  attendanceCount: number
  selectionCount: number
  hasAttended: boolean
  isSelected: boolean
}

export interface LiveOverviewMealSlot {
  summary: {
    totalSelections: number
    totalAttendance: number
  }
  data: LiveOverviewStudentItem[]
}

export interface ManagerLiveOverviewData {
  date: string
  mealTypes: string[]
  data: Record<string, LiveOverviewMealSlot>
}

export const useGetManagerLiveOverview = (date: string, enabled: boolean = true) => {
  return useQuery<ManagerLiveOverviewData>({
    queryKey: ['managerLiveOverview', date],
    queryFn: async () => {
      if (!date) return { date: '', mealTypes: [], data: {} }
      const { data } = await apiClient.get<{ status: string; data: ManagerLiveOverviewData }>(
        `/attendance/live-overview?date=${encodeURIComponent(date)}`
      )
      return data.data
    },
    enabled: Boolean(date && enabled),
    staleTime: 1000 * 15, // 15 seconds
  })
}

