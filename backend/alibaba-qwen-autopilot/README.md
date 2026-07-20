# Jobraker Alibaba Qwen Autopilot Backend

This service is the Alibaba Cloud backend for Jobraker Recruiter's Track 4: Autopilot Agent submission.

It runs on Alibaba Cloud Function Compute and calls Qwen Cloud through the OpenAI-compatible DashScope endpoint:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

When `ALIBABA_AUTOPILOT_URL` is configured in the Electron main-process environment, the existing `recruiter:generateLlm` IPC path sends recruiter-native AI work through this Function Compute service. The desktop application does not need the Qwen API key in that deployment mode.

## Endpoints

- `GET /health` returns deployment and provider proof metadata.
- `POST /api/recruiter/generate` accepts the existing recruiter system prompt, user prompt, and temperature, then returns Qwen-generated text.
- `POST /api/autopilot/recruiter` accepts structured candidate and role data and returns a review-first recruiter Autopilot recommendation.

The POST endpoints are protected by `AUTOPILOT_SERVICE_KEY` through the `X-Jobraker-Service-Key` request header. The health endpoint remains public for deployment verification.

## Required Function Compute environment variables

```powershell
DASHSCOPE_API_KEY=<Qwen Cloud API key>
AUTOPILOT_SERVICE_KEY=<long random service key>
```

Optional:

```powershell
DASHSCOPE_MODEL=qwen3.7-plus
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
PORT=8080
CORS_ORIGIN=*
```

## Desktop application environment

Configure these variables in the environment used to start or package the Electron main process:

```powershell
ALIBABA_AUTOPILOT_URL=https://<function-compute-http-trigger-url>
ALIBABA_AUTOPILOT_SERVICE_KEY=<same long random service key>
```

When `ALIBABA_AUTOPILOT_URL` is absent, Jobraker Recruiter retains its existing local development fallbacks:

1. Direct Qwen Cloud through `DASHSCOPE_API_KEY`.
2. The configured Gemini/Google ADK recruiter runtime.

## Local run

```powershell
cd backend/alibaba-qwen-autopilot
$env:DASHSCOPE_API_KEY="sk-..."
$env:AUTOPILOT_SERVICE_KEY="replace-with-a-long-random-value"
npm start
```

Health check:

```powershell
curl http://localhost:8080/health
```

Protected recruiter generation call:

```powershell
curl -Method POST http://localhost:8080/api/recruiter/generate `
  -Headers @{ "X-Jobraker-Service-Key" = $env:AUTOPILOT_SERVICE_KEY } `
  -ContentType "application/json" `
  -Body '{"systemPrompt":"You are a recruiter.","prompt":"Assess this candidate.","temperature":0.2}'
```

## Alibaba Cloud deployment

This folder includes `s.yaml` and a Dockerfile for Alibaba Cloud Function Compute.

Prerequisites:

- Alibaba Cloud Function Compute activated.
- Serverless Devs installed with `npm install -g @serverless-devs/s`.
- A Serverless Devs `default` credential configured with `s config add`.
- `DASHSCOPE_API_KEY` and `AUTOPILOT_SERVICE_KEY` set in the deploying shell.

Deploy:

```powershell
cd backend/alibaba-qwen-autopilot
$env:DASHSCOPE_API_KEY="sk-..."
$env:AUTOPILOT_SERVICE_KEY="replace-with-a-long-random-value"
s deploy -y
```

After deployment:

1. Copy the generated HTTP trigger URL.
2. Open `<trigger-url>/health` and capture the successful response.
3. Set the desktop app's `ALIBABA_AUTOPILOT_URL` and `ALIBABA_AUTOPILOT_SERVICE_KEY` values.
4. Run Jobraker Recruiter and trigger candidate analysis, outreach drafting, or Qwen Autopilot.
5. Capture Function Compute invocation logs showing the request reached Alibaba Cloud.

For the Devpost form, use `server.mjs` as the code proof file showing Alibaba Cloud backend and Qwen Cloud API usage.
