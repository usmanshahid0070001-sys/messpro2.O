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

export const exportUsersToExcel = (users: any[], customFieldConfigs: any[] = [], hostelName?: string) => {
  const excelData = users.map((user) => {
    const row: Record<string, any> = {
      'Roll Number / ID': user.id || 'N/A',
      'Full Name': user.name || 'N/A',
      'Email Address': user.email || 'N/A',
      'Role': user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student',
      'Room Number': user.room ? (typeof user.room === 'object' ? user.room.roomName : user.room) : 'Unassigned',
    };

    // Dynamically include all custom fields (CNIC, Domicile, etc.)
    customFieldConfigs.forEach((config: any) => {
      const field = (user.additionalInfo || []).find(
        (f: any) => f.key?.trim().toLowerCase() === config.name?.trim().toLowerCase()
      );
      row[config.name] = field?.value || '';
    });

    // If there are other additionalInfo items not in customFieldConfigs, include them too
    (user.additionalInfo || []).forEach((f: any) => {
      if (f.key && !row[f.key]) {
        row[f.key] = f.value || '';
      }
    });

    row['Agreement Status'] = user.agreement === 'signed' ? 'Signed' : 'Pending';
    row['Joined Date'] = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-fit column widths
  const colKeys = Object.keys(excelData[0] || {});
  worksheet['!cols'] = colKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...excelData.map((r) => String(r[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
  });

  const workbook = XLSX.utils.book_new();
  const sheetName = (hostelName || 'Hostel').substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${hostelName ? hostelName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Hostel'}_Members_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
};
