<a href="https://youtu.be/ir1zGiwD0lo?si=ndZpQUMpLCFiBn87" target="_blank" rel="noopener noreferrer">
  <img width="100%" alt="Jobraker Recruiter Dashboard Overview" src="https://github.com/user-attachments/assets/fc463b99-01b3-401c-b4a4-044dad480901" />
</a>

<h1 align="center">Jobraker Recruiter</h1>

<p align="center">
  <strong>AI recruiting for lean startups — source, screen, and outreach without the agency headcount.</strong>
</p>

<p align="center">
  <a href="https://jobraker-recruiters.vercel.app/" target="_blank" rel="noopener">
    <img alt="Website" src="https://img.shields.io/badge/Website-10b981?labelColor=10b981&logo=window&logoColor=white">
  </a>
  <a href="https://discord.gg/wajrgmJQ6b" target="_blank" rel="noopener">
    <img alt="Discord" src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&labelColor=5865F2">
  </a>
  <a href="https://x.com/intent/user?screen_name=jobraker-recruiterhq" target="_blank" rel="noopener">
    <img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/jobraker-recruiterhq?style=social">
  </a>
  <a href="https://trendshift.io/repositories/13609" target="blank">
    <img src="https://trendshift.io/api/badge/repositories/13609" alt="Jobraker Recruiter | Trendshift" height="20"/>
  </a>
</p>

---

## 💡 What is Jobraker Recruiter?

**Jobraker Recruiter** is a local-first desktop copilot for recruiters and hiring managers. It acts as an autonomous agent that searches profile indexes (800M+ records), screens candidates for startup fit, drafts highly personalized outreach sequences, and automates tracking—all while keeping your data private and stored on your own machine.

Unlike typical recruiting platforms that treat every search as a cold start, Jobraker Recruiter builds a **long-term knowledge graph** from your email, calendar, meetings, and notes, helping your hiring context compound over time.

### 🌟 Key Value Propositions
* **Local-First & Private**: Everything lives on your machine as plain, human-readable Markdown files. No proprietary formats or cloud lock-in.
* **Declarative Automation (Live Notes)**: Turn static documents into active dashboards that self-update via email sync, calendar events, or cron timers.
* **Connected Workspace**: Securely link Google services (Gmail, Calendar, Drive) and third-party tools (Slack, Linear, GitHub, CRMs) to fetch fresh context.
* **Flexible AI Engines**: Use Google Gemini (recommended) for top-tier cloud reasoning, or run local models (like Gemma) via Ollama with zero API cost.

---

## 🎥 Video Demo

