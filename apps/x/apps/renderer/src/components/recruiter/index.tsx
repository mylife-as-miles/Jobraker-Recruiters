import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Loader2, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { AnalyticsPage } from './analytics-page'
import { CandidatesPage } from './candidates-page'
import { PipelinePage } from './pipeline-page'
import { RolesPage } from './roles-page'
import { RECRUITER_EASE } from './shared'
import { loadRecruiterState, saveRecruiterState } from './storage'
import {
  CANDIDATES,
  ROLES,
  type Candidate,
  type Role,
  type CandidateStage,
  type CandidateSource,
  type CompanyStage,
  type GrowthTrajectory,
  type VestingStatus,
  type IntentSignal,
} from './data'

export type RecruiterScreenId = 'roles' | 'candidates' | 'pipeline' | 'analytics'

export type RecruiterScreensProps = {
  screen: RecruiterScreenId
  onNavigate: (screen: RecruiterScreenId, candidateId?: string | null, initialAction?: 'add-candidate' | 'add-role' | null) => void
  onAskCopilot?: (prompt: string) => void
  onOpenSearch?: () => void
  onOpenChat?: (prompt?: string) => void
  onTakeMeetingNotes?: () => void
  onOpenAgents?: () => void
  onOpenEmail?: (threadId?: string) => void
  onOpenMeetings?: () => void
  selectedCandidateId?: string | null
  initialAction?: 'add-candidate' | 'add-role' | null
}

// Helper to initialize candidates merging old stages and notes lists
function getInitialCandidates(): Candidate[] {
  const list = loadRecruiterState<Candidate[]>('candidates', CANDIDATES)
  const stages = loadRecruiterState<Record<string, CandidateStage>>('candidate-stages', {})
  const notes = loadRecruiterState<Record<string, string>>('candidate-notes', {})
  
  return list.map((c) => ({
    ...c,
    stage: stages[c.id] ?? c.stage,
    note: notes[c.id] ?? c.note ?? '',
  }))
}

// Helper to initialize roles merging favorite settings
function getInitialRoles(): Role[] {
  const list = loadRecruiterState<Role[]>('roles', ROLES)
  const favorites = loadRecruiterState<string[]>('role-favorites', [])
  const favSet = new Set(favorites)
  
  return list.map((r) => ({
    ...r,
    favorite: r.favorite || favSet.has(r.id),
  }))
}

