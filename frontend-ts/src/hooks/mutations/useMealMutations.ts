import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { MealSchedule, MenuItem } from '../queries/useMealQueries'
import { toast } from 'sonner'

export interface UpdateMealSchedulePayload {
  groupId?: string | null
  numberOfMeals?: number
  mealNames?: string[]
  selectionTiming?: string[]
  maxMealSelection?: number
  menu?: {
    Monday?: MenuItem[]
    Tuesday?: MenuItem[]
    Wednesday?: MenuItem[]
    Thursday?: MenuItem[]
    Friday?: MenuItem[]
    Saturday?: MenuItem[]
    Sunday?: MenuItem[]
  }
  status?: 'active' | 'inactive'
}

export interface MealSelectionItem {
  date: string
  mealType: string
  mealInfo: {
    name: string
    price: number
  }
  count: number
}

export interface BulkSelectMealsPayload {
  selections: MealSelectionItem[]
}

// ── 1. Update Meal Schedule Mutation (Admin/Manager) ─────────────────────
export const useUpdateMealSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateMealSchedulePayload) => {
      const { data } = await apiClient.put<{
        success: boolean
        message: string
        data: MealSchedule
      }>('/meal-schedule', payload)
      return data
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['mealSchedule'] })
      toast.success(res.message || 'Weekly meal schedule updated successfully!')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update meal schedule.'
      toast.error(msg)
    },
  })
}

// ── 2. Student Bulk Select Meals Mutation ────────────────────────────────
export const useBulkSelectMeals = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BulkSelectMealsPayload) => {
      const { data } = await apiClient.post<{
        status: string
        message: string
        data: { count: number }
      }>('/attendance/selections', payload)
      return data
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['studentSelections'] })
      toast.success(res.message || 'Meal selections saved successfully!')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to save meal selections.'
      toast.error(msg)
    },
  })
}
