# Analysis: Existing System Architectural Patterns

> Deep extraction of every architectural primitive, pattern, strength, weakness, and migration consideration across the Finance Agent and L-Thread Orchestrator systems.
>
> Date: 2026-03-06
> Analyst: Systems Architecture Agent
> Sources: Complete file-level analysis of both codebases

---

## Table of Contents

1. [Architectural Primitives Found](#1-architectural-primitives-found)
2. [What Works Well](#2-what-works-well)
3. [What's Missing](#3-whats-missing)
4. [Integration Points](#4-integration-points)
5. [Notion as Data Layer](#5-notion-as-data-layer)
6. [Claude Code Ecosystem Patterns](#6-claude-code-ecosystem-patterns)
7. [Scheduling/Automation Patterns](#7-schedulingautomation-patterns)
8. [Context Architecture](#8-context-architecture)
9. [Migration Considerations](#9-migration-considerations)
10. [Anti-Patterns Observed](#10-anti-patterns-observed)

---

## 1. Architectural Primitives Found

### 1.1 Shared Primitives (Present in Both Systems)

| Primitive | Finance Agent | Orchestrator | Notes |
|-----------|--------------|--------------|-------|
| **CLAUDE.md as Entry Point** | Config + DB IDs + Rules | Rules + Architecture + Quick Ref | Both use CLAUDE.md as the mandatory first-read contract |
| **Custom Agent Definition** | `.claude/agents/finance-agent.md` | `.claude/agents/orchestrator.md` + `overseer.md` | Persona, rules, behavior definitions |
| **State JSON Files** | `memory/agent-state.json` | `_bmad/orchestrator-state.json`, `*-teams-state.json`, `*-tmux-state.json` | JSON as persistence layer between sessions |
| **Session-Start Checkliste** | Manual (read 3 files) | Automated hook (`orchestrator-session-start.sh`) | Same concept, different automation levels |
| **Write Tool for State** | Explicit rule: "Write Tool verwenden" | Explicit rule: "Write tool fuer State Updates" | Both prohibit bash heredoc for state |
| **Absolute Rules** | 6 rules (Idempotenz, Locking, PDF, Notifications, Sprache, State) | 4 rules (No Code, E2E Gate, Mode-Aware, Auto-Mode) | Hard constraints that override all behavior |
| **Notification Hooks** | `finance-notify.sh` (macOS osascript) | `conduit notify` / tmux nudges | Different mechanisms, same intent |
| **Desktop Notifications** | osascript via hook script | osascript via worker error handler + Conduit notify | macOS-native in both |
| **Error Handling Patterns** | Per-command error handling sections | Roadblock Recovery system with INC-XXX database | Finance is ad-hoc, Orchestrator is systematic |
| **Idempotency Guards** | Explicit: check Posteingang before creating duplicates | Implicit: check state before spawning agents | Both address the "don't do it twice" problem |

### 1.2 Finance-Agent-Only Primitives

| Primitive | Description |
|-----------|-------------|
| **Notion as Primary Database** | 7+ Notion DBs as the single source of truth for all domain data |
| **MCP Tool Integration** | Direct MCP calls to Notion (server ID `407df280-...`) |
| **Schema-First MCP Usage** | "IMMER zuerst Schema prufen mit mcp-cli info BEVOR ein MCP-Call gemacht wird" |
| **File-Based Locking** | `.scan.lock` with timestamp-based stale detection (30 min) |
| **PDF Processing Pipeline** | inbox -> Read tool extraction -> processed (with mv) |
| **Domain Template System** | `templates/stundungsantrag-de.md` with `{{VARIABLE}}` placeholders |
| **Schreibstil (Writing Style) Reference** | `context/schreibstil.md` -- extracted from 700+ real emails |
| **Scoring Algorithms** | `/triage` uses weighted multi-factor scoring (0-100) |
| **Cross-DB Lookup** | Glaubiger name used as foreign key across Fristen, E-Mail Entwurfe DBs |
| **LaunchAgent Scheduling** | macOS plist-based cron via `launchd` |
| **Headless Mode** | Commands designed to run without user interaction (scheduler context) |
| **Session Handoff Object** | `session_handoff` in state with `completed_this_session`, `open_todos`, `next_action` |
| **Burak Answers Archive** | `burak_answers` in state -- captures user decisions for continuity |
| **Email Draft Tracking** | `email_drafts` in state with per-creditor Notion IDs and status |

### 1.3 Orchestrator-Only Primitives

| Primitive | Description |
|-----------|-------------|
| **Mode Detection Algorithm** | Teams -> Tmux -> Conduit -> Error (cascading detection) |
| **Tiered Context Architecture** | Tier 0 (always loaded) -> Tier 1 (injected by hook) -> Tier 2 (on-demand) |
| **SessionStart Hook** | Automated shell script that injects state + rules via `additionalContext` JSON |
| **PreCompact Hook** | Persists state before context compaction, increments `compaction_count` |
| **FutureLearnings Incident Database** | INC-XXX entries with Symptom -> Root Cause -> Fix -> Prevention pattern |
| **AUTO_MODE Flag** | File-based feature flag (`.bmad/AUTO_MODE`) that eliminates all human prompts |
| **Agent Spawning Patterns** | Three distinct modes: Conduit (pane-split), Teams (Task tool), Tmux (new-session) |
| **Review-Fix Loop** | Max 3 cycles with improvement detection (improving/stalled/regressing) |
| **Orchestrator-as-Non-Developer** | Hard rule: orchestrator NEVER writes code, only spawns agents |
| **Overseer (Meta-Orchestrator)** | Agent that monitors the orchestrator itself (2-minute polling loop) |
| **Tmux as Crash Protection** | Sessions survive Conduit crashes; state file tracks `last_seen_alive` |
| **Process Cleanup** | `pkill -f "vitest"` etc. after closing agents to prevent memory leaks |
| **Devlog** | `.bmad/devlog.md` -- append-only log of orchestrator actions |
| **BMAD Framework Integration** | 60+ commands from BMAD methodology (analysis, planning, dev, testing, etc.) |
| **Sprint Metrics** | `tasks_total`, `tasks_merged`, `tasks_skipped` tracking |
| **Peer-to-Peer Agent Communication** | Teams mode allows reviewer <-> dev direct messaging |

---

## 2. What Works Well

### 2.1 Finance Agent Strengths

**1. Domain-Specific Persona Engineering (A+)**
The Finance Agent is not a generic chatbot. It has a deeply engineered persona as a "Verhandlungsstratege, nicht Buchhalter" (negotiation strategist, not accountant). The agent definition contains:
- Gamer-type intelligence per creditor (timing windows, escalation awareness)
- Tone calibration per creditor type (Finanzamt = ultra-formal, Inkasso = cooperative-direct)
- Writing style reference extracted from 700+ real emails
- Strategic decision framework ("maximale Zeit bei minimalem Risiko")

This is the strongest example of **context engineering as domain expertise injection**. The persona IS the product.

**2. Notion as Unified Data Layer (A)**
Seven interconnected databases create a complete domain model:
- Glaubiger (creditors) = entity store with profiles, timing rules, playbooks
- Fristen (deadlines) = event store with status tracking
- E-Mail Entwurfe = output queue (drafts pending review)
- Posteingang = notification/inbox system
- Finanzstatus = dashboard/KPI store
- Abos & Subscriptions = recurring cost tracker
- Private Schulden = informal debt tracker

This is a **no-code backend** built entirely in Notion, accessed via MCP. Zero infrastructure cost, zero deployment friction.

**3. Command-as-Skill Architecture (A)**
Ten commands map to discrete capabilities:
- `/check` = daily radar (most important, runs headless via scheduler)
- `/scan` = document intelligence (PDF -> structured data)
- `/draft` = output generation (leverages templates + style reference + strategic context)
- `/triage` = decision algorithm (weighted scoring)
- `/status` = comprehensive dashboard
- `/profile` = entity detail view
- `/onboard` = entity creation wizard
- `/log` = communication tracker with automatic intelligence extraction
- `/remind` = reminder creation
- `/income` = revenue tracking

Each command has a consistent structure: Vorab-Checkliste (pre-checks) -> Ablauf (workflow steps) -> Fehlerbehandlung (error handling). This is a strong, repeatable pattern.

**4. Idempotency by Design (A-)**
The `/check` command implements idempotency via composite key checking (`{glaubiger}_{datum}_{dringlichkeit}`) against the Posteingang before creating notifications. This prevents duplicate alerts when the command runs multiple times.

**5. Headless/Scheduler Compatibility (A-)**
Commands are designed to work both interactively and headlessly. The `/check` command explicitly documents "Headless-Modus (Scheduler)" behavior. The worker script invokes `claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"` -- a clean automation pattern.

**6. Session Handoff in State (B+)**
The `agent-state.json` contains a rich `session_handoff` object with `completed_this_session`, `open_todos`, and `next_action`. This provides continuity across sessions. The `burak_answers` section even captures user decisions for future reference.

### 2.2 Orchestrator Strengths

**1. Tiered Context Architecture (A+)**
The three-tier system is the most sophisticated context engineering pattern in either system:
- **Tier 0**: Always loaded. Absolute rules. Non-negotiable. (~500 tokens)
- **Tier 1**: Injected by SessionStart hook. Current state, environment, AUTO_MODE. (~200 tokens)
- **Tier 2**: On-demand. FutureLearnings, sprint briefings, project docs. (Loaded only when needed)

This minimizes base context cost while ensuring critical rules are never lost, even after compaction.

**2. Hook-Based Lifecycle Management (A+)**
Two hooks create an automated lifecycle:
- `SessionStart` hook: Injects rules + state after every session start (including after compaction)
- `PreCompact` hook: Persists state before context compaction, maintains compaction counter

This solves the "context loss after compaction" problem elegantly. The agent never needs to manually reload context -- the hook system does it automatically.

**3. Multi-Modal Agent Spawning (A)**
Three execution modes with clean detection:
- **Conduit Mode**: Sequential, pane-based, terminal-write/read/wait
- **Teams Mode**: Parallel, message-based, native TaskList
- **Tmux Mode**: Crash-resilient, persistent sessions, cross-project

The mode detection algorithm cascades cleanly: Teams -> Tmux -> Conduit -> Error. Tmux and Conduit can coexist.

**4. FutureLearnings Incident Database (A)**
The INC-XXX pattern is an institutional memory system:
- Symptom -> Root Cause -> Fix -> Prevention
- Searchable by error pattern
- Referenced by the `/roadblock-recovery` command
- Grows over time as new incidents are documented

This is the **knowledge compounding** pattern from Phase 2 research, implemented practically.

**5. AUTO_MODE as Autonomy Toggle (A-)**
A single file (`.bmad/AUTO_MODE`) switches between human-in-the-loop and fully autonomous operation. When ENABLED:
- No user prompts
- No confirmation requests
- Roadblocks are skipped and logged
- The loop never stops

This is a clean design for graduating from supervised to unsupervised operation.

**6. Overseer (Meta-Orchestration) (B+)**
The Overseer agent monitors the orchestrator itself via tmux capture-pane, checking for:
- Code-writing violations
- Stuck workers (>30min)
- Context overflow (>120k tokens)
- Agent drift
- User-prompt violations in AUTO_MODE

This is an early implementation of the "observability before scale" principle.

**7. State Management Discipline (A-)**
Multiple state files with clear separation of concerns:
- `orchestrator-state.json` (Conduit mode current task)
- `orchestrator-teams-state.json` (Teams mode sprint tracking)
- `orchestrator-tmux-state.json` (Tmux session liveness)

Each has a defined schema, update protocol, and recovery path.

---

## 3. What's Missing

### 3.1 Cross-System Communication

**Critical Gap**: The Finance Agent and Orchestrator exist in complete isolation. There is:
- No shared state between systems
- No way for the Orchestrator to dispatch work to the Finance Agent
- No unified notification system
- No cross-project event bus

**Impact**: The Orchestrator cannot know that a creditor deadline is approaching, and the Finance Agent cannot know that a contract payment is expected from a project the Orchestrator is managing.

### 3.2 Unified Project Management Layer

**Gap**: There is no system that tracks:
- Active contracts/projects (the source of income)
- Client relationships and deliverables
- Project milestones tied to expected payments
- Resource allocation across projects

The Finance Agent tracks "expected income" as flat text fields. The Orchestrator tracks GitHub issues for development. Neither tracks the business relationship that connects development work to revenue.

### 3.3 Business Context Layer

**Gap**: Key business information is scattered:
- Financial situation -> Finance Agent (`context/burak.md`)
- Client contracts -> nowhere (mentioned in burak.md as context)
- Technical projects -> Orchestrator (GitHub issues)
- Revenue expectations -> Finance Agent (flat state fields)
- Business strategy -> nowhere

A unified system needs a Business Context Layer that provides any agent with the current business state: active contracts, cash position, upcoming deadlines across all domains.

### 3.4 Observability and Metrics

**Gap**: Neither system has:
- Centralized logging across agents
- Token usage tracking
- Cost tracking (API costs, subscription costs)
- Performance metrics (time-to-resolution, agent success rate)
- Audit trail for agent actions

The Orchestrator has a devlog (append-only), and the Finance Agent has a session_handoff in state. Neither is queryable or analyzable.

### 3.5 Inter-Agent Handoff Protocol

**Gap**: There is no standard protocol for:
- One agent requesting work from another agent in a different system
- Passing context between systems (e.g., "the Orchestrator just merged a deliverable for Client X, which means payment milestone Y is hit, update Finance Agent")
- Escalating issues across domain boundaries

### 3.6 Unified Memory / Knowledge Base

**Gap**: Each system has its own memory:
- Finance Agent: `memory/agent-state.json` + Notion databases
- Orchestrator: `_bmad/` state files + `memory/FutureLearnings.md`
- User-level memory: `~/.claude/projects/.../memory/MEMORY.md`

These don't share information. FutureLearnings in the Orchestrator could benefit the Finance Agent (e.g., "Notion MCP has a bug with date fields -- use this workaround").

### 3.7 Error Recovery Across Systems

**Gap**: The Orchestrator has a sophisticated roadblock recovery system (INC-XXX database, `/roadblock-recovery` command). The Finance Agent has per-command error handling sections but no systematic incident tracking.

### 3.8 Agent Health Monitoring

**Gap**: No system monitors whether the Finance Agent's scheduled tasks actually ran successfully. The LaunchAgent writes to log files, but nothing reads those logs or alerts on failure. The Overseer pattern from the Orchestrator could extend here.

### 3.9 Configuration Management

**Gap**: Configuration is duplicated:
- Notion DB IDs in Finance Agent's CLAUDE.md
- No centralized config for shared resources (Notion workspace, MCP servers, user preferences)
- settings.local.json in both projects with overlapping but separate permission sets

### 3.10 Version Control / Change Tracking for Notion Data

**Gap**: Notion is used as a database but changes are not versioned. If the Finance Agent accidentally updates a creditor record incorrectly, there is no rollback mechanism beyond Notion's own page history.

---

## 4. Integration Points

### 4.1 Natural Connection: Income <-> Project Delivery

The most obvious integration point:

```
Orchestrator merges PR for Client X deliverable
  -> Milestone Y is hit
    -> Finance Agent: Update expected income for Client X
      -> If payment conditions met: /triage recalculation
```

This requires:
1. A **Project-Client mapping** (which project maps to which income stream)
2. An **event protocol** (how the Orchestrator signals "milestone hit")
3. A **shared Notion DB** for projects/contracts that both systems can read

### 4.2 Natural Connection: Financial Pressure <-> Work Prioritization

```
Finance Agent /check detects critical deadline
  -> "Need EUR 3000 by March 15 or Inkasso escalates to Gerichtlich"
    -> Orchestrator: Prioritize Client X deliverable (payment expected March 10)
      -> Adjust sprint plan accordingly
```

This requires:
1. A **priority signal** from Finance Agent to Orchestrator
2. A **project-revenue mapping** so the Orchestrator knows which work generates which income
3. A **shared urgency metric** that both systems understand

### 4.3 Shared Infrastructure Needed

| Resource | Current | Unified |
|----------|---------|---------|
| Notion Workspace | Finance Agent owns 7 DBs | Shared workspace with domain-separated DBs |
| MCP Servers | Notion MCP in Finance Agent | Shared Notion MCP accessible from any system |
| Notification System | Per-project hooks | Centralized notification hub |
| State Management | Per-project JSON files | Shared state store (or event bus) |
| Scheduling | LaunchAgent per project | Unified scheduler that can dispatch to any agent |
| User Context | `context/burak.md` in Finance Agent | Shared user context file accessible from anywhere |
| Memory | Per-project memory files | Shared knowledge base with domain-tagged entries |

### 4.4 Communication Patterns

Three integration architectures are viable:

**A. File-Based Event Bus (Simplest)**
```
/shared/events/
  2026-03-06_orchestrator_milestone-hit.json
  2026-03-06_finance-agent_critical-deadline.json
```
Each system polls or watches the events directory. Zero infrastructure.

**B. Notion as Event Bus (Leverages Existing Infrastructure)**
A shared Notion DB "System Events" where both systems write events and read each other's events.

**C. Tmux as Communication Layer (Already Available)**
The Orchestrator already manages tmux sessions. A Finance Agent session could receive commands:
```bash
tmux send-keys -t finance "Please update expected income for Client X: EUR 15000 by March 2026" Enter
```

### 4.5 The Meta-System Pattern

```
                        Meta-Orchestrator
                        (Business Context Layer)
                       /         |         \
             Orchestrator    Finance Agent    [Future: Client Agent]
            (Dev/Delivery)   (Debt/Finance)   (CRM/Sales)
                  |              |                  |
              GitHub Issues   Notion DBs        Notion DBs
              PR Tracking     PDF Pipeline      Email/Comms
```

The Meta-Orchestrator holds:
- Active contracts and their status
- Revenue expectations and cash flow
- Priority rankings across all domains
- Cross-domain event routing

---

## 5. Notion as Data Layer

### 5.1 Current Usage in Finance Agent

**7 Active Databases:**

| DB | Purpose | Key Fields | Relationships |
|----|---------|------------|---------------|
| Glaubiger | Entity store (creditors) | Name, Type, Gesamtschuld, Eskalationsstufe, Timing-Regeln, Playbook, Kontakt | Referenced by: Fristen, E-Mail Entwurfe |
| Fristen | Event/deadline store | Name, Betrag, Falligkeitsdatum, Status, Typ, Wiederholung, Quelldatei | References: Glaubiger (by name) |
| E-Mail Entwurfe | Output queue (drafts) | Name, Status, Empfanger, Kommunikationstyp, Inhalt | References: Glaubiger (by name) |
| Posteingang | Notification inbox | Name, Dringlichkeit, Typ, Details, Gelesen | Independent |
| Finanzstatus | Dashboard/KPI store | Kontostand, Fixkosten, Erwartetes Einkommen 1/2, Pipeline Notizen | Independent |
| Abos & Subscriptions | Recurring cost tracker | [Unknown fields -- referenced in /status but not detailed in configs] | Independent |
| Private Schulden | Informal debt tracker | [Unknown fields -- referenced in /status but not detailed in configs] | Independent |

**Additional Notion Resources:**
- Elternseite (parent page): `Finance Agent (Notion Hub)` -- serves as navigation root
- Schreibstil-Referenz page: Writing style reference stored as a Notion page
- Session Logs DB: Operation audit trail

**Access Pattern**: All access via MCP Notion tools (`notion-fetch`, `notion-create-pages`, `notion-update-page`, `notion-search`). Schema validation enforced via `mcp-cli info` before every call.

**Cross-DB Lookup Pattern**: Glaubiger name is used as a de facto foreign key. The agent searches by name string matching across DBs. This is fragile (name changes break references) but functional for a single-agent system.

### 5.2 Notion Patterns That Should Extend

**1. Posteingang (Inbox) Pattern**
The Posteingang DB functions as a notification queue. Any agent action that produces user-relevant output creates an entry here. This pattern should generalize to:
- A **System Inbox** where all agents post notifications
- Entries tagged by source system (Finance, Orchestrator, etc.)
- Urgency-based filtering (Kritisch, Warnung, Info)
- Read/unread tracking

**2. Entity Profile + Playbook Pattern**
The Glaubiger DB stores not just data but also "intelligence" -- timing rules, playbooks (what worked before), communication history. This pattern should extend to:
- **Client Profiles**: Communication preferences, decision-makers, contract history
- **Project Profiles**: Architecture decisions, known gotchas, tech debt
- **Agent Profiles**: Performance history, common failure modes, optimal task types

**3. Output Queue Pattern**
E-Mail Entwurfe functions as a human review queue -- the agent generates drafts, stores them with "Zur Prufung" status, and the human reviews/sends. This pattern extends to:
- PR review queue (Orchestrator generates PRs, human spot-checks)
- Client communication queue
- Any agent output that needs human approval before execution

### 5.3 Notion DBs a Meta-System Would Need

| Database | Purpose | Key Fields |
|----------|---------|------------|
| **Projects** | Active contracts/projects | Name, Client, Status, Revenue, Milestones, Expected Payment, Assigned Agents |
| **Clients** | Client/customer profiles | Name, Contact, Communication Prefs, Active Projects, Payment History |
| **System Inbox** | Unified notifications | Source Agent, Urgency, Message, Read Status, Action Required |
| **Agent Registry** | All known agents | Name, Type, Domain, Status, Last Active, Performance Metrics |
| **System Events** | Cross-system event log | Timestamp, Source, Event Type, Payload, Consumed By |
| **Knowledge Base** | Shared learnings (extends FutureLearnings) | INC-XXX, Domain, Symptom, Fix, Prevention, Applicable Agents |
| **Financial Overview** | Merged from current Finanzstatus | Cash Position, Monthly Costs, Revenue Pipeline, Runway |
| **Scheduling** | Unified task scheduling | Agent, Command, Schedule, Last Run, Last Result, Enabled |

Plus the existing Finance Agent DBs (Glaubiger, Fristen, E-Mail Entwurfe, Abos, Private Schulden) remain as domain-specific stores.

---

## 6. Claude Code Ecosystem Patterns

### 6.1 Complete Pattern Catalog

| Pattern | Finance Agent | Orchestrator | Description |
|---------|:---:|:---:|-------------|
| **CLAUDE.md** | Yes | Yes | Project-level instruction file, read at session start |
| **`.claude/agents/*.md`** | 1 agent | 2 agents | Custom Agent definitions with persona + rules |
| **`.claude/commands/*.md`** | 10 commands | 65+ commands | Slash-command skill definitions |
| **`.claude/settings.local.json`** | Yes (detailed) | Yes (detailed) | Per-project permissions (allow-list) |
| **`.claude/hooks/`** | 1 hook (notify) | 0 (hooks in .bmad/) | Claude Code hook scripts |
| **SessionStart Hook** | No (manual reads) | Yes (automated) | Hook that fires on every session start |
| **PreCompact Hook** | No | Yes | Hook that fires before context compaction |
| **MCP Integration** | Notion (server ID) | Chrome DevTools | MCP servers for external tool access |
| **`memory/`** | `agent-state.json` | (user-level MEMORY.md) | Per-project memory/state storage |
| **`_bmad/`** | No | Yes (extensive) | BMAD framework directory with workflows, templates, state |
| **`context/`** | Yes (3 files) | No | Domain context files (personal, style, research) |
| **`templates/`** | Yes (1 template) | No (templates in _bmad/) | Output template files |
| **`scheduler/`** | Yes | No | LaunchAgent-based scheduling |
| **`data/`** | Yes (inbox, processed, glaeubiger) | No | Data processing pipeline directories |
| **`--agent` flag** | Yes (in worker script) | No (invoked differently) | CLI agent selection for headless runs |
| **`--dangerously-skip-permissions`** | Yes (scheduler) | Yes (tmux agent spawning) | Non-interactive permission bypass |
| **`-p` flag** | Yes (piped command) | No | Prompt piping for headless execution |

### 6.2 Permission Architecture

**Finance Agent Permissions (Fine-Grained):**
- Explicit bash command allowlist (`Bash(ls:*)`, `Bash(mv:*)`, etc.)
- Write restricted to project directory only
- MCP tools allowed by server ID pattern
- Specific webhook execution allowed
- OAuth credentials embedded in permission strings (Google, MS365)
- WebSearch and WebFetch allowed

**Orchestrator Permissions (Broad):**
- `Edit`, `Write` allowed globally (trusts the orchestrator rules)
- Wide bash tool allowlist (50+ patterns)
- `tmux:*` allowed for session management
- Python3 allowed for scraping scripts
- No MCP-specific permissions (Chrome DevTools handled separately)

**Key Difference**: Finance Agent uses fine-grained permissions because it operates autonomously via scheduler. Orchestrator uses broad permissions because it spawns sub-agents that need flexibility.

### 6.3 Hook Architecture

**Finance Agent:**
- No SessionStart or PreCompact hooks
- Has a custom notification hook (`finance-notify.sh`) in `.claude/hooks/`
- Session startup is MANUAL: agent reads 3 files per the Vorab-Checkliste
- No compaction recovery -- state is persisted but not auto-injected

**Orchestrator:**
- SessionStart hook: `orchestrator-session-start.sh`
  - Reads state files (conduit, teams, tmux)
  - Detects mode (teams vs conduit)
  - Checks AUTO_MODE flag
  - Probes tmux sessions (liveness check)
  - Outputs JSON with `additionalContext`
- PreCompact hook: `orchestrator-handoff.sh`
  - Updates timestamp and compaction counter in all state files
  - Probes tmux sessions before saving
  - Appends to devlog
- Hooks defined in `settings.local.json` under `hooks.SessionStart` and `hooks.PreCompact`

### 6.4 Agent-as-CLI Pattern

The Finance Agent's worker script reveals a powerful pattern:
```bash
claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"
```

This treats Claude Code as a CLI tool that:
1. Selects an agent persona (`--agent`)
2. Bypasses interactive permissions (`--dangerously-skip-permissions`)
3. Pipes a command as a prompt (`-p "/$COMMAND"`)

This is the foundation for any automated agent invocation -- launchd, cron, tmux, or meta-orchestrator.

---

## 7. Scheduling/Automation Patterns

### 7.1 Finance Agent Scheduling

**Architecture:**
```
macOS LaunchAgent (plist files)
  |
  +--> com.burak.finance-agent.plist (daily 08:00 -> /check)
  +--> com.burak.finance-agent-scan.plist (weekly Mon 09:00 -> /scan)
  |
  +--> finance-worker.sh (common worker script)
        |
        +--> claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"
```

**Key Design Decisions:**
1. **LaunchAgent over cron**: macOS-native, survives user sessions, integrates with system logging
2. **Common worker script**: Single script handles any command via argument (`check`, `scan`, `status`)
3. **Claude binary discovery**: Cascading fallback (`/usr/local/bin/claude` -> `/opt/homebrew/bin/claude` -> `which claude`)
4. **Log rotation**: Automatic cleanup of logs older than 30 days (`find ... -mtime +30 -delete`)
5. **Error notification**: On failure, sends macOS notification via osascript
6. **Management script**: `manage.sh` with install/uninstall/status/test commands

**Plist Configuration Details:**
- `RunAtLoad: false` (don't run on system boot)
- `KeepAlive: false` (one-shot execution, not daemon)
- Environment variables set: `PATH`, `HOME`
- Working directory set to project root
- Stdout/stderr redirected to per-schedule log files

### 7.2 Orchestrator Scheduling

The Orchestrator has NO scheduling. It operates in three modes:
1. **Interactive**: User invokes `/orchestrator` or `/orchestrator-teams`
2. **Continuous Loop**: Once started, AUTO_MODE keeps it running until work is done
3. **Tmux Persistent**: Sessions persist across crashes, recoverable via `/tmux-recovery`

**No LaunchAgent**: The Orchestrator is not scheduled because it runs as a long-lived loop, not a periodic task. It self-continues via the auto-loop pattern.

### 7.3 Unified Scheduling Architecture (Recommendation)

A meta-system would need:

```
Unified Scheduler
  |
  +--> Daily 08:00: Finance Agent /check
  +--> Weekly Mon 09:00: Finance Agent /scan
  +--> On-demand: Orchestrator sprint start
  +--> Triggered: Finance Agent /triage (when payment received)
  +--> Triggered: Cross-system events (milestone -> income update)
  +--> Health check: Every 15 min, probe all agent sessions
```

This could be implemented as:
- A single LaunchAgent that runs a meta-scheduler script
- The meta-scheduler reads a schedule config (Notion DB or JSON)
- Dispatches commands to agents via tmux sessions or CLI invocations

---

## 8. Context Architecture

### 8.1 Finance Agent Context Model

```
CLAUDE.md (MANDATORY FIRST READ)
  ├── Notion DB IDs (critical for MCP calls)
  ├── MCP Tool Reference (patterns, examples)
  ├── File Paths (absolute paths to everything)
  ├── Data Conventions (amounts, dates, escalation levels)
  ├── Critical Rules (6 rules)
  └── Session-Start Checkliste (3 files)

context/burak.md (PERSONAL CONTEXT)
  ├── Current Life Phase (debt recovery, government contracts)
  ├── Debt Situation (9 active creditors, amounts, status)
  ├── Professional Context (web developer, TypeScript/Next.js)
  ├── Communication Style (direct, no BS)
  ├── Decision Preferences (show options with recommendation)
  ├── Key Contacts (Jobcenter, Finanzamt, phone numbers)
  ├── Technical Setup (Android phone, OCR tools, Notion DBs)
  └── Goals (short/medium/long-term)

context/schreibstil.md (WRITING STYLE REFERENCE)
  ├── Grundcharakteristik (direct, personal, pragmatic)
  ├── Greeting Formulas (per context)
  ├── Self-Introduction Patterns (per recipient type)
  ├── Closing Formulas
  ├── Tone per Recipient Type (5 categories with detailed rules)
  ├── Strategic Patterns (dramatization, guilt-shifting, assertiveness)
  ├── Writing Mechanics (natural flow, text structure, vocabulary)
  ├── Template Patterns (Stundungsantrag, Ratenzahlung)
  └── Anti-Patterns (what NOT to do)

memory/agent-state.json (PERSISTENT STATE)
  ├── Timestamps (last_scan, last_check, last_email_scan)
  ├── Version
  ├── Email Accounts Scanned
  ├── Notion Updates Log (per-date action log)
  ├── Email Drafts (per-creditor tracking)
  ├── Burak Answers (captured decisions)
  └── Session Handoff (completed, open_todos, next_action)
```

**Loading Pattern**: Every command begins with a "Vorab-Checkliste" that reads CLAUDE.md, burak.md, and agent-state.json. This is MANUAL -- the agent definition says "bei JEDER Session und VOR JEDEM Befehl" but relies on the command definitions to enforce this.

**Context Size**: Approximately:
- CLAUDE.md: ~4KB / ~1200 tokens
- finance-agent.md: ~5KB / ~1500 tokens
- burak.md: ~6KB / ~1800 tokens
- schreibstil.md: ~9KB / ~2700 tokens
- agent-state.json: ~5KB / ~1500 tokens
- Per-command definition: 2-9KB / ~600-2700 tokens
- Total per session: ~32-40KB / ~9500-12000 tokens (before Notion data)

### 8.2 Orchestrator Context Model

```
TIER 0: ALWAYS LOADED (in .claude/agents/orchestrator.md)
  ├── Absolute Rules (4 rules, non-negotiable)
  ├── Mode Detection Algorithm
  ├── Orchestrator Loop (Sequential + Parallel)
  ├── State Management Schemas
  ├── Roadblock Recovery Pattern (5 steps)
  ├── Process Cleanup Commands
  ├── Devlog Format
  ├── User Commands
  └── CLI References (Conduit + Teams)

TIER 1: INJECTED BY HOOK (SessionStart)
  ├── Absolute Rules Summary (reinforcement)
  ├── Current State (mode, phase, version, target branch, AUTO_MODE)
  ├── Mode-Specific State (story/pane/PR for Conduit, team/tasks for Teams)
  ├── Roadblock Recovery Hint
  ├── Briefing References (if exist)
  └── Tmux Session Probe Results (live status)

TIER 2: ON-DEMAND (loaded when needed)
  ├── memory/FutureLearnings.md (incident database)
  ├── Sprint Briefings (overnight briefing, teams briefing)
  ├── Project Documentation (getting-started, post-compaction briefing)
  └── BMAD Framework Resources (60+ command/workflow files)

CLAUDE.md (PROJECT ROOT)
  ├── Architecture Overview (file map)
  ├── 4 Absolute Rules (reinforced from Tier 0)
  ├── State Management (file paths)
  └── Quick References (tables for Conduit, Teams, Tmux modes)
```

**Loading Pattern**: Tier 0 is loaded when the agent definition is activated. Tier 1 is injected automatically by the SessionStart hook. Tier 2 is loaded on demand when the agent encounters a specific situation (roadblock, new sprint, architecture question).

**Context Size**: Approximately:
- orchestrator.md (Tier 0): ~14KB / ~4200 tokens
- SessionStart injection (Tier 1): ~1-2KB / ~300-600 tokens
- CLAUDE.md: ~2.5KB / ~750 tokens
- Per-mode command definition: ~8-10KB / ~2400-3000 tokens
- Total base: ~26-29KB / ~7650-8550 tokens (before Tier 2)
- With FutureLearnings loaded: +10-20KB / +3000-6000 tokens

### 8.3 Context Architecture Comparison

| Dimension | Finance Agent | Orchestrator |
|-----------|--------------|--------------|
| **Loading mechanism** | Manual (per-command checklists) | Automated (hooks + tiered loading) |
| **Compaction survival** | None (relies on persistent state file) | Automated (PreCompact saves, SessionStart restores) |
| **Rule reinforcement** | Rules in CLAUDE.md + agent definition | Rules in agent definition + CLAUDE.md + SessionStart injection (triple reinforcement) |
| **Domain knowledge** | Deep (personal finance, German law, creditor intelligence) | Broad (development workflow, Git, CI, testing) |
| **User context** | Rich (burak.md with personal situation, contacts, goals) | Minimal (via MEMORY.md, external to project) |
| **Style/tone control** | Sophisticated (schreibstil.md with 700+ email patterns) | None (relies on model defaults) |
| **Historical context** | State file with action logs and handoff notes | State files with phase tracking + devlog |
| **On-demand context** | Templates loaded when drafting | FutureLearnings loaded when debugging |

---

## 9. Migration Considerations

### 9.1 Bringing Finance Agent Into a Meta-System

**What Must Be Preserved:**
1. **Notion DB Structure**: All 7+ databases and their data. These are production data with real creditor information and deadlines.
2. **Command Definitions**: All 10 `/commands/*.md` files. These are proven skill implementations.
3. **Agent Persona**: The `finance-agent.md` with its strategic reasoning, tone calibration, and domain expertise.
4. **Context Files**: `burak.md`, `schreibstil.md`, `steuer-recherche-2025.md` -- personal context that makes the agent effective.
5. **LaunchAgent Scheduling**: The daily/weekly automation must continue uninterrupted.
6. **Headless Operation**: The `claude -p "/$COMMAND"` pattern must work in the new system.
7. **Notification Hooks**: Critical alerts must still reach the desktop.

**What Should Change:**
1. **Session Start**: Migrate from manual "Vorab-Checkliste" to automated SessionStart hook (like Orchestrator).
2. **State Management**: Add PreCompact hook for state persistence across compactions.
3. **Error Tracking**: Adopt the INC-XXX incident pattern from the Orchestrator.
4. **Notification System**: Unify with a shared notification infrastructure.
5. **Event Publishing**: After key actions (e.g., `/check` finds critical deadline), publish events for other systems.
6. **Configuration**: Move Notion DB IDs to a shared config, not duplicated in CLAUDE.md.

**Migration Steps (Preserving Functionality):**

```
Phase 1: Add Hooks (Non-Breaking)
  - Create .bmad/scripts/finance-session-start.sh
  - Create .bmad/scripts/finance-handoff.sh
  - Add to settings.local.json hooks section
  - Test: scheduler still works, hooks inject context

Phase 2: Add Event Publishing (Non-Breaking)
  - After /check: write event to shared events location
  - After /scan: write event for new documents found
  - After /income: write event for revenue update
  - Test: existing commands still work, events are published

Phase 3: Add Cross-System Reading (Non-Breaking)
  - /status reads from shared Projects DB
  - /triage considers project milestones for runway calculation
  - Test: /status shows project-linked income data

Phase 4: Shared Notification Infrastructure
  - Replace direct osascript calls with shared notification service
  - Finance Agent publishes to shared System Inbox (Notion DB)
  - Test: notifications still arrive, also visible in unified inbox

Phase 5: Meta-Orchestrator Integration
  - Register Finance Agent in Agent Registry
  - Meta-Orchestrator can invoke Finance Agent commands
  - Cross-system events trigger appropriate responses
```

### 9.2 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Breaking scheduler automation | Medium | High (missed deadlines!) | Phase 1: test scheduler after every change |
| Notion data corruption | Low | Critical | Never modify existing DB schemas, only add new DBs |
| Context bloat (too much cross-system context) | High | Medium (slower, more confused responses) | Maintain tiered loading -- cross-system context is Tier 2 |
| Permission conflicts | Medium | Medium | Use separate settings.local.json per system initially |
| LaunchAgent breaks with path changes | Medium | High | Keep Finance Agent at current path, add symlinks if needed |

### 9.3 What NOT to Migrate

- **Do NOT merge the codebases**: Keep Finance Agent and Orchestrator as separate repos/projects. The meta-system is a third project that coordinates them.
- **Do NOT rewrite commands**: The 10 Finance Agent commands are battle-tested. Extend, don't replace.
- **Do NOT change Notion DB schemas**: Add new databases for cross-system data. Don't modify existing ones.
- **Do NOT centralize state**: Each system keeps its own state. The meta-system has its own state that references the others.

---

## 10. Anti-Patterns Observed

### 10.1 Finance Agent Anti-Patterns

**1. Manual Context Loading (MEDIUM)**
Every command starts with "Vorab-Checkliste: lies diese 3 Dateien." This relies on the command definition being followed exactly. If the agent skips a file (due to context pressure or compaction), it operates with incomplete information. The Orchestrator solved this with automated hooks.

**Recommendation**: Adopt SessionStart hook pattern.

**2. Name-Based Foreign Keys in Notion (LOW-MEDIUM)**
Creditors are referenced across databases by name string matching. If a creditor name changes or has a typo, cross-DB lookups break silently.

**Recommendation**: Use Notion relations (page references) instead of name matching where possible. For now, document the constraint and add validation.

**3. No Compaction Recovery (MEDIUM)**
If context compaction occurs during a long `/status` or `/check` operation, the agent loses all loaded Notion data and must re-fetch everything. There is no PreCompact hook to preserve in-progress work.

**Recommendation**: Add PreCompact hook.

**4. Hardcoded Absolute Paths (LOW)**
File paths are hardcoded throughout: `/Users/buraksmac/Desktop/code2/Finance-agent/...`. This prevents running on different machines or with different directory structures.

**Recommendation**: Use `$CLAUDE_PROJECT_DIR` or relative paths where possible. Acceptable for a single-user system but blocks portability.

**5. Flat State Schema (LOW-MEDIUM)**
The `agent-state.json` has grown organically with `notion_updates`, `email_drafts`, `burak_answers`, and `session_handoff` all at the top level. There is no schema version migration path.

**Recommendation**: Introduce schema versioning (`"schema_version": "2.0"`) and a migration function in the SessionStart hook.

**6. No Rate Limiting for Notion API (LOW)**
The `/check` and `/status` commands fetch from all 7 databases with no throttling. Heavy usage could hit Notion API rate limits.

**Recommendation**: Add rate-awareness or batch fetching.

### 10.2 Orchestrator Anti-Patterns

**1. Double-State Risk in Teams Mode (Acknowledged, MEDIUM)**
The orchestrator-teams.md explicitly warns: "FALSCH: Own agents{} AND TaskList -> out of sync!" This is an acknowledged anti-pattern where custom state and native TaskList can diverge.

**Recommendation**: Already documented. Continue using TaskList as source of truth, custom state only for PR tracking.

**2. Sleep in Overseer (LOW-MEDIUM)**
The Overseer agent uses `sleep 120` in its monitoring loop. The Orchestrator's own rules say "NIEMALS bash sleep -- use event-driven waiting." The Overseer violates its parent system's rules.

**Recommendation**: Use event-driven monitoring if possible, or accept this as a known exception for meta-monitoring.

**3. Excessive Command Count (LOW)**
65+ commands in `.claude/commands/` from the BMAD framework. Most are not used by the Orchestrator itself. They add to directory listing noise and could confuse the agent about available capabilities.

**Recommendation**: Consider moving unused BMAD commands to a separate location or using a command namespace.

**4. No Health Metrics (MEDIUM)**
The Orchestrator tracks `stories_completed`, `tasks_merged`, etc., but doesn't track:
- Token usage per agent
- Time-to-completion per task
- Success/failure ratios
- Cost per task

**Recommendation**: Add metrics to state files or a dedicated metrics DB.

**5. Tmux State Drift (LOW-MEDIUM)**
`orchestrator-tmux-state.json` can drift from reality if tmux sessions are manually killed outside the orchestrator's knowledge. The SessionStart hook probes sessions, but between probes, the state may be stale.

**Recommendation**: Always probe before acting on tmux state. Never trust `claude_running` without a fresh check.

### 10.3 Shared Anti-Patterns

**1. German/English Mixed Documentation (LOW)**
Both systems mix German and English in their documentation. CLAUDE.md rules are in German ("DU BIST KEIN ENTWICKLER"), while architectural descriptions are in English. Commands are in German. This creates cognitive load for non-German speakers and makes pattern extraction harder.

**Recommendation**: Choose one language per document type. Rules can stay in German (they're read by the agent, and the German emphasis is intentional for the model). Architecture docs should be English for portability.

**2. No Automated Testing of Agent Behavior (MEDIUM)**
Neither system has automated tests that verify agent behavior. For example:
- Does `/check` actually produce idempotent results?
- Does the SessionStart hook correctly inject state after compaction?
- Does the `/triage` scoring algorithm produce correct priorities?

**Recommendation**: Create test fixtures (sample Notion data, sample state files) and validation scripts.

**3. `--dangerously-skip-permissions` Everywhere (LOW)**
Both systems use `--dangerously-skip-permissions` for autonomous operation. This is necessary but means the permission allowlists in `settings.local.json` are only enforced during interactive sessions.

**Recommendation**: Accept this for now. The permission lists serve as documentation of intended access even when bypassed.

---

## Summary: Key Takeaways for Meta-System Design

### Patterns to Carry Forward (Do More Of)
1. **Tiered Context Architecture** -- mandatory for any system managing context across compactions
2. **SessionStart + PreCompact Hooks** -- automated lifecycle management is non-negotiable
3. **Command-as-Skill** -- discrete, well-defined commands with consistent structure
4. **Notion as Database** -- zero-infrastructure, queryable, human-viewable
5. **Agent Persona Engineering** -- deep domain expertise injection via context files
6. **State-Driven Recovery** -- JSON state files that survive crashes and compactions
7. **Headless CLI Pattern** -- `claude --agent X -p "/command"` for automation
8. **FutureLearnings/Incident Database** -- institutional memory that compounds
9. **AUTO_MODE Toggle** -- clean graduated autonomy
10. **Idempotency Guards** -- prevent duplicate actions on repeated invocations

### Patterns to Add (Currently Missing)
1. **Cross-System Event Bus** -- file-based or Notion-based event routing
2. **Business Context Layer** -- projects, clients, revenue mapping
3. **Unified Notification Hub** -- shared System Inbox for all agents
4. **Agent Registry** -- central catalog of all agents and their capabilities
5. **Health Monitoring** -- centralized liveness checks, token tracking, cost metrics
6. **Shared Knowledge Base** -- extend FutureLearnings across all systems
7. **Automated Testing** -- verify agent behavior with fixtures and assertions
8. **Configuration Management** -- shared config for Notion IDs, MCP servers, paths

### Patterns to Stop (Anti-Patterns)
1. **Manual context loading** -- replace with hooks everywhere
2. **Name-based foreign keys** -- use Notion relations where possible
3. **Organic state schema growth** -- version and migrate state schemas
4. **Sleep-based polling** -- use event-driven patterns
5. **Isolated systems** -- every system should publish events and consume cross-system context
