import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

export interface MealPriceItem {
  id: string
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | string
  mealInfo: {
    name: string
    price: number | ''
  }
  attendanceCount: number
  selectionCount: number
}

export interface MealPriceDayGroup {
  date: string
  meals: MealPriceItem[]
}

export interface MealPricesResponse {
  success: boolean
  data: MealPriceDayGroup[]
}

export type BillFieldType =
  | 'meal_attendance'
  | 'previous_unpaid'
  | 'static'
  | 'percentage'
  | 'multiplier'

export interface BillFieldConfig {
  id: string
  name: string
  type: BillFieldType
  value: number | null
  linkedFieldId: string | null
  included?: boolean
}

export interface BillingSettings {
  customCharges: BillFieldConfig[]
  isDynamicBillingEnabled: boolean
}

export interface BillingSettingsResponse {
  success: boolean
  data: BillingSettings
}

/**
 * Fetch aggregated meal records with attendance & current prices for a date range.
 */
export const useGetMealPricesForBilling = (
  startDate: string | null,
  endDate: string | null,
  enabled: boolean = true
) => {
  return useQuery<MealPriceDayGroup[]>({
    queryKey: ['meal-prices', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return []
      const response = await apiClient.get<MealPricesResponse>(
        `/billing/meal-prices?startDate=${startDate}&endDate=${endDate}`
      )
      return response.data?.data || []
    },
    enabled: enabled && Boolean(startDate && endDate),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

/**
 * Fetch billing settings including custom charge methods from the hostel configuration.
 */
export const useGetBillingSettings = () => {
  return useQuery<BillingSettings>({
    queryKey: ['billing-settings'],
    queryFn: async () => {
      const response = await apiClient.get<BillingSettingsResponse>('/billing/settings')
      return response.data?.data || { customCharges: [], isDynamicBillingEnabled: true }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
