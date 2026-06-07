// Mock recruiter data powering the Roles / Candidates / Pipeline / Analytics
// dashboards. These screens are presentation-first; the data here mirrors the
// product design so the UI renders with realistic, premium content. Swap these
// for live IPC-backed sources when a recruiting backend exists.

export type PipelineStage =
  | 'Sourced'
  | 'Contacted'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Hired'

export const PIPELINE_STAGES: PipelineStage[] = [
  'Sourced',
  'Contacted',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
]

export type CandidateStage =
  | 'New'
  | 'Screening'
  | 'In Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Offer'
  | 'Hired'

export type CandidateSource =
  | 'LinkedIn'
  | 'Referral'
  | 'Website'
  | 'Job Board'
  | 'AngelList'
  | 'Dribbble'
  | 'Twitter'
  | 'Career Page'

export type Candidate = {
  id: string
  name: string
  title: string
  location: string
  experienceYears: number
  matchScore: number
  stage: CandidateStage
  source: CandidateSource
  lastActivity: string
  fit?: 'High fit' | 'Recommended' | null
  skills: string[]
  highlights: string[]
  aiInsight: string
  note?: string
  email: string
}

// Deterministic avatar gradient from a name so colors stay stable per person.
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #1dff00 0%, #0b8f12 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
  'linear-gradient(135deg, #f8d74a 0%, #f97316 100%)',
  'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
]

export function avatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function matchTone(score: number): { text: string; bg: string; ring: string } {
  if (score >= 85) return { text: '#1dff00', bg: 'rgba(29,255,0,0.12)', ring: 'rgba(29,255,0,0.45)' }
  if (score >= 65) return { text: '#f8d74a', bg: 'rgba(248,215,74,0.12)', ring: 'rgba(248,215,74,0.4)' }
  return { text: '#f97316', bg: 'rgba(249,115,22,0.12)', ring: 'rgba(249,115,22,0.4)' }
}

// ───────────────────────── Candidates ─────────────────────────

