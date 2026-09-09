import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  MessageCircle,
  ExternalLink,
  Layers,
  ShieldCheck,
  Headphones,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  OFFICIAL_SUPPORT_EMAIL,
  OFFICIAL_SUPPORT_NUMBERS,
} from '@/components/SupportUpgradeModal';
import { toast } from 'sonner';

export default function HostelRequestsPage() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Hostel Onboarding & Support Desk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Hostel onboarding and trial provisioning are coordinated directly through our official support and WhatsApp channels.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/app/superadmin/hostels"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-9 shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Active Hostels</span>
          </Link>
          <Link
            to="/app/superadmin/plans"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors h-9"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Manage Plans</span>
          </Link>
        </div>
      </div>

      {/* ── Direct Channel Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Support Phone & WhatsApp Channels */}
        <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Official WhatsApp & Helplines</h2>
              <p className="text-xs text-muted-foreground">Direct onboarding channels for new hostel admins</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {OFFICIAL_SUPPORT_NUMBERS.map((num) => {
              const copyKey = `desk-phone-${num.id}`;
              const waUrl = `https://wa.me/${num.digits}`;

              return (
                <div
                  key={num.id}
                  className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block">{num.label}</span>
                    <span className="text-xs font-mono font-medium text-muted-foreground block mt-0.5">
                      {num.display}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(num.raw, copyKey, num.label)}
                      className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                      title="Copy number"
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
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Email & Onboarding Hub */}
        <div className="p-5 rounded-2xl border border-blue-500/25 bg-blue-500/5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Official Support Email</h2>
              <p className="text-xs text-muted-foreground">Direct inbox for enterprise inquiries & agreements</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block">Primary Support Inbox</span>
              <span className="text-xs font-mono font-medium text-muted-foreground block mt-0.5 truncate">
                {OFFICIAL_SUPPORT_EMAIL}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(OFFICIAL_SUPPORT_EMAIL, 'desk-email', 'Official Email')}
                className="h-8 px-2 text-xs rounded-lg cursor-pointer"
                title="Copy email"
              >
                {copiedKey === 'desk-email' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <a
                href={`mailto:${OFFICIAL_SUPPORT_EMAIL}?subject=MessPro%20Hostel%20Onboarding`}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Mail</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Manual Provisioning Tip
            </span>
            <p className="text-[11px] leading-relaxed">
              To provision a new hostel directly, visit{' '}
              <Link to="/app/superadmin/hostels" className="text-primary font-semibold hover:underline">
                Manage Tenants
              </Link>{' '}
              and click <strong>"Create Hostel"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
