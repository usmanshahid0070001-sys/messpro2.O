import { useQuery } from '@tanstack/react-query';
import {
  managerGetDailyCounts,
  managerGetMenu,
  managerGetStudentBill,
  managerGetAllBills,
} from '../../api/endpoints/manager.api';

// ─── MANAGER QUERY HOOKS ────────────────────────────────────────────────────

export const useManagerDailyCounts = (date) => {
  return useQuery({
    queryKey: ['dailyCounts', date],
    queryFn: () => managerGetDailyCounts(date),
    enabled: !!date,
    refetchInterval: 30000, // 30 seconds for live data
    staleTime: 1000 * 30,
  });
};

export const useManagerMenu = () => {
  return useQuery({
    queryKey: ['managerMenu'],
    queryFn: managerGetMenu,
  });
};

export const useManagerStudentBill = (rollNumber) => {
  return useQuery({
    queryKey: ['managerStudentBill', rollNumber],
    queryFn: () => managerGetStudentBill(rollNumber),
    enabled: !!rollNumber,
  });
};

export const useManagerAllBills = () => {
  return useQuery({
    queryKey: ['managerAllBills'],
    queryFn: managerGetAllBills,
  });
};
