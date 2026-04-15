# Project Discovery Report: Burak's Code Repositories
**Generated:** 2026-04-05
**Scope:** `/Users/buraksmac/Desktop/code/` and `/Users/buraksmac/Desktop/code2/`

---

## Summary Overview

**Total Projects Found:** 45+
**Categories:**
- Voice AI / Voice Agents: 8 projects
- SaaS / Agent Orchestration: 6 projects
- Cold Outreach / Sales: 2 projects
- Content / Content Engines: 3 projects
- Solar / Clean Energy: 1 project
- Infrastructure / Demo: 8 projects
- Research & Knowledge: 3 projects
- Hackathons / Templates: 2 projects

---

## VOICE AI & VOICE AGENTS

### 1. coldyAI (ACTIVE - PRIMARY VOICE AI PROJECT)
**Location:** `/Users/buraksmac/Desktop/code/coldyAI`
**Git Remote:** https://github.com/buri1/coldyAI
**Last Activity:** 2025-11-24 (fix: final UI adjustments for cockpit layout)
**Tech Stack:** 
- Frontend: Next.js, TypeScript
- Backend: Node.js with Livekit server SDK
- Package Manager: pnpm@9.0.0
- Key Dependency: livekit-server-sdk@2.14.0

**Description:**
ColdyAI is a monorepo voice AI platform built with pnpm workspaces. The project includes:
- Multi-app structure (web, agents, backend)
- Livekit integration for real-time voice
- Cold outreach / sales automation capabilities
- Dashboard/cockpit UI for agent management
- BMAD framework integration for agent orchestration

**Key Files:**
- `/coldyAI/package.json` - Main monorepo config
- Multiple epic branches for feature development (see Epic Projects below)

**Status:** Mature, actively maintained. Multiple epic branches indicating ongoing development.

---

### 2. ultravox-incoming-calls
**Location:** `/Users/buraksmac/Desktop/code/ultravox-incoming-calls`
**Tech Stack:**
- Runtime: Node.js (ES modules)
- Framework: Express.js@5.1.0
- Telephony: Twilio@5.5.2

**Description:**
Voice agent system for handling incoming calls via Twilio integration. Appears to be a prototype for integrating real-time voice AI with telephone infrastructure.

**Status:** Early prototype, likely abandoned or superseded by coldyAI.

---

### 3. gptrealtime
**Location:** `/Users/buraksmac/Desktop/code/gptrealtime`
**Status:** No git, minimal documentation
**Description:** Likely experimental project for real-time GPT integration with voice.

---

### 4. ultravox-demo
**Location:** `/Users/buraksmac/Desktop/code/ultravox-demo`
**Status:** No git, appears to be demo/exploration project
**Description:** Demo implementation, likely for testing Ultravox API.

---

### 5. Livekit-Related Projects (4 projects)
**Locations:**
- `/Users/buraksmac/Desktop/code/Livekit/`
- `/Users/buraksmac/Desktop/code/Livekit_Frontend/`
- `/Users/buraksmac/Desktop/code/LivekitDemo/`
- `/Users/buraksmac/Desktop/code/LivekitDockerDemo/`

**Livekit_Frontend README Summary:**
Next.js-based frontend for Livekit Agents voice assistant template. Used as starting template for web voice interface.

**Tech:** Next.js, Livekit JavaScript SDK
**Status:** Demo/template projects, not actively maintained

---

### 6. voiceagent
**Location:** `/Users/buraksmac/Desktop/code/voiceagent`
**Type:** Python project (has .venv directory)
**Last Activity:** 2025-03-16 (syncing devices)
**Structure:** Contains sandbox/ directory
**Description:** Voice agent project with Python backend. Likely experimental or historical.
**Status:** Old, minimal recent activity

---

---

## SAAS / AGENT ORCHESTRATION

### 1. orchestrator (PRIMARY ORCHESTRATION PLATFORM)
**Location:** `/Users/buraksmac/Desktop/code2/orchestrator`
**Git Remote:** Internal repo
**Last Activity:** 2026-03-30 (docs: BuriClaw agent briefing — CEO agent persona + project portfolio)
**Tech Stack:** Custom orchestration system for Claude Code agents

