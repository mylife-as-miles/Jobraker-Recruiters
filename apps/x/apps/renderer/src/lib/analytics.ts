import posthog from 'posthog-js'

let appVersion: string | undefined
let apiUrl: string | undefined

export function isAnalyticsEnabled(): boolean {
  return Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY?.trim())
}

// Pendo Track Event helper — safely calls pendo.track() when the Pendo agent is loaded.
function pendoTrack(event: string, properties?: Record<string, unknown>) {
  try {
    const w = window as any
    if (typeof w.pendo?.track === 'function') {
      w.pendo.track(event, properties)
    }
  } catch {
    // Never let Pendo tracking break application flow
  }
}

function appVersionProperties(): Record<string, string> {
  return appVersion ? { app_version: appVersion } : {}
}

export function configureAnalyticsContext(props: { appVersion?: string; apiUrl?: string }) {
  if (!isAnalyticsEnabled()) return

  appVersion = props.appVersion?.trim() || undefined
  apiUrl = props.apiUrl?.trim() || undefined

  const eventProperties = appVersionProperties()
  if (Object.keys(eventProperties).length > 0) {
    posthog.register(eventProperties)
  }

  const personProperties = {
    ...(apiUrl ? { api_url: apiUrl } : {}),
    ...eventProperties,
  }
  if (Object.keys(personProperties).length > 0) {
    posthog.people.set(personProperties)
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isAnalyticsEnabled()) return
  posthog.identify(userId, {
    ...properties,
    ...appVersionProperties(),
  })
}

export function resetAnalyticsIdentity() {
  if (!isAnalyticsEnabled()) return
  posthog.reset()
  configureAnalyticsContext({ appVersion, apiUrl })
}

export function chatSessionCreated(runId: string) {
  if (!isAnalyticsEnabled()) return
  posthog.capture('chat_session_created', { run_id: runId })
  pendoTrack('chat_session_created', { run_id: runId })
}

export function chatMessageSent(props: {
  voiceInput?: boolean
  voiceOutput?: string
  searchEnabled?: boolean
}) {
  if (!isAnalyticsEnabled()) return
  const properties = {
    voice_input: props.voiceInput ?? false,
    voice_output: props.voiceOutput ?? false,
    search_enabled: props.searchEnabled ?? false,
  }
  posthog.capture('chat_message_sent', properties)
  pendoTrack('chat_message_sent', properties)
}

export function oauthConnected(provider: string) {
  if (!isAnalyticsEnabled()) return
  posthog.capture('oauth_connected', { provider })
  pendoTrack('oauth_connected', { provider })
}

export function oauthDisconnected(provider: string) {
  if (!isAnalyticsEnabled()) return
  posthog.capture('oauth_disconnected', { provider })
  pendoTrack('oauth_disconnected', { provider })
}

export function voiceInputStarted() {
  if (!isAnalyticsEnabled()) return
  posthog.capture('voice_input_started')
  pendoTrack('voice_input_started')
}

export function searchExecuted(types: string[]) {
  if (!isAnalyticsEnabled()) return
  posthog.capture('search_executed', { types })
  pendoTrack('search_executed', { types })
}

export function noteExported(format: string) {
  if (!isAnalyticsEnabled()) return
  posthog.capture('note_exported', { format })
  pendoTrack('note_exported', { format })
}
