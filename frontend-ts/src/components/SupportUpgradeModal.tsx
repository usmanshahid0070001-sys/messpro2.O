import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Headphones,
  ExternalLink,
  ShieldCheck,
  Bug,
  Zap,
  Repeat,
} from 'lucide-react'
import { useGetSupportContact } from '@/hooks/queries/useSupportQueries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export type SupportContextReason =
  | 'upgrade'
  | 'renewal'
  | 'feature'
  | 'bug'
  | 'general'

interface SupportUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  initialReason?: SupportContextReason
  featureName?: string
}

export default function SupportUpgradeModal({
  isOpen,
  onClose,
  initialReason = 'upgrade',
  featureName,
}: SupportUpgradeModalProps) {
  const { data: contact, isLoading } = useGetSupportContact()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeReason, setActiveReason] = useState<SupportContextReason>(initialReason)

  if (!isOpen) return null

  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const cleanPhoneForWa = (phoneStr: string) => {
    return (phoneStr || '').replace(/[^0-9]/g, '')
  }

  const getReasonMeta = (reason: SupportContextReason) => {
    switch (reason) {
      case 'upgrade':
        return {
          title: 'Upgrade Subscription Plan',
          desc: featureName
            ? `Unlock "${featureName}" and advanced capabilities by upgrading your hostel plan.`
            : 'Upgrade to a higher tier plan to unlock advanced features, increased student limits, and premium tools.',
          badge: 'Plan Upgrade',
          icon: Zap,
          badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          prefillMsg: `Hello MessPro Support, I would like to upgrade our hostel plan to access ${
            featureName ? `"${featureName}"` : 'higher tier features'
          }.`,
        }
      case 'renewal':
        return {
          title: 'Renew or Extend Subscription',
          desc: 'Extend your current hostel subscription duration or renewal schedule.',
          badge: 'Plan Renewal',
          icon: Repeat,
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
          prefillMsg:
            'Hello MessPro Support, I would like to renew / extend our hostel subscription plan.',
        }
      case 'feature':
        return {
          title: 'Custom Feature Request',
          desc: 'Request custom integrations, hardware scanner sync, or dedicated feature setups.',
          badge: 'Feature Request',
          icon: Sparkles,
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          prefillMsg: `Hello MessPro Support, I would like to request feature configuration for "${
            featureName || 'our hostel'
          }".`,
        }
      case 'bug':
        return {
          title: 'Report Bug or Technical Issue',
          desc: 'Get immediate support from our engineering and support team.',
          badge: 'Technical Support',
          icon: Bug,
          badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          prefillMsg:
            'Hello MessPro Support, I am experiencing an issue and need technical assistance.',
        }
      case 'general':
      default:
        return {
          title: 'Hostel Support & Assistance',
          desc: 'Reach out to our platform team for onboarding, setup, or administrative inquiries.',
          badge: 'General Support',
          icon: Headphones,
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          prefillMsg:
            'Hello MessPro Support, I would like some assistance regarding our hostel account.',
        }
    }
  }

  const reasonMeta = getReasonMeta(activeReason)
  const ReasonIcon = reasonMeta.icon

  // Build lists of WhatsApp channels, Email channels, and Phone channels
  const whatsappList =
    contact?.whatsappNumbers && contact.whatsappNumbers.length > 0
      ? contact.whatsappNumbers
      : contact?.whatsapp
      ? [{ label: 'WhatsApp Support', value: contact.whatsapp }]
      : []

  const emailList =
    contact?.emailAddresses && contact.emailAddresses.length > 0
      ? contact.emailAddresses
      : contact?.email
      ? [{ label: 'Official Support Email', value: contact.email }]
      : [{ label: 'Support Email', value: 'support@messpro.com' }]

  const phoneList =
    contact?.phoneNumbers && contact.phoneNumbers.length > 0
      ? contact.phoneNumbers.filter(
          (p) => !whatsappList.some((w) => cleanPhoneForWa(w.value) === cleanPhoneForWa(p.value))
        )
      : contact?.phone && !whatsappList.some((w) => cleanPhoneForWa(w.value) === cleanPhoneForWa(contact.phone))
      ? [{ label: 'Helpline Phone', value: contact.phone }]
      : []

  // Other custom key-value pairs
  const handledValues = new Set([
    ...whatsappList.map((w) => w.value.toLowerCase()),
    ...emailList.map((e) => e.value.toLowerCase()),
    ...phoneList.map((p) => p.value.toLowerCase()),
  ])

  const otherAdditionalInfo = (contact?.additionalInfo || []).filter(
    (item) =>
      item.value &&
      !handledValues.has(item.value.toLowerCase()) &&
      !['whatsapp', 'phone', 'email', 'whats_app', 'wa', 'mobile', 'contact'].includes(
        item.key.toLowerCase().replace(/[\s-_]+/g, '')
      )
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground truncate">
                  Platform Support & Services
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border shrink-0 ${reasonMeta.badgeColor}`}
                >
                  <ReasonIcon className="w-3 h-3" />
                  {reasonMeta.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Direct helpline for plan upgrades, renewals & support
              </p>
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
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {/* Reason Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              What do you need assistance with?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'upgrade', label: 'Upgrade Plan', icon: Zap },
                { id: 'renewal', label: 'Renew / Extend', icon: Repeat },
                { id: 'feature', label: 'Add Feature', icon: Sparkles },
                { id: 'bug', label: 'Report Bug', icon: Bug },
              ].map((item) => {
                const ItemIcon = item.icon
                const isActive = activeReason === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveReason(item.id as SupportContextReason)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs'
                        : 'bg-background hover:bg-muted/40 text-muted-foreground border-border/70'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Context Explanatory Banner */}
          <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1">
            <div className="flex items-center gap-2">
              <ReasonIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-foreground">{reasonMeta.title}</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{reasonMeta.desc}</p>
          </div>

          {/* Contact Channels */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Official Superadmin Support Channels
            </span>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* ── All WhatsApp Numbers (Direct Chat & Copy) ── */}
                {whatsappList.map((waItem, idx) => {
                  const waDigits = cleanPhoneForWa(waItem.value)
                  const waUrl = waDigits
                    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(reasonMeta.prefillMsg)}`
                    : '#'
                  const copyKey = `wa-${idx}`

                  return (
                    <div
                      key={copyKey}
                      className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground">
                              {waItem.label || 'WhatsApp Support'}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Instant WhatsApp
                            </span>
                          </div>
                          <span className="text-xs font-mono font-medium text-muted-foreground truncate block mt-0.5">
                            {waItem.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(waItem.value, copyKey, waItem.label || 'WhatsApp number')}
                          className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                          title="Copy WhatsApp number"
                        >
                          {copiedKey === copyKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}

                {/* ── All Email Channels ── */}
                {emailList.map((emailItem, idx) => {
                  const mailUrl = `mailto:${emailItem.value}?subject=${encodeURIComponent(
                    `[MessPro Support] ${reasonMeta.title}`
                  )}&body=${encodeURIComponent(reasonMeta.prefillMsg)}`
                  const copyKey = `email-${idx}`

                  return (
                    <div
                      key={copyKey}
                      className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block">
                            {emailItem.label || 'Support Email'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block mt-0.5">
                            {emailItem.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(emailItem.value, copyKey, 'Email address')}
                          className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                          title="Copy email address"
                        >
                          {copiedKey === copyKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <a
                          href={mailUrl}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Email</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}

                {/* ── Helpline Phone Numbers (if distinct from WhatsApp) ── */}
                {phoneList.map((phoneItem, idx) => {
                  const copyKey = `phone-${idx}`

                  return (
                    <div
                      key={copyKey}
                      className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block">
                            {phoneItem.label || 'Helpline Phone'}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground truncate block mt-0.5">
                            {phoneItem.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(phoneItem.value, copyKey, 'Phone number')}
                          className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                        >
                          {copiedKey === copyKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <a
                          href={`tel:${phoneItem.value}`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  )
                })}

                {/* ── Other Custom Additional Info Fields ── */}
                {otherAdditionalInfo.map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-muted-foreground capitalize">
                      {item.key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{item.value}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, item.key, item.key)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Official MessPro Support</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 cursor-pointer rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
