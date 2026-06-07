import * as React from 'react'
import {
  Briefcase,
  Send,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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
  DateRangePill,
  Delta,
  EmptyState,
  RecruiterHeader,
  Reveal,
  SectionCard,
  Skeleton,
  SkeletonCard,
  useFakeLoading,
  RECRUITER_EASE,
} from './shared'

const KPI_ICONS: Record<Kpi['icon'], React.ReactNode> = {
  roles: <Briefcase className="size-4" />,
  response: <Send className="size-4" />,
  time: <Clock className="size-4" />,
  interviews: <Users className="size-4" />,
  offer: <CheckCircle2 className="size-4" />,
}

type AnalyticsPageProps = {
  onAskCopilot?: (prompt: string) => void
}

export function AnalyticsPage({ onAskCopilot }: AnalyticsPageProps) {
  const loading = useFakeLoading(720)
  const [search, setSearch] = React.useState('')
  const trendMetric = 'Response Rate'

  const filteredTimeToFill = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TIME_TO_FILL_BY_ROLE
    return TIME_TO_FILL_BY_ROLE.filter((r) => r.role.toLowerCase().includes(q))
  }, [search])

  if (loading) {
    return (
      <div className="recruiter-scroll flex h-full flex-col overflow-auto">
        <div className="px-6 pt-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-6 py-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 px-6 pb-8 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="recruiter-scroll flex h-full flex-col overflow-auto bg-background">
      <RecruiterHeader
        title="Analytics"
        subtitle="Data-driven insights to optimize your recruiting and drive better outcomes."
        searchPlaceholder="Search candidates, roles, or notes"
        searchValue={search}
        onSearchChange={setSearch}
        rightExtra={<DateRangePill label={DATE_RANGE_LABEL} />}
      />

      <div className="px-6 pb-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {ANALYTICS_KPIS.map((kpi, i) => (
            <Reveal key={kpi.label} delay={i * 0.05}>
              <div className="recruiter-kpi recruiter-card rounded-2xl border border-border/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{kpi.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Delta
                        value={kpi.trend === 'up' ? 1 : -1}
                        suffix=""
                        invertColor={kpi.icon === 'time'}
                        className="!text-[10px]"
                      />
                      <span>{kpi.deltaLabel}</span>
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                    {KPI_ICONS[kpi.icon]}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Charts row */}
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-4" delay={0.1}>
            <SectionCard title="Hiring Funnel" hint="Conversion between stages">
              <div className="space-y-2">
                {HIRING_FUNNEL.map((stage, i) => {
                  const widthPct = Math.max(18, (stage.value / HIRING_FUNNEL[0].value) * 100)
                  return (
                    <div key={stage.stage} className="flex items-center gap-3">
                      <div className="w-20 shrink-0 text-right">
                        <p className="text-[11px] font-medium text-muted-foreground">{stage.stage}</p>
                        <p className="text-sm font-bold tabular-nums">{stage.value.toLocaleString()}</p>
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <motion.div
                          className="h-8 rounded-lg border border-brand/20 bg-gradient-to-r from-brand/25 to-brand/5"
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08, ease: RECRUITER_EASE }}
                        />
                        {i > 0 && (
                          <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand">
                            {stage.conversion}%
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <TrendingUp className="size-3 text-brand" />
                Overall conversion <span className="font-semibold text-foreground">0.9%</span>
                <Delta value={1} suffix="pp" className="ml-1" />
              </p>
            </SectionCard>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.15}>
            <SectionCard
              title="Candidate Source Performance"
              action={
                <button type="button" className="text-[11px] font-medium text-brand hover:underline">
                  View full source report →
                </button>
              }
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-44 w-44 shrink-0">
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
                        paddingAngle={2}
                        stroke="none"
                      >
                        {SOURCE_PERFORMANCE.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatedNumber value={SOURCE_TOTAL} className="text-xl font-bold tabular-nums" />
                    <span className="text-[10px] text-muted-foreground">Total Sourced</span>
                  </div>
                </div>
                <ul className="min-w-0 flex-1 space-y-2">
                  {SOURCE_PERFORMANCE.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 truncate text-muted-foreground">
                        <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-foreground">{s.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.2}>
            <SectionCard
              title="Outreach Response Trend"
              action={
                <button type="button" className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {trendMetric}
                  <ChevronDown className="size-3" />
                </button>
              }
            >
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={OUTREACH_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="outreachFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1dff00" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1dff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 40]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(29,255,0,0.25)',
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                      formatter={(v) => [`${Number(v)}%`, 'Response rate']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#1dff00"
                      strokeWidth={2}
                      fill="url(#outreachFill)"
                      dot={{ r: 3, fill: '#1dff00', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#1dff00' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </Reveal>
        </div>

        {/* Bottom row */}
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-4" delay={0.1}>
            <SectionCard
              title="Time to Fill by Role"
              action={
                <button type="button" className="text-[11px] font-medium text-brand hover:underline">
                  View full report →
                </button>
              }
            >
              {filteredTimeToFill.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="size-6" />}
                  title="No roles match your search"
                  body="Try a different query or clear the search bar."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground">
                        <th className="pb-2 font-medium">Role</th>
                        <th className="pb-2 font-medium">Time to Fill</th>
                        <th className="pb-2 font-medium">vs Prior Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTimeToFill.map((row) => (
                        <tr key={row.role} className="recruiter-row border-b border-border/20">
                          <td className="py-2.5 pr-2 font-medium text-foreground">{row.role}</td>
                          <td className="py-2.5 tabular-nums text-foreground">{row.days} days</td>
                          <td className="py-2.5">
                            <Delta value={-row.deltaDays} suffix=" days" invertColor />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.15}>
            <SectionCard
              title="Pipeline Health"
              action={
                <button type="button" className="text-[11px] font-medium text-brand hover:underline">
                  See pipeline breakdown →
                </button>
              }
            >
              <div className="flex gap-4">
                <div className="relative flex size-28 shrink-0 items-center justify-center">
                  <svg className="-rotate-90" width={112} height={112}>
                    <circle cx={56} cy={56} r={48} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
                    <motion.circle
                      cx={56}
                      cy={56}
                      r={48}
                      fill="none"
                      stroke="#1dff00"
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - PIPELINE_HEALTH.score / 100) }}
                      transition={{ duration: 1, ease: RECRUITER_EASE }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <AnimatedNumber value={PIPELINE_HEALTH.score} className="text-2xl font-bold text-brand" />
                    <p className="text-[10px] text-muted-foreground">{PIPELINE_HEALTH.label}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{PIPELINE_HEALTH.note}</p>
                  {PIPELINE_HEALTH.stages.map((s) => (
                    <div key={s.stage} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{s.stage}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                        <motion.div
                          className="h-full rounded-full bg-brand"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.6, ease: RECRUITER_EASE }}
                        />
                      </div>
                      <Delta value={s.deltaPct} suffix="%" className="w-10 justify-end" />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.2}>
            <SectionCard
              title={
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 text-brand" />
                  AI Insights
                </span>
              }
              action={
                <button
                  type="button"
                  className="text-[11px] font-medium text-brand hover:underline"
                  onClick={() => onAskCopilot?.('Analyze my recruiting analytics and suggest top 3 actions for this week.')}
                >
                  View all insights →
                </button>
              }
            >
              <div className="space-y-3">
                {ANALYTICS_INSIGHTS.map((insight) => (
                  <div
                    key={insight.title}
                    className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3"
                  >
                    <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{insight.body}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
                  <p className="text-xs font-semibold text-foreground">Recommended actions</p>
                  <ul className="mt-2 space-y-1.5">
                    {ANALYTICS_RECOMMENDED_ACTIONS.map((action) => (
                      <li key={action} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-brand" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onAskCopilot?.('What should I prioritize in my recruiting pipeline this week?')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand/30 bg-brand/10 py-2 text-xs font-semibold text-brand transition hover:bg-brand/15"
                >
                  Ask AI Agent for more insights
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
