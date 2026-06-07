import * as React from 'react'
import {
  Briefcase,
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Sparkles,
  Trophy,
  UserPlus,
  Send,
  Users,
  Calendar,
  Gift,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  PIPELINE_COLUMNS,
  PIPELINE_INSIGHTS,
  PIPELINE_ROLE_OPTIONS,
  PIPELINE_STAGES,
  candidateById,
  type PipelineStage,
} from './data'
import { loadRecruiterState, saveRecruiterState } from './storage'
import {
  Avatar,
  EmptyState,
  RecruiterHeader,
  Reveal,
  ScoreRing,
  Skeleton,
  SkeletonCard,
  useFakeLoading,
  Delta,
  SectionCard,
} from './shared'
import { cn } from '@/lib/utils'

const STAGE_ICONS: Record<PipelineStage, React.ReactNode> = {
  Sourced: <UserPlus className="size-4" />,
  Contacted: <Send className="size-4" />,
  Screening: <Users className="size-4" />,
  Interview: <Calendar className="size-4" />,
  Offer: <Gift className="size-4" />,
  Hired: <CheckCircle2 className="size-4" />,
}

const STAGE_DOT: Record<PipelineStage, string> = {
  Sourced: 'bg-sky-400',
  Contacted: 'bg-cyan-400',
  Screening: 'bg-amber-400',
  Interview: 'bg-violet-400',
  Offer: 'bg-orange-400',
  Hired: 'bg-brand',
}

function buildInitialBoard(): Record<PipelineStage, string[]> {
  const saved = loadRecruiterState<Record<PipelineStage, string[]> | null>('pipeline-board', null)
  if (saved) return saved
  return Object.fromEntries(
    PIPELINE_COLUMNS.map((col) => [col.stage, [...col.candidateIds]]),
  ) as Record<PipelineStage, string[]>
}

type PipelinePageProps = {
  onAskCopilot?: (prompt: string) => void
  onNavigateCandidates?: () => void
}

