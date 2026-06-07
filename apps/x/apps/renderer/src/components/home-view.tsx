import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUp,
  Bell,
  Bot,
  Briefcase,
  Calendar,
  ChevronDown,
  FileText,
  Mail,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { PageTransition, PremiumEmptyState, PremiumSkeleton, ScrollReveal } from '@/components/premium-states'

interface TreeNode {
  path: string
  name: string
  kind: 'file' | 'dir'
  children?: TreeNode[]
  stat?: { size: number; mtimeMs: number }
}

type RunItem = { id: string; title?: string; createdAt: string }
type TaskItem = { slug: string; name: string; active: boolean; lastRunAt?: string; lastAttemptAt?: string }

type HomeViewProps = {
  tree: TreeNode[]
  runs: RunItem[]
  bgTaskSummaries: TaskItem[]
  onOpenEmail: () => void
  onOpenMeetings: () => void
  onOpenAgents: () => void
  onOpenAgent: (slug: string) => void
  onOpenNote: (path: string) => void
  onOpenRun: (runId: string) => void
  onTakeMeetingNotes: () => void
  onOpenChat?: (prompt?: string) => void
  onOpenRecruiterScreen?: (screen: 'roles' | 'candidates' | 'pipeline' | 'analytics') => void
  onOpenSearch?: () => void
}

const topMatches = [
  { name: 'Teni Ogunleye', role: 'Senior Product Designer', meta: 'Lagos, Nigeria - 4y exp', score: 96 },
  { name: 'Femi Okoro', role: 'Product Designer', meta: 'Remote - 5y exp', score: 92 },
  { name: 'Chinaza Uche', role: 'UX/UI Designer', meta: 'Lagos, Nigeria - 3y exp', score: 89 },
  { name: 'David Adeyemi', role: 'Product Designer', meta: 'Abuja, Nigeria - 6y exp', score: 87 },
  { name: 'Amara Nwosu', role: 'Design Systems Lead', meta: 'Remote - 7y exp', score: 85 },
  { name: 'Kola Balogun', role: 'UX Researcher', meta: 'Lagos, Nigeria - 5y exp', score: 82 },
]

const pipeline = [
  { label: 'Sourced', value: '128', icon: Users, tone: 'text-cyan-300' },
  { label: 'Screening', value: '42', icon: FileText, tone: 'text-lime-300' },
  { label: 'Interview', value: '18', icon: Send, tone: 'text-amber-300' },
  { label: 'Offer', value: '6', icon: Briefcase, tone: 'text-lime-300' },
]

