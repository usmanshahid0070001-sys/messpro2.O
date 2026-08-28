import { useState, useMemo } from 'react'
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
  Zap,
  Droplets,
  Utensils,
  Wifi,
  Sparkles,
  BedDouble,
  Volume2,
  HelpCircle,
  Layers,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Minus,
  Loader2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useGetStudentComplaints,
  type ComplaintIntensity,
  type ComplaintStatus,
} from '@/hooks/queries/useComplaintQueries'
import {
  useCreateComplaint,
  useDeleteComplaint,
} from '@/hooks/mutations/useComplaintMutations'
import { ComplaintStatusBadge, ComplaintIntensityBadge } from './components/ComplaintStatusBadge'

const CATEGORY_PRESETS = [
  { id: 'Electricity', label: 'Electricity & Lights', icon: Zap, color: 'text-amber-500' },
  { id: 'Plumbing', label: 'Plumbing & Water', icon: Droplets, color: 'text-blue-500' },
  { id: 'Mess / Food', label: 'Mess & Food', icon: Utensils, color: 'text-emerald-500' },
  { id: 'WiFi / Internet', label: 'WiFi & Network', icon: Wifi, color: 'text-purple-500' },
  { id: 'Room Maintenance', label: 'Room & Furniture', icon: BedDouble, color: 'text-teal-500' },
  { id: 'Cleaning', label: 'Sanitation & Clean', icon: Sparkles, color: 'text-sky-500' },
  { id: 'Noise / Disturbance', label: 'Noise Disturbance', icon: Volume2, color: 'text-rose-500' },
  { id: 'Other', label: 'Other Issue', icon: HelpCircle, color: 'text-slate-500' },
]

const INTENSITIES: {
  level: ComplaintIntensity
  title: string
  desc: string
  icon: any
  border: string
  activeBg: string
  activeText: string
}[] = [
  {
    level: 'Low',
    title: 'Low',
    desc: 'Minor issue; no daily disruption',
    icon: Minus,
    border: 'border-slate-500/30',
    activeBg: 'bg-slate-500/10 border-slate-500',
    activeText: 'text-slate-600 dark:text-slate-400',
  },
  {
    level: 'Medium',
    title: 'Medium',
    desc: 'Standard maintenance or repair',
    icon: ArrowUpRight,
    border: 'border-sky-500/30',
    activeBg: 'bg-sky-500/10 border-sky-500',
    activeText: 'text-sky-600 dark:text-sky-400',
  },
  {
    level: 'High',
    title: 'High',
    desc: 'Disrupts daily routine or sleep',
    icon: ShieldAlert,
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500/10 border-amber-500',
    activeText: 'text-amber-600 dark:text-amber-400',
  },
  {
    level: 'Urgent',
    title: 'Urgent',
    desc: 'Immediate hazard, leak, or outage',
    icon: Flame,
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-500/10 border-rose-500',
    activeText: 'text-rose-600 dark:text-rose-400',
  },
]