export const CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Teni Ogunleye',
    title: 'Senior Product Designer',
    location: 'Lagos, Nigeria',
    experienceYears: 4,
    matchScore: 96,
    stage: 'Shortlisted',
    source: 'LinkedIn',
    lastActivity: '2h ago',
    fit: 'High fit',
    skills: ['Product Design', 'Figma', 'User Research', 'Design Systems', 'Prototyping'],
    highlights: [
      'Designed and shipped 15+ features used by 100K+ users',
      'Led design system revamp that improved consistency by 40%',
      'Collaborated with cross-functional teams in agile environment',
    ],
    aiInsight:
      'Teni has strong fundamentals in interaction design but could strengthen visual design skills.',
    note: 'Impressed with portfolio case studies and user research depth.',
    email: 'teni.ogunleye@example.com',
  },
  {
    id: 'c2',
    name: 'Femi Okoro',
    title: 'Product Designer',
    location: 'Remote',
    experienceYears: 5,
    matchScore: 92,
    stage: 'In Review',
    source: 'Referral',
    lastActivity: '4h ago',
    fit: 'Recommended',
    skills: ['Product Design', 'Design Systems', 'Figma', 'Motion'],
    highlights: [
      'Scaled a 0→1 fintech product to 250K users',
      'Mentored 3 junior designers',
    ],
    aiInsight: 'Strong systems thinker; comp expectations may run above band.',
    email: 'femi.okoro@example.com',
  },
  {
    id: 'c3',
    name: 'Chinaza Uche',
    title: 'UX/UI Designer',
    location: 'Lagos, Nigeria',
    experienceYears: 3,
    matchScore: 89,
    stage: 'Screening',
    source: 'Website',
    lastActivity: '1d ago',
    skills: ['UI Design', 'Figma', 'Webflow', 'Accessibility'],
    highlights: ['Redesigned marketing site lifting conversion 22%'],
    aiInsight: 'Great visual polish; less depth in research methods.',
    email: 'chinaza.uche@example.com',
  },
  {
    id: 'c4',
    name: 'David Adeyemi',
    title: 'Product Designer',
    location: 'Abuja, Nigeria',
    experienceYears: 6,
    matchScore: 86,
    stage: 'In Review',
    source: 'LinkedIn',
    lastActivity: '1d ago',
    skills: ['Product Design', 'Research', 'Strategy'],
    highlights: ['Owned end-to-end design for B2B SaaS dashboard'],
    aiInsight: 'Senior generalist; strong stakeholder management.',
    email: 'david.adeyemi@example.com',
  },
  {
    id: 'c5',
    name: 'Zainab Yusuf',
    title: 'Product Designer',
    location: 'Lagos, Nigeria',
    experienceYears: 2,
    matchScore: 78,
    stage: 'New',
    source: 'Job Board',
    lastActivity: '2d ago',
    skills: ['UI Design', 'Figma', 'Illustration'],
    highlights: ['Strong early-career portfolio with mobile focus'],
    aiInsight: 'Promising junior; would benefit from systems exposure.',
    email: 'zainab.yusuf@example.com',
  },
  {
    id: 'c6',
    name: 'Ibrahim Bello',
    title: 'Product Designer',
    location: 'Kano, Nigeria',
    experienceYears: 4,
    matchScore: 75,
    stage: 'Screening',
    source: 'LinkedIn',
    lastActivity: '3d ago',
    skills: ['Product Design', 'Figma'],
    highlights: ['Shipped 3 consumer apps end to end'],
    aiInsight: 'Solid execution; portfolio narrative could be sharper.',
    email: 'ibrahim.bello@example.com',
  },
  {
    id: 'c7',
    name: 'Aisha Lawal',
    title: 'Product Designer',
    location: 'Remote',
    experienceYears: 5,
    matchScore: 85,
    stage: 'Screening',
    source: 'AngelList',
    lastActivity: '3d ago',
    fit: 'Recommended',
    skills: ['Product Design', 'Research', 'Prototyping'],
    highlights: ['Led design at a YC-backed startup'],
    aiInsight: 'Startup-ready; thrives in ambiguity.',
    email: 'aisha.lawal@example.com',
  },
  {
    id: 'c8',
    name: 'Daniel Kim',
    title: 'Product Designer',
    location: 'Seoul, KR',
    experienceYears: 6,
    matchScore: 80,
    stage: 'Screening',
    source: 'Dribbble',
    lastActivity: '4d ago',
    skills: ['Visual Design', 'Branding', 'Figma'],
    highlights: ['Award-winning visual portfolio'],
    aiInsight: 'Exceptional craft; timezone overlap is limited.',
    email: 'daniel.kim@example.com',
  },
  {
    id: 'c9',
    name: 'Fatima Yusuf',
    title: 'Product Designer',
    location: 'Lagos, Nigeria',
    experienceYears: 4,
    matchScore: 78,
    stage: 'Interview',
    source: 'Career Page',
    lastActivity: '5h ago',
    skills: ['Product Design', 'Figma', 'Research'],
    highlights: ['Strong product thinking in interviews'],
    aiInsight: 'Consistent performer across screens.',
    email: 'fatima.yusuf@example.com',
  },
  {
    id: 'c10',
    name: 'Morgan Lee',
    title: 'Product Designer',
    location: 'Remote',
    experienceYears: 7,
    matchScore: 93,
    stage: 'Interview',
    source: 'LinkedIn',
    lastActivity: 'Today',
    fit: 'High fit',
    skills: ['Product Design', 'Design Systems', 'Leadership'],
    highlights: ['Staff-level designer with platform experience'],
    aiInsight: 'Top of funnel; move quickly to secure.',
    email: 'morgan.lee@example.com',
  },
  {
    id: 'c11',
    name: 'Tobi Martins',
    title: 'Product Designer',
    location: 'Lagos, Nigeria',
    experienceYears: 5,
    matchScore: 88,
    stage: 'Interview',
    source: 'Referral',
    lastActivity: 'Today',
    skills: ['Product Design', 'Prototyping'],
    highlights: ['Referred by current senior designer'],
    aiInsight: 'Warm referral; strong culture signal.',
    email: 'tobi.martins@example.com',
  },
  {
    id: 'c12',
    name: 'Priya Shah',
    title: 'Product Designer',
    location: 'Bengaluru, IN',
    experienceYears: 8,
    matchScore: 91,
    stage: 'Offer',
    source: 'LinkedIn',
    lastActivity: 'Today',
    fit: 'High fit',
    skills: ['Product Design', 'Strategy', 'Design Systems'],
    highlights: ['Offer extended — pending acceptance'],
    aiInsight: 'High intent; competing offer likely.',
    email: 'priya.shah@example.com',
  },
  {
    id: 'c13',
    name: 'Jason Ng',
    title: 'Product Designer',
    location: 'Singapore',
    experienceYears: 6,
    matchScore: 90,
    stage: 'Offer',
    source: 'AngelList',
    lastActivity: 'Yesterday',
    skills: ['Product Design', 'Research'],
    highlights: ['Offer pending internal approval'],
    aiInsight: 'Strong all-rounder.',
    email: 'jason.ng@example.com',
  },
  {
    id: 'c14',
    name: 'Sarah Johnson',
    title: 'Product Designer',
    location: 'Remote',
    experienceYears: 7,
    matchScore: 94,
    stage: 'Hired',
    source: 'LinkedIn',
    lastActivity: 'May 28, 2025',
    fit: 'High fit',
    skills: ['Product Design', 'Design Systems', 'Leadership'],
    highlights: ['Hired — start date confirmed'],
    aiInsight: 'Closed successfully.',
    email: 'sarah.johnson@example.com',
  },
]

