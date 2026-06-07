import { AnimatePresence, motion } from 'motion/react'
import { AnalyticsPage } from './analytics-page'
import { CandidatesPage } from './candidates-page'
import { PipelinePage } from './pipeline-page'
import { RolesPage } from './roles-page'
import { RECRUITER_EASE } from './shared'

export type RecruiterScreenId = 'roles' | 'candidates' | 'pipeline' | 'analytics'

export type RecruiterScreensProps = {
  screen: RecruiterScreenId
  onNavigate: (screen: RecruiterScreenId) => void
  onAskCopilot?: (prompt: string) => void
}

export function RecruiterScreens({ screen, onNavigate, onAskCopilot }: RecruiterScreensProps) {
  return (
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
            onNavigatePipeline={() => onNavigate('pipeline')}
            onNavigateCandidates={() => onNavigate('candidates')}
          />
        )}
        {screen === 'candidates' && (
          <CandidatesPage
            onAskCopilot={onAskCopilot}
            onNavigatePipeline={() => onNavigate('pipeline')}
          />
        )}
        {screen === 'pipeline' && (
          <PipelinePage
            onAskCopilot={onAskCopilot}
            onNavigateCandidates={() => onNavigate('candidates')}
          />
        )}
        {screen === 'analytics' && (
          <AnalyticsPage onAskCopilot={onAskCopilot} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export { AnalyticsPage } from './analytics-page'
export { CandidatesPage } from './candidates-page'
export { PipelinePage } from './pipeline-page'
export { RolesPage } from './roles-page'
