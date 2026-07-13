import { useState, useMemo } from 'react';
import { Plus, Settings, Search, Building2 } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { useHostels } from '../../hooks/queries/useSuperadminQueries';
import CreateHostelModal from '../../components/superadmin/CreateHostelModal';
import HostelSettingsModal from '../../components/superadmin/HostelSettingsModal';
import AddHostelUserModal from '../../components/superadmin/AddHostelUserModal';
import { UserPlus } from 'lucide-react';

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

  return (
    <div className="space-y-6 p-4"> 
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white">Tenants</h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">
            Manage all registered hostels, subscriptions, and administrative access.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-xl text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#050505]"
        >
          <Plus className="w-4 h-4" />
          Create Hostel
        </button>
      </div>

      {/* Main Roster Section */}
      <div className="flex flex-col gap-4">
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111111] dark:text-white">
            <Building2 className="w-4 h-4 text-[#737373] dark:text-[#888888]" />
            All Tenants 
            <span className="text-[#737373] dark:text-[#888888] font-medium">({hostels.length})</span>
          </div>

          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#a3a3a3]" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#222222] rounded-xl text-sm placeholder:text-[#a3a3a3] text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid gap-4 border-b border-[#f5f5f5] dark:border-[#1a1a1a] bg-[#fafafa] dark:bg-[#111111] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#737373] dark:text-[#888888] grid-cols-[100px_minmax(250px,1fr)_120px_120px_120px_80px]">
              <span>ID</span>
              <span>Hostel</span>
              <span>Admin</span>
              <span>Plan</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#f5f5f5] dark:divide-[#1a1a1a]">
              {loading ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
                  <p className="text-sm font-medium text-[#737373] dark:text-[#888888]">Loading hostels...</p>
                </div>
              ) : filteredHostels.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Building2 className="w-8 h-8 text-[#e5e5e5] dark:text-[#333333] mb-3" />
                  <p className="text-sm font-semibold text-[#111111] dark:text-white">
                    {searchQuery ? "No hostels found" : "No hostels created yet"}
                  </p>
                  <p className="text-xs font-medium text-[#737373] mt-1">
                    {searchQuery ? `We couldn't find any match for "${searchQuery}"` : "Get started by creating your first hostel."}
                  </p>
                </div>
              ) : (
                filteredHostels.map((hostel) => (
                  <div key={hostel._id} className="grid gap-4 px-6 py-4 text-sm grid-cols-[100px_minmax(250px,1fr)_120px_120px_120px_80px] hover:bg-[#fafafa] dark:hover:bg-[#111111] transition-colors items-center group">
                    <span className="font-mono text-xs font-semibold text-[#a3a3a3] dark:text-[#555555]">
                      {hostel._id.slice(-6).toUpperCase()}
                    </span>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#111111] dark:text-white truncate" title={hostel.name}>
                        {hostel.name}
                      </span>
                      <span className="text-xs font-medium text-[#737373] dark:text-[#888888] truncate mt-0.5" title={hostel.location}>
                        {hostel.location}
                      </span>
                    </div>

                    <span className="font-medium text-[#737373] dark:text-[#888888]">Superadmin</span>
                    
                    <span className="font-medium text-[#111111] dark:text-[#dddddd]">
                      {typeof hostel.plan === 'object' ? hostel.plan?.name : (hostel.plan || 'Basic')}
                    </span>
                    
                    <div>
                      <StatusBadge tone={hostel.status === 'Active' ? 'success' : hostel.status === 'Suspended' ? 'danger' : 'warning'}>
                        {hostel.status || 'Active'}
                      </StatusBadge>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedHostelForUser(hostel)}
                        className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                        aria-label="Add User"
                        title="Add Admin/Manager"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedHostelSettings(hostel)}
                        className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                        aria-label="Manage settings"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
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
