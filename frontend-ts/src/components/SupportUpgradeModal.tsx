import React, { useState, useEffect } from 'react'
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
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export type SupportContextReason =
  | 'setup'
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

export const OFFICIAL_SUPPORT_EMAIL = 'manan12345ch@gmail.com'

export const OFFICIAL_SUPPORT_NUMBERS = [
  {
    id: 'line1',
    raw: '+923261678545',
    digits: '923261678545',
    display: '+92 326 1678545',
    label: 'Primary Helpline & WhatsApp',
  },
  {
    id: 'line2',
    raw: '+92 308 3460558',
    digits: '923083460558',
    display: '+92 308 3460558',
    label: 'Secondary Helpline & WhatsApp',
  },
]

export default function SupportUpgradeModal({
  isOpen,
  onClose,
  initialReason = 'setup',
  featureName,
}: SupportUpgradeModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeReason, setActiveReason] = useState<SupportContextReason>(initialReason)

  // Sync active reason whenever modal opens or initialReason changes
  useEffect(() => {
    if (isOpen) {
      setActiveReason(initialReason)
    }
  }, [isOpen, initialReason])

  if (!isOpen) return null

  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getReasonMeta = (reason: SupportContextReason) => {
    switch (reason) {
      case 'setup':
        return {
          title: 'Setup & Onboard Your Hostel',
          desc: featureName
            ? `To set up your hostel facility with the "${featureName}" plan, please contact our platform onboarding team directly via WhatsApp, Phone, or Email.`
            : 'To set up your hostel workspace, activate trial access, or request deployment assistance, please contact our platform team directly via WhatsApp, Phone, or Email.',
          badge: 'Hostel Setup',
          icon: Building2,
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          prefillMsg: featureName
            ? `Hello MessPro Support, I would like to set up and onboard our hostel on MessPro with the "${featureName}" plan.`
            : 'Hello MessPro Support, I would like to set up and onboard our hostel on MessPro.',
        }
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

  const mailUrl = `mailto:${OFFICIAL_SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `[MessPro Support] ${reasonMeta.title}`
  )}&body=${encodeURIComponent(reasonMeta.prefillMsg)}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground truncate">
                  Hostel Setup & Support
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${reasonMeta.badgeColor}`}
                >
                  <ReasonIcon className="w-3 h-3" />
                  {reasonMeta.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Direct helpline for hostel setup, trial activation & support
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
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'setup', label: 'Setup Hostel', icon: Building2 },
                { id: 'upgrade', label: 'Upgrade Plan', icon: Zap },
                { id: 'renewal', label: 'Renew', icon: Repeat },
                { id: 'feature', label: 'Features', icon: Sparkles },
                { id: 'bug', label: 'Report Bug', icon: Bug },
              ].map((item) => {
                const ItemIcon = item.icon
                const isActive = activeReason === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveReason(item.id as SupportContextReason)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                        : 'bg-background hover:bg-muted/40 text-muted-foreground border-border/70'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Context Explanatory Banner */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center gap-2">
              <ReasonIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-foreground">{reasonMeta.title}</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{reasonMeta.desc}</p>
          </div>

          {/* Contact Channels */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Official Platform Support Channels
            </span>

            <div className="space-y-2.5">
              {/* ── Official Supporting Numbers (WhatsApp & Call) ── */}
              {OFFICIAL_SUPPORT_NUMBERS.map((numItem) => {
                const waUrl = `https://wa.me/${numItem.digits}?text=${encodeURIComponent(
                  reasonMeta.prefillMsg
                )}`
                const copyKey = `phone-${numItem.id}`

                return (
                  <div
                    key={numItem.id}
                    className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">
                            {numItem.label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            WhatsApp & Call
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-muted-foreground truncate block mt-0.5">
                          {numItem.display}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {/* Copy */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(numItem.raw, copyKey, numItem.label)}
                        className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                        title="Copy phone number"
                      >
                        {copiedKey === copyKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      {/* Direct Call */}
                      <a
                        href={`tel:${numItem.raw}`}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold bg-background hover:bg-muted border border-border text-foreground shadow-xs transition-colors"
                        title="Call helpline"
                      >
                        <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Call</span>
                      </a>

                      {/* WhatsApp Chat */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )
              })}

              {/* ── Official Email Channel ── */}
              <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        Official Support Email
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Email Support
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate block mt-0.5 font-mono">
                      {OFFICIAL_SUPPORT_EMAIL}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(OFFICIAL_SUPPORT_EMAIL, 'email', 'Official email')}
                    className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                    title="Copy email address"
                  >
                    {copiedKey === 'email' ? (
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
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
