import http from 'node:http'

const PORT = Number(process.env.PORT || 8080)
const QWEN_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
const QWEN_MODEL = process.env.DASHSCOPE_MODEL || 'qwen3.7-plus'

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': process.env.CORS_ORIGIN || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  })
  res.end(JSON.stringify(payload))
}

async function readJson(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 1_000_000) {
      throw new Error('Request body too large')
    }
  }
  return body ? JSON.parse(body) : {}
}

function buildPrompt(candidate, role) {
  return `Run Jobraker Recruiter Autopilot for this candidate and role.

Candidate:
${JSON.stringify(candidate, null, 2)}

Role:
${JSON.stringify(role, null, 2)}

Return only valid JSON:
{
  "recommendedStage": "New | Screening | In Review | Shortlisted | Interview | Offer | Hired",
  "matchScore": number,
  "startupFitScore": number,
  "recruiterSummary": "1-2 sentences explaining the recommendation",
  "candidateNoteAppend": "short audit note beginning with Qwen Autopilot:",
  "nextAction": "specific next recruiter action",
  "humanApprovalRequired": true,
  "approvalReason": "why the recruiter should approve before outreach or scheduling"
}`
}

async function runQwenAutopilot(candidate, role) {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not configured on the Alibaba Cloud backend')
  }

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: QWEN_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are Jobraker Recruiter Autopilot, a review-first agent for startup recruiting workflows. Recommend actions, preserve human approval for candidate-facing steps, and output only valid JSON.',
        },
        {
          role: 'user',
          content: buildPrompt(candidate, role),
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error?.message || `Qwen Cloud request failed with ${response.status}`)
  }

  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Qwen Cloud returned an empty response')
  }

  return JSON.parse(text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim())
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      return sendJson(res, 204, {})
    }

    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'jobraker-alibaba-qwen-autopilot',
        cloud: 'Alibaba Cloud',
        qwenBaseUrl: QWEN_BASE_URL,
        qwenModel: QWEN_MODEL,
        hasDashscopeKey: Boolean(process.env.DASHSCOPE_API_KEY),
      })
    }

    if (req.method === 'POST' && req.url === '/api/autopilot/recruiter') {
      const { candidate, role } = await readJson(req)
      if (!candidate || !role) {
        return sendJson(res, 400, { error: 'candidate and role are required' })
      }

      const result = await runQwenAutopilot(candidate, role)
      return sendJson(res, 200, {
        provider: 'Alibaba Cloud Qwen Cloud',
        model: QWEN_MODEL,
        result,
      })
    }

    return sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

server.listen(PORT, () => {
  console.log(`Jobraker Alibaba Qwen Autopilot backend listening on ${PORT}`)
})
