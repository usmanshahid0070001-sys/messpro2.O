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

export interface CustomChargeItem {
  name: string
  chargeType: 'addition' | 'multiple' | 'percentage' | string
  value: number
  target: 'mess_bill' | 'unpaid_bill' | 'none' | string
  calculatedAmount: number
}

export interface StudentReference {
  _id: string
  id: string
  name: string
  email?: string
}

export interface Bill {
  _id: string
  hostelId: string
  studentId: StudentReference | null
  rollNumber: string
  isGuest: boolean
  billingPeriod: {
    startDate: string
    endDate: string
  }
  baseMessBill: number
  previousUnpaidArrears: number
  customCharges: CustomChargeItem[]
  total: number
  paidBill: number
  remainingBill: number
  status: 'Paid' | 'Adjusted in Balance' | 'Unpaid' | string
  createdAt?: string
  updatedAt?: string
}

export interface BillsResponse {
  success: boolean
  results: number
  data: Bill[]
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

export interface UseGetBillsParams {
  month?: string | null
  demand?: 'current' | null
  status?: string | null
}

/**
 * Fetch bills with support for current cycle or monthly archive, and status filtering.
 */
export const useGetBills = (params?: UseGetBillsParams, enabled: boolean = true) => {
  const { month, demand, status } = params || {}

  return useQuery<Bill[]>({
    queryKey: ['bills', { month, demand, status }],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (demand) {
        searchParams.append('demand', demand)
      } else if (month) {
        searchParams.append('month', month)
      }
      if (status && status !== 'all') {
        searchParams.append('status', status)
      }

      const queryString = searchParams.toString()
      const url = `/billing${queryString ? `?${queryString}` : ''}`
      const response = await apiClient.get<BillsResponse>(url)
      return response.data?.data || []
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

