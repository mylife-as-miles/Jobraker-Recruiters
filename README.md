# Jobraker Recruiter

**Local-first AI recruiting copilot for lean hiring teams**

Jobraker Recruiter is a desktop application that helps founders, recruiters, and hiring managers move from open role to qualified pipeline without enterprise headcount or opaque ATS lock-in. Describe candidates in plain language, enrich profiles, manage pipeline state, draft outreach, and compound hiring context over time — with your data stored on your machine as inspectable Markdown.

| | |
|---|---|
| **Website** | [jobraker-recruiter.com](https://www.jobraker-recruiter.com/) |
| **Downloads** | [Mac · Windows · Linux](https://www.jobraker-recruiter.com/downloads) |
| **Demo** | [YouTube walkthrough](https://www.youtube.com/watch?v=7xTpciZCfpw) |
| **Community** | [Discord](https://discord.gg/wajrgmJQ6b) |

---

## Table of contents

- [Overview](#overview)
- [Capabilities](#capabilities)
- [Recruiter workspace](#recruiter-workspace)
- [Knowledge and automation](#knowledge-and-automation)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Integrations](#integrations)
- [Local-first design](#local-first-design)
- [Development](#development)
- [Repository structure](#repository-structure)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Most recruiting stacks treat every search as a cold start: context lives in tabs, inboxes, and spreadsheets that never connect. Jobraker Recruiter inverts that model. It combines an agentic AI copilot with a persistent, Obsidian-compatible knowledge vault and a full recruiter operating surface — roles, candidates, pipeline, sourcing, and analytics — in one Electron desktop app.

The assistant does not only answer questions. It navigates the application, reads and writes local files, calls structured tools, connects to Gmail and Calendar, runs background agents on schedules, and leaves behind editable artifacts you can audit: candidate records, role briefs, outreach drafts, and meeting notes.

**Jobraker** (in `Jobraker/`) is the job-seeker product. **Jobraker Recruiter** — the focus of this repository — is the recruiter-side companion within the same monorepo.

### Example workflows

| You ask | Jobraker Recruiter does |
|---------|-------------------------|
| *Find senior product designers in Lagos with 5+ years SaaS experience* | Plans a sourcing workflow, enriches profiles, and adds candidates to your pipeline |
| *Draft outreach to [candidate] for our PM opening* | Generates personalized copy grounded in role context and candidate evidence |
| *Screen this profile for startup fit* | Summarizes strengths, gaps, trajectory, and match signals |
| *Set up follow-ups across our active searches* | Creates or updates background tasks with triggers and digests |
| *What changed on the Acme design role this week?* | Pulls from synced email, calendar, notes, and live-updating knowledge |

---

## Capabilities

### Source

Search and shortlist talent using natural language. Import LinkedIn profiles through enrichment providers (People Data Labs, Enrich.so), queue URLs in the sourcing workspace, and assign candidates to open roles with structured fit signals.

### Screen

Evaluate candidates against role requirements with match scores, startup-fit attributes, skills, highlights, and AI-generated insights. Compare profiles in list and detail views backed by live pipeline data — not static mock dashboards.

### Outreach

Draft and refine email and LinkedIn outreach from role and candidate context. Integrate with Gmail for inbox awareness on the home dashboard and email-aware agent workflows.

### Remember

Accumulate hiring context in a local Markdown vault with backlinks. Sync Gmail and Google Calendar into the workdir. Use live notes and background tasks to keep roles, companies, and candidates current without manual copy-paste.

---

## Recruiter workspace

The recruiter module is a first-class product surface inside the desktop shell:

| Screen | Purpose |
|--------|---------|
| **Home** | Command center with live KPIs, top matches, pipeline overview, Gmail inbox, and calendar agenda |
| **Roles** | Open positions, applicant quality, and role-level pipeline counts |
| **Candidates** | Search, filter, evaluate, and engage talent with fit rings and stage management |
| **Pipeline** | Kanban workflow across sourced → contacted → screening → interview → offer → hired |
| **Sourcing** | LinkedIn URL enrichment queue, quick import, and role assignment |
| **Analytics** | Funnel, response rate, time-to-fill, and pipeline health from stored records |

Recruiter state persists locally under `jobraker-recruiter-ui:*` keys and `config/recruiter-db.json`, with cross-view sync so the home dashboard and recruiter screens reflect the same live data.

---

## Knowledge and automation

### Markdown knowledge vault

Notes, meetings, people, and projects live as plain Markdown under `~/.jobraker-recruiter/knowledge/`. The format is Obsidian-compatible: you can inspect, edit, back up, or migrate your data at any time.

### Live notes

A single `live:` frontmatter block turns a note into a self-updating artifact. Triggers include cron schedules, time windows, and event matchers (e.g. new Gmail threads). See [apps/x/LIVE_NOTE.md](apps/x/LIVE_NOTE.md).

### Background tasks

Recurring agents maintain digests, draft replies, monitor pipelines, or perform scheduled side effects. Tasks are defined on disk under `bg-tasks/` with explicit instructions and triggers.

### Agentic copilot

The assistant runs a skill-and-tool loop: load domain guidance, call builtin tools or MCP integrations, observe structured results, and refine. Skills cover app navigation, outreach, meeting prep, browser control, Elasticsearch onboarding, Composio integrations, and more. See [apps/x/packages/core/src/application/assistant/skills/](apps/x/packages/core/src/application/assistant/skills/).

---

## Architecture

Jobraker Recruiter is an Electron application with a strict separation between UI, IPC bridge, and business logic:

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer (React 19 + Vite 7)                               │
│  App shell · Recruiter UI · Chat · Knowledge · Meetings     │
└──────────────────────────┬──────────────────────────────────┘
                           │ contextBridge (preload)
┌──────────────────────────▼──────────────────────────────────┐
│  Main process (Electron + Node.js)                          │
│  IPC router · OAuth · schedulers · background task runner     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  @x/core — AI runtime, MCP, Elastic, filesystem, sync         │
│  @x/shared — Zod schemas, IPC contracts, domain types         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Local storage (~/.jobraker-recruiter)                        │
│  knowledge/ · config/ · calendar_sync/ · gmail_sync/ · runs/ │
└───────────────────────────────────────────────────────────────┘
```

**Build order:** `shared` → `core` → `preload` → `renderer` / `main`

For C4 diagrams, sequence flows, and component-level detail, see [architecture_diagram.md](architecture_diagram.md). For agent and navigation conventions, see [CLAUDE.md](CLAUDE.md).

---

## Installation

### Desktop application

Download the latest installer for your platform:

- **Releases:** [jobraker-recruiter.com/downloads](https://www.jobraker-recruiter.com/downloads)
- **GitHub releases:** [github.com/jobraker-recruiter/jobraker-recruiter/releases/latest](https://github.com/jobraker-recruiter/jobraker-recruiter/releases/latest)

### First launch

On first run, choose **Start with my own API key** and configure an LLM provider:

| Provider | Notes |
|----------|-------|
| **Gemini** | Recommended for cloud inference; uses your Google AI API key |
| **Ollama** | Local models, including the Gemma family — no cloud key required |
| **OpenAI / Anthropic / OpenRouter** | Supported via `config/models.json` |

Model configuration is stored at:

```
~/.jobraker-recruiter/config/models.json
```

Override the workspace directory with the `JOBRAKER_RECRUITER_WORKDIR` environment variable.

---

## Configuration

Optional capabilities are enabled by adding API key files under `~/.jobraker-recruiter/config/`. Each file uses the same shape:

```json
{
  "apiKey": "<your-key>"
}
```

| File | Capability |
|------|------------|
| `models.json` | LLM provider and model selection |
| `elastic.json` | Elasticsearch semantic retrieval ([setup guide](apps/x/ELASTIC.md)) |
| `firecrawl.json` | Web search and page scraping (`web-search`, `web-scrape` tools) |
| `deepgram.json` | Voice input (speech-to-text) |
| `elevenlabs.json` | Voice output (text-to-speech) |
| `composio.json` | Third-party tool integrations via Composio |

### Google Workspace

Gmail, Calendar, and Drive require OAuth credentials. Follow [google-setup.md](google-setup.md) to create a Google Cloud project and connect services.

### Enrichment providers

Configure People Data Labs and Enrich.so API keys in **Settings → Connector API Keys** (renderer) for LinkedIn profile enrichment in the sourcing workspace.

---

## Integrations

| Integration | Use |
|-------------|-----|
| **Gmail** | Inbox sync, outreach context, live-note triggers |
| **Google Calendar** | Meeting agenda, interview scheduling, meeting prep |
| **Composio** | Slack, Linear, GitHub, Notion, Jira, CRMs, and more |
| **MCP** | Model Context Protocol servers for search, databases, and custom APIs |
| **Elasticsearch** | Hybrid semantic retrieval for knowledge, workspaces, and candidate evidence |
| **Firecrawl** | Web discovery and structured page extraction |
| **People Data Labs / Enrich.so** | LinkedIn profile enrichment |

---

## Local-first design

Jobraker Recruiter is built for teams that need leverage without surrendering data ownership:

- **Plain Markdown vault** — no proprietary note format; compatible with Obsidian workflows
- **Inspectable state** — recruiter pipeline, configs, and run history live on disk
- **Provider choice** — cloud LLMs (Gemini, OpenAI, Anthropic) or local inference (Ollama / Gemma)
- **No hosted lock-in** — back up, export, or delete your workdir at any time
- **Transparent agents** — tool calls and file writes are structured and auditable, not hidden inside a black-box database

Default workdir layout:

| Path | Purpose |
|------|---------|
| `config/` | Models, Elastic, API keys, recruiter DB |
| `knowledge/` | Notes, meetings, people, projects |
| `calendar_sync/` | Synced Google Calendar JSON |
| `gmail_sync/` | Synced email threads |
| `bg-tasks/` | Background agent definitions |
| `runs/` | Chat and agent run history |

---

## Development

### Prerequisites

- Node.js 20+
- pnpm (required for `workspace:*` protocol in `apps/x`)

### Electron desktop app (`apps/x`)

```bash
cd apps/x
pnpm install
npm run deps    # Build shared → core → preload
npm run dev     # Vite renderer (localhost:5173) + Electron main
```

**Hot reload:** The React renderer hot-reloads. Main process and preload do not — restart `npm run dev` after editing `apps/main/src/` or `apps/preload/src/`.

**Verify compilation:**

```bash
cd apps/x && npm run deps && npm run lint
cd apps/x/apps/renderer && npx tsc --noEmit
```

### Production build (Windows)

```bash
cd apps/x/apps/main
npm run package   # Packaged application
npm run make      # Squirrel installer (.exe)
```

Installer output: `apps/x/apps/main/out/make/squirrel.windows/x64/`

### Web preview (renderer only)

The renderer can be built for static hosting (e.g. Vercel). Workspace packages must compile first:

```bash
cd apps/x
pnpm run shared
pnpm --filter @x/renderer run build
```

See `apps/x/apps/renderer/vercel.json` for deployment settings.

---

## Repository structure

```
Jobraker-Recruiters/
├── apps/
│   ├── x/                      # Electron desktop app (primary)
│   │   ├── apps/main/          # Main process, packaging, IPC
│   │   ├── apps/renderer/      # React UI (Vite)
│   │   ├── apps/preload/       # contextBridge IPC bridge
│   │   └── packages/
│   │       ├── shared/         # @x/shared — schemas, IPC types
│   │       └── core/           # @x/core — AI, MCP, knowledge, sync
│   ├── jobraker-recruiter/     # Next.js web dashboard
│   ├── jobraker-recruiter-x/   # Next.js frontend
│   ├── cli/                    # CLI tool
│   ├── python-sdk/             # Python SDK
│   └── docs/                   # Documentation site
├── Jobraker/                   # Job-seeker application (Vite + Supabase)
├── architecture_diagram.md     # System design and sequence diagrams
├── CLAUDE.md                   # Developer and agent reference
├── AGENTS.md                   # Cross-agent instructions
├── google-setup.md             # Google OAuth setup guide
└── LICENSE                     # Apache License 2.0
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [architecture_diagram.md](architecture_diagram.md) | C4 diagrams, build pipeline, data flows |
| [CLAUDE.md](CLAUDE.md) | Architecture, commands, feature entry points |
| [apps/x/LIVE_NOTE.md](apps/x/LIVE_NOTE.md) | Live note schema, triggers, and UI |
| [apps/x/ELASTIC.md](apps/x/ELASTIC.md) | Elasticsearch connector setup |
| [apps/x/ANALYTICS.md](apps/x/ANALYTICS.md) | PostHog events and taxonomy |
| [apps/x/apps/renderer/DESIGN_LANGUAGE.md](apps/x/apps/renderer/DESIGN_LANGUAGE.md) | Visual design tokens and patterns |
| [google-setup.md](google-setup.md) | Gmail, Calendar, and Drive OAuth |

---

## License

Jobraker Recruiter is released under the [Apache License 2.0](LICENSE).

---

<p align="center">
  <a href="https://www.jobraker-recruiter.com/">Website</a> ·
  <a href="https://discord.gg/wajrgmJQ6b">Discord</a> ·
  <a href="https://x.com/intent/user?screen_name=jobraker-recruiterhq">Twitter</a>
</p>