export const CANDIDATE_KPIS = {
  total: 1284,
  shortlisted: 128,
  inReview: 312,
  avgMatch: 82,
  totalDeltaPct: 18,
  shortlistedDeltaPct: 12,
  inReviewDeltaPct: 8,
  avgMatchDeltaPct: 6,
}

// ───────────────────────── Pipeline ─────────────────────────

export type PipelineColumn = {
  stage: PipelineStage
  count: number
  deltaPct: number
  candidateIds: string[]
}

export const PIPELINE_ROLE_OPTIONS = [
  'Senior Product Designer',
  'Backend Engineer',
  'Data Scientist',
  'Product Manager',
  'Sales Executive',
]

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { stage: 'Sourced', count: 128, deltaPct: 14, candidateIds: ['c1', 'c2', 'c3', 'c5', 'c10'] },
  { stage: 'Contacted', count: 42, deltaPct: 8, candidateIds: ['c9', 'c6', 'c4'] },
  { stage: 'Screening', count: 18, deltaPct: 12, candidateIds: ['c2', 'c7', 'c8'] },
  { stage: 'Interview', count: 6, deltaPct: 0, candidateIds: ['c10', 'c11'] },
  { stage: 'Offer', count: 2, deltaPct: 100, candidateIds: ['c12', 'c13'] },
  { stage: 'Hired', count: 1, deltaPct: 100, candidateIds: ['c14'] },
]

export type PipelineInsight = {
  kind: 'bottleneck' | 'conversion' | 'outreach' | 'interview'
  title: string
  body: string
  cta: string
}

export const PIPELINE_INSIGHTS: PipelineInsight[] = [
  {
    kind: 'bottleneck',
    title: 'Bottleneck',
    body: 'Screening is taking the longest on average (5.6 days).',
    cta: 'Review screening tasks',
  },
  {
    kind: 'conversion',
    title: 'Conversion rate',
    body: 'From Sourced to Hired',
    cta: 'View other suggestions',
  },
]

// ───────────────────────── Roles ─────────────────────────

export type Role = {
  id: string
  title: string
  department: string
  location: string
  employmentType: string
  level: string
  salaryRange: string
  status: 'Open' | 'Interviewing' | 'Closing' | 'Draft'
  postedAgo: string
  applicants: number
  newApplicants: number
  qualityScore: number
  favorite?: boolean
  description: string
  responsibilities: string[]
  requirements: string[]
  skills: string[]
  stageCounts: { stage: PipelineStage; count: number }[]
}

