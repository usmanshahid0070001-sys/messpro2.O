import { useState, useMemo } from'react';
import { Plus, Settings, Search, Building2 } from'lucide-react';
import StatusBadge from'../../features/ui/StatusBadge';
import { useHostels } from'../../hooks/queries/useSuperadminQueries';
import CreateHostelModal from'./components/CreateHostelModal';
import HostelSettingsModal from'./components/HostelSettingsModal';
import AddHostelUserModal from'./components/AddHostelUserModal';
import { UserPlus, Download } from'lucide-react';
import { exportHostelsToExcel } from'../../utils/exportUtils';

export default function ManageTenants() {
 const { data, isLoading: loading, error } = useHostels();
 const hostels = data?.data || [];

 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [selectedHostelSettings, setSelectedHostelSettings] = useState(null);
 const [selectedHostelForUser, setSelectedHostelForUser] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');

 if (error) {
 console.error(error);
 }

 // Filter logic
 const filteredHostels = useMemo(() => {
 if (!searchQuery.trim()) return hostels;
 return hostels.filter((h) =>
 h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 h.location?.toLowerCase().includes(searchQuery.toLowerCase())
 );
 }, [hostels, searchQuery]);

 const handleExport = () => {
 if (window.confirm('Are you sure you want to download the tenants list as an Excel sheet?')) {
 exportHostelsToExcel(filteredHostels);
 }
 };

 return (
 <div className="space-y-6 p-4 lg:p-8">
 {/* Page Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0">
 <h1 className="text-2xl font-black tracking-tight text-foreground">Tenants</h1>
 <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
 Manage all registered hostels, subscriptions, and administrative access.
 </p>
 </div>

 </div>

 {/* Main Roster Section */}
 <div className="flex flex-col gap-4">
 {/* Table Controls Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

 {/* Left: Title & Count Badge */}
 <div className="flex items-center gap-2.5 shrink-0">
 <div className="p-1.5 bg-secondary rounded-lg border border-border dark:border-border">
 <Building2 className="w-4 h-4 text-foreground dark:text-foreground"/>
 </div>
 <h2 className="text-sm font-bold text-foreground">
 All Tenants
 </h2>
 <span className="flex items-center justify-center px-2 py-0.5 bg-secondary border border-border dark:border-border rounded-full text-[11px] font-semibold text-foreground dark:text-foreground">
 {hostels.length}
 </span>
 </div>

 {/* Right: Actions Group */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

 {/* Search Input */}
 <div className="relative w-full sm:w-[280px]">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-foreground dark:text-foreground"/>
 </div>
 <input
 type="text"
 placeholder="Search by name or location..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="block w-full pl-9 pr-4 py-2 bg-background border border-border dark:border-border rounded-xl text-sm placeholder:text-foreground dark:placeholder:text-foreground text-foreground focus:outline-none focus:border-border focus:ring-1 focus:ring-ring dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
 />
 </div>

 {/* Download Button */}
 <button
 onClick={handleExport}
 title="Download Excel sheet of the hostel table"
 className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-foreground hover:text-foreground hover:bg-background transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
 >
 <Download className="w-4 h-4 shrink-0"/>
 <span>Download Excel</span>
 </button>

 {/* Create Hostel Button */}
 <button
 onClick={() => setIsCreateModalOpen(true)}
 className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
 >
 <Plus className="w-4 h-4"/>
 Create Hostel
 </button>

 </div>
 </div>

 {/* Table Container */}
 <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-border dark:border-border bg-background shadow-sm">
 <div className="min-w-[800px]">
 {/* Table Header */}
 <div className="grid gap-4 border-b border-border dark:border-border bg-background dark:bg-background px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground dark:text-foreground grid-cols-[100px_minmax(250px,1fr)_120px_120px_120px_80px]">
 <span>ID</span>
 <span>Hostel</span>
 <span>Admin</span>
 <span>Plan</span>
 <span>Status</span>
 <span className="text-right">Actions</span>
 </div>

 {/* Table Body */}
 <div className="divide-y divide-border dark:divide-border">
 {loading ? (
 <div className="p-12 text-center flex flex-col items-center gap-3">
 <div className="w-5 h-5 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin"/>
 <p className="text-sm font-medium text-foreground dark:text-foreground">Loading hostels...</p>
 </div>
 ) : filteredHostels.length === 0 ? (
 <div className="p-12 text-center flex flex-col items-center">
 <Building2 className="w-8 h-8 text-foreground dark:text-foreground mb-3"/>
 <p className="text-sm font-semibold text-foreground">
 {searchQuery ?"No hostels found":"No hostels created yet"}
 </p>
 <p className="text-xs font-medium text-foreground mt-1">
 {searchQuery ? `We couldn't find any match for"${searchQuery}"` :"Get started by creating your first hostel."}
 </p>
 </div>
 ) : (
 filteredHostels.map((hostel) => (
 <div key={hostel._id} className="grid gap-4 px-6 py-4 text-sm grid-cols-[100px_minmax(250px,1fr)_120px_120px_120px_80px] hover:bg-background dark:hover:bg-background transition-colors items-center group">
 <span className="font-mono text-xs font-semibold text-foreground dark:text-foreground">
 {hostel._id.slice(-6).toUpperCase()}
 </span>

 <div className="flex flex-col min-w-0">
 <span className="font-semibold text-foreground truncate"title={hostel.name}>
 {hostel.name}
 </span>
 <span className="text-xs font-medium text-foreground dark:text-foreground truncate mt-0.5"title={hostel.location}>
 {hostel.location}
 </span>
 </div>

 <span className="font-medium text-foreground dark:text-foreground">Superadmin</span>

 <span className="font-medium text-foreground dark:text-foreground">
 {typeof hostel.plan ==='object'? hostel.plan?.name : (hostel.plan ||'Basic')}
 </span>

 <div>
 <StatusBadge tone={hostel.status ==='Active'?'success': hostel.status ==='Suspended'?'danger':'warning'}>
 {hostel.status ||'Active'}
 </StatusBadge>
 </div>

 <div className="flex justify-end gap-2">
 <button
 onClick={() => setSelectedHostelForUser(hostel)}
 className="p-2 rounded-lg text-foreground hover:text-foreground dark:hover:text-white hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
 aria-label="Add User"
 title="Add Admin/Manager"
 >
 <UserPlus className="w-4 h-4"/>
 </button>
 <button
 onClick={() => setSelectedHostelSettings(hostel)}
 className="p-2 rounded-lg text-foreground hover:text-foreground dark:hover:text-white hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
 aria-label="Manage settings"
 title="Settings"
 >
 <Settings className="w-4 h-4"/>
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>

 <CreateHostelModal
 isOpen={isCreateModalOpen}
 onClose={() => setIsCreateModalOpen(false)}
 />

 <HostelSettingsModal
 isOpen={!!selectedHostelSettings}
 onClose={() => setSelectedHostelSettings(null)}
 hostel={selectedHostelSettings}
 />

 <AddHostelUserModal
 isOpen={!!selectedHostelForUser}
 onClose={() => setSelectedHostelForUser(null)}
 hostel={selectedHostelForUser}
 />
 </div>
 );
}
