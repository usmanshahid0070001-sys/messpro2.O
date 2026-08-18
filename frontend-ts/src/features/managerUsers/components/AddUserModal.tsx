import { useState, useMemo, useEffect } from 'react'
import {
  X,
  Loader2,
  UserPlus,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Building2,
  Utensils,
  ClipboardCheck,
  Settings2,
  KeyRound,
  Check,
} from 'lucide-react'
import { useCreateUser } from '@/hooks/mutations/useUserMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  currentRole: string
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

export default function AddUserModal({ isOpen, onClose, currentRole, hostel }: AddUserModalProps) {
  const createUserMutation = useCreateUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'student' | 'manager' | 'admin'>('student')
  const [rollNumber, setRollNumber] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [permissions, setPermissions] = useState<string[]>([])

  const creatableRoles = useMemo(() => {
    if (currentRole === 'superadmin') return ['admin', 'manager']
    if (currentRole === 'admin') return ['manager', 'student']
    if (currentRole === 'manager') return ['student']
    return ['student']
  }, [currentRole])

  const customFieldConfigs = useMemo(() => hostel?.customRegistrationFields || [], [hostel])

  const toggleablePermissions = useMemo(() => {
    if (!hostel?.plan?.features) return []
    const excludedNames = ['hostel_configuration', 'bill_management', 'bill_generation', 'meal_control']
    return hostel.plan.features
      .filter((f: any) => f.isEnabled && !excludedNames.includes(normalize(f.name)))
      .map((f: any) => normalize(f.name))
  }, [hostel])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      const initialRole = (creatableRoles[0] as any) || 'student'
      setRole(initialRole)
      setRollNumber('')

      const defaultPerms: string[] = []
      if (initialRole === 'manager') {
        if (toggleablePermissions.includes('meal_settings')) defaultPerms.push('meal_settings')
        if (toggleablePermissions.includes('qr_attendance')) defaultPerms.push('qr_attendance')
      }
      setPermissions(defaultPerms)

      const initFields: Record<string, string> = {}
      customFieldConfigs.forEach((f: any) => {
        initFields[f.name] = ''
      })
      setCustomFields(initFields)
    }
  }, [isOpen, customFieldConfigs, creatableRoles, toggleablePermissions])

  if (!isOpen) return null

  const handleRoleChange = (newRole: 'student' | 'manager' | 'admin') => {
    setRole(newRole)
    if (newRole === 'manager') {
      const defaultPerms: string[] = []
      if (toggleablePermissions.includes('meal_settings')) defaultPerms.push('meal_settings')
      if (toggleablePermissions.includes('qr_attendance')) defaultPerms.push('qr_attendance')
      setPermissions(defaultPerms)
    } else {
      setPermissions([])
    }
  }

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required')
      return
    }

    if (role === 'student' && !rollNumber.trim()) {
      toast.error('Roll Number is required for students')
      return
    }

    if (role === 'student') {
      const isPakistan = (location?: string) => {
        if (!location) return true
        const loc = location.toLowerCase()
        return loc.includes('karachi') || loc.includes('pakistan') || loc.includes('pk') || loc.includes('asia/karachi')
      }

      for (const config of customFieldConfigs) {
        const val = (customFields[config.name] || '').trim()
        if (config.isRequired && !val) {
          toast.error(`Field "${config.name}" is required`)
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
      value: value.trim(),
    }))

    const payload: any = {
      name: name.trim(),
      email: email.trim(),
      role,
      additionalInfo: additionalInfoPayload,
    }

    if (role === 'student') {
      payload.id = rollNumber.trim()
    } else if (role === 'manager') {
      payload.permissions = permissions
    }

    await createUserMutation.mutateAsync(payload)
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add New Member</h2>
              <p className="text-xs text-muted-foreground">
                Invite a new resident, operational manager, or administrative staff.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {/* ── 1. Role Selection Cards ── */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Membership Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {creatableRoles.includes('student') && (
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    role === 'student'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30'
                      : 'border-border bg-background hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    {role === 'student' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <span className="text-xs font-bold block">Student</span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight">
                    Hostel resident with room access & mess privileges
                  </span>
                </button>
              )}

              {creatableRoles.includes('manager') && (
                <button
                  type="button"
                  onClick={() => handleRoleChange('manager')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    role === 'manager'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30'
                      : 'border-border bg-background hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-4 h-4 text-purple-500" />
                    {role === 'manager' && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <span className="text-xs font-bold block">Manager</span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight">
                    Operational staff with assigned administrative tools
                  </span>
                </button>
              )}

              {creatableRoles.includes('admin') && (
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    role === 'admin'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30'
                      : 'border-border bg-background hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    {role === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <span className="text-xs font-bold block">Administrator</span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight">
                    Full authority over hostel operations & members
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ── 2. Basic Info Fields ── */}
          <div className="space-y-3 pt-1 border-t border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Personal Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="E.g., Ali Ahmed, Sarah Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {role === 'student' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Roll Number / University ID <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="E.g., 2021-CS-15, STD-8841"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>
            )}
          </div>

          {/* ── 3. Dynamic Custom Registration Fields ── */}
          {role === 'student' && customFieldConfigs.length > 0 && (
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

          {/* ── 4. Manager Permissions Section ── */}
          {role === 'manager' && toggleablePermissions.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Manager Permissions
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Grant administrative capabilities to this manager.
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
                      onClick={() => handleTogglePermission(permKey)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-purple-500/40 bg-purple-500/5 ring-1 ring-purple-500/20'
                          : 'border-border/70 bg-background hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="min-w-0">
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
            onClick={handleCreate}
            disabled={createUserMutation.isPending || !name.trim() || !email.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold gap-1.5 cursor-pointer"
          >
            {createUserMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Inviting...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create & Invite User</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
