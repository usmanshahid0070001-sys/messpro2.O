import { useState, useMemo, useDeferredValue } from 'react'
import { FileText } from 'lucide-react'
import { useGetAdminComplaints, type Complaint } from '@/hooks/queries/useComplaintQueries'
import ComplaintMetrics from './components/ComplaintMetrics'
import ComplaintFilterBar from './components/ComplaintFilterBar'
import ComplaintTable from './components/ComplaintTable'
import ComplaintDetailModal from './components/ComplaintDetailModal'
import { toast } from 'sonner'

export default function ComplainManagement() {
  
  // Status filter state for query (defaults to 'all' = unresolved in backend)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Data fetching
  const {
    data: complaints = [],
    isLoading,
    isRefetching,
    refetch,
  } = useGetAdminComplaints(statusFilter)

  // Local filters
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [intensityFilter, setIntensityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'intensity'>('newest')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal selection
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Unique categories from fetched complaints
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    complaints.forEach((c) => {
      if (c.category) set.add(c.category)
    })
    return Array.from(set).sort()
  }, [complaints])

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase()
    return complaints.filter((c) => {
      // Search match
      const roomNumber =
        typeof c.roomid === 'object' && c.roomid !== null ? c.roomid.roomNumber : ''
      const block =
        typeof c.roomid === 'object' && c.roomid !== null ? c.roomid.block || '' : ''
      const studentName =
        typeof c.studentId === 'object' && c.studentId !== null ? c.studentId.name || '' : ''

      const matchSearch =
        !term ||
        c.roll_number.toLowerCase().includes(term) ||
        studentName.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        roomNumber.toLowerCase().includes(term) ||
        block.toLowerCase().includes(term)

      // Intensity match
      const matchIntensity =
        intensityFilter === 'all' || c.intensity.toLowerCase() === intensityFilter.toLowerCase()

      // Category match
      const matchCategory =
        categoryFilter === 'all' || c.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchSearch && matchIntensity && matchCategory
    })
  }, [complaints, deferredSearchTerm, intensityFilter, categoryFilter])

  // Sort complaints
  const sortedComplaints = useMemo(() => {
    const list = [...filteredComplaints]
    const intensityWeight: Record<string, number> = {
      Urgent: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortOrder === 'intensity') {
      list.sort((a, b) => (intensityWeight[b.intensity] || 0) - (intensityWeight[a.intensity] || 0))
    }

    return list
  }, [filteredComplaints, sortOrder])

  // Paginate complaints
  const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage)
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedComplaints.slice(start, start + itemsPerPage)
  }, [sortedComplaints, currentPage, itemsPerPage])

  const handleToggleSort = () => {
    setSortOrder((curr) => {
      if (curr === 'newest') return 'oldest'
      if (curr === 'oldest') return 'intensity'
      return 'newest'
    })
  }

  const handleExportExcel = async () => {
    if (sortedComplaints.length === 0) {
      toast.error('No complaints to export')
      return
    }

    try {
      const XLSX = await import('xlsx')
      const dataToExport = sortedComplaints.map((c) => {
        const studentName =
          typeof c.studentId === 'object' && c.studentId !== null ? c.studentId.name : 'N/A'
        const roomNum =
          typeof c.roomid === 'object' && c.roomid !== null ? c.roomid.roomNumber : 'N/A'
        const block =
          typeof c.roomid === 'object' && c.roomid !== null ? c.roomid.block || 'N/A' : 'N/A'
        const date = new Date(c.createdAt).toLocaleString()

        return {
          'Ticket ID': c._id,
          'Student Name': studentName,
          'Roll Number': c.roll_number,
          Category: c.category,
          Intensity: c.intensity,
          Status: c.status,
          Room: roomNum,
          Block: block,
          Description: c.description,
          'Reported Date': date,
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints')

      const fileName = `Complaints_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success(`Exported ${sortedComplaints.length} complaints to Excel (.xlsx)`)
    } catch (err: any) {
      toast.error('Export Failed', {
        description: err?.message || 'Could not generate Excel spreadsheet.',
      })
    }
  }

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-4 pb-10 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Complaint Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor student grievance tickets, assign maintenance, and resolve hostel issues.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <ComplaintMetrics complaints={complaints} />

      {/* Filter and Search Bar */}
      <ComplaintFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val)
          setCurrentPage(1)
        }}
        intensityFilter={intensityFilter}
        onIntensityFilterChange={(val) => {
          setIntensityFilter(val)
          setCurrentPage(1)
        }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(val) => {
          setCategoryFilter(val)
          setCurrentPage(1)
        }}
        availableCategories={availableCategories}
        sortOrder={sortOrder}
        onToggleSort={handleToggleSort}
        onExport={handleExportExcel}
        onRefresh={() => refetch()}
        isRefreshing={isLoading || isRefetching}
      />

      {/* Interactive Complaint Table */}
      <ComplaintTable
        paginatedComplaints={paginatedComplaints}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sortedComplaints.length}
        onPageChange={setCurrentPage}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Complaint Detail & Status Modal */}
      <ComplaintDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedComplaint(null)
        }}
        complaint={selectedComplaint}
      />
    </div>
  )
}
