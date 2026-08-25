import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  UserPlus,
  ShieldCheck,
  Building2,
  Check,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import { useAddHostelUser } from '@/hooks/mutations/useSuperadminMutations'
import type { HostelTenant } from '@/hooks/queries/useSuperadminQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface AddHostelUserModalProps {
  isOpen: boolean
  onClose: () => void
  hostel: HostelTenant | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AddHostelUserModal({
  isOpen,
  onClose,
  hostel,
}: AddHostelUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'student'>('admin')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { mutateAsync: addUser, isPending: isSubmitting } = useAddHostelUser()

  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      setRole('admin')
      setTouched({})
    }
  }, [isOpen])

  if (!isOpen || !hostel) return null

  const isEmailValid = EMAIL_REGEX.test(email)
  const isNameValid = Boolean(name.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true })

    if (!isNameValid || !isEmailValid) {
      toast.error('Please fill in all required fields properly')
      return
    }

    try {
      await addUser({
        id: hostel._id,
        userData: {
          name: name.trim(),
          email: email.trim(),
          role,
        },
      })
      onClose()
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Hostel Staff</h2>
              <p className="text-xs text-muted-foreground">{hostel.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Role / Access Level</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'admin'
                    ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Hostel Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'manager'
                    ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Mess Manager
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Asad Malik"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              className={touched.name && !isNameValid ? 'border-rose-500' : ''}
            />
            {touched.name && !isNameValid && (
              <p className="text-[11px] text-rose-500">Full name is required</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email Address (Login ID) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              className={touched.email && !isEmailValid ? 'border-rose-500' : ''}
            />
            {touched.email && !isEmailValid && (
              <p className="text-[11px] text-rose-500">Please provide a valid email</p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4 shrink-0 text-blue-500" />
            <span>
              An invite email containing initial temporary credentials and password setup link will be sent
              to this address.
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding User...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Create Staff Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