**Description:**
L-Thread Orchestrator Template v2.0 - Autonomous Multi-Agent Orchestration System for Claude Code. This is the master orchestration platform that manages:

**Architecture:**
```
Tier 0: Absolute Rules, Mode Detection
Tier 1: Session State (injected)
Tier 2: FutureLearnings (on-demand)
```

**Three Execution Modes:**
1. **Conduit CLI Mode** - Sequential agent execution (1 agent at a time)
2. **Claude Code Teams Mode** - Parallel execution (2-3 agents + reviewer)
3. **Tmux Mode** - Crash-protected sessions with tmux layer

**Key Features:**
- Autonomous loop that picks tasks, spawns agents, reviews code, merges PRs
- Auto-mode for fully unattended operation
- E2E gate (Chrome DevTools MCP testing required)
- Roadblock recovery system with documented incident patterns (INC-001 through INC-014)
- Context preservation across compaction via hooks
- SessionStart and PreCompact hooks for state management

**Installation:**
- Global installation via `setup.sh` to `~/.claude/`
- Per-project setup with `.bmad/scripts/` and `_bmad/` directories
- Requires Claude Code CLI, GitHub CLI, jq, tmux, Conduit or Teams

**State Files:**
- `.bmad/AUTO_MODE` - Enable autonomous operation
- `.bmad/devlog.md` - Session logs
- `_bmad/orchestrator-state.json` - Conduit mode state
- `_bmad/orchestrator-teams-state.json` - Teams mode state
- `_bmad/orchestrator-tmux-state.json` - Tmux session tracking

**Roadblock Recovery Pattern:**
Known incidents documented in `memory/FutureLearnings.md`:
- INC-001: Database connections hanging
- INC-002: Validation schema mismatch
- INC-013: Chrome DevTools instability
- INC-014: E2E testing skipped

**Status:** Active, production-ready template system

---

### 2. adwo-2 (AGENTIC DEVELOPMENT WORKFLOW ORCHESTRATOR)
**Location:** `/Users/buraksmac/Desktop/code2/adwo-2`
**Git Remote:** https://github.com/buri1/adwo-2
**Last Activity:** 2026-02-01 (feat: Add stream-json WebSocket integration and event persistence)
**Tech Stack:**
- Monorepo: pnpm@9.15.4 + Turbo
- Frontend: Next.js Dashboard
- Backend: Orchestrator (git submodule)
- Language: TypeScript
- Dev tools: ESLint, Prettier, Vitest

**Description:**
ADWO 2.0 = Real-time dashboard for monitoring and interacting with AI-powered development workflows. Combines:
- CLI Orchestrator (Backend) + Dashboard (UI)
- Event Bridge connection layer
- Stream-JSON WebSocket for real-time updates
- Event persistence system

**Architecture:**
```
CLI Orchestrator (Backend) + Dashboard (UI)
           ↑
   Event Bridge (connection layer)
```

**Structure:**
```
adwo-2/
├── orchestrator/           # Git Submodule (orchestrator-template)
├── apps/dashboard/         # Next.js Dashboard + Event Bridge
├── packages/shared/        # TypeScript Types
├── adwo.config.yaml       # Project configuration
└── pnpm-workspace.yaml    # Workspace definition
```

**Key Integration:**
Uses orchestrator-template as git submodule for backend logic.

**Status:** Active, production-ready

---

### 3. agenthub (AGENT COLLABORATION PLATFORM)
**Location:** `/Users/buraksmac/Desktop/code2/agenthub`
**Language:** Go
**Last Activity:** 2026-03-09 (historical context)
**Tech Stack:** Go, SQLite, Git, REST API

**Description:**
Agent-first collaboration platform - a bare git repo + message board designed for swarms of AI agents working on the same codebase.

**Key Concept:** No main branch, no PRs, no merges — just a sprawling DAG of commits with a message board for agent coordination.

**Architecture:**
- One Go binary (`agenthub-server`)
- One SQLite database
- One bare git repo on disk
- Thin CLI wrapper (`ah`)

**Core Components:**
1. **Git Layer** - Agents push via git bundles, server validates and unbundles
2. **Message Board** - Channels, posts, threaded replies for agent coordination
3. **Auth + Defense** - API key per agent, rate limiting, bundle size limits