export function PipelinePage({ onAskCopilot, onNavigateCandidates }: PipelinePageProps) {
  const loading = useFakeLoading(700)
  const [search, setSearch] = React.useState('')
  const [role, setRole] = React.useState(PIPELINE_ROLE_OPTIONS[0])
  const [board, setBoard] = React.useState(buildInitialBoard)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overStage, setOverStage] = React.useState<PipelineStage | null>(null)

  React.useEffect(() => {
    saveRecruiterState('pipeline-board', board)
  }, [board])

  const columns = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    candidateIds: board[col.stage] ?? [],
    count: (board[col.stage] ?? []).length,
  }))

  const conversionRate = React.useMemo(() => {
    const sourced = board.Sourced?.length ?? 0
    const hired = board.Hired?.length ?? 0
    if (sourced === 0) return 0
    return Math.round((hired / sourced) * 1000) / 10
  }, [board])

  const moveCard = (candidateId: string, toStage: PipelineStage) => {
    setBoard((prev) => {
      const next = { ...prev }
      for (const stage of PIPELINE_STAGES) {
        next[stage] = next[stage].filter((id) => id !== candidateId)
      }
      next[toStage] = [...next[toStage], candidateId]
      return next
    })
  }

  const filteredBoard = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return board
    const result = {} as Record<PipelineStage, string[]>
    for (const stage of PIPELINE_STAGES) {
      result[stage] = board[stage].filter((id) => {
        const c = candidateById(id)
        return c && (c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
      })
    }
    return result
  }, [board, search])

  if (loading) {
    return (
      <div className="recruiter-scroll flex h-full flex-col overflow-auto">
        <div className="px-6 pt-6"><Skeleton className="h-8 w-40" /></div>
        <div className="grid grid-cols-3 gap-3 px-6 py-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="!p-3" />)}
        </div>
        <Skeleton className="mx-6 h-80 rounded-2xl" />
      </div>
    )
  }

  const totalCards = PIPELINE_STAGES.reduce((n, s) => n + (filteredBoard[s]?.length ?? 0), 0)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <RecruiterHeader
        title="Pipeline"
        subtitle="Visualize and manage your candidate flow."
        searchPlaceholder="Search candidates, roles, or notes"
        searchValue={search}
        onSearchChange={setSearch}
        rightExtra={
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-border/60 bg-foreground/5 pl-9 pr-8 text-sm text-foreground outline-none focus:border-brand/40"
            >
              {PIPELINE_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        }
      />

      {/* Stage metrics */}
      <div className="grid grid-cols-2 gap-2 px-6 lg:grid-cols-6">
        {columns.map((col, i) => (
          <Reveal key={col.stage} delay={i * 0.04}>
            <div className="recruiter-kpi recruiter-card rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
                  {STAGE_ICONS[col.stage]}
                </span>
                <span className="text-xl font-bold tabular-nums">{col.count}</span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">{col.stage}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Delta value={col.deltaPct} suffix="%" />
                vs last 7 days
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 flex min-h-0 flex-1 gap-4 px-6 pb-4">
        {/* Kanban */}
        <div className="recruiter-scroll min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
          {totalCards === 0 ? (
            <EmptyState
              icon={<Trophy className="size-6" />}
              title="Pipeline is empty"
              body="Add candidates or clear your search to see the kanban board."
              action={
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-black"
                >
                  Clear search
                </button>
              }
            />
          ) : (
            <div className="flex h-full min-w-max gap-3 pb-2">
              {PIPELINE_STAGES.map((stage) => {
                const ids = filteredBoard[stage] ?? []
                return (
                  <div
                    key={stage}
                    data-over={overStage === stage}
                    className="recruiter-kanban-col flex w-[240px] shrink-0 flex-col rounded-2xl border border-border/50 bg-foreground/[0.02] p-2 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault()
                      setOverStage(stage)
                    }}
                    onDragLeave={() => setOverStage(null)}
                    onDrop={(e) => {
                      e.preventDefault()
                      const id = e.dataTransfer.getData('text/candidate-id')
                      if (id) moveCard(id, stage)
                      setDragId(null)
                      setOverStage(null)
                    }}
                  >
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className={cn('size-2 rounded-full', STAGE_DOT[stage])} />
                      <span className="text-xs font-semibold text-foreground">{stage}</span>
                      <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">{ids.length}</span>
                    </div>
                    <div className="recruiter-scroll flex flex-1 flex-col gap-2 overflow-y-auto">
                      {ids.map((id) => {
                        const c = candidateById(id)
                        if (!c) return null
                        return (
                          <div
                            key={id}
                            draggable
                            data-dragging={dragId === id}
                            className="recruiter-kanban-card cursor-grab rounded-xl border border-border/50 bg-background/80 p-3 active:cursor-grabbing"
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/candidate-id', id)
                              setDragId(id)
                            }}
                            onDragEnd={() => {
                              setDragId(null)
                              setOverStage(null)
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <Avatar name={c.name} size={28} />
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold">{c.name}</p>
                                  <p className="truncate text-[10px] text-muted-foreground">{c.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <ScoreRing score={c.matchScore} size={30} />
                                <button type="button" className="text-muted-foreground">
                                  <MoreHorizontal className="size-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-2 text-[10px] text-muted-foreground">{c.source}</p>
                            {stage === 'Interview' && (
                              <p className="mt-1.5 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[9px] font-medium text-violet-300">
                                Interview Tomorrow, 11:00 AM
                              </p>
                            )}
                            {stage === 'Offer' && (
                              <p className="mt-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[9px] font-medium text-orange-300">
                                Offer Extended
                              </p>
                            )}
                            {stage === 'Hired' && (
                              <p className="mt-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 text-[9px] font-medium text-brand">
                                Hired {c.lastActivity}
                              </p>
                            )}
                          </div>
                        )
                      })}
                      <button
                        type="button"
                        onClick={onNavigateCandidates}
                        className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-border/50 py-2 text-[10px] font-medium text-brand transition hover:border-brand/40 hover:bg-brand/5"
                      >
                        <Plus className="size-3" />
                        Add candidate
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI insights sidebar */}
        <aside className="recruiter-scroll hidden w-72 shrink-0 flex-col gap-3 overflow-auto lg:flex">
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand" />
                AI Pipeline Insights
              </span>
            }
          >
            <div className="space-y-3">
              {PIPELINE_INSIGHTS.map((insight) => (
                <div key={insight.title} className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
                  <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{insight.body}</p>
                  <button type="button" className="mt-2 text-[11px] font-medium text-brand hover:underline">
                    {insight.cta}
                  </button>
                </div>
              ))}

              <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
                <p className="text-xs font-semibold text-foreground">Conversion rate</p>
                <p className="mt-1 text-2xl font-bold text-brand">{conversionRate}%</p>
                <p className="text-[10px] text-muted-foreground">From Sourced to Hired</p>
                <div className="mt-3 h-12">
                  <svg viewBox="0 0 120 40" className="h-full w-full">
                    <motion.polyline
                      fill="none"
                      stroke="#1dff00"
                      strokeWidth={2}
                      points="0,30 20,28 40,25 60,22 80,18 100,12 120,8"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2 }}
                    />
                  </svg>
                </div>
                <button type="button" className="mt-2 text-[11px] font-medium text-brand hover:underline">
                  View other suggestions
                </button>
              </div>

              <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
                <p className="text-xs font-semibold text-foreground">Suggested outreach</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Olivia Bennett matches {role} — reach out while she&apos;s active.
                </p>
                <button
                  type="button"
                  onClick={() => onAskCopilot?.(`Draft outreach to Olivia Bennett for the ${role} role.`)}
                  className="mt-2 w-full rounded-lg border border-brand/30 bg-brand/10 py-1.5 text-[11px] font-semibold text-brand"
                >
                  Send outreach
                </button>
              </div>

              <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
                <p className="text-xs font-semibold text-foreground">Interview recommendations</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {(board.Interview?.length ?? 0)} candidates ready for interview scheduling.
                </p>
                <button type="button" className="mt-2 text-[11px] font-medium text-brand hover:underline">
                  View schedule
                </button>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 border-t border-border/40 py-2 text-[10px] text-muted-foreground">
        <GripVertical className="size-3.5" />
        Drag and drop candidates between stages
      </div>
    </div>
  )
}