export function RecruiterScreens({
  screen,
  onNavigate,
  onAskCopilot,
  onOpenSearch,
  onOpenChat,
  onTakeMeetingNotes,
  onOpenAgents,
  onOpenEmail,
  onOpenMeetings,
  selectedCandidateId,
  initialAction,
}: RecruiterScreensProps) {
  // Lifted state
  const [candidates, setCandidates] = React.useState<Candidate[]>(getInitialCandidates)
  const [roles, setRoles] = React.useState<Role[]>(getInitialRoles)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null)
  
  // Modals state
  const [activeModal, setActiveModal] = React.useState<{
    type: 'candidate-add' | 'candidate-edit' | 'role-add' | 'role-edit' | 'email-send' | 'interview-schedule'
    data?: any
  } | null>(null)

  // Handle initialAction triggers on load
  React.useEffect(() => {
    if (initialAction === 'add-candidate') {
      setActiveModal({ type: 'candidate-add' })
    } else if (initialAction === 'add-role') {
      setActiveModal({ type: 'role-add' })
    }
  }, [initialAction])

  // Sync state to localStorage on changes
  React.useEffect(() => {
    saveRecruiterState('candidates', candidates)
    // Update individual stages and notes to support compatibility
    const stages = Object.fromEntries(candidates.map((c) => [c.id, c.stage]))
    const notes = Object.fromEntries(candidates.map((c) => [c.id, c.note ?? '']))
    saveRecruiterState('candidate-stages', stages)
    saveRecruiterState('candidate-notes', notes)
  }, [candidates])

  React.useEffect(() => {
    saveRecruiterState('roles', roles)
    const favorites = roles.filter((r) => r.favorite).map((r) => r.id)
    saveRecruiterState('role-favorites', favorites)
  }, [roles])

  // Modals mutators
  const handleAddCandidate = (candidateData: Partial<Candidate>) => {
    const newId = `c_custom_${Date.now()}`
    const score = candidateData.matchScore ?? 80
    const fit = score >= 88 ? 'High fit' : score >= 75 ? 'Recommended' : null
    
    const newCandidate: Candidate = {
      id: newId,
      name: candidateData.name || 'Unnamed Candidate',
      title: candidateData.title || (roles[0]?.title ?? 'Senior Product Designer'),
      location: candidateData.location || 'Remote',
      experienceYears: Number(candidateData.experienceYears) || 3,
      matchScore: score,
      stage: candidateData.stage || 'New',
      source: candidateData.source || 'LinkedIn',
      lastActivity: 'Just now',
      fit,
      skills: candidateData.skills && candidateData.skills.length > 0 
        ? candidateData.skills 
        : ['Product Design', 'Figma'],
      highlights: candidateData.highlights && candidateData.highlights.length > 0 
        ? candidateData.highlights 
        : ['Strong early-career portfolio'],
      aiInsight: candidateData.aiInsight || 'Promising applicant, fits role profile.',
      note: candidateData.note || '',
      email: candidateData.email || 'candidate@example.com',
      companyStages: candidateData.companyStages || ['Seed'],
      growthTrajectory: candidateData.growthTrajectory || 'Moderate',
      vestingStatus: candidateData.vestingStatus || 'Unvested',
      intentSignal: candidateData.intentSignal || 'Passive',
      startupFitScore: candidateData.startupFitScore || 80,
      startupFitInsight: candidateData.startupFitInsight || 'Exhibits balanced growth potential.',
    }

    setCandidates((prev) => [...prev, newCandidate])
    
    // Also sync to pipeline-board if needed
    try {
      const currentBoard = loadRecruiterState<Record<string, string[]>>('pipeline-board', {})
      const targetStage = (candidateData.stage === 'New' || candidateData.stage === 'Shortlisted' || candidateData.stage === 'In Review') 
        ? 'Sourced' 
        : (candidateData.stage === 'Screening' ? 'Screening' : candidateData.stage === 'Interview' ? 'Interview' : candidateData.stage === 'Offer' ? 'Offer' : candidateData.stage === 'Hired' ? 'Hired' : 'Sourced')
      
      const updatedStageList = [...(currentBoard[targetStage] ?? []), newId]
      saveRecruiterState('pipeline-board', {
        ...currentBoard,
        [targetStage]: updatedStageList,
      })
    } catch {}

    toast.success(`Candidate ${newCandidate.name} added successfully!`)
    setActiveModal(null)
  }

  const handleEditCandidate = (candidateData: Partial<Candidate>) => {
    if (!candidateData.id) return
    const score = candidateData.matchScore ?? 80
    const fit = score >= 88 ? 'High fit' : score >= 75 ? 'Recommended' : null

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateData.id
          ? {
              ...c,
              ...candidateData,
              fit,
              lastActivity: 'Updated just now',
            } as Candidate
          : c
      )
    )
    toast.success('Candidate profile updated!')
    setActiveModal(null)
  }

  const handleRemoveCandidate = (id: string) => {
    const candidate = candidates.find((c) => c.id === id)
    setCandidates((prev) => prev.filter((c) => c.id !== id))
    
    // Also remove from pipeline board
    try {
      const currentBoard = loadRecruiterState<Record<string, string[]>>('pipeline-board', {})
      const nextBoard = {} as Record<string, string[]>
      for (const [stage, ids] of Object.entries(currentBoard)) {
        nextBoard[stage] = ids.filter((cid) => cid !== id)
      }
      saveRecruiterState('pipeline-board', nextBoard)
    } catch {}

    toast.success(`Candidate ${candidate?.name ?? ''} removed.`)
  }

  const handleUpdateCandidateStage = (id: string, stage: CandidateStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage, lastActivity: 'Stage changed' } : c))
    )
  }

  const handleUpdateCandidateDirect = (updated: Candidate) => {
    const score = updated.matchScore ?? 80
    const fit = score >= 88 ? 'High fit' : score >= 75 ? 'Recommended' : null
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated, fit } : c))
    )
  }


  const handleAddRole = (roleData: Partial<Role>) => {
    const newId = `r_custom_${Date.now()}`
    const newRole: Role = {
      id: newId,
      title: roleData.title || 'Product Designer',
      department: roleData.department || 'Design',
      location: roleData.location || 'Remote',
      employmentType: roleData.employmentType || 'Full-time',
      level: roleData.level || 'Mid',
      salaryRange: roleData.salaryRange || '$90k - $120k',
      status: roleData.status || 'Open',
      postedAgo: 'Just posted',
      applicants: 0,
      newApplicants: 0,
      qualityScore: roleData.qualityScore || 85,
      favorite: false,
      description: roleData.description || 'Job role description.',
      responsibilities: roleData.responsibilities || ['Own product design features.'],
      requirements: roleData.requirements || ['3+ years in product design.'],
      skills: roleData.skills || ['Figma', 'UI Design'],
      stageCounts: [
        { stage: 'Sourced', count: 0 },
        { stage: 'Contacted', count: 0 },
        { stage: 'Screening', count: 0 },
        { stage: 'Interview', count: 0 },
        { stage: 'Offer', count: 0 },
        { stage: 'Hired', count: 0 },
      ],
    }

    setRoles((prev) => [...prev, newRole])
    toast.success(`Role ${newRole.title} created successfully!`)
    setActiveModal(null)
  }

  const handleEditRole = (roleData: Partial<Role>) => {
    if (!roleData.id) return
    setRoles((prev) =>
      prev.map((r) => (r.id === roleData.id ? ({ ...r, ...roleData } as Role) : r))
    )
    toast.success('Job role details updated!')
    setActiveModal(null)
  }

  const handleToggleRoleFavorite = (id: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))
    )
  }

  const handleScheduleInterview = (candidateId: string, details: { title: string; date: string; time: string; noteAppend?: string }) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              stage: 'Interview',
              lastActivity: `${details.title} scheduled for ${details.date} at ${details.time}`,
              note: c.note ? c.note + (details.noteAppend ?? '') : (details.noteAppend?.trim() ?? ''),
            }
          : c
      )
    )
    
    // Also move in pipeline board
    try {
      const currentBoard = loadRecruiterState<Record<string, string[]>>('pipeline-board', {})
      const nextBoard = {} as Record<string, string[]>
      for (const [stage, ids] of Object.entries(currentBoard)) {
        nextBoard[stage] = ids.filter((cid) => cid !== candidateId)
      }
      nextBoard['Interview'] = [...(nextBoard['Interview'] ?? []), candidateId]
      saveRecruiterState('pipeline-board', nextBoard)
    } catch {}

    toast.success(`Interview scheduled for ${details.date} at ${details.time}!`)
    setActiveModal(null)
  }

  return (
    <div className="relative h-full min-h-0 flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="flex h-full min-h-0 flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: RECRUITER_EASE }}
        >
          {screen === 'roles' && (
            <RolesPage
              roles={roles}
              candidates={candidates}
              onNavigatePipeline={() => onNavigate('pipeline')}
              onAskCopilot={onAskCopilot}
              onOpenSearch={onOpenSearch}
              onOpenChat={onOpenChat}
              onTakeMeetingNotes={onTakeMeetingNotes}
              onOpenAgents={onOpenAgents}
              onOpenEmail={onOpenEmail}
              onOpenMeetings={onOpenMeetings}
              onToggleFavorite={handleToggleRoleFavorite}
              onSelectRoleFilter={(roleId) => {
                setSelectedRoleId(roleId)
                onNavigate('candidates')
              }}
              onCreateRole={() => setActiveModal({ type: 'role-add' })}
              onEditRole={(role) => setActiveModal({ type: 'role-edit', data: role })}
            />
          )}
          {screen === 'candidates' && (
            <CandidatesPage
              candidatesList={candidates}
              selectedRoleId={selectedRoleId}
              onClearRoleFilter={() => setSelectedRoleId(null)}
              onAskCopilot={onAskCopilot}
              onNavigatePipeline={() => onNavigate('pipeline')}
              onOpenSearch={onOpenSearch}
              onOpenChat={onOpenChat}
              onTakeMeetingNotes={onTakeMeetingNotes}
              onOpenAgents={onOpenAgents}
              onOpenEmail={onOpenEmail}
              onStageChange={handleUpdateCandidateStage}
              onRemoveCandidate={handleRemoveCandidate}
              onAddCandidate={() => setActiveModal({ type: 'candidate-add' })}
              onEditCandidate={(c) => setActiveModal({ type: 'candidate-edit', data: c })}
              onOpenOutreachModal={(c) => setActiveModal({ type: 'email-send', data: c })}
              onOpenScheduleModal={(c) => setActiveModal({ type: 'interview-schedule', data: c })}
              selectedCandidateId={selectedCandidateId}
              onUpdateCandidate={handleUpdateCandidateDirect}
            />
          )}
          {screen === 'pipeline' && (
            <PipelinePage
              candidatesList={candidates}
              onAskCopilot={onAskCopilot}
              onNavigateCandidates={(cid) => onNavigate('candidates', cid)}
              onOpenSearch={onOpenSearch}
              onOpenChat={onOpenChat}
              onTakeMeetingNotes={onTakeMeetingNotes}
              onOpenAgents={onOpenAgents}
              onOpenEmail={onOpenEmail}
              onOpenMeetings={onOpenMeetings}
              onStageChange={handleUpdateCandidateStage}
              onAddCandidateAtStage={(stage) => setActiveModal({ type: 'candidate-add', data: { stage } })}
              onOpenOutreachModal={(c) => setActiveModal({ type: 'email-send', data: c })}
              onOpenScheduleModal={(c) => setActiveModal({ type: 'interview-schedule', data: c })}
            />
          )}
          {screen === 'analytics' && (
            <AnalyticsPage
              candidates={candidates}
              roles={roles}
              onAskCopilot={onAskCopilot}
              onNavigatePipeline={() => onNavigate('pipeline')}
              onOpenSearch={onOpenSearch}
              onOpenChat={onOpenChat}
              onTakeMeetingNotes={onTakeMeetingNotes}
              onOpenAgents={onOpenAgents}
              onOpenEmail={onOpenEmail}
              onOpenMeetings={onOpenMeetings}
              onNavigate={onNavigate}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dynamic Modals Overlay */}
      <AnimatePresence>
        {activeModal && (
          <ModalContainer
            title={
              activeModal.type === 'candidate-add' ? 'Add Candidate' :
              activeModal.type === 'candidate-edit' ? 'Edit Candidate' :
              activeModal.type === 'role-add' ? 'Create Job Position' :
              activeModal.type === 'role-edit' ? 'Edit Job Position' :
              activeModal.type === 'email-send' ? 'Draft AI Outreach' :
              activeModal.type === 'interview-schedule' ? 'Schedule Interview' : ''
            }
            onClose={() => setActiveModal(null)}
          >
            {activeModal.type === 'candidate-add' && (
              <CandidateForm
                roles={roles}
                prefilledStage={activeModal.data?.stage}
                onSave={handleAddCandidate}
                onCancel={() => setActiveModal(null)}
              />
            )}
            {activeModal.type === 'candidate-edit' && (
              <CandidateForm
                roles={roles}
                candidate={activeModal.data}
                onSave={handleEditCandidate}
                onCancel={() => setActiveModal(null)}
              />
            )}
            {activeModal.type === 'role-add' && (
              <RoleForm
                onSave={handleAddRole}
                onCancel={() => setActiveModal(null)}
              />
            )}
            {activeModal.type === 'role-edit' && (
              <RoleForm
                role={activeModal.data}
                onSave={handleEditRole}
                onCancel={() => setActiveModal(null)}
              />
            )}
            {activeModal.type === 'email-send' && (
              <EmailOutreachForm
                candidate={activeModal.data}
                roles={roles}
                onCancel={() => setActiveModal(null)}
              />
            )}
            {activeModal.type === 'interview-schedule' && (
              <InterviewScheduleForm
                candidate={activeModal.data}
                roles={roles}
                onSave={(details) => handleScheduleInterview(activeModal.data.id, details)}
                onCancel={() => setActiveModal(null)}
              />
            )}
          </ModalContainer>
        )}
      </AnimatePresence>
    </div>
  )
}