**API Endpoints:**
- Git: `/api/git/push`, `/api/git/fetch/{hash}`, `/api/git/commits`, `/api/git/diff/`
- Message Board: `/api/channels`, `/api/channels/{name}/posts`
- Admin: `/api/admin/agents`, `/api/health`

**CLI Usage:**
```bash
ah push                    # push HEAD commit to hub
ah fetch <hash>            # fetch a commit from hub
ah log [--agent X]         # recent commits
ah children <hash>         # what's been tried on top of this?
ah leaves                  # frontier commits (no children)
ah post <channel>          # post to a channel
```

**Use Cases:**
- Primary: Autonomous agent-first academia (autoresearch project)
- Generic: Organize communities of agents collaborating on any project

**Deployment:** Single static Go binary, only runtime dependency is `git`

**Status:** Mature, single-binary deployment ready

---

### 4. agent-infra (AGENT INFRASTRUCTURE / HOME PC SETUP)
**Location:** `/Users/buraksmac/Desktop/code/agent-infra`
**Tech Stack:** Tailscale, SSH, tmux, Claude CLI, WSL2

**Description:**
Infrastructure setup for running Claude Code agents on a dedicated Windows PC worker machine accessed from Mac.

**Architecture:**
```
Mac (Entry Point) → Tailscale → Windows PC (Worker) → tmux → Claude CLI Agents
```

**Current Status (as of 2026-02-22):**
| Phase | Status | Details |
|-------|--------|---------|
| 1 – Netzwerk/SSH/Tailscale | 🟡 90% | SSH funktioniert in PowerShell, WSL-Routing noch zu verifizieren |
| 2 – tmux-Layer | ⬜ 0% | |
| 3 – Claude CLI auf PC | ⬜ 0% | |
| 4 – Orchestrator MVP | ⬜ 0% | |
| 5 – Claude Code SSH-Environment | ⬜ 0% | |
| 6 – Cloud/Daytona Pilot | ⬜ 0% | |

**Hardware Specs:**
- Mac: M4, 32GB RAM
- Windows PC: 48GB RAM, RTX 3070, WSL2 Ubuntu 24.04
- Network: Tailscale VPN connection

**Quick Commands:**
```bash
ssh homepc                                    # SSH into Windows PC
ssh homepc -t "tmux attach -t orchestrator"   # Attach tmux session
/Applications/Tailscale.app/Contents/MacOS/Tailscale status
```

**Status:** In progress, infrastructure foundation being built

---

### 5. Finance-agent
**Location:** `/Users/buraksmac/Desktop/code2/Finance-agent`
**Last Activity:** 2026-02-14 (Add Schreibstil-Referenz + update /draft Skill mit Stil-Integration)
**Purpose:** Schuldenmanagement & persönlicher VA (Debt Management & Personal VA)

**Description:**
Claude-powered personal finance agent for managing debt and acting as personal virtual assistant. Includes Schreibstil (writing style) integration.

**Features:**
- Abos/Subscriptions tracking
- Private debt database
- Gläubiger (creditor) archive structure
- Draft skill with style integration

**Status:** Active development

---

---

## COLD OUTREACH / SALES

### 1. coldyAI (See Voice AI section above)
Primary platform for cold outreach automation with voice agents.

---

### 2. (Integrated into coldyAI)
The epic projects below are feature branches/releases of coldyAI focused on different aspects of the cold outreach/sales workflow.

---

---

## CONTENT / CONTENT ENGINES

### 1. ContentOS
**Location:** `/Users/buraksmac/Desktop/code2/ContentOS`
**Last Activity:** 2026-02-14 (Initial commit: ContentOS project with strategy docs and resources)
**Type:** Documentation/Strategy Project

**Description:**
Content Operating System - Strategic content brand framework project. Contains:
- Complete content brand strategy documentation
- AI infrastructure masterclass documentation
- Hormozi playbooks collection
- Content masterclass segments

**Files:**
- `COMPLETE-CONTENT-BRAND-STRATEGY.md`
- `AI-Infrastructure-Masterclass-Documentation.md`
- `Hormozi Playbooks/` directory
- `masterclass_segments.txt`

