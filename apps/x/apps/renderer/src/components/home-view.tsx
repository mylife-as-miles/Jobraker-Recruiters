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
  onOpenRecruiterScreen?: (
    screen: 'roles' | 'candidates' | 'pipeline' | 'analytics',
    candidateId?: string | null,
    initialAction?: 'add-candidate' | 'add-role' | null
  ) => void
  onOpenSearch?: () => void
}

const TOP_MATCHES_LIMIT = 5

const topMatches = [
  { id: 'c1', name: 'Teni Ogunleye', role: 'Senior Product Designer', meta: 'Lagos, Nigeria - 4y exp', score: 96 },
  { id: 'c2', name: 'Femi Okoro', role: 'Product Designer', meta: 'Remote - 5y exp', score: 92 },
  { id: 'c3', name: 'Chinaza Uche', role: 'UX/UI Designer', meta: 'Lagos, Nigeria - 3y exp', score: 89 },
  { id: 'c4', name: 'David Adeyemi', role: 'Product Designer', meta: 'Abuja, Nigeria - 6y exp', score: 87 },
  { id: 'c7', name: 'Aisha Lawal', role: 'Product Designer', meta: 'Remote - 5y exp', score: 85 },
  { id: 'c8', name: 'Daniel Kim', role: 'Product Designer', meta: 'Seoul, KR - 6y exp', score: 80 },
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
    .toUpperCase()
}

