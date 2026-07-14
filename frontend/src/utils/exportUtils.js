import * as XLSX from 'xlsx';

export const exportHostelsToExcel = (hostels) => {
  // Format the data for excel
  const excelData = hostels.map((hostel) => ({
    'ID': hostel._id,
    'Name': hostel.name,
    'Location': hostel.location || 'N/A',
    'Admin': 'Superadmin', // Using the same placeholder/value as the UI
    'Plan': typeof hostel.plan === 'object' ? hostel.plan?.name : (hostel.plan || 'Basic'),
    'Status': hostel.status || 'Active',
  }));

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenants');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'Tenants_List.xlsx');
};
