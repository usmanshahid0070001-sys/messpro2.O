import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

export interface MenuItem {
  meal: string
  price: number
}

export interface MealSchedule {
  _id?: string
  hostelId: string
  groupId?: string | null
  numberOfMeals: number
  mealNames: string[]
  selectionTiming: string[]
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
}

// ── 1. Get Hostel Meal Schedule ──────────────────────────────────────────
export const useGetMealSchedule = () => {
  return useQuery({
    queryKey: ['mealSchedule'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: MealSchedule | null }>('/meal-schedule')
      return data.data
    },
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