export function HomeView({
  bgTaskSummaries,
  onOpenEmail,
  onOpenMeetings,
  onOpenAgents,
  onOpenAgent,
  onOpenChat,
  onOpenRecruiterScreen,
  onOpenSearch,
}: HomeViewProps) {
  const [prompt, setPrompt] = useState('')
  const [isSettled, setIsSettled] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false)

  const activeAgents = useMemo(() => {
    const liveAgents = bgTaskSummaries.filter((task) => task.active).slice(0, 3)
    return liveAgents.length ? liveAgents : fallbackAgents
  }, [bgTaskSummaries])

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsSettled(true), 220)
    return () => window.clearTimeout(timeout)
  }, [])

  const openRecruiterChat = () => {
    if (prompt.trim()) {
      onOpenChat?.(prompt)
      setPrompt('')
    } else {
      onOpenChat?.()
    }
  }

  const handleAppendToken = (tokenType: string) => {
    const templates: Record<string, string> = {
      'Job Title': 'role:"Senior Product Designer"',
      'Industry': 'industry:"Fintech"',
      'Skills': 'skills:"Figma, CSS"',
      'Experience': 'experience:">5 years"',
      'Job Location': 'location:"Lagos, Nigeria"',
    }
    const appendText = templates[tokenType] || ''
    setPrompt((prev) => (prev ? `${prev} ${appendText}` : appendText))
  }

  const handleImprovePrompt = () => {
    if (!prompt.trim()) {
      setPrompt('Source senior product designers with SaaS startup experience, focusing on strong systems thinking and interaction design portfolio.')
    } else {
      setPrompt((prev) => `Enhance: ${prev} - prioritizing startup-fit, high interaction fidelity, and 4+ years experience with design systems.`)
    }
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
            <button
              onClick={onOpenSearch}
              className="flex h-10 w-[318px] items-center gap-3 rounded-xl border border-white/10 bg-[#050608] px-4 text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] text-left hover:border-white/20 transition cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-xs text-zinc-600 select-none">Search candidates, roles, or notes</span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400">Ctrl K</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsNewDropdownOpen(false)
                }}
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#050608] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#49ff16] text-[10px] font-bold text-black">3</span>
              </button>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 z-45 w-[280px] rounded-xl border border-zinc-800 bg-[#09090b]/95 p-1.5 shadow-2xl backdrop-blur-md text-white">
                    <div className="border-b border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400">
                      Notifications
                    </div>
                    <div className="py-1 divide-y divide-zinc-900">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false)
                          onOpenEmail()
                        }}
                        className="flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-800/60 transition cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-200">New reply from Michael O.</span>
                        <span className="text-[10px] text-zinc-500">LinkedIn outreach has a new message</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false)
                          onOpenRecruiterScreen?.('candidates', 'c1')
                        }}
                        className="flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-800/60 transition cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-200">Teni Ogunleye responded</span>
                        <span className="text-[10px] text-zinc-500">Agreed to a screening interview</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false)
                          onOpenAgents()
                        }}
                        className="flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-800/60 transition cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-200">Sourcing completed</span>
                        <span className="text-[10px] text-zinc-500">AI agent found 15 new designers</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsNewDropdownOpen(!isNewDropdownOpen)
                  setIsNotificationsOpen(false)
                }}
                className="flex h-10 items-center gap-3 rounded-xl border border-[#2e7b19]/80 bg-[#113f08] px-4 text-sm font-medium text-white shadow-[0_0_24px_rgba(68,255,22,0.18)] hover:brightness-110 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#62ff28]" />
                New
                <ChevronDown className="h-4 w-4 text-[#62ff28]" />
              </button>
              {isNewDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsNewDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 z-45 w-[200px] rounded-xl border border-zinc-800 bg-[#09090b]/95 p-1.5 shadow-2xl backdrop-blur-md text-white">
                    <button
                      onClick={() => {
                        setIsNewDropdownOpen(false)
                        onOpenRecruiterScreen?.('candidates', null, 'add-candidate')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-[#4dff18]" />
                      Add Candidate
                    </button>
                    <button
                      onClick={() => {
                        setIsNewDropdownOpen(false)
                        onOpenRecruiterScreen?.('roles', null, 'add-role')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                    >
                      <Briefcase className="h-4 w-4 text-[#4dff18]" />
                      Create Job Position
                    </button>
                    <button
                      onClick={() => {
                        setIsNewDropdownOpen(false)
                        setPrompt("Draft a LinkedIn outreach sequence to candidates sourced for the Senior Product Designer role.")
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                    >
                      <Send className="h-4 w-4 text-[#4dff18]" />
                      Draft AI Outreach
                    </button>
                    <button
                      onClick={() => {
                        setIsNewDropdownOpen(false)
                        setPrompt("Source product designers in Lagos with 5+ years experience.")
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-zinc-800/60 transition text-zinc-200 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-[#4dff18]" />
                      Start Sourcing Search
                    </button>
                  </div>
                </>
              )}
            </div>
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
                  { label: 'Open Roles', value: '12', sub: '2 vs last week', icon: Briefcase, screen: 'roles' as const },
                  { label: 'Active Searches', value: '8', sub: '1 vs last week', icon: Users, screen: 'candidates' as const },
                  { label: 'Response Rate', value: '24.6%', sub: '6.2pp vs last 7 days', icon: Send, screen: 'analytics' as const },
                ].map((metric) => (
                  <article
                    key={metric.label}
                    onClick={() => onOpenRecruiterScreen?.(metric.screen)}
                    className="premium-lift group relative overflow-hidden rounded-xl border border-white/10 bg-[#080a0d] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)] cursor-pointer hover:border-[#4dff18]/25 transition duration-300"
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
                                onClick={() => handleAppendToken(chip)}
                                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-[#4dff18]/25 hover:bg-[#4dff18]/10 hover:text-white cursor-pointer"
                              >
                                {chip} <span className="ml-1 text-[#4dff18]">+</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleImprovePrompt}
                              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-[#4dff18]/25 hover:text-[#4dff18] cursor-pointer"
                              aria-label="Improve prompt"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                            <button
                              onClick={openRecruiterChat}
                              className="grid h-11 w-16 place-items-center rounded-full bg-[#4dff18] text-black shadow-[0_0_26px_rgba(77,255,24,0.42)] transition hover:scale-[1.03] cursor-pointer"
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
                            onClick={() => onOpenChat?.(description as string)}
                            className="group rounded-xl border border-white/10 bg-[#101318]/82 p-4 text-left transition hover:border-[#4dff18]/28 hover:bg-[#142013] cursor-pointer"
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

                <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium tracking-[-0.03em]">Top Matches</h2>
                    <button
                      onClick={() => onOpenRecruiterScreen?.('candidates')}
                      className="text-xs text-zinc-400 hover:text-[#4dff18] cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                  <div className="mt-5 space-y-4">
                    {topMatches.length === 0 ? (
                      <PremiumEmptyState
                        className="min-h-[250px]"
                        icon={<Users className="h-6 w-6" />}
                        title="No matches yet"
                        description="Ask the AI Recruiter to source candidates and the strongest evidence-backed matches will appear here."
                      />
                    ) : topMatches.slice(0, TOP_MATCHES_LIMIT).map((candidate) => (
                      <button
                        key={candidate.name}
                        onClick={() => onOpenRecruiterScreen?.('candidates', candidate.id)}
                        className="flex w-full items-center gap-4 text-left hover:bg-white/[0.03] p-1.5 rounded-xl transition cursor-pointer"
                      >
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
                      </button>
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
                    <button
                      onClick={() => onOpenRecruiterScreen?.('pipeline')}
                      className="text-xs text-zinc-500 hover:text-[#4dff18] cursor-pointer"
                    >
                      View pipeline
                    </button>
                  </div>
                  <div className="mt-8 grid grid-cols-4 gap-5">
                    {pipeline.map((stage) => (
                      <button
                        key={stage.label}
                        onClick={() => onOpenRecruiterScreen?.('pipeline')}
                        className="space-y-4 text-left hover:bg-white/[0.02] p-1.5 rounded-xl transition cursor-pointer"
                      >
                        <p className="text-xs text-zinc-300">{stage.label}</p>
                        <p className="text-2xl font-light tracking-[-0.05em]">{stage.value}</p>
                        <stage.icon className={`h-5 w-5 ${stage.tone}`} />
                      </button>
                    ))}
                  </div>
                </article>

                <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium tracking-[-0.03em]">Active Agents</h2>
                    <button onClick={onOpenAgents} className="text-xs text-zinc-500 hover:text-[#4dff18] cursor-pointer">View all</button>
                  </div>
                  <div className="mt-4 divide-y divide-white/8">
                    {activeAgents.map((agent, index) => (
                      <button
                        key={agent.slug}
                        onClick={() => onOpenAgent(agent.slug)}
                        className="flex w-full items-center gap-3 py-3 text-left cursor-pointer hover:bg-white/[0.02] px-1 rounded-lg transition"
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
                      <span className="text-white border-b-2 border-brand pb-3 -mb-3.5 z-10 cursor-pointer">Agenda</span>
                      <button
                        onClick={onOpenEmail}
                        className="text-zinc-500 hover:text-white transition pb-3 -mb-3.5 cursor-pointer"
                      >
                        Inbox
                      </button>
                    </div>
                    <div className="mt-4 space-y-4">
                      {[
                        { time: '10:00 AM', title: 'Design Team Standup', duration: '30m', action: () => onOpenMeetings() },
                        { time: '11:30 AM', title: 'Interview: Teni Ogunleye', duration: '60m', action: () => onOpenRecruiterScreen?.('candidates', 'c1') },
                        { time: '02:00 PM', title: 'Interview: David Adeyemi', duration: '45m', action: () => onOpenRecruiterScreen?.('candidates', 'c4') },
                      ].map((event) => (
                        <button
                          key={event.title}
                          onClick={event.action}
                          className="flex w-full items-center gap-3 text-left hover:bg-white/[0.02] p-1 rounded-lg transition cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-zinc-500">{event.time}</p>
                            <p className="truncate text-xs text-zinc-300">{event.title}</p>
                          </div>
                          <span className="text-[11px] text-zinc-500">{event.duration}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={onOpenMeetings}
                      className="mt-6 text-sm text-[#4dff18] hover:underline cursor-pointer"
                    >
                      View full agenda -&gt;
                    </button>
                  </article>

                  <article className="premium-lift rounded-xl border border-white/10 bg-[#07090b] p-5">
                    <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                      <h2 className="text-lg font-medium tracking-[-0.03em]">Inbox</h2>
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4dff18] text-[11px] font-bold text-black">2</span>
                    </div>
                    <div className="mt-5 space-y-6">
                      <button
                        onClick={onOpenEmail}
                        className="flex w-full gap-3 text-left hover:bg-white/[0.02] p-1 rounded-lg transition cursor-pointer"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded bg-[#0a66c2] text-xs font-bold text-white shrink-0">in</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-200">LinkedIn</p>
                          <p className="truncate text-xs text-zinc-500">New reply from Michael O.</p>
                        </div>
                        <span className="text-[11px] text-zinc-500 shrink-0">2m</span>
                      </button>
                      <button
                        onClick={onOpenEmail}
                        className="flex w-full gap-3 text-left hover:bg-white/[0.02] p-1 rounded-lg transition cursor-pointer"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded bg-white/10 text-[#ff4c4c] shrink-0">
                          <Mail className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-200">Gmail</p>
                          <p className="truncate text-xs text-zinc-500">Re: Senior Product Designer role</p>
                        </div>
                        <span className="text-[11px] text-zinc-500 shrink-0">15m</span>
                      </button>
                    </div>
                    <button
                      onClick={onOpenEmail}
                      className="mt-8 text-sm text-[#4dff18] hover:underline cursor-pointer"
                    >
                      Go to inbox -&gt;
                    </button>
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
