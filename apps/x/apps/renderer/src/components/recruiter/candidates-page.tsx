import * as React from 'react'
import { toast } from 'sonner'
import {
  Bookmark,
  Briefcase,
  ChevronDown,
  Filter,
  Mail,
  MoreHorizontal,
  Pencil,
  Sparkles,
  User,
  X,
  BarChart3,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  CANDIDATE_KPIS,
  CANDIDATES,
  type Candidate,
  type CandidateStage,
} from './data'
import { loadRecruiterState, saveRecruiterState } from './storage'
import {
  AnimatedNumber,
  Avatar,
  Delta,
  EmptyState,
  MatchBar,
  RecruiterHeader,
  Reveal,
  ScoreRing,
  Skeleton,
  SkeletonCard,
  useFakeLoading,
  RECRUITER_EASE,
} from './shared'
import { cn } from '@/lib/utils'

const STAGE_STYLES: Record<CandidateStage, string> = {
  New: 'bg-foreground/10 text-muted-foreground border-border/50',
  Screening: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'In Review': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Shortlisted: 'bg-brand/15 text-brand border-brand/35',
  Interview: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Offer: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Hired: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

const PAGE_SIZES = [5, 10, 25]

type CandidatesPageProps = {
  onAskCopilot?: (prompt: string) => void
  onNavigatePipeline?: () => void
  onOpenSearch?: () => void
  onOpenChat?: (prompt?: string) => void
  onTakeMeetingNotes?: () => void
  onOpenAgents?: () => void
  onOpenEmail?: (threadId?: string) => void
  onOpenMeetings?: () => void
}

export function CandidatesPage({
  onAskCopilot,
  onNavigatePipeline,
  onOpenSearch,
  onOpenChat,
  onTakeMeetingNotes,
  onOpenAgents,
  onOpenEmail,
  onOpenMeetings,
}: CandidatesPageProps) {
  const loading = useFakeLoading(680)
  const [search, setSearch] = React.useState('')
  const [stageFilter, setStageFilter] = React.useState<CandidateStage | 'All'>('All')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)
  const [selectedId, setSelectedId] = React.useState<string | null>('c1')
  const [candidatesList] = React.useState<Candidate[]>(() =>
    loadRecruiterState('candidates', CANDIDATES)
  )
  const [checked, setChecked] = React.useState<Set<string>>(() => new Set(['c1']))
  const [stages, setStages] = React.useState<Record<string, CandidateStage>>(() =>
    loadRecruiterState(
      'candidate-stages',
      Object.fromEntries(candidatesList.map((c) => [c.id, c.stage])) as Record<string, CandidateStage>,
    ),
  )
  const [notes, setNotes] = React.useState<Record<string, string>>(() =>
    loadRecruiterState(
      'candidate-notes',
      Object.fromEntries(candidatesList.filter((c) => c.note).map((c) => [c.id, c.note!])) as Record<string, string>,
    ),
  )
  const [editingNote, setEditingNote] = React.useState(false)
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null)

  React.useEffect(() => {
    saveRecruiterState('candidate-stages', stages)
  }, [stages])

  React.useEffect(() => {
    saveRecruiterState('candidate-notes', notes)
  }, [notes])

  const candidates = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidatesList.map((c) => ({ ...c, stage: stages[c.id] ?? c.stage }))
      .filter((c) => {
        if (stageFilter !== 'All' && c.stage !== stageFilter) return false
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q)
          || c.title.toLowerCase().includes(q)
          || c.location.toLowerCase().includes(q)
          || c.skills.some((s) => s.toLowerCase().includes(q))
        )
      })
  }, [candidatesList, search, stageFilter, stages])

  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize))
  const pageItems = candidates.slice((page - 1) * pageSize, page * pageSize)
  const selected = candidates.find((c) => c.id === selectedId) ?? pageItems[0] ?? null

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const updateStage = (id: string, stage: CandidateStage) => {
    setStages((prev) => ({ ...prev, [id]: stage }))
  }

  if (loading) {
    return (
      <div className="recruiter-scroll flex h-full overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-6 pt-6"><Skeleton className="h-8 w-48" /></div>
          <div className="grid grid-cols-2 gap-3 px-6 py-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <Skeleton className="mx-6 h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="recruiter-scroll flex min-w-0 flex-1 flex-col overflow-auto">
        <RecruiterHeader
          title="Candidates"
          subtitle="Search, evaluate, and engage top talent."
          searchPlaceholder="Search candidates by name, role, skill…"
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          onOpenSearch={onOpenSearch}
          onOpenChat={onOpenChat}
          onTakeMeetingNotes={onTakeMeetingNotes}
          onOpenAgents={onOpenAgents}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 px-6 lg:grid-cols-4">
          {[
            { label: 'Total Candidates', value: CANDIDATE_KPIS.total, delta: CANDIDATE_KPIS.totalDeltaPct, icon: Briefcase },
            { label: 'Shortlisted', value: CANDIDATE_KPIS.shortlisted, delta: CANDIDATE_KPIS.shortlistedDeltaPct, icon: Bookmark },
            { label: 'In Review', value: CANDIDATE_KPIS.inReview, delta: CANDIDATE_KPIS.inReviewDeltaPct, icon: User },
            { label: 'Avg Match Score', value: CANDIDATE_KPIS.avgMatch, delta: CANDIDATE_KPIS.avgMatchDeltaPct, icon: BarChart3, suffix: '%' },
          ].map((kpi, i) => (
            <Reveal key={kpi.label} delay={i * 0.05}>
              <div className="recruiter-kpi recruiter-card rounded-2xl border border-border/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">
                      <AnimatedNumber value={kpi.value} format={(n) => `${Math.round(n)}${kpi.suffix ?? ''}`} />
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Delta value={kpi.delta} suffix="%" />
                      vs last 7 days
                    </p>
                  </div>
                  <span className="flex size-9 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                    <kpi.icon className="size-4" />
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2 px-6">
          {(['Role', 'Stage', 'Location', 'Experience', 'Source', 'Match score'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="flex h-8 items-center gap-1 rounded-lg border border-border/50 bg-foreground/[0.03] px-2.5 text-[11px] text-muted-foreground transition hover:border-brand/30 hover:text-foreground"
              onClick={() => {
                if (f === 'Stage') setStageFilter((s) => (s === 'All' ? 'Shortlisted' : 'All'))
              }}
            >
              {f === 'Stage' && stageFilter !== 'All' ? stageFilter : f}
              <ChevronDown className="size-3" />
            </button>
          ))}
          <button
            type="button"
            className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-border/50 px-2.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Filter className="size-3.5" />
            Filters
          </button>
        </div>

        {/* Table */}
        <Reveal className="mt-4 flex-1 px-6 pb-4" delay={0.1}>
          {candidates.length === 0 ? (
            <EmptyState
              icon={<User className="size-6" />}
              title="No candidates found"
              body="Adjust your filters or search to discover talent in your pipeline."
              action={
                <button
                  type="button"
                  onClick={() => { setSearch(''); setStageFilter('All') }}
                  className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-black"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-foreground/[0.02] text-muted-foreground">
                    <th className="w-10 p-3" />
                    <th className="p-3 font-medium">Candidate</th>
                    <th className="hidden p-3 font-medium md:table-cell">Experience</th>
                    <th className="p-3 font-medium">Match</th>
                    <th className="p-3 font-medium">Stage</th>
                    <th className="hidden p-3 font-medium lg:table-cell">Source</th>
                    <th className="hidden p-3 font-medium sm:table-cell">Last activity</th>
                    <th className="w-10 p-3" />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr
                      key={c.id}
                      data-selected={selectedId === c.id}
                      className="recruiter-row cursor-pointer border-b border-border/20"
                      onClick={() => setSelectedId(c.id)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked.has(c.id)}
                          onChange={() => {
                            setChecked((prev) => {
                              const next = new Set(prev)
                              if (next.has(c.id)) next.delete(c.id)
                              else next.add(c.id)
                              return next
                            })
                          }}
                          className="size-3.5 rounded border-border accent-brand"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} size={32} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-foreground">{c.name}</span>
                              {c.fit && (
                                <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                                  {c.fit}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {c.title} · {c.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden p-3 tabular-nums text-muted-foreground md:table-cell">
                        {c.experienceYears} yrs
                      </td>
                      <td className="p-3"><MatchBar score={c.matchScore} /></td>
                      <td className="p-3">
                        <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold', STAGE_STYLES[c.stage])}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="hidden p-3 text-muted-foreground lg:table-cell">{c.source}</td>
                      <td className="hidden p-3 text-muted-foreground sm:table-cell">{c.lastActivity}</td>
                      <td className="relative p-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                        {activeMenuId === c.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-2 mt-1 z-40 w-44 rounded-xl border border-zinc-800 bg-[#09090b] p-1.5 shadow-2xl backdrop-blur-md">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  onOpenEmail?.()
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition-colors text-white"
                              >
                                Send Email
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  onOpenMeetings?.()
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition-colors text-white"
                              >
                                Schedule Interview
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  onAskCopilot?.(`Help me edit the candidate profile for ${c.name}.`)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition-colors text-white"
                              >
                                Ask AI to Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  toast.success(`Candidate ${c.name} removed from active list.`)
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove Candidate
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>

        {/* Pagination */}
        {candidates.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-6 py-3 text-[11px] text-muted-foreground">
            <span>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, candidates.length)} of{' '}
              {candidates.length.toLocaleString()} candidates
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-border/50 px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    'min-w-7 rounded-lg border px-2 py-1 tabular-nums',
                    page === n ? 'border-brand/40 bg-brand/15 text-brand' : 'border-border/50',
                  )}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 && <span className="px-1">…</span>}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border/50 px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="rounded-lg border border-border/50 bg-transparent px-2 py-1"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>Show {s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.aside
            key={selected.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35, ease: RECRUITER_EASE }}
            className="recruiter-scroll hidden w-[min(380px,38vw)] shrink-0 flex-col overflow-auto border-l border-border/50 bg-[var(--jobraker-recruiter-panel,rgba(255,255,255,0.02))] lg:flex"
          >
            <CandidateDetailPanel
              candidate={selected}
              note={notes[selected.id] ?? selected.note ?? ''}
              editingNote={editingNote}
              onEditNote={() => setEditingNote(true)}
              onSaveNote={(text) => {
                setNotes((prev) => ({ ...prev, [selected.id]: text }))
                setEditingNote(false)
              }}
              onClose={() => setSelectedId(null)}
              onStageChange={(stage) => updateStage(selected.id, stage)}
              onAskCopilot={onAskCopilot}
              onNavigatePipeline={onNavigatePipeline}
              onOpenEmail={onOpenEmail}
              onOpenMeetings={onOpenMeetings}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

function CandidateDetailPanel({
  candidate,
  note,
  editingNote,
  onEditNote,
  onSaveNote,
  onClose,
  onStageChange,
  onAskCopilot,
  onNavigatePipeline,
}: {
  candidate: Candidate
  note: string
  editingNote: boolean
  onEditNote: () => void
  onSaveNote: (text: string) => void
  onClose: () => void
  onStageChange: (stage: CandidateStage) => void
  onAskCopilot?: (prompt: string) => void
  onNavigatePipeline?: () => void
  onOpenEmail?: (threadId?: string) => void
  onOpenMeetings?: () => void
}) {
  const [draft, setDraft] = React.useState(note)
  React.useEffect(() => setDraft(note), [note, candidate.id])

  return (
    <>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex gap-3">
          <Avatar name={candidate.name} size={48} ring />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold">{candidate.name}</h2>
              {candidate.fit && (
                <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                  {candidate.fit}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{candidate.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {candidate.location} · {candidate.experienceYears} yrs experience
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-foreground/5">
          <X className="size-4" />
        </button>
      </div>

      <div className="mx-5 rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/12 to-transparent p-4">
        <div className="flex items-start gap-3">
          <ScoreRing score={candidate.matchScore} size={52} />
          <div>
            <p className="text-lg font-bold text-brand">{candidate.matchScore}% Match score</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Why this is a great match</span>
              <br />
              Strong alignment on {candidate.skills.slice(0, 3).join(', ')} with relevant experience in {candidate.title.toLowerCase()} roles.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold text-foreground">Top skills</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {candidate.skills.map((s) => (
            <span key={s} className="rounded-lg border border-border/50 bg-foreground/[0.04] px-2 py-1 text-[10px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold text-foreground">Experience highlights</p>
        <ul className="mt-2 space-y-1.5">
          {candidate.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-[11px] text-muted-foreground">
              <span className="text-brand">•</span>
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-xl border border-border/40 bg-foreground/[0.03] p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="size-3.5 text-violet-400" />
            AI Insights
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{candidate.aiInsight}</p>
          <button
            type="button"
            onClick={() => onAskCopilot?.(`Give me a full analysis of candidate ${candidate.name} for the ${candidate.title} role.`)}
            className="mt-2 text-[11px] font-medium text-brand hover:underline"
          >
            View full analysis
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Notes</p>
            <button type="button" onClick={onEditNote} className="text-muted-foreground hover:text-foreground">
              <Pencil className="size-3.5" />
            </button>
          </div>
          {editingNote ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => onSaveNote(draft)}
              className="mt-2 w-full resize-none rounded-xl border border-border/50 bg-foreground/[0.03] p-3 text-[11px] text-muted-foreground outline-none focus:border-brand/40"
              rows={3}
              autoFocus
            />
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {note || 'Add a note about this candidate…'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-border/40 p-5">
        <button
          type="button"
          onClick={() => onStageChange('Shortlisted')}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-black transition hover:brightness-110"
        >
          <Bookmark className="size-4" />
          Shortlist
        </button>
        <button
          type="button"
          onClick={() => {
            onStageChange('Interview')
            onNavigatePipeline?.()
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-brand/40 text-sm font-semibold text-brand transition hover:bg-brand/10"
        >
          <Briefcase className="size-4" />
          Move to Interview
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAskCopilot?.(`Draft a personalized outreach email to ${candidate.name} for our ${candidate.title} opening.`)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-brand/40"
          >
            <Mail className="size-3.5" />
            Draft outreach
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`Name: ${candidate.name}\nEmail: ${candidate.email}\nRole: ${candidate.title}\nLocation: ${candidate.location}`);
              toast.success(`CV Loaded: ${candidate.name}`, {
                description: `Copied contact details for ${candidate.name} to clipboard.`,
              });
            }}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-brand/40"
          >
            <FileText className="size-3.5" />
            View resume
          </button>
        </div>
      </div>
    </>
  )
}
