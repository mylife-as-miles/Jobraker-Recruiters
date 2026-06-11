const PREFIX = 'jobraker-recruiter-ui'

export const RECRUITER_STATE_EVENT = 'jobraker-recruiter-state-change'

export function loadRecruiterState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveRecruiterState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(RECRUITER_STATE_EVENT, { detail: { key } }))
    
    // Asynchronously sync the full database to disk file config/recruiter-db.json
    void syncRecruiterDbToDisk()
  } catch {
    /* quota / private mode */
  }
}

export async function syncRecruiterDbToDisk(): Promise<void> {
  try {
    // Only proceed if window.ipc is available (e.g. running inside Electron)
    if (!window.ipc) return
    const db = {
      candidates: loadRecruiterState('candidates', []),
      roles: loadRecruiterState('roles', []),
      pipelineBoard: loadRecruiterState('pipeline-board', {}),
      candidateStages: loadRecruiterState('candidate-stages', {}),
      candidateNotes: loadRecruiterState('candidate-notes', {}),
      roleFavorites: loadRecruiterState('role-favorites', []),
      homeMetricsSnapshots: loadRecruiterState('home-metrics-snapshots', [])
    }
    await window.ipc.invoke("workspace:writeFile", {
      path: "config/recruiter-db.json",
      data: JSON.stringify(db, null, 2)
    })
  } catch (err) {
    console.error("Failed to sync recruiter db to disk", err)
  }
}

function cleanMockData(): void {
  try {
    const rawCandidates = localStorage.getItem('jobraker-recruiter-ui:candidates')
    if (rawCandidates) {
      const parsed = JSON.parse(rawCandidates) as any[]
      const hasMock = Array.isArray(parsed) && parsed.some((c: any) =>
        c && typeof c === 'object' && ['Teni Ogunleye', 'Morgan Lee', 'Femi Okoro', 'Priya Shah', 'Jason Ng'].includes(c.name)
      )
      if (hasMock) {
        localStorage.removeItem('jobraker-recruiter-ui:candidates')
        localStorage.removeItem('jobraker-recruiter-ui:roles')
        localStorage.removeItem('jobraker-recruiter-ui:candidate-stages')
        localStorage.removeItem('jobraker-recruiter-ui:candidate-notes')
        localStorage.removeItem('jobraker-recruiter-ui:role-favorites')
        localStorage.removeItem('jobraker-recruiter-ui:pipeline-board')
        localStorage.removeItem('jobraker-recruiter-ui:home-metrics-snapshots')
      }
    }
  } catch {
    // Ignore error
  }
}

cleanMockData()
