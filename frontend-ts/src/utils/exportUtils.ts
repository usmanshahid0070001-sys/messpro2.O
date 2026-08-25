import * as XLSX from 'xlsx';
import type { HostelTenant, SubscriptionPlan } from '@/hooks/queries/useSuperadminQueries';

export const exportHostelsToExcel = (hostels: HostelTenant[]) => {
  const excelData = hostels.map((hostel) => ({
    'Hostel ID': hostel._id,
    'Hostel Name': hostel.name,
    'Subdomain': hostel.subdomain ? `${hostel.subdomain}.messpro.app` : 'N/A',
    'Location': hostel.location || 'N/A',
    'Plan': typeof hostel.plan === 'object' ? hostel.plan?.name : hostel.plan || 'Standard',
    'Status': hostel.status || 'Active',
    'Max Meals / Day': hostel.maxMealSelection || 4,
    'Auto-Verification': (hostel.settings as any)?.autoMealVerification !== false ? 'Enabled' : 'Disabled',
    'Subscription Expires At': hostel.subscriptionExpiresAt
      ? new Date(hostel.subscriptionExpiresAt).toLocaleDateString()
      : 'Lifetime / Trial',
    'Created Date': hostel.createdAt ? new Date(hostel.createdAt).toLocaleDateString() : 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hostel Tenants');
  XLSX.writeFile(workbook, `MessPro_Hostel_Tenants_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportPlansToExcel = (plans: SubscriptionPlan[]) => {
  const excelData = plans.map((plan) => ({
    'Plan Name': plan.name,
    'Price / Month ($)': plan.price,
    'Max Students': plan.limits?.maxStudents === -1 ? 'Unlimited' : plan.limits?.maxStudents,
    'Max Managers': plan.limits?.maxManagers === -1 ? 'Unlimited' : plan.limits?.maxManagers,
    'Status': plan.isActive ? 'Active' : 'Inactive',
    'Features Count': plan.features?.length || 0,
    'Description': plan.description || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscription Plans');
  XLSX.writeFile(workbook, `MessPro_Plans_${new Date().toISOString().split('T')[0]}.xlsx`);
};
