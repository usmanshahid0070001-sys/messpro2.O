import { useState, useMemo, useEffect } from 'react'
import {
  X,
  Loader2,
  Settings2,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useUpdateUser } from '@/hooks/mutations/useUserMutations'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: ManageableUser | null
  hostel: any
}

const normalize = (str: string) => (str || '').toLowerCase().replace(/[\s-_]+/g, '_')

const PERMISSION_CONFIG: Record<
  string,
  { label: string; desc: string; category: 'residence' | 'food' | 'attendance' | 'governance' }
> = {
  user_management: {
    label: 'Manage Users',
    desc: 'Invite, edit, and configure hostel member permissions',
    category: 'governance',
  },
  hostel_configuration: {
    label: 'Hostel Configuration',
    desc: 'Update hostel profile, branding, and registration fields',
    category: 'governance',
  },
  bill_management: {
    label: 'Bill Management',
    desc: 'Track student dues and payment reconciliation',
    category: 'governance',
  },
  bill_generation: {
    label: 'Bill Generation',
    desc: 'Generate monthly invoices and hostel fee bills',
    category: 'governance',
  },
  complaint_management: {
    label: 'Complaint Tickets',
    desc: 'Manage and resolve resident maintenance tickets',
    category: 'governance',
  },
  residence_management: {
    label: 'Residence Management',
    desc: 'Build rooms, allot beds, and manage hostel occupancy',
    category: 'residence',
  },
  service_management: {
    label: 'Sanitation & Room Service',
    desc: 'Track daily room cleaning and hygiene logs',
    category: 'residence',
  },
  meal_settings: {
    label: 'Meal Schedule & Menu',
    desc: 'Configure weekly menu and dining hours',
    category: 'food',
  },
  meal_control: {
    label: 'Meal Control & Blocking',
    desc: 'Block/unblock dining privileges based on dues',
    category: 'food',
  },
  manual_attendance: {
    label: 'Manual Attendance',
    desc: 'Record manual mess attendance logs',
    category: 'attendance',
  },
  qr_attendance: {
    label: 'QR Code Attendance',
    desc: 'Scan digital student QR tokens at dining hall',
    category: 'attendance',
  },
  biometric_attendance: {
    label: 'Biometric Scanner Sync',
    desc: 'Hardware device attendance synchronization',
    category: 'attendance',
  },
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'superadmin':
      return { label: 'Super Admin', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20', icon: ShieldCheck }
    case 'admin':
      return { label: 'Administrator', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20', icon: ShieldCheck }
    case 'manager':
      return { label: 'Manager', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20', icon: UserCheck }
    case 'student':
    default:
      return { label: 'Student Resident', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20', icon: GraduationCap }
  }
}

export default function EditUserModal({ isOpen, onClose, user, hostel }: EditUserModalProps) {
  const updateUserMutation = useUpdateUser()

  const [name, setName] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [permissions, setPermissions] = useState<string[]>([])

  const customFieldConfigs = useMemo(() => hostel?.customRegistrationFields || [], [hostel])

  const toggleablePermissions = useMemo(() => {
    if (!hostel?.plan?.features) return []
    const excludedNames = ['hostel_configuration', 'bill_management', 'bill_generation', 'meal_control']
    return hostel.plan.features
      .filter((f: any) => f.isEnabled && !excludedNames.includes(normalize(f.name)))
      .map((f: any) => normalize(f.name))
  }, [hostel])

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name)

      let userPerms = user.permissions || []
      if (user.role === 'manager' && userPerms.length === 0) {
        const defaultPerms: string[] = []
        if (toggleablePermissions.includes('meal_settings')) defaultPerms.push('meal_settings')
        if (toggleablePermissions.includes('qr_attendance')) defaultPerms.push('qr_attendance')
        userPerms = defaultPerms
      }
      setPermissions(userPerms)

      const initFields: Record<string, string> = {}
      customFieldConfigs.forEach((config: any) => {
        const saved = (user.additionalInfo || []).find((f: any) => f.key === config.name)
        initFields[config.name] = saved ? saved.value : ''
      })
      setCustomFields(initFields)
    }
  }, [isOpen, user, customFieldConfigs, toggleablePermissions])

  if (!isOpen || !user) return null

  const roleInfo = getRoleBadge(user.role)
  const RoleIcon = roleInfo.icon

  const handleTogglePermission = (permKey: string) => {
    setPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    )
  }

  const handleSelectAllPerms = () => {
    setPermissions([...toggleablePermissions])
  }

  const handleClearAllPerms = () => {
    setPermissions([])
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
        return loc.includes('karachi') || loc.includes('pakistan') || loc.includes('pk') || loc.includes('asia/karachi')
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

    if (user.role === 'manager' || user.role === 'student') {
      payload.permissions = permissions
    }

    await updateUserMutation.mutateAsync({
      id: user._id,
      payload,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
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
                <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${roleInfo.color}`}>
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
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
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

          {/* Permissions Section (Managers & Permitted Students) */}
          {(user.role === 'manager' || user.role === 'student') && toggleablePermissions.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {user.role === 'student' ? 'Student Administrative Permissions' : 'Manager Permissions'}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {user.role === 'student'
                      ? 'Grant administrative privileges to this student (e.g. Mess Secretary, Residence Proctor, Attendance Monitor).'
                      : 'Customize granted feature gates for this manager.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllPerms}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Select All
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {toggleablePermissions.map((permKey: string) => {
                  const info = PERMISSION_CONFIG[permKey] || {
                    label: permKey.replace(/_/g, ' '),
                    desc: 'Feature capability permission',
                  }
                  const isChecked = permissions.includes(permKey)

                  return (
                    <label
                      key={permKey}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-purple-500/40 bg-purple-500/5 ring-1 ring-purple-500/20'
                          : 'border-border/70 bg-background hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(permKey)}
                        className="mt-0.5 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                      />
                      <div className="min-w-0 select-none">
                        <span className="text-xs font-semibold text-foreground block leading-tight">
                          {info.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
                          {info.desc}
                        </span>
                      </div>
                    </label>
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
    </div>
  )
}