// ───────────────────────── Modal Wrapper ─────────────────────────

function ModalContainer({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050705]/80 backdrop-blur-md"
      />
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#09090b]/95 p-6 shadow-2xl backdrop-blur-sm max-h-[85vh] flex flex-col text-white"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 shrink-0">
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto recruiter-scroll pr-1">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// ───────────────────────── Forms ─────────────────────────

function CandidateForm({
  candidate,
  roles,
  prefilledStage,
  onSave,
  onCancel,
}: {
  candidate?: Candidate
  roles: Role[]
  prefilledStage?: CandidateStage
  onSave: (data: Partial<Candidate>) => void
  onCancel: () => void
}) {
  const [name, setName] = React.useState(candidate?.name ?? '')
  const [email, setEmail] = React.useState(candidate?.email ?? '')
  const [title, setTitle] = React.useState(candidate?.title ?? (roles[0]?.title ?? 'Senior Product Designer'))
  const [location, setLocation] = React.useState(candidate?.location ?? 'Lagos, Nigeria')
  const [experienceYears, setExperienceYears] = React.useState(candidate?.experienceYears ?? 4)
  const [matchScore, setMatchScore] = React.useState(candidate?.matchScore ?? 85)
  const [stage, setStage] = React.useState<CandidateStage>(candidate?.stage ?? prefilledStage ?? 'New')
  const [source, setSource] = React.useState<CandidateSource>(candidate?.source ?? 'LinkedIn')
  const [skills, setSkills] = React.useState(candidate?.skills.join(', ') ?? '')
  const [highlights, setHighlights] = React.useState(candidate?.highlights.join('\n') ?? '')
  const [aiInsight, setAiInsight] = React.useState(candidate?.aiInsight ?? '')
  const [note, setNote] = React.useState(candidate?.note ?? '')

  // Startup Fit additional states
  const [companyStages, setCompanyStages] = React.useState<CompanyStage[]>(candidate?.companyStages ?? ['Seed'])
  const [growthTrajectory, setGrowthTrajectory] = React.useState<GrowthTrajectory>(candidate?.growthTrajectory ?? 'Moderate')
  const [vestingStatus, setVestingStatus] = React.useState<VestingStatus>(candidate?.vestingStatus ?? 'Unvested')
  const [intentSignal, setIntentSignal] = React.useState<IntentSignal>(candidate?.intentSignal ?? 'Passive')
  const [startupFitScore, setStartupFitScore] = React.useState<number>(candidate?.startupFitScore ?? 80)
  const [startupFitInsight, setStartupFitInsight] = React.useState<string>(candidate?.startupFitInsight ?? '')

  const [isGeneratingInsights, setIsGeneratingInsights] = React.useState(false)

  const generateAiInsights = async () => {
    if (!name.trim()) return toast.error('Please enter candidate name first')
    setIsGeneratingInsights(true)
    try {
      const targetRole = roles.find(r => r.title === title) || roles[0]
      const roleContext = targetRole 
        ? `Title: ${targetRole.title}\nDescription: ${targetRole.description}\nRequirements:\n${targetRole.requirements.join('\n')}`
        : `Title: ${title}`

      const res = await window.ipc.invoke('recruiter:generateLlm', {
        systemPrompt: 'You are a senior technical recruiter and talent evaluator. Analyze the candidate details against the role requirements. Return a JSON object containing matchScore (number 1-100), startupFitScore (number 1-100), sourcingInsight (1-2 sentences), and startupFitInsight (1-2 sentences).',
        prompt: `Analyze candidate ${name} for the role of ${title}.\nCandidate background:\nLocation: ${location}\nSkills: ${skills}\nHighlights: ${highlights}\nExperience: ${experienceYears} years\nStartup attributes: company stages: ${companyStages.join('/')}, growth trajectory: ${growthTrajectory}, vesting: ${vestingStatus}, intent: ${intentSignal}.\n\nRole requirements:\n${roleContext}\n\nRespond with ONLY a valid JSON object matching this schema:\n{\n  "matchScore": number,\n  "startupFitScore": number,\n  "sourcingInsight": "string",\n  "startupFitInsight": "string"\n}\nNo markdown formatting or extra text.`,
      })

      if (res.error) throw new Error(res.error)
      let text = res.text || ''
      text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const data = JSON.parse(text)
      
      if (data.sourcingInsight) setAiInsight(data.sourcingInsight)
      if (data.startupFitInsight) setStartupFitInsight(data.startupFitInsight)
      if (data.matchScore) setMatchScore(Number(data.matchScore))
      if (data.startupFitScore) setStartupFitScore(Number(data.startupFitScore))

      toast.success('AI Insights generated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to generate AI insights', {
        description: err?.message || String(err)
      })
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    
    onSave({
      id: candidate?.id,
      name: name.trim(),
      email: email.trim() || 'candidate@example.com',
      title,
      location: location.trim(),
      experienceYears: Number(experienceYears),
      matchScore: Number(matchScore),
      stage,
      source,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      aiInsight: aiInsight.trim() || `Strong potential for ${title} opening.`,
      note: note.trim(),
      companyStages,
      growthTrajectory,
      vestingStatus,
      intentSignal,
      startupFitScore: Number(startupFitScore),
      startupFitInsight: startupFitInsight.trim() || `Suitable for startup team.`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Candidate Name *</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@example.com"
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Target Role</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.title}>{r.title}</option>
            ))}
            {!roles.some(r => r.title === title) && <option value={title}>{title}</option>}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote"
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Experience (Yrs)</label>
          <input
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Match Score (1-100)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={matchScore}
            onChange={(e) => setMatchScore(Number(e.target.value))}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Pipeline Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as CandidateStage)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
          >
            {(['New', 'Screening', 'In Review', 'Shortlisted', 'Interview', 'Offer', 'Hired'] as CandidateStage[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as CandidateSource)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
          >
            {(['LinkedIn', 'Referral', 'Website', 'Job Board', 'AngelList', 'Dribbble'] as CandidateSource[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Skills (comma-separated)</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Product Design, Figma, Research, Prototyping"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Experience Highlights (one per line)</label>
        <textarea
          rows={2}
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          placeholder="Designed UI system from scratch&#10;Led design for a team of 4 designers"
          className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block font-semibold text-zinc-300">AI Sourcing Insight</label>
          <button
            type="button"
            onClick={generateAiInsights}
            disabled={isGeneratingInsights}
            className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer disabled:opacity-50"
          >
            {isGeneratingInsights ? (
              <Loader2 className="size-3 animate-spin text-brand" />
            ) : (
              <Sparkles className="size-3 text-brand" />
            )}
            <span>Generate with AI</span>
          </button>
        </div>
        <input
          type="text"
          value={aiInsight}
          onChange={(e) => setAiInsight(e.target.value)}
          placeholder="Dynamic AI-generated insight"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Recruiter Notes</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Personal details, portfolio feedback..."
          className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none"
        />
      </div>

      {/* Startup Fit & Sourcing Data */}
      <div className="border-t border-zinc-800 pt-3 mt-3">
        <h4 className="font-bold text-zinc-300 mb-2">Startup Fit & Sourcing Data</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Growth Trajectory</label>
            <select
              value={growthTrajectory}
              onChange={(e) => setGrowthTrajectory(e.target.value as GrowthTrajectory)}
              className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
            >
              <option value="Fast">Fast Growth</option>
              <option value="Moderate">Moderate Growth</option>
              <option value="Steady">Steady Growth</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Vesting Status</label>
            <select
              value={vestingStatus}
              onChange={(e) => setVestingStatus(e.target.value as VestingStatus)}
              className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
            >
              <option value="Unvested">Unvested</option>
              <option value="Partially Vested">Partially Vested</option>
              <option value="Fully Vested">Fully Vested</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Intent Signal</label>
            <select
              value={intentSignal}
              onChange={(e) => setIntentSignal(e.target.value as IntentSignal)}
              className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
            >
              <option value="Passive">Passive</option>
              <option value="High Engagement">High Engagement</option>
              <option value="Recently Promoted">Recently Promoted</option>
              <option value="Actively Sourcing">Actively Sourcing</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Startup Fit Score (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={startupFitScore}
              onChange={(e) => setStartupFitScore(Number(e.target.value))}
              className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1 text-zinc-300">Company Stage Experience</label>
          <div className="flex flex-wrap gap-3 p-2 rounded-lg border border-zinc-800 bg-[#121214]">
            {(['Seed', 'Series A', 'Series B', 'Growth', 'Enterprise'] as CompanyStage[]).map((stg) => {
              const isChecked = companyStages.includes(stg)
              return (
                <label key={stg} className="flex items-center gap-1.5 text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setCompanyStages((prev) =>
                        prev.includes(stg)
                          ? prev.filter((s) => s !== stg)
                          : [...prev, stg]
                      )
                    }}
                    className="rounded border-zinc-800 accent-brand cursor-pointer"
                  />
                  <span>{stg}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Startup Fit Summary Insight</label>
          <input
            type="text"
            value={startupFitInsight}
            onChange={(e) => setStartupFitInsight(e.target.value)}
            placeholder="e.g. Shipped 0->1 B2B product before. Highly collaborative."
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-9 px-4 rounded-xl bg-brand text-black hover:brightness-110 transition font-bold cursor-pointer"
        >
          {candidate ? 'Save Changes' : 'Create Candidate'}
        </button>
      </div>
    </form>
  )
}

function RoleForm({
  role,
  onSave,
  onCancel,
}: {
  role?: Role
  onSave: (data: Partial<Role>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = React.useState(role?.title ?? '')
  const [department, setDepartment] = React.useState(role?.department ?? 'Design')
  const [location, setLocation] = React.useState(role?.location ?? 'Remote')
  const [employmentType, setEmploymentType] = React.useState(role?.employmentType ?? 'Full-time')
  const [level, setLevel] = React.useState(role?.level ?? 'Senior')
  const [salaryRange, setSalaryRange] = React.useState(role?.salaryRange ?? '$100k - $130k')
  const [status, setStatus] = React.useState<Role['status']>(role?.status ?? 'Open')
  const [description, setDescription] = React.useState(role?.description ?? '')
  const [skills, setSkills] = React.useState(role?.skills.join(', ') ?? '')
  const [requirements, setRequirements] = React.useState(role?.requirements.join('\n') ?? '')
  const [responsibilities, setResponsibilities] = React.useState(role?.responsibilities.join('\n') ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Role Title is required')

    onSave({
      id: role?.id,
      title: title.trim(),
      department,
      location: location.trim(),
      employmentType,
      level,
      salaryRange: salaryRange.trim(),
      status,
      description: description.trim(),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: requirements.split('\n').map((r) => r.trim()).filter(Boolean),
      responsibilities: responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Job Title *</label>
        <input
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Salary Range</label>
          <input
            type="text"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="e.g. $120k - $150k"
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Location type</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote"
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Employment Type</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Target Level</label>
          <input
            type="text"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. Senior"
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Role['status'])}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
          >
            <option value="Open">Open</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Closing">Closing</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of the opening..."
          className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Required Skills (comma-separated)</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="TypeScript, Node.js, React, AWS"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Key Responsibilities (one per line)</label>
        <textarea
          rows={2}
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          placeholder="Write scalable backend services&#10;Evolve architecture design"
          className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Job Requirements (one per line)</label>
        <textarea
          rows={2}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="BS degree in CS or equivalent&#10;Experience with high throughput databases"
          className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-9 px-4 rounded-xl bg-brand text-black hover:brightness-110 transition font-bold cursor-pointer"
        >
          {role ? 'Save Changes' : 'Post Position'}
        </button>
      </div>
    </form>
  )
}

function EmailOutreachForm({
  candidate,
  roles = [],
  onCancel,
}: {
  candidate: Candidate
  roles?: Role[]
  onCancel: () => void
}) {
  const [outreachMode, setOutreachMode] = React.useState<'single' | 'sequence'>('single')
  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3>(1)
  const [isGenerating, setIsGenerating] = React.useState(false)
  
  // Step 1: Email
  const [subject, setSubject] = React.useState(`Jobraker Opportunity: ${candidate.title} opening`)
  const [body, setBody] = React.useState('')

  // Step 2: LinkedIn Connect
  const [linkedinNote, setLinkedinNote] = React.useState('')

  // Step 3: Follow-up Email
  const [followUpSubject, setFollowUpSubject] = React.useState(`Following up: ${candidate.title} opportunity`)
  const [followUpBody, setFollowUpBody] = React.useState('')

  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle')

  const generateOutreach = React.useCallback(async () => {
    setIsGenerating(true)
    try {
      const targetRole = roles.find(r => r.title === candidate.title) || roles[0]
      const roleContext = targetRole 
        ? `Title: ${targetRole.title}\nDepartment: ${targetRole.department}\nLocation: ${targetRole.location}\nSalary: ${targetRole.salaryRange}\nDescription: ${targetRole.description}\nRequirements:\n${targetRole.requirements.map(r => `* ${r}`).join('\n')}\nResponsibilities:\n${targetRole.responsibilities.map(r => `* ${r}`).join('\n')}`
        : `Title: ${candidate.title}`

      // Run generations in parallel
      const [emailRes, liRes, followUpRes] = await Promise.all([
        window.ipc.invoke('recruiter:generateLlm', {
          systemPrompt: 'You are a warm, professional tech recruiter drafting a personalized cold outreach email. Output only "Subject: [Subject]" followed by the email body.',
          prompt: `Draft a personalized outreach email to candidate ${candidate.name} for the role of ${candidate.title}.\n\nCandidate background:\nSkills: ${candidate.skills.join(', ')}\nHighlights: ${candidate.highlights.join('; ')}\nExperience: ${candidate.experienceYears} years\nStartup alignment: Sourced via ${candidate.source}, intent: ${candidate.intentSignal}.\n\nRole details:\n${roleContext}\n\nMake it engaging, citing their specific skills, and ask for a 15-minute intro chat. Output ONLY "Subject: <Subject>" on line 1, then a double newline, then the email body.`,
        }),
        window.ipc.invoke('recruiter:generateLlm', {
          systemPrompt: 'You are a professional tech recruiter drafting a short LinkedIn connection request note. Output only the note under 300 characters.',
          prompt: `Draft a personalized, extremely brief LinkedIn connection note (MAX 300 characters) to candidate ${candidate.name} for the ${candidate.title} role. Mention connecting about their background in ${candidate.skills.slice(0, 2).join('/')} and Jobraker. Keep it under 300 characters.`,
        }),
        window.ipc.invoke('recruiter:generateLlm', {
          systemPrompt: 'You are a warm, professional tech recruiter drafting a follow-up email. Output only "Subject: [Subject]" followed by the follow-up body.',
          prompt: `Draft a brief follow-up email to candidate ${candidate.name} about the ${candidate.title} role. Keep it to 3-4 sentences maximum, friendly, reminding them of the previous email, and suggesting a quick chat. Output ONLY "Subject: <Subject>" on line 1, then a double newline, then the body.`,
        })
      ])

      if (emailRes.error) throw new Error(emailRes.error)

      // Parse email
      const emailText = emailRes.text || ''
      const emailSubjectMatch = emailText.match(/^Subject:\s*(.*)/i)
      if (emailSubjectMatch) {
        setSubject(emailSubjectMatch[1].trim())
        setBody(emailText.replace(/^Subject:\s*.*/i, '').trim())
      } else {
        setBody(emailText)
      }

      // LinkedIn note
      setLinkedinNote(liRes.text || '')

      // Follow-up
      const followUpText = followUpRes.text || ''
      const followUpSubjectMatch = followUpText.match(/^Subject:\s*(.*)/i)
      if (followUpSubjectMatch) {
        setFollowUpSubject(followUpSubjectMatch[1].trim())
        setFollowUpBody(followUpText.replace(/^Subject:\s*.*/i, '').trim())
      } else {
        setFollowUpBody(followUpText)
      }

      toast.success('AI outreach templates drafted!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to generate AI outreach', {
        description: err?.message || String(err)
      })
    } finally {
      setIsGenerating(false)
    }
  }, [candidate, roles])

  React.useEffect(() => {
    generateOutreach()
  }, [generateOutreach])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    
    setTimeout(() => {
      setStatus('sent')
      const message = outreachMode === 'sequence' 
        ? `Outreach sequence launched successfully!` 
        : `Outreach email sent!`
      const desc = outreachMode === 'sequence'
        ? `Initiated 3-step automated follow-up sequence for ${candidate.name}.`
        : `Delivered message to ${candidate.name} (${candidate.email}) successfully.`
        
      toast.success(message, {
        description: desc,
      })
      setTimeout(() => {
        onCancel()
      }, 1000)
    }, 1500)
  }

  return (
    <form onSubmit={handleSend} className="space-y-4 text-xs font-sans">
      {/* Selector Tabs */}
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
        <button
          type="button"
          onClick={() => setOutreachMode('single')}
          className={`flex-1 h-8 rounded-lg text-xs font-semibold transition cursor-pointer ${
            outreachMode === 'single' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
          disabled={isGenerating}
        >
          Single Email
        </button>
        <button
          type="button"
          onClick={() => setOutreachMode('sequence')}
          className={`flex-1 h-8 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            outreachMode === 'sequence' ? "bg-violet-600/20 text-violet-300 border border-violet-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
          disabled={isGenerating}
        >
          <Sparkles className="size-3 text-violet-400" />
          <span>Multi-Channel Sequence</span>
        </button>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center p-12 border border-zinc-800/80 bg-[#121214]/50 rounded-xl space-y-4">
          <Loader2 className="size-6 animate-spin text-brand" />
          <span className="text-zinc-400 text-xs font-semibold">AI is drafting personalized candidate outreach...</span>
        </div>
      ) : outreachMode === 'sequence' ? (
        <div className="space-y-4">
          {/* Timeline indicator steps */}
          <div className="relative flex justify-between items-center px-4 py-2 bg-[#121214] rounded-xl border border-zinc-800">
            {/* Horizontal timeline line */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-800" />
            
            {[
              { id: 1, label: "Day 1", type: "Email" },
              { id: 2, label: "Day 3", type: "LinkedIn" },
              { id: 3, label: "Day 5", type: "Follow-up" }
            ].map((step) => {
              const isCurrent = activeStep === step.id
              const isPast = activeStep > step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id as 1 | 2 | 3)}
                  className="relative z-10 flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
                >
                  <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    isCurrent ? "bg-violet-600 border-violet-400 text-white" :
                    isPast ? "bg-brand/20 border-brand text-brand" :
                    "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}>
                    {step.id}
                  </span>
                  <span className={`text-[9px] font-semibold transition ${
                    isCurrent ? "text-violet-300" : "text-zinc-500"
                  }`}>
                    {step.label} · {step.type}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Step Content fields */}
          {activeStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Recipient</label>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121214] h-9 px-3 text-zinc-400">
                  <span>{candidate.name}</span>
                  <span>{candidate.email}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-zinc-300">Subject</label>
                  <button
                    type="button"
                    onClick={generateOutreach}
                    className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    <span>Regenerate drafts</span>
                  </button>
                </div>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Email Body (AI Sourced)</label>
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-zinc-300">LinkedIn Connect Note (Autopilot)</label>
                  <button
                    type="button"
                    onClick={generateOutreach}
                    className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    <span>Regenerate drafts</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={linkedinNote}
                  onChange={(e) => setLinkedinNote(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Sent as a personalized invitation note along with the connection request.
                </p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-zinc-300">Follow-up Email Subject</label>
                  <button
                    type="button"
                    onClick={generateOutreach}
                    className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    <span>Regenerate drafts</span>
                  </button>
                </div>
                <input
                  required
                  type="text"
                  value={followUpSubject}
                  onChange={(e) => setFollowUpSubject(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Follow-up Email Body</label>
                <textarea
                  required
                  rows={5}
                  value={followUpBody}
                  onChange={(e) => setFollowUpBody(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Recipient</label>
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121214] h-9 px-3 text-zinc-400">
              <span>{candidate.name}</span>
              <span>{candidate.email}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-zinc-300">Subject</label>
              <button
                type="button"
                onClick={generateOutreach}
                className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline cursor-pointer"
              >
                <Sparkles className="size-3" />
                <span>Regenerate draft</span>
              </button>
            </div>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
              disabled={status !== 'idle'}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Email Draft (AI generated, customizable)</label>
            <textarea
              required
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] p-2.5 outline-none focus:border-brand/40 text-white resize-none leading-relaxed"
              disabled={status !== 'idle'}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-semibold cursor-pointer"
          disabled={status !== 'idle' || isGenerating}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="min-w-38 h-9 px-4 rounded-xl bg-brand text-black hover:brightness-110 transition font-bold flex items-center justify-center gap-2 cursor-pointer"
          disabled={status !== 'idle' || isGenerating}
        >
          {status === 'sending' && (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>{outreachMode === 'sequence' ? 'Launching Sequencer...' : 'Delivering...'}</span>
            </>
          )}
          {status === 'sent' && (
            <>
              <Check className="size-3.5" />
              <span>{outreachMode === 'sequence' ? 'Sequence Running!' : 'Outbox Sent!'}</span>
            </>
          )}
          {status === 'idle' && (
            <span>{outreachMode === 'sequence' ? 'Start AI Auto-Sequence' : 'Send AI Outreach'}</span>
          )}
        </button>
      </div>
    </form>
  )
}

function InterviewScheduleForm({
  candidate,
  roles = [],
  onSave,
  onCancel,
}: {
  candidate: Candidate
  roles?: Role[]
  onSave: (details: { title: string; date: string; time: string; noteAppend?: string }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = React.useState('Technical Interview')
  const [date, setDate] = React.useState('2026-06-09')
  const [time, setTime] = React.useState('11:00')
  const [interviewer, setInterviewer] = React.useState('Miles (Design Lead)')

  const [aiQuestions, setAiQuestions] = React.useState<string[]>([])
  const [isGeneratingQuestions, setIsGeneratingQuestions] = React.useState(false)

  const generateInterviewQuestions = async () => {
    setIsGeneratingQuestions(true)
    try {
      const targetRole = roles.find(r => r.title === candidate.title) || roles[0]
      const roleContext = targetRole
        ? `Title: ${targetRole.title}\nDescription: ${targetRole.description}\nRequirements:\n${targetRole.requirements.join('\n')}`
        : `Title: ${candidate.title}`

      const res = await window.ipc.invoke('recruiter:generateLlm', {
        systemPrompt: 'You are an elite startup interviewer. Generate 3 highly specific, challenging, and customized interview questions for the candidate based on their profile and the target role.',
        prompt: `Generate 3 targeted interview questions for candidate ${candidate.name} interviewing for the role: ${candidate.title}.\nCandidate background:\nSkills: ${candidate.skills.join(', ')}\nHighlights: ${candidate.highlights.join('; ')}\nRole Context:\n${roleContext}\n\nOutput only the 3 questions as a numbered list (1, 2, 3) without extra intro or outro text.`,
      })

      if (res.error) throw new Error(res.error)
      const list = (res.text || '')
        .split(/\n+/)
        .map(q => q.replace(/^\d+[\.\)\s]*/, '').trim())
        .filter(Boolean)
      
      setAiQuestions(list.slice(0, 3))
      toast.success('AI Interview Questions generated!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to generate interview questions', {
        description: err?.message || String(err)
      })
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let noteAppend = ''
    if (aiQuestions.length > 0) {
      noteAppend = `\n\n[AI Interview Guide for ${title}]:\n` + aiQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    }

    onSave({ title, date, time, noteAppend })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Candidate Name</label>
        <div className="flex items-center rounded-lg border border-zinc-800 bg-[#121214] h-9 px-3 text-zinc-400">
          <span>{candidate.name} ({candidate.title})</span>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Interview Title</label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-2 outline-none focus:border-brand/40 text-white"
        >
          <option value="Initial Screen">Initial Screen</option>
          <option value="Technical Interview">Technical Interview</option>
          <option value="Design Portfolio Critique">Design Portfolio Critique</option>
          <option value="Cultural Fit Interview">Cultural Fit Interview</option>
          <option value="Executive Interview">Executive Interview</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Date</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">Time</label>
          <input
            required
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-zinc-300">Primary Interviewer</label>
        <input
          required
          type="text"
          value={interviewer}
          onChange={(e) => setInterviewer(e.target.value)}
          placeholder="Interviewer Name"
          className="w-full h-9 rounded-lg border border-zinc-800 bg-[#121214] px-3 outline-none focus:border-brand/40 text-white"
        />
      </div>

      {/* AI Interview Guide Section */}
      <div className="border-t border-zinc-800 pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand" />
            AI Interview Questions
          </h4>
          {aiQuestions.length === 0 && !isGeneratingQuestions && (
            <button
              type="button"
              onClick={generateInterviewQuestions}
              className="text-[10px] font-semibold text-brand hover:underline cursor-pointer"
            >
              Generate Guide
            </button>
          )}
        </div>

        {isGeneratingQuestions && (
          <div className="flex items-center justify-center gap-2 p-4 bg-[#121214] border border-zinc-800 rounded-lg">
            <Loader2 className="size-4 animate-spin text-brand" />
            <span className="text-[10px] text-zinc-400">AI is analyzing candidate profile...</span>
          </div>
        )}

        {aiQuestions.length > 0 && (
          <div className="space-y-2 p-3 bg-[#121214] border border-zinc-800 rounded-lg">
            {aiQuestions.map((q, idx) => (
              <div key={idx} className="flex gap-2 text-[11px] text-zinc-300 leading-relaxed">
                <span className="font-bold text-brand">{idx + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={generateInterviewQuestions}
              disabled={isGeneratingQuestions}
              className="mt-1 text-[9px] font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Regenerate Questions
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-9 px-4 rounded-xl bg-brand text-black hover:brightness-110 transition font-bold cursor-pointer"
        >
          Schedule Interview
        </button>
      </div>
    </form>
  )
}

export { AnalyticsPage } from './analytics-page'
export { CandidatesPage } from './candidates-page'
export { PipelinePage } from './pipeline-page'
export { RolesPage } from './roles-page'
