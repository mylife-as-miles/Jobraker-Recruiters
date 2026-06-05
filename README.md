<a href="https://www.youtube.com/watch?v=5AWoGo-L16I" target="_blank" rel="noopener noreferrer">
  <img width="1339" height="607" alt="jobraker-recruiter-github-2" src="https://github.com/user-attachments/assets/fc463b99-01b3-401c-b4a4-044dad480901" />
</a>

<h5 align="center">

<p align="center" style="display: flex; justify-content: center; gap: 20px; align-items: center;">
  <a href="https://trendshift.io/repositories/13609" target="blank">
    <img src="https://trendshift.io/api/badge/repositories/13609" alt="jobraker-recruiter/jobraker-recruiter | Trendshift" width="250" height="55"/>
  </a>
</p>

<p align="center">
  <a href="https://www.jobraker-recruiter.com/" target="_blank" rel="noopener">
    <img alt="Website" src="https://img.shields.io/badge/Website-10b981?labelColor=10b981&logo=window&logoColor=white">
  </a>
  <a href="https://discord.gg/wajrgmJQ6b" target="_blank" rel="noopener">
    <img alt="Discord" src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&labelColor=5865F2">
  </a>
  <a href="https://x.com/intent/user?screen_name=jobraker-recruiterhq" target="_blank" rel="noopener">
    <img alt="Twitter" src="https://img.shields.io/twitter/follow/jobraker-recruiterhq?style=social">
  </a>
</p>

# Jobraker Recruiter
**AI recruiting for lean teams — source, screen, and outreach without the headcount**

</h5>

Jobraker Recruiter is a local-first desktop copilot for recruiters and hiring managers at lean startups. Describe your ideal candidate in plain English, search across 800M+ profiles, screen for startup fit, and draft personalized outreach — all from one chat, with your data staying on your machine.

**Jobraker** (in `Jobraker/`) is the job-seeker product. **Jobraker Recruiter** is the recruiter-side companion in this monorepo.

You can do things like:
- `Find candidates for our founding engineer role` → search and shortlist profiles with seed-stage experience
- `Draft outreach to [candidate] for our PM opening` → personalized messages grounded in role context
- `Screen this profile for startup fit` → summarize strengths, gaps, and growth trajectory
- `Set up follow-ups across our pipeline` → multi-step outreach across your active searches
- Build a long-lived knowledge graph from email, meetings, and notes to keep hiring context compounding

**Download for Mac / Windows / Linux:** [jobraker-recruiter.com/downloads](https://www.jobraker-recruiter.com/downloads)

⭐ If you find Jobraker Recruiter useful, please star the repo.

## Demo

[![Demo](https://github.com/user-attachments/assets/8b9a859b-d4f1-47ca-9d1d-9d26d982e15d)](https://www.youtube.com/watch?v=7xTpciZCfpw)

[Watch the full video](https://www.youtube.com/watch?v=7xTpciZCfpw)

---

## Installation

**Latest installers:** [Download](https://www.jobraker-recruiter.com/downloads)

**All release files:** https://github.com/jobraker-recruiter/jobraker-recruiter/releases/latest

### First launch

On first run, choose **Start with my own API key** and configure an LLM provider:

| Provider | Notes |
|----------|--------|
| **Gemini** | Recommended; uses your Google AI API key |
| **Ollama** | Local models (Gemma 4 family) — no cloud key required |

Model config is stored at `~/.jobraker-recruiter/config/models.json`.

### Google setup

To connect Google services (Gmail, Calendar, and Drive), follow [Google setup](google-setup.md).

### Voice input (optional)

Add a Deepgram API key in `~/.jobraker-recruiter/config/deepgram.json`

### Voice output (optional)

Add an ElevenLabs API key in `~/.jobraker-recruiter/config/elevenlabs.json`

### Web search (optional)

Add an Exa API key in `~/.jobraker-recruiter/config/exa-search.json`

### External tools (optional)

Connect MCP servers or Composio tools via `~/.jobraker-recruiter/config/composio.json`

All API key files use the same format:

```json
{
  "apiKey": "<key>"
}
```

---

## What it does

Jobraker Recruiter helps lean teams move from open role to qualified pipeline faster:

- **Source** — describe the role and search large profile indexes with natural language
- **Screen** — evaluate fit, summarize backgrounds, and compare candidates
- **Outreach** — draft and refine personalized messages and follow-up sequences
- **Remember** — accumulate hiring context in a local Markdown knowledge vault

Under the hood, the app maintains an **Obsidian-compatible vault** of plain Markdown notes with backlinks — transparent working memory you can inspect and edit.

## Integrations

Jobraker Recruiter builds context from the work you already do:

- **Gmail** (email)
- **Google Calendar**
- **Jobraker Recruiter meeting notes** or **Fireflies**
- **Composio** — Slack, Linear, GitHub, CRMs, and more

## How it's different

Most recruiting tools treat every search as a cold start.

Jobraker Recruiter keeps **long-lived knowledge** instead:

- hiring context accumulates over time
- relationships between people, roles, and companies stay explicit
- notes are editable by you, not hidden inside a model
- everything lives on your machine as plain Markdown

## Live notes

Live notes stay updated automatically. Create one by typing `@jobraker-recruiter` in a note.

- Track a role, company, or candidate across web and communications
- Monitor pipeline stages and open questions
- Keep running summaries of active searches

Everything is written back into your local Markdown vault.

## Extend with tools (MCP)

Connect external tools via **Model Context Protocol (MCP)** — search, databases, CRMs, support tools, automations, or your own internal APIs.

Examples: Exa (web search), Slack, Linear/Jira, GitHub, ElevenLabs (voice), and more.

## Local-first by design

- Data stored locally as plain Markdown
- No proprietary formats or hosted lock-in
- Inspect, edit, back up, or delete everything at any time

---

## Development

This monorepo includes the Electron desktop app, Next.js web apps, CLI, Python SDK, and the Jobraker job-seeker app.

### Electron desktop app (`apps/x`)

```bash
cd apps/x
pnpm install
npm run deps    # build shared → core → preload
npm run dev     # Vite renderer + Electron main
```

**Production build (Windows):**

```bash
cd apps/x/apps/main
npm run package   # packaged app
npm run make      # Squirrel installer (.exe)
```

Installer output: `apps/x/apps/main/out/make/squirrel.windows/x64/`

See [CLAUDE.md](CLAUDE.md) for architecture, build order, and feature docs (`LIVE_NOTE.md`, `ANALYTICS.md`).

### Monorepo layout

```
jobraker-recruiters/
├── apps/x/                  # Electron desktop (Jobraker Recruiter)
├── apps/jobraker-recruiter/ # Next.js web dashboard
├── apps/jobraker-recruiter-x/
├── apps/cli/
├── apps/python-sdk/
├── Jobraker/                # Job-seeker Vite + Supabase app
└── CLAUDE.md                # Agent / developer reference
```

---

<div align="center">

[Discord](https://discord.gg/wajrgmJQ6b) · [Twitter](https://x.com/intent/user?screen_name=jobraker-recruiterhq)

</div>