export const ROLES: Role[] = [
  {
    id: 'r1',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Remote · EMEA',
    employmentType: 'Full-time',
    level: 'Senior',
    salaryRange: '$95k – $130k',
    status: 'Interviewing',
    postedAgo: '12 days ago',
    applicants: 128,
    newApplicants: 14,
    qualityScore: 92,
    favorite: true,
    description:
      'We are looking for a Senior Product Designer to own end-to-end product experiences across our recruiting platform. You will partner closely with PM and Engineering to ship delightful, accessible interfaces at speed.',
    responsibilities: [
      'Lead design for major product surfaces from concept to ship',
      'Evolve and maintain the design system',
      'Run discovery and usability research with real users',
      'Mentor mid-level designers and elevate craft across the team',
    ],
    requirements: [
      '4+ years designing complex web products',
      'Expert in Figma and modern prototyping',
      'Strong portfolio demonstrating systems thinking',
      'Excellent written and verbal communication',
    ],
    skills: ['Product Design', 'Figma', 'Design Systems', 'User Research', 'Prototyping'],
    stageCounts: [
      { stage: 'Sourced', count: 128 },
      { stage: 'Contacted', count: 42 },
      { stage: 'Screening', count: 18 },
      { stage: 'Interview', count: 6 },
      { stage: 'Offer', count: 2 },
      { stage: 'Hired', count: 1 },
    ],
  },
  {
    id: 'r2',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Hybrid · Lagos',
    employmentType: 'Full-time',
    level: 'Mid–Senior',
    salaryRange: '$110k – $150k',
    status: 'Open',
    postedAgo: '8 days ago',
    applicants: 96,
    newApplicants: 9,
    qualityScore: 88,
    favorite: false,
    description:
      'Join our platform team to build resilient, high-throughput services that power candidate sourcing and matching at scale.',
    responsibilities: [
      'Design and build scalable backend services',
      'Own reliability and performance of core APIs',
      'Collaborate with data and ML teams on matching',
    ],
    requirements: [
      '4+ years building production backend systems',
      'Strong with TypeScript/Node or Go',
      'Experience with distributed systems',
    ],
    skills: ['Node.js', 'PostgreSQL', 'Distributed Systems', 'AWS', 'Go'],
    stageCounts: [
      { stage: 'Sourced', count: 96 },
      { stage: 'Contacted', count: 31 },
      { stage: 'Screening', count: 14 },
      { stage: 'Interview', count: 5 },
      { stage: 'Offer', count: 1 },
      { stage: 'Hired', count: 0 },
    ],
  },
  {
    id: 'r3',
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote · Global',
    employmentType: 'Full-time',
    level: 'Senior',
    salaryRange: '$120k – $160k',
    status: 'Open',
    postedAgo: '3 days ago',
    applicants: 64,
    newApplicants: 21,
    qualityScore: 84,
    favorite: false,
    description:
      'Help us turn recruiting signals into actionable intelligence. You will build models that power candidate match scores and pipeline forecasting.',
    responsibilities: [
      'Develop and ship ML models for candidate matching',
      'Partner with product to define success metrics',
      'Build analytics that surface hiring insights',
    ],
    requirements: [
      'Strong applied ML and statistics background',
      'Fluent in Python and modern ML tooling',
      'Experience deploying models to production',
    ],
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'MLOps'],
    stageCounts: [
      { stage: 'Sourced', count: 64 },
      { stage: 'Contacted', count: 22 },
      { stage: 'Screening', count: 9 },
      { stage: 'Interview', count: 3 },
      { stage: 'Offer', count: 0 },
      { stage: 'Hired', count: 0 },
    ],
  },
  {
    id: 'r4',
    title: 'Product Manager',
    department: 'Product',
    location: 'Hybrid · London',
    employmentType: 'Full-time',
    level: 'Senior',
    salaryRange: '$105k – $140k',
    status: 'Open',
    postedAgo: '6 days ago',
    applicants: 73,
    newApplicants: 5,
    qualityScore: 81,
    favorite: false,
    description:
      'Own the roadmap for our outreach and pipeline products. Translate recruiter pain into shipped, measurable outcomes.',
    responsibilities: [
      'Define and prioritize the product roadmap',
      'Run discovery with recruiters and hiring managers',
      'Partner with design and engineering to ship',
    ],
    requirements: [
      '5+ years in product management',
      'Track record shipping B2B SaaS',
      'Strong analytical and communication skills',
    ],
    skills: ['Product Strategy', 'Roadmapping', 'Analytics', 'Discovery'],
    stageCounts: [
      { stage: 'Sourced', count: 73 },
      { stage: 'Contacted', count: 26 },
      { stage: 'Screening', count: 11 },
      { stage: 'Interview', count: 4 },
      { stage: 'Offer', count: 1 },
      { stage: 'Hired', count: 0 },
    ],
  },
  {
    id: 'r5',
    title: 'Sales Executive',
    department: 'Go-to-Market',
    location: 'On-site · New York',
    employmentType: 'Full-time',
    level: 'Mid',
    salaryRange: '$80k – $110k + OTE',
    status: 'Closing',
    postedAgo: '18 days ago',
    applicants: 142,
    newApplicants: 2,
    qualityScore: 76,
    favorite: false,
    description:
      'Drive new business across mid-market accounts. You will own the full sales cycle from prospecting to close.',
    responsibilities: [
      'Build and manage a pipeline of qualified opportunities',
      'Run discovery and product demos',
      'Hit and exceed quarterly quota',
    ],
    requirements: [
      '3+ years B2B SaaS sales',
      'Consistent quota attainment',
      'Excellent communication',
    ],
    skills: ['Sales', 'Prospecting', 'Negotiation', 'CRM'],
    stageCounts: [
      { stage: 'Sourced', count: 142 },
      { stage: 'Contacted', count: 58 },
      { stage: 'Screening', count: 20 },
      { stage: 'Interview', count: 7 },
      { stage: 'Offer', count: 2 },
      { stage: 'Hired', count: 1 },
    ],
  },
]

// ───────────────────────── Analytics ─────────────────────────

export type Kpi = {
  label: string
  value: string
  deltaLabel: string
  trend: 'up' | 'down'
  icon: 'roles' | 'response' | 'time' | 'interviews' | 'offer'
}

