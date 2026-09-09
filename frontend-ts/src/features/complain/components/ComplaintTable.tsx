import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ComplaintStatusBadge, ComplaintIntensityBadge } from './ComplaintStatusBadge'
import type { Complaint, ComplaintStatus } from '@/hooks/queries/useComplaintQueries'
import { useUpdateComplaintStatus } from '@/hooks/mutations/useComplaintMutations'

interface ComplaintTableProps {
  paginatedComplaints: Complaint[]
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onViewDetails: (complaint: Complaint) => void
  isLoading?: boolean
}

export const formatRoomDisplay = (roomid: any) => {
  if (!roomid) return 'General / No Room'
  if (typeof roomid === 'object') {
    const num = roomid.roomNumber || roomid.roomName || roomid.name || roomid.number
    if (num && num !== 'undefined') {
      return `Room ${num}${roomid.block ? ` (${roomid.block})` : ''}`
    }
    return 'General / No Room'
  }
  if (typeof roomid === 'string' && roomid.trim() && roomid !== 'undefined') {
    // If it's an ObjectId string (24 chars), don't show "Room 6451..."
    if (roomid.length === 24 && /^[0-9a-fA-F]+$/.test(roomid)) {
      return 'General / No Room'
    }
    return `Room ${roomid}`
  }
  return 'General / No Room'
}

export default function ComplaintTable({
  paginatedComplaints,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetails,
  isLoading = false,
}: ComplaintTableProps) {
  const updateStatusMutation = useUpdateComplaintStatus()

  const handleQuickStatusChange = (e: React.MouseEvent, id: string, status: ComplaintStatus) => {
    e.stopPropagation()
    updateStatusMutation.mutate({ id, status })
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading complaints...</p>
      </div>
    )
  }

  if (paginatedComplaints.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground">No complaints found</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No complaints match your current search and filter criteria. Try adjusting or resetting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* ── MOBILE / TABLET CARD VIEW (Visible on screens < md) ── */}
      <div className="block md:hidden divide-y divide-border">
        {paginatedComplaints.map((c) => {
          const studentName =
            typeof c.studentId === 'object' && c.studentId !== null ? c.studentId.name : null
          const roomStr = formatRoomDisplay(c.roomid)
          const timeStr = new Date(c.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <div
              key={c._id}
              onClick={() => onViewDetails(c)}
              className="p-4 space-y-2.5 hover:bg-muted/30 active:bg-muted/50 transition-colors cursor-pointer"
            >
              {/* Top Row: Roll No, Student Name, Category, Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-foreground bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {c.roll_number}
                    </span>
                    {studentName && (
                      <span className="text-xs font-semibold text-foreground">
                        {studentName}
                      </span>
                    )}
                    <span className="text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {c.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-teal-500 shrink-0" />
                      {roomStr}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                      {timeStr}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ComplaintIntensityBadge intensity={c.intensity} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="focus:outline-none rounded-full transition-transform active:scale-95"
                        title="Change status"
                      >
                        <ComplaintStatusBadge status={c.status} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-card border-border">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleQuickStatusChange(e, c._id, 'Open')}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                        <span>Open</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleQuickStatusChange(e, c._id, 'Assigned')}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                        <span>Assigned</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleQuickStatusChange(e, c._id, 'In Progress')}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>In Progress</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleQuickStatusChange(e, c._id, 'Resolved')}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Resolved</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Description preview */}
              <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50 line-clamp-2 leading-relaxed">
                {c.description}
              </p>

              {/* Tap for details prompt */}
              <div className="flex items-center justify-end text-[11px] font-medium text-amber-600 dark:text-amber-400 gap-1">
                <span>View Full Details</span>
                <Eye className="w-3 h-3" />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW (Visible on screens >= md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reported</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedComplaints.map((c) => {
              const studentName =
                typeof c.studentId === 'object' && c.studentId !== null ? c.studentId.name : null
              const roomStr = formatRoomDisplay(c.roomid)
              const timeStr = new Date(c.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })

              return (
                <tr
                  key={c._id}
                  onClick={() => onViewDetails(c)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {/* Student Info */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20 shrink-0">
                        {studentName ? studentName[0].toUpperCase() : (c.roll_number?.slice(-2) || '#')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground text-xs truncate max-w-[140px]">
                          {studentName || c.roll_number}
                        </span>
                        {studentName && (
                          <span className="font-mono text-[10px] text-muted-foreground truncate">
                            {c.roll_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
                      {c.category}
                    </span>
                  </td>

                  {/* Room */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      {roomStr}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-xs text-foreground truncate" title={c.description}>
                      {c.description}
                    </p>
                  </td>

                  {/* Intensity / Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <ComplaintIntensityBadge intensity={c.intensity} />
                  </td>

                  {/* Status & Quick Change Dropdown */}
                  <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="focus:outline-none rounded-full transition-transform hover:scale-105"
                          title="Click to quickly change status"
                        >
                          <ComplaintStatusBadge status={c.status} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44 bg-card border-border">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleQuickStatusChange(e, c._id, 'Open')}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                          <span>Open</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleQuickStatusChange(e, c._id, 'Assigned')}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          <span>Assigned</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleQuickStatusChange(e, c._id, 'In Progress')}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>In Progress</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleQuickStatusChange(e, c._id, 'Resolved')}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Resolved</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                    {timeStr}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(c)}
                      className="h-7 px-2 text-xs gap-1.5 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground gap-2">
        <div className="text-center sm:text-left text-[11px] sm:text-xs">
          Showing <span className="font-semibold text-foreground">{paginatedComplaints.length}</span> of{' '}
          <span className="font-semibold text-foreground">{totalCount}</span> complaints
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 font-medium text-foreground text-xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
