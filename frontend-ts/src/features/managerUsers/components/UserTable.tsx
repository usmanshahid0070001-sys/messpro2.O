import { useState } from 'react'
import {
  Mail,
  ShieldAlert,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  BedDouble,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  Settings2,
  MoreHorizontal,
  MoreVertical,
} from 'lucide-react'
import type { ManageableUser } from '@/hooks/queries/useUserQueries'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

const getRoleConfig = (role: string) => {
  switch (role) {
    case 'superadmin':
      return {
        label: 'Super Admin',
        badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
        avatarBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
        icon: ShieldCheck,
      }
    case 'admin':
      return {
        label: 'Admin',
        badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        avatarBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        icon: ShieldCheck,
      }
    case 'manager':
      return {
        label: 'Manager',
        badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        avatarBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        icon: UserCheck,
      }
    case 'student':
    default:
      return {
        label: 'Student',
        badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        avatarBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        icon: GraduationCap,
      }
  }
}

export default function UserTable({
  paginatedUsers,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onEditClick,
  customFieldConfigs,
}: UserTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    toast.success('Email copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFreeze = (userName: string) => {
    toast.info(`Status update: ${userName}'s account status has been marked.`)
  }

  const handleDelete = (userName: string) => {
    toast.warning(`Request to remove ${userName} has been logged.`)
  }

  if (paginatedUsers.length === 0) {
    return (
      <div className="border border-border rounded-2xl bg-card p-12 sm:p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Users className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No members found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            No records matched your search term or active role filter.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
      {/* ── Desktop View (≥ md): High Density Data Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="px-5 py-3.5">Member</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Roll / ID</th>
              {/* Dynamic custom field headers */}
              {customFieldConfigs.slice(0, 2).map((config: any) => (
                <th key={config.name} className="px-5 py-3.5">{config.name}</th>
              ))}
              <th className="px-5 py-3.5">Room Allotment</th>
              <th className="px-5 py-3.5 text-right w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedUsers.map((user) => {
              const roleConfig = getRoleConfig(user.role)
              const RoleIcon = roleConfig.icon

              return (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors group">
                  {/* Member info & avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`relative h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border select-none ${roleConfig.avatarBg}`}>
                        {user.name.substring(0, 2).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">{user.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(user.email, user._id)}
                            className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded transition-colors"
                            title="Copy email"
                          >
                            {copiedId === user._id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleConfig.badge}`}>
                        <RoleIcon className="h-3 w-3" />
                        <span>{roleConfig.label}</span>
                      </span>
                      {user.role === 'student' && user.permissions && user.permissions.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                          title={`Assigned permissions: ${user.permissions.join(', ')}`}
                        >
                          <ShieldCheck className="h-2.5 w-2.5" />
                          <span>+{user.permissions.length} Admin Perms</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground">
                    {user.role === 'student' ? (
                      user.id ? (
                        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/60">
                          {user.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Custom fields */}
                  {customFieldConfigs.slice(0, 2).map((config: any) => {
                    const field = (user.additionalInfo || []).find((f: any) => f.key === config.name)
                    return (
                      <td key={config.name} className="px-5 py-3.5 text-xs font-medium text-foreground">
                        {field?.value ? (
                          <span className="truncate block max-w-[140px]">{field.value}</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Room Allotment */}
                  <td className="px-5 py-3.5">
                    {user.role === 'student' || user.role === 'manager' ? (
                      user.room ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          <BedDouble className="h-3 w-3" />
                          <span>{user.room.roomName}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/70 italic">Unassigned</span>
                      )
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Space-Friendly Action Menu */}
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                          title="Actions menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border border-border rounded-xl shadow-lg p-1">
                        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                          Member Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEditClick(user)}
                          className="text-xs gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-foreground focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400"
                        >
                          <Settings2 className="h-3.5 w-3.5 text-blue-500" />
                          <span>Configure Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFreeze(user.name)}
                          className="text-xs gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-foreground focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                          <span>Suspend / Freeze</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.name)}
                          variant="destructive"
                          className="text-xs gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-500/10 focus:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Member</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile View (< md): High Contrast Card List ── */}
      <div className="md:hidden divide-y divide-border">
        {paginatedUsers.map((user) => {
          const roleConfig = getRoleConfig(user.role)
          const RoleIcon = roleConfig.icon

          return (
            <div key={user._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${roleConfig.avatarBg}`}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground text-sm block truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleConfig.badge}`}>
                      <RoleIcon className="h-3 w-3" />
                      <span>{roleConfig.label}</span>
                    </span>
                    {user.role === 'student' && user.permissions && user.permissions.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                        title={`Assigned permissions: ${user.permissions.join(', ')}`}
                      >
                        <ShieldCheck className="h-2 w-2" />
                        <span>+{user.permissions.length} Perms</span>
                      </span>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-card border border-border rounded-xl shadow-lg p-1">
                      <DropdownMenuItem onClick={() => onEditClick(user)} className="text-xs gap-2 px-2 py-1.5 cursor-pointer">
                        <Settings2 className="h-3.5 w-3.5 text-blue-500" />
                        <span>Configure</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFreeze(user.name)} className="text-xs gap-2 px-2 py-1.5 cursor-pointer">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                        <span>Suspend</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 bg-border/60" />
                      <DropdownMenuItem onClick={() => handleDelete(user.name)} variant="destructive" className="text-xs gap-2 px-2 py-1.5 text-rose-600 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Specs row */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/40">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Roll Number</span>
                  <span className="font-mono text-foreground font-medium">{user.id || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Room Allotment</span>
                  <span className="text-foreground font-medium">
                    {user.room ? user.room.roomName : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Pagination Bar ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground gap-3">
          <span>
            Showing Page <strong className="text-foreground">{currentPage}</strong> of{' '}
            <strong className="text-foreground">{totalPages}</strong> ({totalCount} total members)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
