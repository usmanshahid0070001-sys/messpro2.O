import type { LucideIcon } from 'lucide-react'

export interface MetricConfig {
  label: string
  value: string | number
  subtext: string
  icon: LucideIcon
  /** Tailwind color classes for the icon (text + border hover) */
  iconColor: string
  borderHover: string
  /** Optional: override value text color */
  valueColor?: string
  /** Whether card spans 2 cols on mobile (last item in a 5-col row) */
  wideOnMobile?: boolean
}

interface ResidenceMetricsProps {
  metrics: MetricConfig[]
}

export default function ResidenceMetrics({ metrics }: ResidenceMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5 w-full min-w-0">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`p-3.5 sm:p-4 rounded-xl bg-card border border-border flex flex-col justify-between gap-2 shadow-xs min-w-0 transition-colors ${m.borderHover} ${m.wideOnMobile ? 'col-span-2 sm:col-span-1' : ''}`}
        >
          <span className={`text-xs sm:text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 truncate`}>
            <m.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${m.iconColor}`} />
            <span className="truncate">{m.label}</span>
          </span>
          <div>
            <div className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight font-mono ${m.valueColor ?? 'text-foreground'}`}>
              {m.value}
            </div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-normal mt-0.5 truncate">
              {m.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
