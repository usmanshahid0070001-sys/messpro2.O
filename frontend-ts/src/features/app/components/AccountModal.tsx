import React from 'react'
import {
  X,
  User as UserIcon,
  Building2,
  Bed,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Sparkles,
  KeyRound,
  FileText,
  Calendar,
  Layers,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  hostel: any
  onUpgradeClick?: () => void
}

/**
 * Normalizes permission key to readable text
 */
const formatPermName = (perm: string) => {
  return (perm || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

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
        label: 'Hostel Administrator',
        color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        icon: ShieldCheck,
      }
    case 'manager':
      return {
        label: 'Operational Manager',
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

export default function AccountModal({
  isOpen,
  onClose,
  user,
  hostel,
  onUpgradeClick,
}: AccountModalProps) {
  if (!isOpen || !user) return null

  const roleInfo = getRoleBadge(user.role)
  const RoleIcon = roleInfo.icon

  // Room details extraction
  const roomName =
    typeof user.room === 'object' && user.room !== null
      ? user.room.roomName || user.room.name
      : typeof user.room === 'string' && user.room.trim()
      ? user.room
      : null

  const roomCapacity =
    typeof user.room === 'object' && user.room !== null ? user.room.capacity : null

  const roomStatus =
    typeof user.room === 'object' && user.room !== null ? user.room.status : null

  const additionalInfo = Array.isArray(user.additionalInfo) ? user.additionalInfo : []
  const permissions = Array.isArray(user.permissions) ? user.permissions : []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-11 w-11 rounded-xl ring-2 ring-primary/20 shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/shapes/svg?seed=${user.name || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                alt={user.name}
              />
              <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                {(user.name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground truncate">{user.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border shrink-0 ${roleInfo.color}`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* ── 1. Basic Account & Identity ── */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <UserIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Membership Details
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {user.role === 'student' ? 'Roll Number / Student ID' : 'Account ID'}
                </span>
                <span className="font-mono font-semibold text-foreground truncate block">
                  {user.id || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Account Role</span>
                <span className="font-semibold text-foreground capitalize block">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. Room & Accommodation (For Student Role) ── */}
          {user.role === 'student' && (
            <div className="p-3.5 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-teal-500/20">
                <Bed className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Room & Accommodation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Assigned Room</span>
                  <span className="font-semibold text-foreground block">
                    {roomName ? `Room ${roomName}` : 'No room allotted yet'}
                  </span>
                </div>

                {roomCapacity && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Room Capacity</span>
                    <span className="font-semibold text-foreground block">
                      {roomCapacity} Beds
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-muted-foreground block">Living Status</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300 block capitalize">
                    {roomStatus || (roomName ? 'Allotted' : 'Pending Allotment')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. Hostel Information (For Admin, Manager, Student) ── */}
          {user.role !== 'superadmin' && hostel && (
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Hostel & Subscription Plan
                  </span>
                </div>
                {hostel.plan?.name && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {hostel.plan.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Hostel Name</span>
                  <span className="font-semibold text-foreground block">{hostel.name}</span>
                </div>

                {hostel.subdomain && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Subdomain URL</span>
                    <span className="font-mono text-foreground block text-[11px]">
                      {hostel.subdomain}.messpro.app
                    </span>
                  </div>
                )}

                {hostel.location && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Location / Timezone</span>
                    <span className="text-foreground block">{hostel.location}</span>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-muted-foreground block">Subscription Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize block">
                    {hostel.isTrial ? 'Active Free Trial' : hostel.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── 4. Granted Administrative Permissions ── */}
          {(user.role === 'manager' || (user.role === 'student' && permissions.length > 0)) && (
            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20">
                <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                  Granted Delegated Permissions ({permissions.length})
                </span>
              </div>

              {permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((perm: string) => (
                    <span
                      key={perm}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium bg-background border border-purple-500/30 text-purple-700 dark:text-purple-300"
                    >
                      {formatPermName(perm)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Standard operational access. No extra administrative permissions assigned.
                </p>
              )}
            </div>
          )}

          {/* ── 5. Additional Profile Metadata ── */}
          {additionalInfo.length > 0 && (
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Additional Profile Information
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {additionalInfo.map((item: any) => (
                  <div key={item.key}>
                    <span className="text-[11px] text-muted-foreground capitalize block">
                      {item.key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-foreground block">{item.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0">
          {onUpgradeClick && (user.role === 'admin' || user.role === 'manager') ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                onUpgradeClick()
              }}
              className="text-xs h-8 cursor-pointer rounded-lg border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade / Support</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
