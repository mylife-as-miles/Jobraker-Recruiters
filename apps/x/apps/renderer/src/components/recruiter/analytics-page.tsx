import * as React from 'react'
import { toast } from 'sonner'
import {
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  Plus,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'motion/react'
import {
  ANALYTICS_INSIGHTS,
  ANALYTICS_KPIS,
  ANALYTICS_RECOMMENDED_ACTIONS,
  DATE_RANGE_LABEL,
  HIRING_FUNNEL,
  OUTREACH_TREND,
  PIPELINE_HEALTH,
  SOURCE_PERFORMANCE,
  SOURCE_TOTAL,
  TIME_TO_FILL_BY_ROLE,
  type Kpi,
} from './data'
import {
  AnimatedNumber,
  Delta,
  Reveal,
  Skeleton,
  SkeletonCard,
  useFakeLoading,
  RECRUITER_EASE,
} from './shared'
import { PageTransition } from '@/components/premium-states'

const KPI_ICONS: Record<Kpi['icon'], React.ReactNode> = {
  roles: <Briefcase className="size-5" />,
  response: <Send className="size-5" />,
  time: <Clock className="size-5" />,
  interviews: <Users className="size-5" />,
  offer: <CheckCircle2 className="size-5" />,
}

type AnalyticsPageProps = {
  onAskCopilot?: (prompt: string) => void
  onNavigatePipeline?: () => void
  onOpenSearch?: () => void
  onOpenChat?: (prompt?: string) => void
  onTakeMeetingNotes?: () => void
  onOpenAgents?: () => void
  onOpenEmail?: (threadId?: string) => void
  onOpenMeetings?: () => void
}

export function AnalyticsPage({
  onAskCopilot,
  onNavigatePipeline,
  onOpenSearch,
  onOpenChat,
  onTakeMeetingNotes,
  onOpenAgents,
}: AnalyticsPageProps) {
  const loading = useFakeLoading(720)
  const [search] = React.useState('')
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  const filteredTimeToFill = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TIME_TO_FILL_BY_ROLE
    return TIME_TO_FILL_BY_ROLE.filter((r) => r.role.toLowerCase().includes(q))
  }, [search])

  if (loading) {
    return (
      <PageTransition className="analytics-shot recruiter-scroll flex h-full min-h-0 flex-col overflow-auto p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
          <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Skeleton className="h-64 rounded-xl xl:col-span-4" />
          <Skeleton className="h-64 rounded-xl xl:col-span-4" />
          <Skeleton className="h-64 rounded-xl xl:col-span-4" />
          <Skeleton className="h-72 rounded-xl xl:col-span-4" />
          <Skeleton className="h-72 rounded-xl xl:col-span-4" />
          <Skeleton className="h-72 rounded-xl xl:col-span-4" />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="analytics-shot recruiter-scroll flex h-full min-h-0 flex-col overflow-auto px-6 pb-8 pt-5 text-white">
      <header className="analytics-topbar">
        <div className="min-w-0">
          <h1 className="text-[25px] font-semibold leading-none tracking-[-0.04em] text-white">Analytics</h1>
          <p className="mt-3 text-[13px] text-white/55">
            Data-driven insights to optimize your recruiting and drive better outcomes.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col items-stretch gap-3 lg:w-auto lg:items-end">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div
              role="button"
              tabIndex={0}
              onClick={onOpenSearch}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onOpenSearch?.()
              }}
              className="analytics-search cursor-pointer"
            >
              <Search className="size-4 text-white/55" />
              <input
                readOnly
                placeholder="Search candidates, roles, or notes"
                className="cursor-pointer"
              />
              <kbd>⌘ K</kbd>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.success('System status: Healthy', {
                  description: '3 active sourcing agents running. 0 active errors.',
                  duration: 3500,
                })
              }}
              className="analytics-icon-button cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span>3</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="analytics-new-button cursor-pointer"
              >
                <Plus className="size-5" />
                New
                <ChevronDown className="ml-5 size-4" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-zinc-800 bg-[#09090b] p-1.5 shadow-2xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onOpenChat?.() }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-zinc-800/60"
                    >
                      New Search Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onOpenChat?.('Help me create a new job role template.') }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-zinc-800/60"
                    >
                      New Job Role
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onTakeMeetingNotes?.() }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-zinc-800/60"
                    >
                      New Meeting Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onOpenAgents?.() }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-zinc-800/60"
                    >
                      New AI Agent
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                toast.info('Date range filter changed', {
                  description: `Displaying metrics for ${DATE_RANGE_LABEL}.`,
                })
              }}
              className="analytics-date-button cursor-pointer"
            >
              <CalendarDays className="size-3.5" />
              {DATE_RANGE_LABEL.replace('–', '-')}
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {ANALYTICS_KPIS.map((kpi, index) => (
          <Reveal key={kpi.label} delay={index * 0.035} className="min-w-0">
            <KpiCard kpi={kpi} />
          </Reveal>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Reveal className="min-w-0 xl:col-span-4" delay={0.06}>
          <AnalyticsPanel title="Hiring Funnel" aside="Conversion" className="min-h-[252px]">
            <FunnelChart />
          </AnalyticsPanel>
        </Reveal>

        <Reveal className="min-w-0 xl:col-span-4" delay={0.09}>
          <AnalyticsPanel title="Candidate Source Performance" className="min-h-[252px]">
            <SourcePerformance onAskCopilot={onAskCopilot} />
          </AnalyticsPanel>
        </Reveal>

        <Reveal className="min-w-0 xl:col-span-4" delay={0.12}>
          <AnalyticsPanel
            title="Outreach Response Trend"
            aside={(
              <button type="button" className="analytics-select-pill">
                Response Rate
                <ChevronDown className="size-3" />
              </button>
            )}
            className="min-h-[252px]"
          >
            <ResponseTrend />
          </AnalyticsPanel>
        </Reveal>

        <Reveal className="min-w-0 xl:col-span-4" delay={0.08}>
          <AnalyticsPanel title="Time to Fill by Role" className="min-h-[278px]">
            <TimeToFillTable rows={filteredTimeToFill} onAskCopilot={onAskCopilot} />
          </AnalyticsPanel>
        </Reveal>

        <Reveal className="min-w-0 xl:col-span-4" delay={0.11}>
          <AnalyticsPanel title="Pipeline Health" className="min-h-[278px]">
            <PipelineHealth onNavigatePipeline={onNavigatePipeline} />
          </AnalyticsPanel>
        </Reveal>

        <Reveal className="min-w-0 xl:col-span-4" delay={0.14}>
          <AnalyticsPanel
            title={(
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 fill-[#b6ff00] text-[#b6ff00]" />
                AI Insights
                <span className="rounded-full bg-[#39ff14]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#39ff14]">AI</span>
              </span>
            )}
            aside={(
              <button
                type="button"
                className="analytics-link"
                onClick={() => onAskCopilot?.('Analyze my recruiting analytics and suggest top 3 actions for this week.')}
              >
                View all insights {'->'}
              </button>
            )}
            className="min-h-[278px]"
          >
            <AiInsights onAskCopilot={onAskCopilot} />
          </AnalyticsPanel>
        </Reveal>
      </section>
    </PageTransition>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const invert = kpi.icon === 'time'
  const positive = kpi.trend === 'up'
  return (
    <div className="analytics-kpi-card">
      <div>
        <p className="analytics-kpi-label">{kpi.label}</p>
        <p className="mt-2 text-[25px] font-semibold leading-none tracking-[-0.04em] text-white">{kpi.value}</p>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-white/48">
          <Delta
            value={positive ? 1 : -1}
            suffix={invert ? ' days' : kpi.value.includes('%') ? 'pp' : ''}
            invertColor={invert}
            className="!text-[10px]"
          />
          <span>{kpi.deltaLabel.replace('–', '-')}</span>
        </p>
      </div>
      <div className="analytics-kpi-orb">
        {KPI_ICONS[kpi.icon]}
      </div>
    </div>
  )
}

function AnalyticsPanel({
  title,
  aside,
  className,
  children,
}: {
  title: React.ReactNode
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`analytics-panel ${className ?? ''}`}>
      <div className="analytics-panel-header">
        <h2>
          {title}
          <Info className="size-3 text-white/35" />
        </h2>
        {aside && <div className="analytics-panel-aside">{aside}</div>}
      </div>
      {children}
    </div>
  )
}

function FunnelChart() {
  const max = HIRING_FUNNEL[0]?.value ?? 1
  return (
    <div className="mt-4">
      <div className="grid grid-cols-[64px_1fr_58px] gap-3 text-[10px] text-white/48">
        <span />
        <span />
        <span className="text-right">Conversion</span>
      </div>
      <div className="mt-1 space-y-0">
        {HIRING_FUNNEL.map((stage, index) => {
          const width = Math.max(19, (stage.value / max) * 100)
          return (
            <div key={stage.stage} className="analytics-funnel-row">
              <span>{stage.stage}</span>
              <div className="analytics-funnel-track">
                <motion.div
                  className="analytics-funnel-bar"
                  style={{ width: `${width}%` }}
                  initial={{ scaleX: 0.2, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.55, delay: index * 0.07, ease: RECRUITER_EASE }}
                >
                  <strong>{stage.value.toLocaleString()}</strong>
                </motion.div>
              </div>
              <span className="text-right text-white/58">{index === 0 ? '' : `${stage.conversion}%`}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="text-white/70">Overall conversion <strong className="text-white">0.9%</strong></span>
        <span className="text-[#39ff14]">↑ 0.2pp vs Apr 11 - May 10</span>
      </div>
    </div>
  )
}

function SourcePerformance({ onAskCopilot }: { onAskCopilot?: (prompt: string) => void }) {
  return (
    <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[154px_1fr]">
      <div className="relative mx-auto h-[154px] w-[154px] shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={SOURCE_PERFORMANCE}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={1.5}
              stroke="#050705"
              strokeWidth={2}
            >
              {SOURCE_PERFORMANCE.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <AnimatedNumber value={SOURCE_TOTAL} className="text-[24px] font-semibold leading-none tracking-[-0.04em]" />
          <span className="mt-1 text-[10px] text-white/48">Total Sourced</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {SOURCE_PERFORMANCE.map((source) => (
          <div key={source.name} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-2 text-white/70">
              <span className="size-2.5 rounded-full" style={{ background: source.color }} />
              <span className="truncate">{source.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-white">{source.pct}% ({source.value})</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onAskCopilot?.("Give me a comprehensive report on Candidate Source performance.")}
        className="analytics-link col-span-2 mt-2 justify-self-start"
      >
        View full source report {'->'}
      </button>
    </div>
  )
}

function ResponseTrend() {
  return (
    <div className="relative mt-3 h-[196px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={OUTREACH_TREND} margin={{ top: 10, right: 16, left: -18, bottom: 10 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tick={{ fill: 'rgba(255,255,255,0.42)', fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 40]}
            ticks={[0, 10, 20, 30, 40]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: 'rgba(255,255,255,0.42)', fontSize: 10 }}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(57,255,20,0.28)', strokeDasharray: '3 4' }}
            contentStyle={{
              background: '#050705',
              border: '1px solid rgba(57,255,20,0.25)',
              borderRadius: 10,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: 11,
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Response Rate']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#39ff14"
            strokeWidth={2.2}
            dot={{ r: 4, fill: '#39ff14', stroke: '#39ff14', strokeWidth: 0 }}
            activeDot={{ r: 5.5, fill: '#39ff14', stroke: '#050705', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="analytics-chart-legend">
        <span className="size-2.5 rounded-full bg-[#39ff14]" />
        Response Rate
      </div>
    </div>
  )
}

function TimeToFillTable({
  rows,
  onAskCopilot,
}: {
  rows: typeof TIME_TO_FILL_BY_ROLE
  onAskCopilot?: (prompt: string) => void
}) {
  return (
    <div className="mt-4">
      {rows.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-[12px] text-white/45">
          No roles match your search.
        </div>
      ) : (
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Time to Fill</th>
              <th>vs Prior Period</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.role}>
                <td>{row.role}</td>
                <td>{row.days} days</td>
                <td>
                  <Delta value={-row.deltaDays} suffix=" days" invertColor />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        type="button"
        onClick={() => onAskCopilot?.("Give me a detailed report of recruiting Time to Fill metrics by role.")}
        className="analytics-link mt-6"
      >
        View full report {'->'}
      </button>
    </div>
  )
}

function PipelineHealth({ onNavigatePipeline }: { onNavigatePipeline?: () => void }) {
  return (
    <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[120px_1fr]">
      <div>
        <div className="relative flex size-[112px] items-center justify-center">
          <svg className="-rotate-90" width={112} height={112}>
            <circle cx={56} cy={56} r={44} fill="none" stroke="rgba(57,255,20,0.12)" strokeWidth={8} />
            <motion.circle
              cx={56}
              cy={56}
              r={44}
              fill="none"
              stroke="#7cff00"
              strokeLinecap="round"
              strokeWidth={8}
              strokeDasharray={2 * Math.PI * 44}
              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - PIPELINE_HEALTH.score / 100) }}
              transition={{ duration: 1, ease: RECRUITER_EASE }}
            />
          </svg>
          <div className="absolute text-center">
            <AnimatedNumber value={PIPELINE_HEALTH.score} className="text-[28px] font-semibold leading-none text-[#b6ff00]" />
            <p className="mt-1 text-[10px] text-[#b6ff00]">{PIPELINE_HEALTH.label}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-white/62">{PIPELINE_HEALTH.note}</p>
      </div>

      <div>
        <div className="mb-3 grid grid-cols-[1fr_1.6fr_44px] gap-2 text-[10px] text-white/42">
          <span>Stage</span>
          <span />
          <span className="text-right">vs Prior Period</span>
        </div>
        <div className="space-y-3">
          {PIPELINE_HEALTH.stages.map((stage) => (
            <div key={stage.stage} className="grid grid-cols-[1fr_1.6fr_44px] items-center gap-2">
              <span className="text-[11px] text-white/70">{stage.stage}</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-[#39ff14]"
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.pct}%` }}
                  transition={{ duration: 0.62, ease: RECRUITER_EASE }}
                />
              </div>
              <Delta value={stage.deltaPct} suffix="%" className="justify-end" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onNavigatePipeline}
          className="analytics-link mt-8"
        >
          See pipeline breakdown {'->'}
        </button>
      </div>
    </div>
  )
}

function AiInsights({ onAskCopilot }: { onAskCopilot?: AnalyticsPageProps['onAskCopilot'] }) {
  return (
    <div className="mt-3 space-y-2">
      {ANALYTICS_INSIGHTS.map((insight, index) => (
        <div
          key={insight.title}
          onClick={() => onAskCopilot?.(`Analyze recruiting insight: ${insight.title} - ${insight.body}`)}
          className="analytics-insight-row cursor-pointer hover:bg-white/5 transition rounded-lg p-1"
        >
          <span className={index === 0 ? 'analytics-insight-icon analytics-insight-icon--green' : 'analytics-insight-icon analytics-insight-icon--purple'}>
            {index === 0 ? <TrendingUp className="size-5" /> : <Zap className="size-5" />}
          </span>
          <span className="min-w-0">
            <strong>{insight.title}</strong>
            <span>{insight.body}</span>
          </span>
        </div>
      ))}

      <div className="analytics-actions-box">
        <p>Recommended actions</p>
        {ANALYTICS_RECOMMENDED_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAskCopilot?.(`Help me execute recommended action: ${action}`)}
            className="flex w-full items-center gap-2 text-left hover:text-[#b6ff00] transition-colors py-0.5"
          >
            <Check className="size-3 shrink-0" />
            <span>{action}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="analytics-link mt-2"
        onClick={() => onAskCopilot?.('What should I prioritize in my recruiting pipeline this week?')}
      >
        Ask AI Agent for more insights {'->'}
      </button>
    </div>
  )
}