export default function FileComplain() {
  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('Electricity')
  const [customCategory, setCustomCategory] = useState('')
  const [selectedIntensity, setSelectedIntensity] = useState<ComplaintIntensity>('Medium')
  const [description, setDescription] = useState('')

  // Filter State for Complaint History
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'resolved'>('all')

  // Queries & Mutations
  const { data: complaints = [], isLoading } = useGetStudentComplaints()
  const createComplaintMutation = useCreateComplaint()
  const deleteComplaintMutation = useDeleteComplaint()

  const maxChars = 80
  const remainingChars = maxChars - description.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalCategory =
      selectedCategory === 'Other' && customCategory.trim()
        ? customCategory.trim()
        : selectedCategory

    if (!description.trim()) return

    await createComplaintMutation.mutateAsync({
      category: finalCategory,
      intensity: selectedIntensity,
      description: description.trim(),
    })

    // Reset Form
    setDescription('')
    setCustomCategory('')
    setSelectedIntensity('Medium')
  }

  // Filtered student complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (historyFilter === 'active') {
        return c.status === 'Open' || c.status === 'Assigned' || c.status === 'In Progress'
      }
      if (historyFilter === 'resolved') {
        return c.status === 'Resolved'
      }
      return true
    })
  }, [complaints, historyFilter])

  // Active / Resolved counts
  const stats = useMemo(() => {
    let active = 0
    let resolved = 0
    complaints.forEach((c) => {
      if (c.status === 'Resolved') resolved++
      else active++
    })
    return { total: complaints.length, active, resolved }
  }, [complaints])

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 w-full max-w-full min-w-0">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Hostel Complaints & Helpdesk
            </h1>
            <p className="text-xs text-muted-foreground">
              Report maintenance issues, track grievance status, and manage your tickets.
            </p>
          </div>
        </div>

        {/* Quick Student Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 sm:py-2 rounded-xl bg-card border border-border flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <div className="text-[11px] sm:text-xs">
              <span className="text-muted-foreground">Active: </span>
              <span className="font-bold text-foreground font-mono">{stats.active}</span>
            </div>
          </div>

          <div className="px-3 py-1.5 sm:py-2 rounded-xl bg-card border border-border flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <div className="text-[11px] sm:text-xs">
              <span className="text-muted-foreground">Resolved: </span>
              <span className="font-bold text-foreground font-mono">{stats.resolved}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left / Top Column: File a New Complaint Form (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-foreground">File a New Complaint</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Preset Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Select Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_PRESETS.map((cat) => {
                  const isSelected = selectedCategory === cat.id
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500/30'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? 'text-amber-500' : cat.color}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>

              {selectedCategory === 'Other' && (
                <div className="pt-2">
                  <Input
                    placeholder="Specify your custom category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="text-xs h-9"
                    required
                  />
                </div>
              )}
            </div>

            {/* Urgency / Intensity Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Urgency Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTENSITIES.map((item) => {
                  const isSelected = selectedIntensity === item.level
                  const Icon = item.icon
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedIntensity(item.level)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${item.activeBg} ring-1 ring-amber-500/30 font-semibold`
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? item.activeText : 'text-foreground'
                          }`}
                        >
                          {item.title}
                        </span>
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isSelected ? item.activeText : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                        {item.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Brief Description <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10px] sm:text-[11px] font-mono ${
                    remainingChars < 10
                      ? 'text-rose-500 font-bold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {remainingChars} chars left
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
                placeholder="E.g., Fan regulator is burnt in room 204. Need replacement."
                rows={3}
                required
                className="w-full rounded-xl border border-border bg-background p-2.5 sm:p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createComplaintMutation.isPending || !description.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 sm:h-10 gap-2 shadow-xs transition-all cursor-pointer"
            >
              {createComplaintMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Student's Complaint History & Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-card border border-border rounded-2xl shadow-xs gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground">My Grievance History</h2>
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('active')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  historyFilter === 'active'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('resolved')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  historyFilter === 'resolved'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Resolved ({stats.resolved})
              </button>
            </div>
          </div>

          {/* Complaints List */}
          {isLoading ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading your complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No complaints filed</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                You currently have no complaints under this filter. If you face any issues in the hostel, file a ticket on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => {
                const isDeletable = c.status === 'Open'
                const formattedDate = new Date(c.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                // Status stage calculation for progress visualization
                const steps: ComplaintStatus[] = ['Open', 'Assigned', 'In Progress', 'Resolved']
                const currentStepIndex = steps.indexOf(c.status)

                return (
                  <div
                    key={c._id}
                    className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-amber-500/30 transition-all space-y-3"
                  >
                    {/* Top Row: Category & Badges & Delete */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground">
                            {c.category}
                          </span>
                          <ComplaintIntensityBadge intensity={c.intensity} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
                          <Calendar className="w-3 h-3" />
                          <span>Filed on {formattedDate}</span>
                          <span>•</span>
                          <span className="font-mono">#{c._id.slice(-6).toUpperCase()}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <ComplaintStatusBadge status={c.status} />

                        {isDeletable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteComplaintMutation.isPending}
                            onClick={() => deleteComplaintMutation.mutate(c._id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                            title="Withdraw Open Complaint"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <p className="text-xs text-foreground bg-muted/20 p-2.5 sm:p-3 rounded-xl border border-border/50 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Progress Step Indicator */}
                    <div className="pt-2 border-t border-border/50">
                      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 items-center">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex
                          const isCurrent = idx === currentStepIndex

                          return (
                            <div key={step} className="flex flex-col items-center gap-1 text-center">
                              <div
                                className={`h-1.5 w-full rounded-full transition-all ${
                                  isCompleted
                                    ? isCurrent
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                    : 'bg-muted'
                                }`}
                              />
                              <span
                                className={`text-[9px] sm:text-[10px] truncate max-w-full ${
                                  isCurrent
                                    ? 'font-bold text-foreground'
                                    : isCompleted
                                    ? 'text-muted-foreground'
                                    : 'text-muted-foreground/50'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
