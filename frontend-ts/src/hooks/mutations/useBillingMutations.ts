import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { toast } from 'sonner'
import type { BillFieldConfig } from '../queries/useBillingQueries'

export interface MealPriceUpdatePayload {
  date: string
  mealType: string
  oldName: string
  newName: string
  newPrice: number | string
}

export interface UpdateMealPricesRequest {
  updates: MealPriceUpdatePayload[]
}

/**
 * Mutation to update meal prices for historical consumed meals.
 */
export const useUpdateMealPrices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: MealPriceUpdatePayload[]) => {
      const response = await apiClient.put<{ success: boolean; message: string; data: any }>(
        '/billing/meal-prices',
        { updates }
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meal-prices'] })
      toast.success('Meal Prices Saved', {
        description: data.message || 'Meal prices updated successfully.',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update meal prices.'
      toast.error('Save Failed', {
        description: message,
      })
    },
  })
}

export interface UpdateBillingSettingsPayload {
  customCharges: BillFieldConfig[]
  isDynamicBillingEnabled: boolean
}

/**
 * Mutation to update billing custom charges & configuration settings.
 */
export const useUpdateBillingSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateBillingSettingsPayload) => {
      const response = await apiClient.put<{ success: boolean; message: string; data: any }>(
        '/billing/settings',
        payload
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['billing-settings'] })
      toast.success('Settings Saved', {
        description: data.message || 'Billing configuration saved successfully.',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save billing settings.'
      toast.error('Settings Save Failed', {
        description: message,
      })
    },
  })
}

export interface BackendCustomChargePayload {
  name: string
  chargeType: 'addition' | 'multiple' | 'percentage'
  value: number
  target: 'mess_bill' | 'unpaid_bill' | 'none'
}

export interface GenerateBillsPayload {
  billingPeriod: {
    startDate: string
    endDate: string
  }
  customCharges?: BackendCustomChargePayload[]
}

export interface GenerateBillsResponse {
  status: string
  message: string
  results: number
  studentBillsCount?: number
  guestBillsCount?: number
  data: any[]
}

/**
 * Mutation to execute batch bill generation for all active students and guests.
 */
export const useGenerateBills = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: GenerateBillsPayload) => {
      const response = await apiClient.post<GenerateBillsResponse>(
        '/billing/generate',
        payload
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] })
      toast.success('Bills Generated Successfully', {
        description: data.message || `Generated ${data.results ?? 0} bills.`,
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate bills.'
      toast.error('Generation Failed', {
        description: message,
      })
    },
  })
}
