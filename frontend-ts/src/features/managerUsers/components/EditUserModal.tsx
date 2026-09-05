import { useState, useMemo, useEffect } from 'react'
import {
  X,
  Loader2,
  Settings2,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Check,
  Sparkles,
  Lock,
  Headphones,
  Settings,
} from 'lucide-react'
import { useUpdateUser } from '@/hooks/mutations/useUserMutations'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import SupportUpgradeModal, { type SupportContextReason } from '@/components/SupportUpgradeModal'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: ManageableUser | null
  hostel: any
  currentRole?: string
}

/**
 * Normalizes permission and feature name strings to snake_case format.
 */
const normalize = (str: string) => (str || '').toLowerCase().replace(/[\s-_]+/g, '_')

/**
 * Feature Aliases for robust matching against backend plan features.
 */
const FEATURE_ALIASES: Record<string, string[]> = {
  user_management: ['user_management', 'manage_users', 'users', 'user_staff_management'],
  complaint_management: ['complaint_management', 'complaints', 'complaint_tickets', 'maintenance_complaint_tickets'],
  residence_management: ['residence_management', 'rooms', 'room_allocation', 'residence_room_allocation'],
  service_management: ['service_management', 'sanitation', 'room_sanitation_cleaning', 'sanitation_room_service'],
  meal_settings: ['meal_settings', 'mess_settings', 'meal_schedule_menu', 'weekly_menu_meal_configuration'],
  meal_control: ['meal_control', 'meal_restrictions_dining_control', 'dining_control', 'meal_control_blocking'],
  bill_management: ['bill_management', 'dues', 'dues_management', 'student_bills'],
  bill_generation: ['bill_generation', 'invoices', 'bill_generation_invoicing'],
  manual_attendance: ['manual_attendance', 'manual_register_attendance'],
  qr_attendance: ['qr_attendance', 'qr_code_attendance', 'dynamic_qr_attendance_scanner'],
  biometric_attendance: ['biometric_attendance', 'biometric_scanner_sync', 'biometric_gate_terminal_sync'],
}

/**
 * Full master list of MessPro Admin Features that can be delegated to managers and students.
 */
export const MESSPRO_ADMIN_FEATURES = [
  {
    id: 'user_management',
    label: 'User Management',
    desc: 'Invite, edit, and configure hostel member accounts and directory',
  },
  {
    id: 'complaint_management',
    label: 'Complaint Management',
    desc: 'Track and resolve resident maintenance and facility tickets',
  },
  {
    id: 'residence_management',
    label: 'Residence Management',
    desc: 'Room allocation, capacity planning, and bed assignments',
  },
  {
    id: 'service_management',
    label: 'Service Management',
    desc: 'Daily room housekeeping, cleaning logs, and sanitation status',
  },
  {
    id: 'meal_settings',
    label: 'Mess Settings',
    desc: 'Weekly menu schedule, meal timings, and dining hours',
  },
  {
    id: 'meal_control',
    label: 'Meal Control',
    desc: 'Dining privilege enforcement and counter dining verification',
  },
  {
    id: 'bill_management',
    label: 'Bill Management',
    desc: 'Student dues ledger, payment recording, and balance tracking',
  },
  {
    id: 'bill_generation',
    label: 'Bill Generation',
    desc: 'Monthly fee invoices and automated student bill calculation',
  },
  {
    id: 'manual_attendance',
    label: 'Manual Attendance',
    desc: 'Manual roll-call and register mess attendance logging',
  },
  {
    id: 'qr_attendance',
    label: 'QR Code Attendance',
    desc: 'Digital student QR token scanning at dining hall',
  },
  {
    id: 'biometric_attendance',
    label: 'Biometric Attendance',
    desc: 'Hardware biometric scanner terminal sync and attendance logs',
  },
] as const

/**
 * Returns role badge colors and display icons for existing profiles.
 */
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'superadmin':
      return {
        label: 'Super Admin',
        color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
        icon: ShieldCheck,
      }
    case 'admin':
      return {
        label: 'Administrator',
        color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        icon: ShieldCheck,
      }
    case 'manager':
      return {
        label: 'Manager',
        color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        icon: UserCheck,
      }
    case 'student':
    default:
      return {
        label: 'Student Resident',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        icon: GraduationCap,
      }
  }
}

/**
 * EditUserModal - Dialog for updating member profiles, dynamic registration metadata,
 * and fine-grained feature permissions.
 */
