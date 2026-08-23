import { useState } from 'react'
import {
  X,
  User,
  Building2,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check,
  Loader2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComplaintStatusBadge, ComplaintIntensityBadge } from './ComplaintStatusBadge'
import type { Complaint, ComplaintStatus } from '@/hooks/queries/useComplaintQueries'
import { useUpdateComplaintStatus } from '@/hooks/mutations/useComplaintMutations'

interface ComplaintDetailModalProps {
  isOpen: boolean
  onClose: () => void
  complaint: Complaint | null
}

export default function ComplaintDetailModal({
  isOpen,
  onClose,
  complaint,
}: ComplaintDetailModalProps) {
  const updateStatusMutation = useUpdateComplaintStatus()
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('')

  if (!isOpen || !complaint) return null

  const currentStatus = (selectedStatus || complaint.status) as ComplaintStatus

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (newStatus === complaint.status) return
    setSelectedStatus(newStatus)
    try {
      await updateStatusMutation.mutateAsync({
        id: complaint._id,
        status: newStatus,
      })
    } catch {
      setSelectedStatus('')
    }
  }

  const roomDisplay =
    typeof complaint.roomid === 'object' && complaint.roomid !== null
      ? `Room ${complaint.roomid.roomNumber}${complaint.roomid.block ? ` (${complaint.roomid.block})` : ''}`
      : 'General / No Room'

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusOptions: { status: ComplaintStatus; desc: string; icon: any }[] = [
    { status: 'Open', desc: 'Registered and awaiting action', icon: AlertCircle },
    { status: 'Assigned', desc: 'Staff allocated to inspect', icon: User },
    { status: 'In Progress', desc: 'Active repair ongoing', icon: Clock },
    { status: 'Resolved', desc: 'Issue fixed and closed', icon: CheckCircle2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Complaint Details</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                Ticket #{complaint._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Status & Priority Ribbon */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Current Status
              </span>
              <ComplaintStatusBadge status={currentStatus} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Urgency Level
              </span>
              <ComplaintIntensityBadge intensity={complaint.intensity} />
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Description
            </label>
            <div className="p-3 sm:p-4 rounded-xl bg-background border border-border text-xs sm:text-sm text-foreground leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card space-y-0.5 sm:space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Student Roll No
              </span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-foreground">{complaint.roll_number}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card space-y-0.5 sm:space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                Category
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">{complaint.category}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card space-y-0.5 sm:space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-500" />
                Room / Block
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">{roomDisplay}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card space-y-0.5 sm:space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Reported On
              </span>
              <p className="text-xs font-medium text-foreground">{formattedDate}</p>
            </div>
          </div>

          {/* Quick Status Update Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Update Ticket Status</span>
              {updateStatusMutation.isPending && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const isSelected = currentStatus === opt.status
                const Icon = opt.icon
                return (
                  <button
                    key={opt.status}
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusChange(opt.status)}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-border bg-background hover:bg-muted/50 hover:border-muted-foreground/30'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                          }`}
                        >
                          {opt.status}
                        </p>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 sm:h-9 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
