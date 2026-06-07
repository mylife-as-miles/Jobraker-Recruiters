import * as React from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import {
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { avatarGradient, initials } from './data'

// ───────────────────────── Animation helpers ─────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const

/** Fade + slide up when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Count-up animated number. Accepts the display formatter. */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 90, damping: 18, mass: 0.6 })
  const [display, setDisplay] = React.useState(() => format(0))

  React.useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, value, mv])

  React.useEffect(() => {
    return spring.on('change', (v) => setDisplay(format(v)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spring])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

/** Simulated initial load so skeleton states are exercised on each screen. */
export function useFakeLoading(ms = 650): boolean {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const id = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(id)
  }, [ms])
  return loading
}

// ───────────────────────── Header ─────────────────────────

export function RecruiterHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  rightExtra,
  onNew,
}: {
  title: string
  subtitle: string
  searchPlaceholder: string
  searchValue?: string
  onSearchChange?: (v: string) => void
  rightExtra?: React.ReactNode
  onNew?: () => void
}) {
  return (
    <div className="flex flex-col gap-4 px-6 pt-6 pb-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="recruiter-search group relative hidden md:flex">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-[min(320px,40vw)] rounded-xl border border-border/60 bg-foreground/5 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-brand/40 focus:bg-foreground/[0.07]"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        {rightExtra}
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-muted-foreground transition hover:border-brand/30 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-black">
            3
          </span>
        </button>
        <button
          type="button"
          onClick={onNew}
          className="recruiter-new-btn flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-black transition hover:brightness-110"
        >
          <Plus className="size-4" />
          <span>New</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </button>
      </div>
    </div>
  )
}

export function DateRangePill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-foreground/5 px-3 text-sm text-muted-foreground transition hover:border-brand/30 hover:text-foreground"
    >
      <span className="text-brand">▦</span>
      <span>{label}</span>
      <ChevronDown className="size-3.5 opacity-70" />
    </button>
  )
}

// ───────────────────────── Cards / sections ─────────────────────────

export function SectionCard({
  title,
  hint,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode
  hint?: string
  action?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'recruiter-card flex flex-col rounded-2xl border border-border/50 bg-[var(--jobraker-recruiter-panel,rgba(255,255,255,0.02))] p-5',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {hint && (
                <span
                  className="flex size-4 items-center justify-center rounded-full border border-border/60 text-[9px] text-muted-foreground"
                  title={hint}
                >
                  i
                </span>
              )}
            </div>
          )}
          {action}
        </div>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </div>
  )
}

export function Delta({
  value,
  suffix = '',
  invertColor = false,
  className,
}: {
  value: number
  suffix?: string
  /** When true, a negative value is "good" (e.g. time-to-fill going down). */
  invertColor?: boolean
  className?: string
}) {
  const up = value >= 0
  const positive = invertColor ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums',
        positive ? 'text-brand' : 'text-rose-400',
        className,
      )}
    >
      <Icon className="size-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  )
}

export function Avatar({
  name,
  size = 36,
  ring,
  className,
}: {
  name: string
  size?: number
  ring?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-black/90',
        ring && 'ring-2 ring-brand/40',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: avatarGradient(name),
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

export function ScoreRing({ score, size = 34 }: { score: number; size?: number }) {
  const tone = score >= 85 ? '#1dff00' : score >= 65 ? '#f8d74a' : '#f97316'
  const r = (size - 4) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[9px] font-bold" style={{ color: tone }}>
        {score}
      </span>
    </span>
  )
}

export function MatchBar({ score }: { score: number }) {
  const tone = score >= 85 ? '#1dff00' : score >= 65 ? '#f8d74a' : '#f97316'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold tabular-nums" style={{ color: tone }}>
        {score}%
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: tone }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  )
}

// ───────────────────────── Skeletons ─────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('recruiter-shimmer rounded-md', className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-foreground/[0.02] p-5', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-20" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  )
}

// ───────────────────────── Empty state ─────────────────────────

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-foreground/[0.02] px-6 py-14 text-center"
    >
      <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
        <span className="absolute inset-0 rounded-2xl bg-brand/10 blur-xl" />
        <span className="relative">{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}

export const RECRUITER_EASE = EASE