export default function EditUserModal({
  isOpen,
  onClose,
  user,
  hostel,
  currentRole = 'student',
}: EditUserModalProps) {
  const updateUserMutation = useUpdateUser()

  const [name, setName] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [permissions, setPermissions] = useState<string[]>([])

  // Support & Upgrade Modal state
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [supportReason, setSupportReason] = useState<SupportContextReason>('upgrade')
  const [supportFeatureName, setSupportFeatureName] = useState<string | undefined>(undefined)

  const isAdmin = currentRole === 'admin' || currentRole === 'superadmin'

  const customFieldConfigs = useMemo(() => hostel?.customRegistrationFields || [], [hostel])

  // Applicable features list based on target user's role:
  // - Students see all features EXCEPT bill_management & bill_generation
  // - Managers see all 11 features
  const applicableFeatures = useMemo(() => {
    if (!user) return []
    if (user.role === 'student') {
      return MESSPRO_ADMIN_FEATURES.filter(
        (f) => f.id !== 'bill_management' && f.id !== 'bill_generation'
      )
    }
    return MESSPRO_ADMIN_FEATURES
  }, [user])

  // Check whether a permission is included and enabled in the active hostel plan
  const getPermissionPlanStatus = (permKey: string) => {
    const planFeatures = hostel?.plan?.features || []
    const aliases = FEATURE_ALIASES[permKey] || [permKey]

    const matched = planFeatures.find((f: any) => {
      const rawName = typeof f === 'string' ? f : f?.name
      const norm = normalize(rawName)
      return aliases.some(
        (a) => norm === normalize(a) || norm.includes(normalize(a)) || normalize(a).includes(norm)
      )
    })

    if (!matched) {
      return { isIncluded: false, isEnabled: false }
    }

    const isEnabled = typeof matched === 'string' ? true : Boolean(matched.isEnabled)
    return { isIncluded: true, isEnabled }
  }

  // Permissions that are currently active/enabled in the hostel's plan
  const activeEnabledFeatures = useMemo(() => {
    return applicableFeatures.filter((f) => getPermissionPlanStatus(f.id).isEnabled)
  }, [applicableFeatures, hostel])

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name)
      setPermissions(user.permissions || [])

      const initFields: Record<string, string> = {}
      customFieldConfigs.forEach((config: any) => {
        const saved = (user.additionalInfo || []).find((f: any) => f.key === config.name)
        initFields[config.name] = saved ? saved.value : ''
      })
      setCustomFields(initFields)
    }
  }, [isOpen, user, customFieldConfigs])

  if (!isOpen || !user) return null

  const roleInfo = getRoleBadge(user.role)
  const RoleIcon = roleInfo.icon

  const handleTogglePermission = (permKey: string) => {
    const status = getPermissionPlanStatus(permKey)
    if (!status.isEnabled) return
    setPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    )
  }

  const handleSelectAllPerms = () => {
    setPermissions(activeEnabledFeatures.map((f) => f.id))
  }

  const handleClearAllPerms = () => {
    setPermissions([])
  }

  const openSupportModal = (reason: SupportContextReason, featName?: string) => {
    setSupportReason(reason)
    setSupportFeatureName(featName)
    setIsSupportOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    if (user.role === 'student') {
      const isPakistan = (location?: string) => {
        if (!location) return true
        const loc = location.toLowerCase()
        return (
          loc.includes('karachi') ||
          loc.includes('pakistan') ||
          loc.includes('pk') ||
          loc.includes('asia/karachi')
        )
      }

      for (const config of customFieldConfigs) {
        const val = (customFields[config.name] || '').trim()
        if (config.isRequired && !val) {
          toast.error(`Custom field "${config.name}" is required`)
          return
        }

        if (config.name.toLowerCase() === 'cnic' && val) {
          if (isPakistan(hostel?.location)) {
            const pkrCnicRegex = /^\d{5}-\d{7}-\d$/
            if (!pkrCnicRegex.test(val)) {
              toast.error('CNIC format must be XXXXX-XXXXXXX-X (e.g. 36501-7728634-5)')
              return
            }
          }
        }
      }
    }

    const additionalInfoPayload = Object.entries(customFields).map(([key, value]) => ({
      key,
      value: (value ?? '').toString().trim(),
    }))

    const payload: any = {
      name: name.trim(),
      additionalInfo: additionalInfoPayload,
    }

    if (isAdmin && (user.role === 'manager' || user.role === 'student')) {
      payload.permissions = permissions
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user._id,
        payload,
      })
      onClose()
    } catch {
      // Error is caught and surfaced via toast notification in useUpdateUser
      // Modal stays open so the user doesn't lose entered inputs
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Configure Profile</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${roleInfo.color}`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleUpdate} className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {/* Member Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Profile Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <Input
                  value={user.email}
                  disabled
                  className="h-9 text-xs bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {user.role === 'student' && user.id && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Roll Number / University ID
                </label>
                <Input
                  value={user.id}
                  disabled
                  className="h-9 text-xs bg-muted/50 font-mono text-muted-foreground cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Dynamic Custom Registration Fields */}
          {user.role === 'student' && customFieldConfigs.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Additional Registration Fields
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFieldConfigs.map((config: any) => (
                  <div key={config.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {config.name} {config.isRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <Input
                      placeholder={
                        config.name.toLowerCase() === 'cnic'
                          ? '35201-1234567-1'
                          : `Enter ${config.name.toLowerCase()}`
                      }
                      value={customFields[config.name] || ''}
                      onChange={(e) =>
                        setCustomFields((prev) => ({ ...prev, [config.name]: e.target.value }))
                      }
                      className="h-9 text-xs"
                      required={config.isRequired}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions Section (Only Visible to Admin / Superadmin) */}
          {isAdmin && (user.role === 'manager' || user.role === 'student') && (
            <div className="space-y-3.5 pt-2 border-t border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {user.role === 'student'
                      ? 'Student Administrative Permissions'
                      : 'Manager Permissions'}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {user.role === 'student'
                      ? 'Grant administrative privileges to this student (e.g. Mess Secretary, Residence Proctor).'
                      : 'Customize granted feature gates for this manager.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllPerms}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Select All Active
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllPerms}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Support & Upgrade Info Banner */}
              <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-[11px] text-foreground font-medium truncate">
                    Explore all MessPro features. Need plan upgrades or support?
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openSupportModal('upgrade')}
                  className="h-7 px-2.5 text-[11px] font-semibold border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer rounded-lg shrink-0 gap-1"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Support & Upgrades</span>
                </Button>
              </div>

              {/* All MessPro Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {applicableFeatures.map((feat) => {
                  const isChecked = permissions.includes(feat.id)
                  const planStatus = getPermissionPlanStatus(feat.id)

                  // ── Case 1: Active & Enabled in Plan ──
                  if (planStatus.isEnabled) {
                    return (
                      <label
                        key={feat.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-purple-500/40 bg-purple-500/5 ring-1 ring-purple-500/20'
                            : 'border-border/70 bg-background hover:bg-muted/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(feat.id)}
                          className="mt-0.5 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                        />
                        <div className="min-w-0 select-none flex-1">
                          <span className="text-xs font-semibold text-foreground block leading-tight">
                            {feat.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
                            {feat.desc}
                          </span>
                        </div>
                      </label>
                    )
                  }

                  // ── Case 2: In Plan Tier but Turned OFF in Hostel Configurations ──
                  if (planStatus.isIncluded && !planStatus.isEnabled) {
                    return (
                      <div
                        key={feat.id}
                        className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={false}
                            disabled
                            className="mt-0.5 h-4 w-4 rounded text-muted-foreground opacity-50 cursor-not-allowed"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {feat.label}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                Disabled in Config
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
                              {feat.desc}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300">
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3 shrink-0" />
                            <span>Turn on from Configurations first to assign this</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // ── Case 3: Not Included in Current Plan Tier ──
                  return (
                    <div
                      key={feat.id}
                      className="p-2.5 rounded-xl border border-border bg-muted/30 flex flex-col justify-between gap-2 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled
                          className="mt-0.5 h-4 w-4 rounded text-muted-foreground opacity-40 cursor-not-allowed"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {feat.label}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-muted text-muted-foreground border border-border flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Plan Upgrade Required</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
                            {feat.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                        <span className="text-[10px] text-muted-foreground italic">
                          Not included in active plan
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openSupportModal('upgrade', feat.label)}
                          className="h-6 px-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-md gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Upgrade Plan</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleUpdate}
            disabled={updateUserMutation.isPending || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold gap-1.5 cursor-pointer"
          >
            {updateUserMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Support, Renewal & Plan Upgrade Modal */}
      <SupportUpgradeModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        initialReason={supportReason}
        featureName={supportFeatureName}
      />
    </div>
  )
}