const fallbackAgents: TaskItem[] = [
  { slug: 'sourcing-agent', name: 'Sourcing Agent', active: true, lastAttemptAt: 'Finding product designers in Lagos' },
  { slug: 'outreach-agent', name: 'Outreach Agent', active: true, lastAttemptAt: 'Reaching out to top candidates' },
  { slug: 'screening-agent', name: 'Screening Agent', active: true, lastAttemptAt: 'Reviewing resumes for 3 roles' },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export function HomeView({
  bgTaskSummaries,
  onOpenEmail,
  onOpenMeetings,
  onOpenAgents,
  onOpenAgent,
  onOpenChat,
}: HomeViewProps) {
  const [prompt, setPrompt] = useState('')
  const [isSettled, setIsSettled] = useState(false)
  const activeAgents = useMemo(() => {
    const liveAgents = bgTaskSummaries.filter((task) => task.active).slice(0, 3)
    return liveAgents.length ? liveAgents : fallbackAgents
  }, [bgTaskSummaries])

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsSettled(true), 220)
    return () => window.clearTimeout(timeout)
  }, [])

  const openRecruiterChat = () => {
    setPrompt('')
    onOpenChat?.()
  }

  return (
    <PageTransition className="recruiter-scroll h-full overflow-auto bg-black text-white">
      <div className="flex min-h-full w-full flex-col gap-4 px-6 py-5 lg:px-7">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[27px] font-medium tracking-[-0.04em] text-white">
              {greeting()}, Miles <span className="text-[24px]">{'\uD83D\uDC4B'}</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">AI agentic recruiting, running for you.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex h-10 w-[318px] items-center gap-3 rounded-xl border border-white/10 bg-[#050608] px-4 text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <Search className="h-4 w-4" />
              <input
                className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                placeholder="Search candidates, roles, or notes"
              />
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400">Ctrl K</span>
            </label>
            <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#050608] text-zinc-300">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#49ff16] text-[10px] font-bold text-black">3</span>
            </button>
            <button className="flex h-10 items-center gap-3 rounded-xl border border-[#2e7b19]/80 bg-[#113f08] px-4 text-sm font-medium text-white shadow-[0_0_24px_rgba(68,255,22,0.18)]">
              <Plus className="h-4 w-4 text-[#62ff28]" />
              New
              <ChevronDown className="h-4 w-4 text-[#62ff28]" />
            </button>
          </div>
        </header>

        {!isSettled ? (
          <div className="grid flex-1 grid-cols-3 gap-4">
            <PremiumSkeleton className="h-[172px] rounded-xl" />
            <PremiumSkeleton className="h-[172px] rounded-xl" />
            <PremiumSkeleton className="h-[172px] rounded-xl" />
            <PremiumSkeleton className="col-span-2 h-[378px] rounded-xl" />
            <PremiumSkeleton className="h-[378px] rounded-xl" />
            <PremiumSkeleton className="h-[230px] rounded-xl" />
            <PremiumSkeleton className="h-[230px] rounded-xl" />
            <PremiumSkeleton className="h-[230px] rounded-xl" />
          </div>
        ) : (
          <>
        <ScrollReveal>
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: 'Open Roles', value: '12', sub: '2 vs last week', icon: Briefcase },
            { label: 'Active Searches', value: '8', sub: '1 vs last week', icon: Users },
            { label: 'Response Rate', value: '24.6%', sub: '6.2pp vs last 7 days', icon: Send },
          ].map((metric) => (
            <article
              key={metric.label}
              className="premium-lift group relative overflow-hidden rounded-xl border border-white/10 bg-[#080a0d] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute right-6 top-4 h-20 w-20 rounded-full bg-[#3cff0b]/10 blur-xl transition group-hover:bg-[#3cff0b]/20" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-light tracking-[-0.06em]">{metric.value}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                    <ArrowUp className="h-3 w-3 text-[#4dff18]" />
                    <span className="text-[#4dff18]">{metric.sub.split(' ')[0]}</span>
                    {metric.sub.replace(metric.sub.split(' ')[0], '')}
                  </p>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-full border border-[#43ff15]/20 bg-[#42ff12]/10 text-[#52ff1f] shadow-[0_0_35px_rgba(66,255,18,0.24)]">
                  <metric.icon className="h-8 w-8" />
                </div>
              </div>
            </article>
          ))}
        </section>
        </ScrollReveal>

        <ScrollReveal delay={80}>
        <section className="grid grid-cols-[1fr_372px] gap-4">
          <article className="premium-lift relative overflow-hidden rounded-xl border border-white/10 bg-[#07090b] p-0">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_90%_5%,rgba(72,255,22,0.58),transparent_17%),radial-gradient(circle_at_82%_28%,rgba(62,255,14,0.15),transparent_34%)]" />
            <div className="absolute right-[-2rem] top-[-2rem] h-48 w-80 rotate-[-18deg] rounded-full border border-[#4cff19]/20 bg-[#4cff19]/10 blur-sm" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_40%)]" />
            <div className="relative">
              <div className="px-7 pb-5 pt-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium tracking-[-0.03em]">AI Recruiter</h2>
                  <span className="rounded-full border border-[#42ff13]/20 bg-[#42ff13]/10 px-3 py-1 text-xs text-[#5fff2a]">Command Center</span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1014]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_0_36px_rgba(77,255,24,0.05)]">
                  <div className="relative min-h-[118px] px-6 pt-5">
                    <div className="pointer-events-none absolute left-5 top-5 h-7 w-40 rounded-full bg-white/15 blur-2xl" />
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') openRecruiterChat()
                      }}
                      className="relative min-h-[72px] w-full resize-none bg-transparent text-xl font-medium leading-8 tracking-[-0.04em] text-white outline-none placeholder:text-zinc-500"
                      placeholder="Example: Find cybersecurity analysts in Lagos"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {['Job Title', 'Industry', 'Skills', 'Experience', 'Job Location'].map((chip) => (
                        <button
                          key={chip}
                          onClick={openRecruiterChat}
                          className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#4dff18]/25 hover:bg-[#4dff18]/10 hover:text-white"
                        >
                          {chip} <span className="ml-1 text-[#4dff18]">âœ“</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openRecruiterChat}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-[#4dff18]/25 hover:text-[#4dff18]"
                        aria-label="Improve prompt"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                      <button
                        onClick={openRecruiterChat}
                        className="grid h-11 w-16 place-items-center rounded-full bg-[#4dff18] text-black shadow-[0_0_26px_rgba(77,255,24,0.42)] transition hover:scale-[1.03]"
                        aria-label="Start recruiter search"
                      >
                        <ArrowUp className="h-5 w-5 rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-7 pb-6 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Search className="h-4 w-4 text-[#4dff18]" />
                    Smart Searches
                  </div>
                  <p className="hidden text-sm text-zinc-500 lg:block">Suggested searches based on high-performing recruiter workflows</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ['Software Engineer', 'Find TypeScript and Node.js engineers at Series A companies', FileText],
                    ['Data Analyst', 'Find SQL, Python, and dashboarding talent with 3+ years', Briefcase],
                    ['Cloud Engineer', 'Find AWS-certified engineers skilled in Terraform', Users],
                  ].map(([title, description, Icon]) => (
                    <button
                      key={title as string}
                      onClick={openRecruiterChat}
                      className="group rounded-xl border border-white/10 bg-[#101318]/82 p-4 text-left transition hover:border-[#4dff18]/28 hover:bg-[#142013]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#4dff18]" />
                          <p className="text-sm font-semibold text-zinc-100">{title as string}</p>
                        </div>
                        <ArrowUp className="h-4 w-4 rotate-90 text-zinc-500 transition group-hover:text-[#4dff18]" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{description as string}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-[-0.03em]">Top Matches</h2>
              <button className="text-xs text-zinc-400 hover:text-[#4dff18]">View all</button>
            </div>
            <div className="mt-5 space-y-4">
              {topMatches.length === 0 ? (
                <PremiumEmptyState
                  className="min-h-[250px]"
                  icon={<Users className="h-6 w-6" />}
                  title="No matches yet"
                  description="Ask the AI Recruiter to source candidates and the strongest evidence-backed matches will appear here."
                />
              ) : topMatches.map((candidate) => (
                <div key={candidate.name} className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-700 to-zinc-950 text-sm font-semibold">
                    {initials(candidate.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{candidate.name}</p>
                    <p className="truncate text-xs text-zinc-400">{candidate.role}</p>
                    <p className="truncate text-xs text-zinc-500">{candidate.meta}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-[#4dff18] text-xs text-[#4dff18] shadow-[0_0_20px_rgba(77,255,24,0.12)]">
                    {candidate.score}%
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
        </ScrollReveal>

        <ScrollReveal delay={140}>
        <section className="grid grid-cols-[1.03fr_0.88fr_1.55fr] gap-4">
          <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-[-0.03em]">Pipeline Overview</h2>
              <button onClick={onOpenAgents} className="text-xs text-zinc-500 hover:text-[#4dff18]">View pipeline</button>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-5">
              {pipeline.map((stage) => (
                <div key={stage.label} className="space-y-4">
                  <p className="text-xs text-zinc-300">{stage.label}</p>
                  <p className="text-2xl font-light tracking-[-0.05em]">{stage.value}</p>
                  <stage.icon className={`h-5 w-5 ${stage.tone}`} />
                </div>
              ))}
            </div>
          </article>

          <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-[-0.03em]">Active Agents</h2>
              <button onClick={onOpenAgents} className="text-xs text-zinc-500 hover:text-[#4dff18]">View all</button>
            </div>
            <div className="mt-4 divide-y divide-white/8">
              {activeAgents.map((agent, index) => (
                <button
                  key={agent.slug}
                  onClick={() => onOpenAgent(agent.slug)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${index === 0 ? 'bg-cyan-500/20 text-cyan-300' : index === 1 ? 'bg-lime-500/20 text-lime-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    <Bot className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{agent.name}</span>
                    <span className="block truncate text-xs text-zinc-500">{agent.lastAttemptAt || agent.lastRunAt || 'Monitoring recruiter workflow'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#4dff18]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4dff18]" />
                    Running
                  </span>
                </button>
              ))}
            </div>
          </article>

          <div className="grid grid-cols-2 gap-4">
            <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
              <div className="flex items-center gap-6 border-b border-white/8 pb-3 text-sm">
                <span className="text-white">Agenda</span>
                <span className="text-zinc-500">Inbox</span>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  ['10:00 AM', 'Design Team Standup', '30m'],
                  ['11:30 AM', 'Interview: Teni Ogunleye', '60m'],
                  ['02:00 PM', 'Interview: David Adeyemi', '45m'],
                ].map((event) => (
                  <div key={event[1]} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-zinc-500">{event[0]}</p>
                      <p className="truncate text-xs text-zinc-300">{event[1]}</p>
                    </div>
                    <span className="text-[11px] text-zinc-500">{event[2]}</span>
                  </div>
                ))}
              </div>
              <button onClick={onOpenMeetings} className="mt-6 text-sm text-[#4dff18]">View full agenda -&gt;</button>
            </article>

            <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
              <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                <h2 className="text-lg font-medium tracking-[-0.03em]">Inbox</h2>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4dff18] text-[11px] font-bold text-black">2</span>
              </div>
              <div className="mt-5 space-y-6">
                <div className="flex gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded bg-[#0a66c2] text-xs font-bold">in</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200">LinkedIn</p>
                    <p className="truncate text-xs text-zinc-500">New reply from Michael O.</p>
                  </div>
                  <span className="text-[11px] text-zinc-500">2m</span>
                </div>
                <div className="flex gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded bg-white/10 text-[#ff4c4c]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200">Gmail</p>
                    <p className="truncate text-xs text-zinc-500">Re: Senior Product Designer role</p>
                  </div>
                  <span className="text-[11px] text-zinc-500">15m</span>
                </div>
              </div>
              <button onClick={onOpenEmail} className="mt-8 text-sm text-[#4dff18]">Go to inbox -&gt;</button>
            </article>
          </div>
        </section>
        </ScrollReveal>
          </>
        )}
      </div>
    </PageTransition>
  )
}
