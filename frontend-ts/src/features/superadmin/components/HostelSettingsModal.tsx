import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Building2,
  MapPin,
  ShieldCheck,
  Check,
  RefreshCw,
  Calendar,
  Layers,
  Globe,
  Sliders,
  ChevronDown,
} from 'lucide-react'
import { useUpdateHostelSettings } from '@/hooks/mutations/useSuperadminMutations'
import { useGetPlans, type HostelTenant } from '@/hooks/queries/useSuperadminQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HostelSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  hostel: HostelTenant | null
}

export default function HostelSettingsModal({
  isOpen,
  onClose,
  hostel,
}: HostelSettingsModalProps) {
  const [planId, setPlanId] = useState<string>('')
  const [additionalDays, setAdditionalDays] = useState<number>(0)
  const [location, setLocation] = useState<string>('')
  const [subdomain, setSubdomain] = useState<string>('')
  const [maxMealSelection, setMaxMealSelection] = useState<number>(4)
  const [autoMealVerification, setAutoMealVerification] = useState<boolean>(true)
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')
  const [qrSecret, setQrSecret] = useState<string>('')

  const { data: plans = [] } = useGetPlans(isOpen)
  const { mutateAsync: updateSettings, isPending: isSaving } = useUpdateHostelSettings()

  useEffect(() => {
    if (hostel && isOpen) {
      const currentPlan = typeof hostel.plan === 'object' ? hostel.plan?._id : hostel.plan || ''
      setPlanId(currentPlan)
      setAdditionalDays(0)
      setLocation(hostel.location || '')
      setSubdomain(hostel.subdomain || '')
      setMaxMealSelection(hostel.maxMealSelection || (hostel.settings as any)?.maxMealSelection || 4)
      setAutoMealVerification(
        (hostel.settings as any)?.autoMealVerification !== false &&
        (hostel.settings as any)?.autoVerification !== false
      )
      setLat(hostel.locationCoords?.lat !== undefined ? String(hostel.locationCoords.lat) : '')
      setLng(hostel.locationCoords?.lng !== undefined ? String(hostel.locationCoords.lng) : '')
      setQrSecret(hostel.qrSecret || '')
    }
  }, [hostel, isOpen])

  if (!isOpen || !hostel) return null

  const handleGenerateNewSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setQrSecret(result)
    toast.info('New 8-character QR secret key generated. Click "Save Settings" to activate it.')
  }

  const handleSave = async () => {
    try {
      const parsedLat = lat.trim() ? parseFloat(lat) : undefined
      const parsedLng = lng.trim() ? parseFloat(lng) : undefined

      const payload: any = {
        id: hostel._id,
        settingsData: {
          plan: planId || undefined,
          additionalDays: Number(additionalDays) > 0 ? Number(additionalDays) : undefined,
          location: location.trim() || undefined,
          subdomain: subdomain.trim() || undefined,
          settings: {
            autoMealVerification,
            maxMealSelection: Number(maxMealSelection) || 4,
          },
          locationCoords:
            parsedLat !== undefined && parsedLng !== undefined
              ? { lat: parsedLat, lng: parsedLng }
              : undefined,
          qrSecret: qrSecret.trim() ? qrSecret.trim().slice(0, 8) : undefined,
        },
      }

      await updateSettings(payload)
      onClose()
    } catch {
      // Handled by mutation toast
    }
  }

  const expiryDateFormatted = hostel.subscriptionExpiresAt
    ? new Date(hostel.subscriptionExpiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not Set / Lifetime'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                {hostel.name}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    hostel.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : hostel.status === 'Trial'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {hostel.status || 'Active'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure tenant subscription plan, renewal extension, geofencing, and dining rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Subscription Tier & Renewal Engine */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-foreground text-sm">
                  Subscription Tier & Renewal
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span>Expires: <strong className="text-foreground">{expiryDateFormatted}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Plan Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Assigned Plan Tier</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {plans.find((p) => p._id === planId)
                          ? `${plans.find((p) => p._id === planId)?.name} ($${plans.find((p) => p._id === planId)?.price}/mo)`
                          : '-- Keep Current Plan --'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      Subscription Plans
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={planId}
                      onValueChange={(val) => setPlanId(val)}
                    >
                      <DropdownMenuRadioItem value="" className="text-xs cursor-pointer">
                        -- Keep Current Plan --
                      </DropdownMenuRadioItem>
                      {plans.map((p) => (
                        <DropdownMenuRadioItem key={p._id} value={p._id} className="text-xs cursor-pointer flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            ${p.price}/mo
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Plan Renewal / Additional Days */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>Extend / Renew Contract</span>
                  {additionalDays > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                      +{additionalDays} days
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1.5">
                  {[30, 90, 180, 365].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setAdditionalDays(additionalDays === days ? 0 : days)}
                      className={`flex-1 py-1.5 rounded-md border text-[11px] font-bold transition-all cursor-pointer ${
                        additionalDays === days
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      +{days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Subdomain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Physical Location / Address
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sector H-12, Islamabad"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Subdomain Prefix / Domain Suffix
              </label>
              <Input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g. al-razi or @student.uet.edu.pk"
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Dining Policy Rules */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-500" /> Dining Hall Bouncer Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Max Meals Allowed Per Scan
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={maxMealSelection}
                  onChange={(e) => setMaxMealSelection(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Upper ceiling for bulk/guest portion check-in (1–10).
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Auto-Verify Scans</p>
                  <p className="text-[10px] text-muted-foreground">
                    Instant counter check-in without waiter confirmation
                  </p>
                </div>
                <Switch
                  checked={autoMealVerification}
                  onCheckedChange={setAutoMealVerification}
                />
              </div>
            </div>
          </div>

          {/* Geofence & QR Secret Security */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-500" /> GPS Geofence & QR Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Latitude (GPS)</label>
                <Input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 33.6425"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Longitude (GPS)</label>
                <Input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. 72.9904"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Counter QR Secret Pointer (8 Chars)</span>
                <button
                  type="button"
                  onClick={handleGenerateNewSecret}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate Secret
                </button>
              </label>
              <Input
                value={qrSecret}
                maxLength={8}
                onChange={(e) => setQrSecret(e.target.value.toUpperCase())}
                placeholder="e.g. 8A3F9X2B"
                className="text-xs font-mono uppercase tracking-widest"
              />
              <p className="text-[10px] text-muted-foreground">
                Printed dining hall QR codes validate against this rotated cryptographic secret.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border/60 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
