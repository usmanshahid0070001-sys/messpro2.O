import { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react'
import { useDeleteHostel } from '@/hooks/mutations/useSuperadminMutations'
import type { HostelTenant } from '@/hooks/queries/useSuperadminQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DeleteHostelModalProps {
  isOpen: boolean
  onClose: () => void
  hostel: HostelTenant | null
}

export default function DeleteHostelModal({
  isOpen,
  onClose,
  hostel,
}: DeleteHostelModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const { mutateAsync: deleteHostel, isPending } = useDeleteHostel()

  if (!isOpen || !hostel) return null

  const expectedConfirm = hostel.name.trim()
  const isMatch = confirmText.trim().toLowerCase() === expectedConfirm.toLowerCase()

  const handleDelete = async () => {
    if (!isMatch) return
    try {
      await deleteHostel(hostel._id)
      setConfirmText('')
      onClose()
    } catch {
      // Handled by mutation toast
    }
  }

  const handleClose = () => {
    if (isPending) return
    setConfirmText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Delete Hostel Tenant</h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Permanent cascade deletion
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-foreground">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 items-start">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-600 dark:text-rose-400">
                Warning: This action cannot be undone
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Deleting this hostel will permanently delete the tenant configuration and perform a complete cascade wipe of all associated records.
              </p>
            </div>
          </div>

          {/* Cascade details */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              The following will be permanently erased:
            </p>
            <ul className="space-y-1.5 text-muted-foreground text-[11px] list-disc list-inside">
              <li>
                <strong className="text-foreground">Hostel Workspace:</strong> {hostel.name} ({hostel.subdomain ? `@${hostel.subdomain}` : 'No subdomain'})
              </li>
              <li className="flex items-start gap-1">
                <span>
                  <strong className="text-rose-600 dark:text-rose-400">All User Accounts:</strong> Every <strong className="text-foreground">Admin</strong>, <strong className="text-foreground">Manager</strong>, and <strong className="text-foreground">Student</strong> associated with this hostel will be deleted.
                </span>
              </li>
              <li>
                <strong className="text-foreground">Authentication & Plain Credentials:</strong> All credentials and login access for this hostel will be revoked immediately.
              </li>
              <li>
                <strong className="text-foreground">Tenant Records:</strong> Meals, attendance, complaints, rooms, and billing transactions.
              </li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-medium text-muted-foreground block">
              Type <span className="font-bold text-foreground select-all font-mono">{hostel.name}</span> to confirm:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={hostel.name}
              disabled={isPending}
              className="text-xs h-9"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!isMatch || isPending}
            className="h-9 px-4 text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting Hostel & Users...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Hostel & Users</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
