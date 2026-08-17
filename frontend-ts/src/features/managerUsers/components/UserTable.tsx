import { Mail, Edit2, ShieldAlert, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserTableProps {
  paginatedUsers: ManageableUser[]
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onEditClick: (user: ManageableUser) => void
  customFieldConfigs: any[]
}

const ROLE_BADGES = {
  superadmin: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  admin:      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  manager:    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  student:    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
}

const formatRole = (role: string) => {
  if (role === 'superadmin') return 'Super Admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function UserTable({
  paginatedUsers,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onEditClick,
  customFieldConfigs
}: UserTableProps) {
  
  const handleFreeze = (userName: string) => {
    toast.info(`Feature coming soon: ${userName}'s account status has been toggled.`)
  }

  const handleDelete = (userName: string) => {
    toast.warning(`Feature coming soon: Request to delete ${userName} is pending admin confirmation.`)
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {paginatedUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Roll Number</th>
                {/* Dynamically render first 2 custom registration fields headers */}
                {customFieldConfigs.slice(0, 2).map((config: any) => (
                  <th key={config.name} className="px-5 py-3">{config.name}</th>
                ))}
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {paginatedUsers.map(user => (
                <tr key={user._id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground uppercase border border-border select-none">
                        {user.name.substring(0, 2)}
                      </div>
                      <div>
                        <span className="font-medium text-foreground block">{user.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGES[user.role] || ''}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-foreground">
                    {user.role === 'student' ? (user.id || '_') : '-'}
                  </td>

                  {/* Dynamically render first 2 custom registration fields values */}
                  {customFieldConfigs.slice(0, 2).map((config: any) => {
                    const field = (user.additionalInfo || []).find((f: any) => f.key === config.name)
                    return (
                      <td key={config.name} className="px-5 py-4 text-xs font-medium text-foreground">
                        {field?.value || '_'}
                      </td>
                    )
                  })}

                  <td className="px-5 py-4">
                    {user.role === 'student' ? (
                      <div className="text-xs">
                        {user.room ? (
                          <span className="text-foreground font-medium block">Room: {user.room.roomName}</span>
                        ) : (
                          <span className="text-muted-foreground/80 block">Unassigned</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditClick(user)}
                        className="gap-1 h-8 text-xs px-2.5"
                      >
                        <Edit2 className="h-3 w-3" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleFreeze(user.name)}
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                        title="Freeze / Suspend User"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(user.name)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <Users className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-semibold text-foreground">No users found</p>
            <p className="text-xs">No records matched your search or filtering queries.</p>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
          <span>
            Showing Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong> ({totalCount} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
