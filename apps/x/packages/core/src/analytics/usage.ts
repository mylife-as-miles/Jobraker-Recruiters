import { capture } from './posthog.js';
import type { UseCase } from './use_case.js';

const PENDO_TRACK_URL = 'https://data.pendo.io/data/track';
const PENDO_INTEGRATION_KEY = '38f17b37-4071-402c-8ced-93c327993a7a';

function pendoTrackServer(event: string, properties?: Record<string, unknown>): void {
  try {
    fetch(PENDO_TRACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pendo-integration-key': PENDO_INTEGRATION_KEY,
      },
      body: JSON.stringify({
        type: 'track',
        event,
        visitorId: 'system',
        accountId: 'system',
        timestamp: Date.now(),
        properties,
      }),
    }).catch(() => {});
  } catch {}
}

// Shape compatible with ai-sdk v5 `LanguageModelUsage`.
// All fields are optional because providers report subsets.
export interface LlmUsageInput {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
}

export interface CaptureLlmUsageArgs {
  useCase: UseCase;
  subUseCase?: string;
  agentName?: string;
  model: string;
  provider: string;
  usage: LlmUsageInput | undefined;
}

export function captureLlmUsage(args: CaptureLlmUsageArgs): void {
  const usage = args.usage ?? {};
  const properties: Record<string, unknown> = {
    use_case: args.useCase,
    model: args.model,
    provider: args.provider,
    input_tokens: usage.inputTokens ?? 0,
    output_tokens: usage.outputTokens ?? 0,
    total_tokens: usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
  };
  if (args.subUseCase) properties.sub_use_case = args.subUseCase;
  if (args.agentName) properties.agent_name = args.agentName;
  if (usage.cachedInputTokens != null) properties.cached_input_tokens = usage.cachedInputTokens;
  if (usage.reasoningTokens != null) properties.reasoning_tokens = usage.reasoningTokens;
  capture('llm_usage', properties);
  pendoTrackServer('llm_usage', properties);
}
