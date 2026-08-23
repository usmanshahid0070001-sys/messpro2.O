import { useState, useMemo, useDeferredValue } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Users, UserPlus } from 'lucide-react'
import type { RootState } from '@/store'
import { useGetUsers } from '@/hooks/queries/useUserQueries'
import { useGetMyHostel } from '@/hooks/queries/useHostelQueries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// Import extracted sub-components
import MetricsHeader from './components/MetricsHeader'
import FilterSection from './components/FilterSection'
import UserTable from './components/UserTable'
import AddUserModal from './components/AddUserModal'
import EditUserModal from './components/EditUserModal'

export default function ManageUsers() {
  const { user: currentUser } = useSelector((s: RootState) => s.auth)
  const currentRole = currentUser?.role || 'student'

  const { data: users = [], isLoading: usersLoading } = useGetUsers()
  const { data: hostel, isLoading: hostelLoading } = useGetMyHostel(currentRole)

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Sorting State
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('asc')

  // Modal Open states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  // Counts for tabs
  const counts = useMemo(() => {
    const res = { total: users.length, admin: 0, manager: 0, student: 0 }
    users.forEach((u) => {
      if (u.role === 'admin') res.admin++
      else if (u.role === 'manager') res.manager++
      else if (u.role === 'student') res.student++
    })
    return res
  }, [users])

  // Filter list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        (u.id && u.id.toLowerCase().includes(deferredSearchTerm.toLowerCase()))

      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, deferredSearchTerm, roleFilter])

  // Sort list alphabetically if selected
  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers]
    if (sortOrder === 'asc') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOrder === 'desc') {
      list.sort((a, b) => b.name.localeCompare(a.name))
    }
    return list
  }, [filteredUsers, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedUsers.slice(start, start + itemsPerPage)
  }, [sortedUsers, currentPage])

  // Dynamic custom registration fields configured for this hostel
  const customFieldConfigs = useMemo(() => {
    return hostel?.customRegistrationFields || []
  }, [hostel])

  const handleToggleSort = () => {
    setSortOrder((current) => {
      if (current === 'none') return 'asc'
      if (current === 'asc') return 'desc'
      return 'none'
    })
  }

  const handleExportCSV = () => {
    if (sortedUsers.length === 0) {
      toast.error('No users to export')
      return
    }

    const headers = ['Name', 'Email', 'Role', 'Roll Number']
    const customFieldNames = customFieldConfigs.slice(0, 2).map((c: any) => c.name)
    const allHeaders = [...headers, ...customFieldNames, 'Room']

    const csvRows = [allHeaders.join(',')]

    sortedUsers.forEach((user) => {
      const customFieldValues = customFieldConfigs.slice(0, 2).map((config: any) => {
        const field = (user.additionalInfo || []).find((f: any) => f.key === config.name)
        return field?.value || ''
      })

      const row = [
        `"${user.name.replace(/"/g, '""')}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.id || ''}"`,
        ...customFieldValues.map((v: string) => `"${v.replace(/"/g, '""')}"`),
        `"${user.room ? user.room.roomName : ''}"`,
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Hostel_Members_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Excel/CSV Sheet exported successfully')
  }

  const openEditModal = (user: any) => {
    setSelectedUser(user)
    setIsEditOpen(true)
  }

  if (usersLoading || hostelLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12 w-full max-w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Manage Members & Staff
            </h1>
            <p className="text-xs text-muted-foreground">
              Oversee hostel residents, operational managers, and role permissions.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 self-start sm:self-auto h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer rounded-xl"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <MetricsHeader
        users={users}
        currentRole={currentRole}
        maxStudents={hostel?.plan?.limits?.maxStudents}
      />

      {/* Search and Tab Filter Section */}
      <FilterSection
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(val) => {
          setRoleFilter(val)
          setCurrentPage(1)
        }}
        currentRole={currentRole}
        sortOrder={sortOrder}
        onToggleSort={handleToggleSort}
        onExport={handleExportCSV}
        counts={counts}
      />

      {/* Main Directory Table / Mobile Card List */}
      <UserTable
        paginatedUsers={paginatedUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sortedUsers.length}
        onPageChange={setCurrentPage}
        onEditClick={openEditModal}
        customFieldConfigs={customFieldConfigs}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        currentRole={currentRole}
        hostel={hostel}
      />

      {/* Edit User/Permissions Modal */}
      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        hostel={hostel}
      />
    </div>
  )
}