**Size:** ~430 MB (includes 5-hour video masterclass)

**Status:** Reference/research project

---

### 2. LEVENZ SOLAR (RA SOLAR / CLEAN ENERGY CONTENT)
**Location:** `/Users/buraksmac/Desktop/code/LEVENZ SOLAR`
**Last Activity:** 2026-01-13 (feat: Implement OpenAI integration, power extraction, and cost tracking)
**Language:** Python 3.8+
**Tech Stack:** OpenAI GPT API, Pandas, Pydantic

**Description:**
"Automatisierte Klassifizierung von Handwerker-Rechnungen zur Nachhaltigkeitsanalyse" - Automated classification of tradesperson invoices for sustainability analysis.

**Purpose:**
Classify solar panel products in craft business databases, distinguishing:
- ✅ PV modules/systems (Trina, Jinko, Meyer Burger modules, balcony systems)
- ❌ Accessories (inverters, batteries, infrastructure, services)

**Key Features:**
- AI-powered product classification using OpenAI GPT-5-mini
- Automatic power extraction (Wp/kWp) for CO2 calculations
- Cost tracking with API cost estimation
- Parallel processing for large datasets (70k+ lines)
- Confidence scoring and reasoning for each classification
- Evaluation metrics: Precision, Recall, F1-Score

**Cost Projection:**
- 1,000 lines: ~€0.16
- 70,000 lines: ~€11.39

**Evaluation Results:**
- Accuracy: 100%
- Precision: 100%
- Recall: 100%
- F1-Score: 100%

**CLI Usage:**
```bash
python main.py                                    # Standard
python main.py --limit 10                        # Quick test
python main.py --batch-size 20 --parallel 5     # Optimized
python main.py --input data/file.csv            # Custom input
python evaluate.py                              # Quality check
```

**Project Structure:**
```
src/
├── llm_client.py      # OpenAI API + cost tracking
├── models.py          # Pydantic data models
└── processor.py       # CSV processing
docs/
└── bachelorarbeit_exkurs.md  # Bachelor thesis documentation
data/
├── output.csv         # Classification results
└── evaluation_errors.csv  # Error analysis
```

**Status:** Production-ready, high-accuracy classification system

---

### 3. Archon (Status unclear)
**Location:** `/Users/buraksmac/Desktop/code/Archon`
**Status:** No documentation found, appears to be exploration/archived

---

---

## EPIC PROJECTS (ColdyAI Feature Branches)

ColdyAI uses a distributed development model with multiple epic branches working in parallel. Each epic branch is a full clone with independent git history while collaborating with the main coldyAI repo.

All epic projects use the same monorepo structure (coldyAI package.json) and appear to be branches of the ColdyAI platform implementing specific features.

### Epic Project Structure:
```
epic-N-[name]/
├── package.json (coldyAI monorepo config)
├── apps/
├── packages/
└── .git (connected to ColdyAI-1 repo)
```

### Epic Breakdown:

| Epic | Name | Remote | Last Activity | Status |
|------|------|--------|---------------|--------|
| 1 | **foundation** | github.com/buri1/ColdyAI-1 | 2025-11-19 | Foundational infrastructure |
| 2 | **auth-dashboard** | github.com/buri1/ColdyAI-1 | (in main) | Authentication system |
| 3 | **observation** | github.com/buri1/ColdyAI-1 | 2025-11-19 | Real-time observation frontend |
| 4 | **lead-management** | github.com/buri1/ColdyAI-1 | (in main) | Lead tracking & CRM |
| 5 | **agent-config** | github.com/buri1/ColdyAI-1 | (in main) | Agent configuration UI |
| 6 | **analytics-reporting** | github.com/buri1/ColdyAI-1 | (in main) | Analytics & reporting dashboard |
| 7 | **sales-coach** | No git | N/A | Placeholder/template |

**Key Insight:** Epics 1-6 are fully tracked in git with independent branches. They represent concurrent development streams feeding back into main ColdyAI project.

**Tech Stack (All Epics):** Same as coldyAI (Next.js, Node.js, Livekit, pnpm)

---

---

## INFRASTRUCTURE & DEMO PROJECTS