[![Watch the Demo Video](https://github.com/user-attachments/assets/8b9a859b-d4f1-47ca-9d1d-9d26d982e15d)](https://youtu.be/ir1zGiwD0lo?si=ndZpQUMpLCFiBn87)

*Click the image above to watch the full system walkthrough.*

---

## 🚀 Key Features

### 🔍 1. Sourcing & Screening
Describe your ideal candidate in plain English. The agent searches candidate databases, evaluates candidate profiles, matches strengths against requirements, and identifies growth trajectories.
> `Find candidates for our founding engineer role with early-stage startup experience`

### ✉️ 2. Personalized Outreach Sequences
Generate bespoke outreach sequences grounded in both the role's specifications and the candidate's historical background. Draft follow-ups and monitor response stages.
> `Draft a multi-channel outreach sequence for [Candidate] for our Product Manager opening`

### 🔄 3. Live Notes Engine
By placing a simple `live:` configuration block in a note's YAML frontmatter, you delegate ongoing monitoring to the agent.
* **Cron Schedules**: Update dashboard summaries hourly or daily.
* **Event Triggers**: Re-evaluate pipelines whenever a new Gmail thread matches your criteria or a calendar sync completes.
* **On-Demand**: Trigger manual context updates with a single click.

```yaml
---
live:
  objective: |
    Summarize candidate pipeline responses from the last 24 hours.
    Group them by active open roles.
  active: true
  triggers:
    cronExpr: "0 9 * * 1-5"  # Every weekday at 9 AM
---
# Daily Candidate Pipeline Summary
...
```

### 🕸️ 4. Local Knowledge Graph
Maintains an Obsidian-compatible vault of notes with bidirectional links (`[[Candidate Name]]`, `[[Role Name]]`). This structural framework allows the AI to traverse relationships between people, companies, and roles during retrieval.

---

## 🛠️ System Architecture

Jobraker Recruiter is structured as a multi-package pnpm monorepo. It runs as a desktop application built on Electron, splitting operations across three core layers:

```
jobraker-recruiters/
├── apps/
│   ├── x/                    # Electron Desktop App (React + Vite + Main)
│   ├── jobraker-recruiter/   # Next.js Web Dashboard
│   ├── jobraker-recruiter-x/ # Next.js Frontend
│   ├── cli/                  # Command line interface
│   ├── python-sdk/           # Python SDK
│   └── docs/                 # Documentation site
├── packages/
│   ├── shared/               # Shared domain schemas & typed IPC validators
│   └── core/                 # AI runtimes, local syncs, MCP & filesystem logs
└── architecture_diagram.md   # High-Fidelity Architecture Documentation
```

* For a deep dive into bootstrapping sequences, event-driven loops, storage layers, and IPC communications, review the [Architecture & System Design](architecture_diagram.md) documentation.

---

## 📦 Installation & Setup

### 1. Download & Launch
Download the latest pre-compiled installers for macOS, Windows, or Linux from the [Downloads Page](https://jobraker-recruiters.vercel.app/) or the [Releases Page](https://github.com/jobraker-recruiter/jobraker-recruiter/releases).

### 2. Configure Your LLM Provider
On first startup, choose **Start with my own API key** or configure local models. Configs are stored at `~/.jobraker-recruiter/config/models.json`:
* **Gemini (Recommended)**: Create a Google AI Studio API key and paste it when prompted.
* **Ollama (Local)**: Launch Ollama locally, run a model (e.g. `gemma:2b`), and configure the provider to point to `http://localhost:11434`.

---

## 🔌 API & Tooling Configurations

You can extend Jobraker Recruiter's capabilities by writing simple JSON configurations in the local configuration folder (`~/.jobraker-recruiter/config/`).

All configuration keys use this unified JSON format:
```json
{
  "apiKey": "your-api-key-here"
}
```

| Config Filename | Purpose | Integrated Services |
| :--- | :--- | :--- |
| `deepgram.json` | Voice-to-Text inputs | [Deepgram API](https://deepgram.com/) |
| `elevenlabs.json` | Text-to-Speech voice outputs | [ElevenLabs API](https://elevenlabs.io/) |
| `firecrawl.json` | Web crawling & markdown scraping | [Firecrawl API](https://firecrawl.dev/) (Powers web-search & web-scrape tools) |
| `composio.json` | Integrates developer & workspace apps | [Composio Tooling](https://composio.dev/) (Slack, Linear, GitHub, CRM access) |

### 🔍 Semantic Indexing with Elasticsearch
To configure Elasticsearch as your default semantic retrieval provider for workspaces, candidates, and knowledge bases, create a configuration file at `~/.jobraker-recruiter/config/elastic.json`:

```json
{
  "enabled": true,
  "kibanaUrl": "https://your-deployment.kb.your-region.elastic-cloud.com",
  "apiKey": "your-elastic-api-key",
  "space": "default",
  "indices": [
    "jobraker-workspaces",
    "jobraker-knowledge",
    "jobraker-candidates"
  ]
}
```
*Alternatively, you can supply these configuration credentials via environment variables. See [ELASTIC.md](apps/x/ELASTIC.md) for more details.*

---

## 📧 Google Workspace Integration

To connect Gmail, Google Calendar, and Google Drive for contextual data gathering:

1. **Google Cloud Console**: Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. **APIs**: Enable `Gmail API`, `Google Calendar API`, and `Google Drive API`.
3. **OAuth Screen**: Set your OAuth consent screen to **External** and add your Gmail account to **Test Users**.
4. **Client Credentials**: Create an **OAuth Client ID** (select **Web Application**).
5. **Redirect URI**: Add this exact redirect URI:
   `http://localhost:8080/oauth/callback`
6. **Apply Secrets**: Copy the generated **Client ID** and **Client Secret** and enter them in the Jobraker Recruiter settings panel.
   *(For detailed troubleshooting, view the [Google Setup Guide](google-setup.md).)*

---

## 💻 Local Development

Follow these steps to build and run the Electron desktop application locally on your machine.

### Prerequisites
* **Node.js** (v18+)
* **pnpm** (Required for monorepo workspace resolution)

### Build & Run Instructions
```bash
# Clone the repository
git clone https://github.com/jobraker-recruiter/jobraker-recruiter.git
cd jobraker-recruiter

# Navigate to the Electron application root
cd apps/x

# Install package dependencies
pnpm install

# Compile monorepo packages sequentially (shared -> core -> preload)
npm run deps

# Launch the Vite dev server and boot Electron in development mode
npm run dev
```

> [!NOTE]
> Vite runs on `http://localhost:5173`. Main and Preload files do not hot-reload automatically. If you edit files under `apps/main/src` or `apps/preload/src`, restart the dev task by running `npm run dev`.

### Compilation Verification
Validate typescript compilation and eslint rules before committing code:
```bash
cd apps/x
npm run deps && npm run lint
cd apps/renderer
npx tsc --noEmit
```

### Packaging & Distribution (Windows Production)
To compile a production build and create a installer exe:
```bash
cd apps/x/apps/main
npm run package   # Compiles esbuild bundle into local binary
npm run make      # Creates Squirrel Windows installer (.exe)
```
*Installer assets will be located under `apps/x/apps/main/out/make/squirrel.windows/x64/`.*

---

## 📄 License & Contributing

Jobraker Recruiter is licensed under the [Apache 2.0 License](LICENSE). 

We welcome contributions! Please open issues or submit pull requests following our coding standards (detailed in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md)). Feel free to join our [Discord Community](https://discord.gg/wajrgmJQ6b) to discuss features and roadmap items.