export const ANALYTICS_KPIS: Kpi[] = [
  { label: 'Open Roles', value: '12', deltaLabel: '2 vs Apr 11 – May 10', trend: 'up', icon: 'roles' },
  { label: 'Response Rate', value: '24.6%', deltaLabel: '6.2pp vs Apr 11 – May 10', trend: 'up', icon: 'response' },
  { label: 'Time to Fill', value: '32 days', deltaLabel: '5 days vs Apr 11 – May 10', trend: 'down', icon: 'time' },
  { label: 'Interviews Booked', value: '48', deltaLabel: '18 vs Apr 11 – May 10', trend: 'up', icon: 'interviews' },
  { label: 'Offer Acceptance Rate', value: '86%', deltaLabel: '4.1pp vs Apr 11 – May 10', trend: 'up', icon: 'offer' },
]

export type FunnelStage = { stage: string; value: number; conversion: number }

export const HIRING_FUNNEL: FunnelStage[] = [
  { stage: 'Sourced', value: 1280, conversion: 100 },
  { stage: 'Screened', value: 428, conversion: 33.4 },
  { stage: 'Interview', value: 142, conversion: 33.2 },
  { stage: 'Offer', value: 28, conversion: 19.7 },
  { stage: 'Hired', value: 12, conversion: 42.9 },
]

export type SourceSlice = { name: string; value: number; pct: number; color: string }

export const SOURCE_PERFORMANCE: SourceSlice[] = [
  { name: 'LinkedIn', value: 538, pct: 42, color: '#1dff00' },
  { name: 'Employee Referral', value: 282, pct: 22, color: '#f8d74a' },
  { name: 'Website / Careers', value: 205, pct: 16, color: '#38bdf8' },
  { name: 'AI Agent', value: 128, pct: 10, color: '#c084fc' },
  { name: 'Other', value: 127, pct: 10, color: '#64748b' },
]

export const SOURCE_TOTAL = 1280

export type TrendPoint = { label: string; value: number }

export const OUTREACH_TREND: TrendPoint[] = [
  { label: 'May 11', value: 18.4 },
  { label: 'May 14', value: 19.1 },
  { label: 'May 18', value: 17.8 },
  { label: 'May 21', value: 21.2 },
  { label: 'May 25', value: 20.4 },
  { label: 'May 28', value: 22.6 },
  { label: 'Jun 1', value: 21.8 },
  { label: 'Jun 4', value: 23.1 },
  { label: 'Jun 8', value: 22.4 },
  { label: 'Jun 10', value: 24.6 },
]

export type TimeToFillRow = { role: string; days: number; deltaDays: number }

export const TIME_TO_FILL_BY_ROLE: TimeToFillRow[] = [
  { role: 'Senior Product Designer', days: 28, deltaDays: -6 },
  { role: 'Backend Engineer', days: 35, deltaDays: -4 },
  { role: 'Data Scientist', days: 42, deltaDays: 3 },
  { role: 'Product Manager', days: 30, deltaDays: -7 },
  { role: 'Sales Executive', days: 24, deltaDays: -2 },
]

export type PipelineHealthStage = { stage: string; pct: number; deltaPct: number }

export const PIPELINE_HEALTH = {
  score: 72,
  label: 'Healthy',
  note: 'Your pipeline is healthy. Keep engaging to maintain momentum.',
  stages: [
    { stage: 'Sourced', pct: 92, deltaPct: 8 },
    { stage: 'Screened', pct: 70, deltaPct: 6 },
    { stage: 'Interview', pct: 48, deltaPct: -2 },
    { stage: 'Offer', pct: 30, deltaPct: 4 },
    { stage: 'Hired', pct: 22, deltaPct: 3 },
  ] as PipelineHealthStage[],
}

export type AnalyticsInsight = {
  kind: 'response' | 'time'
  title: string
  body: string
}

export const ANALYTICS_INSIGHTS: AnalyticsInsight[] = [
  {
    kind: 'response',
    title: 'Response rate improving',
    body: 'Your response rate improved by 6.2pp this period, driven by AI-personalized outreach.',
  },
  {
    kind: 'time',
    title: 'Time to fill opportunity',
    body: 'Backend Engineer roles are taking 5 days longer to fill. Consider expanding sourcing or interview capacity.',
  },
]

export const ANALYTICS_RECOMMENDED_ACTIONS = [
  'Increase outreach volume for Backend Engineer roles',
  'Leverage employee referrals for Product Manager roles',
]

export const DATE_RANGE_LABEL = 'May 11 – Jun 10, 2025'

export function candidateById(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id)
}
