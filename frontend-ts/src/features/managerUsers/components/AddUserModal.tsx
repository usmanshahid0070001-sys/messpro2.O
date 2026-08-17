import { useState, useMemo, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
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

const formatRole = (role: string) => {
  if (role === 'superadmin') return 'Super Admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const normalize = (str: string) => (str || '').toLowerCase().replace(/[\s-_]+/g, '_')

const PERMISSION_LABELS: Record<string, string> = {
  user_management: 'Manage Users',
  hostel_configuration: 'Hostel Configuration',
  bill_management: 'Bill Management',
  bill_generation: 'Bill Generation',
  residence_management: 'Residence Management',
  meal_settings: 'Meal Schedule & Settings',
  meal_control: 'Meal Control & Blocking',
  manual_attendance: 'Manual Attendance Logging',
  qr_attendance: 'QR Code Attendance Scanning',
  biometric_attendance: 'Biometric Scanner Sync',
  complaint_management: 'Complaint Tickets & Resolution',
  service_management: 'Service Management',
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
      const initialRole = creatableRoles[0] as any || 'student'
      setRole(initialRole)
      setRollNumber('')
      
      const defaultPerms: string[] = []
      if (initialRole === 'manager') {
        if (toggleablePermissions.includes('meal_settings')) defaultPerms.push('meal_settings')
        if (toggleablePermissions.includes('qr_attendance')) defaultPerms.push('qr_attendance')
      }
      setPermissions(defaultPerms)

      const initFields: Record<string, string> = {}
      customFieldConfigs.forEach((f: any) => { initFields[f.name] = '' })
      setCustomFields(initFields)
    }
  }, [isOpen, customFieldConfigs, creatableRoles, toggleablePermissions])

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
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
          toast.error(`Custom field "${config.name}" is required`)
          return
        }

        if (config.name.toLowerCase() === 'cnic' && val) {
          if (isPakistan(hostel?.location)) {
            const pkrCnicRegex = /^\d{5}-\d{7}-\d$/
            if (!pkrCnicRegex.test(val)) {
              toast.error('CNIC must match Pakistan format: XXXXX-XXXXXXX-X (e.g. 36501-7728634-5)')
              return
            }
          }
        }
      }
    }

    const payload: any = {
      name: name.trim(),
      email: email.trim(),
      role,
      permissions,
    }

    if (role === 'student') {
      payload.id = rollNumber.trim()
      payload.additionalInfo = Object.entries(customFields).map(([key, value]) => ({
        key,
        value: value.trim()
      }))
    }

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm))
    } else {
      setPermissions([...permissions, perm])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-lg max-w-md w-full max-h-[85vh] overflow-y-auto flex flex-col">
        
        <div className="flex items-center justify-between p-5 border-b border-border/80">
          <h3 className="text-base font-semibold text-foreground">Add New User</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Role</label>
            <select
              onChange={e => {
                const newRole = e.target.value as any
                setRole(newRole)
                if (newRole === 'manager') {
                  const defaultPerms: string[] = []
                  if (toggleablePermissions.includes('meal_settings')) defaultPerms.push('meal_settings')
                  if (toggleablePermissions.includes('qr_attendance')) defaultPerms.push('qr_attendance')
                  setPermissions(defaultPerms)
                } else {
                  setPermissions([])
                }
              }}
              className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {creatableRoles.map(r => (
                <option key={r} value={r}>{formatRole(r)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              required
              placeholder="e.g. Ahmad Ali"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <Input
              required
              type="email"
              placeholder="e.g. ahmad.ali@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground/80">
              A temporary auto-generated password will be emailed to this address.
            </p>
          </div>

          {role === 'student' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Roll Number / ID</label>
                <Input
                  required
                  placeholder="e.g. 2024CS102"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                />
              </div>

              {customFieldConfigs.map((config: any) => {
                const formatCNIC = (val: string) => {
                  const digits = val.replace(/\D/g, '').slice(0, 13)
                  if (digits.length <= 5) return digits
                  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
                  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`
                }

                return (
                  <div key={config.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      {config.name}
                      {config.isRequired && <span className="text-destructive">*</span>}
                    </label>
                    <Input
                      required={config.isRequired}
                      placeholder={`Enter ${config.name}`}
                      value={customFields[config.name] || ''}
                      onChange={e => {
                        let val = e.target.value
                        if (config.name.toLowerCase() === 'cnic') {
                          val = formatCNIC(val)
                        }
                        setCustomFields({ ...customFields, [config.name]: val })
                      }}
                    />
                  </div>
                )
              })}
            </>
          )}

          {/* Permissions Checklist (Available for both Managers and Students) */}
          {(role === 'manager' || role === 'student') && toggleablePermissions.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-foreground block">Assign Permissions</span>
              <div className="border border-border rounded-lg bg-muted/10 divide-y divide-border overflow-hidden">
                {toggleablePermissions.map((perm: string) => (
                  <label
                    key={perm}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/30 select-none"
                  >
                    <span>{PERMISSION_LABELS[perm] || perm}</span>
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="h-3.5 w-3.5 rounded border-input cursor-pointer accent-foreground"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Create Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