### 1. production-app
**Location:** `/Users/buraksmac/Desktop/code/production-app`
**Last Activity:** 2025-11-20 (fix: Remove LiveKit agent files from production-app directory)
**Tech Stack:** Next.js/React

**Description:**
Production cockpit/dashboard application. Appears to be the main UI for controlling ColdyAI voice agents.

**Latest Change:** Removed LiveKit agent files, consolidated to cleaner production UI.

**Status:** Active, used for deploying ColdyAI features

---

### 2. CityHub
**Location:** `/Users/buraksmac/Desktop/code2/CityHub`
**Last Activity:** 2026-02-12 (fix: admin comments endpoint returns wrong format causing ticket detail crash)
**Tech Stack:** Node.js/React (has package.json)

**Description:** SaaS platform for city/municipal services. Active development with bug fixes.

**Status:** Active

---

### 3. ADWO (Legacy)
**Location:** `/Users/buraksmac/Desktop/code/ADWO`
**Status:** Legacy, superseded by adwo-2

---

### 4. Demo/Exploration Projects
- **Livekit/** - Empty or minimal
- **LivekitDemo** - Basic git project
- **LivekitDockerDemo** - Docker setup for demo
- **gptrealtime** - Exploration
- **ultravox-demo** - Exploration

---

---

## RESEARCH & KNOWLEDGE MANAGEMENT

### 1. vault (Obsidian Knowledge Base)
**Location:** `/Users/buraksmac/Desktop/code2/vault`
**Type:** Obsidian vault (personal knowledge management)

**Structure:**
- `00-system/` - Templates, system notes
- `10-journal/` - Daily notes, reflections
- `20-projects/` - Active project notes
- `30-areas/` - Areas of responsibility
- `40-resources/` - Reference material
- `50-archive/` - Completed items
- `60-agent-output/` - AI-generated content
- `_drafts/` - Work in progress
- `_inbox/` - Quick capture
- `_meta/` - Vault metadata
- `memory/` - Agent memory files

**Tools:** Obsidian with kepano/obsidian-skills for Claude Code integration

**Status:** Active knowledge base

---

### 2. everything-claude-code
**Location:** `/Users/buraksmac/Desktop/code2/everything-claude-code`
**Type:** Educational/Reference

---

### 3. opendev-main
**Location:** `/Users/buraksmac/Desktop/code2/opendev-main`
**Status:** Reference/documentation

---

---

## HACKATHON & TEMPLATE PROJECTS

### 1. hackathon
**Location:** `/Users/buraksmac/Desktop/code2/hackathon`
**Type:** Dynamous x Kiro Hackathon Template (Jan 5 – Feb 5, 2026)
**Tech Stack:** Kiro CLI + BMAD Framework

**Description:**
Hackathon project template with:
- BMAD planning agents (50+)
- Kiro CLI integration
- Multi-agent development workflow
- Project context and steering

**Available Prompts:**
- `@prime` - Load project context
- `@bmad-planning` - Create product brief
- `@bmad-prd` - Create PRD
- `@bmad-architecture` - Define architecture
- `@bmad-stories` - Create epics and stories
- `@bmad-dev` - Implement stories
- `@code-review` - Technical review
- `@code-review-hackathon` - Score against rubric

**Status:** Template project

---

### 2. ColeMedinHackathonTemplate
**Location:** `/Users/buraksmac/Desktop/code2/ColeMedinHackathonTemplate`
**Type:** Hackathon template

---

---

## OTHER / MISCELLANEOUS PROJECTS

### 1. CraftCodeWebsite & craftcodedashboard
**Location:** `/Users/buraksmac/Desktop/code/`
**Type:** Website and dashboard projects

---

### 2. Legacy/Archived Projects
- **ADWO** - Superseded by adwo-2
- **Lagerlink Hildesheim** - Local business project
- **vebeg** - Document/business project
- **AusschreibungDocs** - Document archive
- **Claude** - Random project
- **gastown** - Appears empty
- **pi** - Appears empty
- **Hoyo Kingdom** - Game/content project
- **EVERGABE, EVERGABE-AG** - Business/nonprofit projects
- **omniport-hh, omniportal-hh** - Portal projects

---

---

## TECHNOLOGY STACK SUMMARY

### Languages & Runtimes
- **TypeScript/JavaScript:** coldyAI, adwo-2, production-app, CityHub, most frontend projects
- **Python:** voiceagent, LEVENZ SOLAR, Finance-agent
- **Go:** agenthub
- **Bash/Shell:** agent-infra, orchestrator (CLI scripts)

### Frameworks & Libraries
- **Frontend:** Next.js, React
- **Backend:** Express.js, Node.js, custom Go servers
- **Voice:** Livekit, Twilio, Ultravox
- **AI/LLM:** OpenAI GPT, Claude Code
- **Orchestration:** Custom orchestrator system, Conduit CLI, Teams

### Infrastructure & Tools
- **Package Managers:** pnpm, npm
- **Build Tools:** Turbo, Vercel
- **Version Control:** Git
- **Network:** Tailscale, SSH
- **Session Management:** tmux
- **Database:** SQLite (agenthub)
- **APIs:** REST, WebSocket
- **Dev Tools:** ESLint, Prettier, Vitest

### AI/ML Tools
- OpenAI API (GPT-5-mini, GPT for classification)
- Claude Code (agent orchestration)
- Livekit Agents (voice agents)
- Ultravox (real-time voice)

---

---

## ACTIVE DEVELOPMENT STATUS

### 🔴 ACTIVELY MAINTAINED (Last 30 days)
- coldyAI (2025-11-24)
- orchestrator (2026-03-30)
- adwo-2 (2026-02-01 from feature work)
- Finance-agent (2026-02-14)
- CityHub (2026-02-12)

### 🟡 RECENTLY UPDATED (Last 90 days)
- production-app (2025-11-20)
- LEVENZ SOLAR (2026-01-13)
- agenthub (2026-03-09)
- ContentOS (2026-02-14)

### ⚪ MINIMAL/NO RECENT ACTIVITY
- voiceagent (2025-03-16)
- Livekit projects (2025-06-23 - 2025-07-23)
- agent-infra (2026-02-22 planning stage)
- Demo/exploration projects

---

---

## KEY INSIGHTS & RELATIONSHIPS

### Primary Projects
1. **coldyAI** - Core voice AI platform for cold outreach automation
2. **orchestrator** - Master agent orchestration system for Claude Code
3. **adwo-2** - Real-time dashboard for monitoring orchestrated workflows
4. **agenthub** - Collaboration platform for agent swarms

### Integration Flow
```
coldyAI (Voice Agents)
     ↓
orchestrator (Agent Orchestration)
     ↓
adwo-2 (Dashboard & Monitoring)
     ↓
agenthub (Agent Collaboration)
```

### Feature Development Model
ColdyAI uses parallel epic branches (epic-1 through epic-6) for concurrent development, implementing:
- Foundation (infra)
- Auth & Dashboard
- Real-time Observation
- Lead Management
- Agent Configuration
- Analytics & Reporting

### Infrastructure Strategy
- Mac as primary entry point
- Windows PC (48GB, RTX 3070) as 24/7 worker via Tailscale
- Planned cloud scaling (Hetzner, Daytona sandboxes)
- Tmux-based crash protection for long-running agents

### Content & Training
- ContentOS: Strategic content framework
- LEVENZ SOLAR: AI-powered product classification system
- Finance-agent: Personal finance automation
- orchestrator: Extensive documentation of operational patterns

---

---

## RECOMMENDATIONS FOR NEXT STEPS

### For Running coldyAI
1. Check epic-3-observation branch for latest UI features
2. Verify Livekit credentials in production-app
3. Run orchestrator with production-app as the deployment target

### For Agent Infrastructure
1. Complete agent-infra setup (Phases 2-4)
2. Get tmux working on Windows PC
3. Test Claude CLI SSH environment
4. Scale to cloud VPS (Daytona)

### For Dashboard/Monitoring
1. Deploy adwo-2 with orchestrator submodule
2. Configure WebSocket event bridge
3. Test stream-json integration for real-time updates

### For Content/SaaS
1. Activate ContentOS brand strategy
2. Deploy LEVENZ SOLAR for data classification
3. Expand Finance-agent personal finance features
4. Use agenthub for multi-agent coordination

---

**End of Discovery Report**
