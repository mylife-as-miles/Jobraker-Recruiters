import * as React from 'react'
import {
  Bookmark,
  Briefcase,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Star,
  Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { ROLES, PIPELINE_STAGES, type Role } from './data'
import { loadRecruiterState, saveRecruiterState } from './storage'
import {
  AnimatedNumber,
  Delta,
  EmptyState,
  RecruiterHeader,
  Reveal,
  ScoreRing,
  SectionCard,
  Skeleton,
  useFakeLoading,
  RECRUITER_EASE,
} from './shared'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<Role['status'], string> = {
  Open: 'bg-brand/15 text-brand border-brand/30',
  Interviewing: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Closing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Draft: 'bg-foreground/10 text-muted-foreground border-border/50',
}

type RolesPageProps = {
  onNavigatePipeline?: () => void
  onNavigateCandidates?: () => void
}

export function RolesPage({ onNavigatePipeline, onNavigateCandidates }: RolesPageProps) {
  const loading = useFakeLoading(660)
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string>(ROLES[0]?.id ?? '')
  const [favorites, setFavorites] = React.useState<Set<string>>(() => {
    const saved = loadRecruiterState<string[] | null>('role-favorites', null)
    if (saved) return new Set(saved)
    return new Set(ROLES.filter((r) => r.favorite).map((r) => r.id))
  })

  React.useEffect(() => {
    saveRecruiterState('role-favorites', [...favorites])
  }, [favorites])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ROLES
    return ROLES.filter(
      (r) =>
        r.title.toLowerCase().includes(q)
        || r.department.toLowerCase().includes(q)
        || r.location.toLowerCase().includes(q),
    )
  }, [search])

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null

  React.useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [selected, selectedId])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="recruiter-scroll flex h-full overflow-hidden">
        <div className="w-full max-w-md border-r border-border/40 p-4 lg:w-[380px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-24 rounded-2xl" />
          ))}
        </div>
        <div className="hidden flex-1 p-6 lg:block">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-4 h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <RecruiterHeader
        title="Roles"
        subtitle="Manage open positions and track hiring progress."
        searchPlaceholder="Search roles by title, department, location…"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="flex min-h-0 flex-1">
        {/* Role list — mirrors Jobraker JobPage master pane */}
        <div className="recruiter-scroll w-full max-w-md shrink-0 overflow-auto border-r border-border/50 lg:w-[380px]">
          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Briefcase className="size-6" />}
                title="No roles found"
                body="Try a different search or create a new role."
                action={
                  <button type="button" className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-black">
                    <Plus className="mr-1 inline size-3.5" />
                    Create role
                  </button>
                }
              />
            </div>
          ) : (
            <ul className="space-y-2 p-3">
              {filtered.map((role, i) => (
                <Reveal key={role.id} delay={i * 0.04}>
                  <li>
                    <button
                      type="button"
                      data-selected={selected?.id === role.id}
                      onClick={() => setSelectedId(role.id)}
                      className={cn(
                        'recruiter-row w-full rounded-2xl border border-border/50 p-4 text-left transition',
                        selected?.id === role.id && 'border-brand/35 bg-brand/8',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('rounded-md border px-1.5 py-0.5 text-[9px] font-semibold', STATUS_STYLES[role.status])}>
                              {role.status}
                            </span>
                            {favorites.has(role.id) && (
                              <Star className="size-3 fill-brand text-brand" />
                            )}
                          </div>
                          <p className="mt-1 font-semibold text-foreground">{role.title}</p>
                          <p className="text-[11px] text-muted-foreground">{role.department} · {role.location}</p>
                        </div>
                        <ScoreRing score={role.qualityScore} size={36} />
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {role.applicants} applicants
                        </span>
                        {role.newApplicants > 0 && (
                          <span className="font-semibold text-brand">+{role.newApplicants} new</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {role.postedAgo}
                        </span>
                      </div>
                    </button>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </div>

        {/* Role detail */}
        <div className="recruiter-scroll hidden min-w-0 flex-1 overflow-auto lg:block">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: RECRUITER_EASE }}
                className="p-6"
              >
                <RoleDetail
                  role={selected}
                  isFavorite={favorites.has(selected.id)}
                  onToggleFavorite={() => toggleFavorite(selected.id)}
                  onOpenPipeline={onNavigatePipeline}
                  onOpenCandidates={onNavigateCandidates}
                />
              </motion.div>
            ) : (
              <EmptyState
                icon={<Briefcase className="size-6" />}
                title="Select a role"
                body="Choose a role from the list to view details and pipeline progress."
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function RoleDetail({
  role,
  isFavorite,
  onToggleFavorite,
  onOpenPipeline,
  onOpenCandidates,
}: {
  role: Role
  isFavorite: boolean
  onToggleFavorite: () => void
  onOpenPipeline?: () => void
  onOpenCandidates?: () => void
}) {
  const maxStage = Math.max(...role.stageCounts.map((s) => s.count), 1)

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[role.status])}>
              {role.status}
            </span>
            <span className="text-[11px] text-muted-foreground">{role.employmentType} · {role.level}</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{role.title}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="size-3.5" />{role.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="size-3.5" />{role.salaryRange}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" />Posted {role.postedAgo}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl border transition',
              isFavorite ? 'border-brand/40 bg-brand/15 text-brand' : 'border-border/50 text-muted-foreground hover:text-foreground',
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Bookmark className={cn('size-4', isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={onOpenPipeline}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-black hover:brightness-110"
          >
            View pipeline
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Stage funnel */}
      <SectionCard className="mt-6" title="Hiring funnel">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PIPELINE_STAGES.map((stage) => {
            const count = role.stageCounts.find((s) => s.stage === stage)?.count ?? 0
            return (
              <div key={stage} className="text-center">
                <div className="mx-auto flex h-16 w-full max-w-[72px] items-end justify-center">
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand/30 to-brand/70"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(12, (count / maxStage) * 100)}%` }}
                    transition={{ duration: 0.6, ease: RECRUITER_EASE }}
                    style={{ minHeight: 8 }}
                  />
                </div>
                <p className="mt-2 text-lg font-bold tabular-nums">
                  <AnimatedNumber value={count} />
                </p>
                <p className="text-[10px] text-muted-foreground">{stage}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5 text-brand" />
            <AnimatedNumber value={role.applicants} /> total applicants
          </span>
          <span className="flex items-center gap-1">
            <Delta value={role.newApplicants} suffix="" />
            new this week
          </span>
          <span>Quality score: <strong className="text-brand">{role.qualityScore}%</strong></span>
        </div>
      </SectionCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="About the role">
          <p className="text-sm leading-relaxed text-muted-foreground">{role.description}</p>
        </SectionCard>
        <SectionCard title="Required skills">
          <div className="flex flex-wrap gap-1.5">
            {role.skills.map((s) => (
              <span key={s} className="rounded-lg border border-border/50 bg-foreground/[0.04] px-2 py-1 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Responsibilities">
          <ul className="space-y-2">
            {role.responsibilities.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-brand">•</span>
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Requirements">
          <ul className="space-y-2">
            {role.requirements.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-brand">•</span>
                {r}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenCandidates}
          className="rounded-xl border border-brand/35 bg-brand/10 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/15"
        >
          Browse candidates
        </button>
        <button type="button" className="rounded-xl border border-border/50 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          Edit role
        </button>
        <button type="button" className="rounded-xl border border-border/50 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
          Share posting
        </button>
      </div>
    </>
  )
}
