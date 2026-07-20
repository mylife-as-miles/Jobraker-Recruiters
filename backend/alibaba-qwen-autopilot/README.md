# Jobraker Alibaba Qwen Autopilot Backend

This service is the hackathon proof backend for Track 4: Autopilot Agent.

It is designed to run on Alibaba Cloud and calls Qwen Cloud through the OpenAI-compatible DashScope endpoint:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

## Endpoints

- `GET /health` returns deployment/provider proof metadata.
- `POST /api/autopilot/recruiter` calls Qwen Cloud and returns a recruiter autopilot recommendation.

## Required environment variables

```powershell
DASHSCOPE_API_KEY=<Qwen Cloud API key>
```

Optional:

```powershell
DASHSCOPE_MODEL=qwen3.7-plus
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
PORT=8080
```

## Local run

```powershell
cd backend/alibaba-qwen-autopilot
$env:DASHSCOPE_API_KEY="sk-..."
npm start
```

## Alibaba Cloud deployment

Deploy this folder as a Node.js container/service on Alibaba Cloud, for example:

- Alibaba Cloud Function Compute custom container
- Alibaba Cloud Container Service for Kubernetes
- Alibaba Cloud Elastic Compute Service running this Docker image

Set `DASHSCOPE_API_KEY` as a cloud secret/environment variable, not in source control.

### Serverless Devs deployment

This folder includes `s.yaml` for Alibaba Cloud Function Compute.

Prerequisites:

- Alibaba Cloud Function Compute activated.
- Serverless Devs installed with `npm install -g @serverless-devs/s`.
- A Serverless Devs `default` credential configured with `s config add`.
- `DASHSCOPE_API_KEY` set in the deploying shell.

Deploy:

```powershell
cd backend/alibaba-qwen-autopilot
s deploy
```

After deployment, use the generated HTTP trigger URL plus `/health` as runtime proof.

For the hackathon form, link to `server.mjs` as the code proof file showing Alibaba Cloud service/API usage.
