# Loom

> **"If your name is not Geoffrey Huntley then do not use loom" -- an AI-powered coding agent and evolutionary software factory infrastructure written in Rust, with server-side LLM proxy, K8s-based remote execution (Weaver), and a 77-crate monorepo spanning CLI, TUI, web frontend, observability suite, and integrated VCS.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | https://github.com/ghuntley/loom |
| GitHub Stars | 1,193 (as of 2026-03-09) |
| Publisher | Geoffrey Huntley (solo engineer / Sourcegraph-Amp) |
| License | Proprietary -- "Copyright (c) 2025 Geoffrey Huntley. All rights reserved." |
| Tech Stack | Rust (72%), Nix (12%), Svelte 5 + TypeScript (15%), Cargo workspace, tokio async runtime, SQLite (FTS5), Kubernetes |
| Maturity | 🟡 Early (research project, explicit "do not use" warning, 704 commits, active development) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this tool. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Loom's architecture validates several Master Blueprint principles (deterministic orchestration, server-side credential isolation, workspace-per-agent security boundaries). The Weaver K8s provisioner is the logical next step beyond our tmux+worktree isolation -- relevant for Phase 3+ (Day 60-90). However, it is monolithic single-agent infrastructure, not multi-agent orchestration, and proprietary. |
| **Novelty** | 8/10 | The 77-crate Rust monorepo is the most complete agent infrastructure we have catalogued. The server-side LLM proxy pattern (clients never touch API keys), the Spool/jj VCS fork, the Weaver K8s sandboxing with eBPF auditing, and the integrated observability suite (analytics, crash reporting, session tracking) go well beyond any other tool in the catalogue. The ACP (Agent Client Protocol) for editor integration is also novel. |
| **Actionable** | 5/10 | Cannot use directly (proprietary, explicit prohibition). However, the architecture is extremely well-documented (58 specs) and the patterns are highly studyable: state machine design, tool system interface, credential proxy, workspace security boundaries, auto-commit hooks. Reference material, not adoption material. |

---

## Overview

Loom is Geoffrey Huntley's "Level 9 evolutionary software factory" -- the infrastructure layer that sits beneath and powers his Ralph autonomous coding loops. Where the Ralph pattern is a simple `while :; do cat PROMPT.md | claude-code ; done`, Loom is the full-stack production infrastructure that makes such loops enterprise-grade: a Rust-native agent runtime with an explicit 7-state state machine, a server-side LLM proxy that keeps all API keys off client machines, a Kubernetes-based remote execution system (Weaver) for sandboxed agent workloads, and a complete observability stack (analytics, crash reporting, cron monitoring, session tracking).

The project is structured as a 77-crate Cargo workspace -- an extremely ambitious scope for a solo engineer. It includes a CLI agent, a Ratatui-based TUI, a Svelte 5 web frontend, OAuth/ABAC auth, i18n for 17 locales, a forked version control system (Spool, based on Jujutsu/jj with textile-themed naming), SBOM generation, and even WhatsApp integration. The breadth suggests this is Huntley's full vision for what an autonomous software factory needs end-to-end, not just the agent runtime but the entire platform around it.

Despite 1,193 stars and 202 forks, Huntley explicitly marks this as a research project with a "do not use" warning. The code is proprietary (all rights reserved) and Claude is listed as a contributor, indicating heavy AI-assisted development -- fitting for someone whose thesis is that agents should build software autonomously.

---

## Technical Architecture

### State Machine (Core Agent Loop)

The agent implements a 7-state event-driven state machine -- the most formally specified agent loop we have catalogued:

```
WaitingForUserInput → CallingLlm → ProcessingLlmResponse → ExecutingTools → PostToolsHook → back to CallingLlm
                                                                                ↓
                                                                         Error (with retry)
                                                                                ↓
                                                                         ShuttingDown
```

- **Events** (`AgentEvent`): `UserInput`, `LlmEvent` (TextDelta/ToolCallDelta/Completed/Error), `ToolProgress`, `ToolCompleted`, `PostToolsHookCompleted`, `RetryTimeoutFired`, `ShutdownRequested`
- **Actions** (`AgentAction`): `SendLlmRequest`, `ExecuteTools`, `RunPostToolsHook`, `WaitForInput`, `DisplayMessage`, `DisplayError`, `Shutdown`
- **Design**: Synchronous event processing with caller-controlled I/O -- the state machine itself is pure logic, all async I/O happens outside it. This enables deterministic replay and unit testing.

### Server-Side LLM Proxy

Critical security pattern: API keys exist ONLY on the server. Clients use `ProxyLlmClient` to communicate via HTTP endpoints (`/proxy/{provider}/complete`, `/proxy/{provider}/stream`). SSE streaming for real-time responses. Supports Anthropic Claude, OpenAI, Vertex AI, and a mysterious "zai" provider. This architecture enables:
- Key rotation without client updates
- Audit logging at the proxy layer
- Multi-subscription pooling (Anthropic Max OAuth pool with failover)
- Rate limiting and cost control server-side

### Weaver (Remote Execution)

Kubernetes-based sandboxed execution environments:
- UUID7-identified pods (`weaver-018f6b2a-...`) with 4-hour default TTL (48h max)
- Security hardening: non-root (UID 1000), ALL capabilities dropped, read-only root filesystem, no privilege escalation
- eBPF syscall auditing sidecar for monitoring agent behavior
- WireGuard tunnels with DERP relay for SSH/TCP access to weavers
- SPIFFE-style identity and secret management
- Max 64 concurrent weavers, auto-cleanup every 30 minutes
- Exposed via MCP so external AI clients (Claude Desktop) can provision weavers

### Tool System

Registry-based dispatch with workspace security boundaries:
- **Tool trait**: `name()`, `description()`, `input_schema()` (JSON Schema), `invoke()` (async)
- **Built-in tools**: `read_file`, `list_files`, `edit_file` (snippet-based old_str→new_str), `bash` (60s timeout), `oracle` (cross-model query -- Claude asks GPT), `web_search` (Google CSE)
- **Security**: All filesystem ops canonicalize paths and verify they start with `workspace_root`. `PathOutsideWorkspace` error on violation.
- **Execution lifecycle**: Pending → Running (with ToolProgress updates) → Completed (Success/Error)

### Spool (Integrated VCS)

Fork of Jujutsu (jj) with tapestry-themed naming:
- **Stitch** = atomic change, **Knot** = committed stitch, **Shuttle** = working copy
- **Pin** = bookmark, **Tangle/Snag** = conflict, **Unpick** = undo, **Rethread** = rebase, **Ply** = squash
- Replaces `.jj` directory with `.spool`
- Auto-commit after tool execution via `PostToolsHook` state

### Observability Suite

Full PostHog-style analytics stack built in:
- **Analytics**: Product analytics with identity resolution
- **Crash reporting**: Source maps, regression detection
- **Cron monitoring**: Ping URLs and SDK check-ins
- **Session tracking**: Release health, crash-free rate
- **Unified UI**: Web dashboard for all observability features

### Crate Organization

| Layer | Crates | Purpose |
|-------|--------|---------|
| Core | `loom-common-{core,config,http,secret,thread,version,i18n,spool,webhook}` | Shared types, config, HTTP utilities |
| CLI | `loom-cli`, `loom-cli-{acp,auto-commit,config,credentials,git,tools,spool}` | CLI agent and subcommands |
| Server | `loom-server`, `loom-server-{api,db,config,session,jobs,logs,audit,flags,...}` | HTTP server, auth, features |
| LLM | `loom-server-llm-{anthropic,openai,proxy,service,vertex,zai}` | Provider implementations |
| Auth | `loom-server-auth-{devicecode,github,google,magiclink,okta}` | OAuth providers |
| Observability | `loom-{analytics,crash,crons,sessions}-core`, `loom-{analytics,crash,crons}` | Full observability stack |
| Weaver | `loom-server-weaver`, `loom-weaver-{audit-sidecar,secrets,wgtunnel}` | K8s remote execution |
| Features | `loom-{redact,scim,whatsapp,jobs,flags}` | Secret redaction, provisioning, messaging |

---

## Publisher Background

Geoffrey Huntley is an Australian software engineer with exceptional open-source credibility. Software he has maintained ships inside Microsoft Visual Studio, GitHub, Atlassian Sourcetree, Amazon Drive, Halo, and Slack -- installed by developers over 21 million times. He is a core maintainer of ReactiveUI. Previously tech lead for developer productivity at Canva, currently an engineer at Sourcegraph building Amp (their agentic coding tool).

Huntley rose to prominence through the Ralph Wiggum Loop -- a deterministic bash loop for autonomous coding that became an official Anthropic Claude Code plugin and inspired Steve Yegge's Gas Town multi-agent system. He has ~78K followers on X, delivers conference talks (Web Directions Code 25 closing keynote), and runs free workshops on building coding agents.

This is not a weekend project from an unknown developer. This is a deeply experienced systems engineer who has been running autonomous agent loops continuously for over a year, building the tooling he personally needs to operate at scale. The "do not use" warning is genuine -- he is building for himself, not for the market.

---

## What's Valuable for Us

1. **State machine formalization**: Our agent state is implicit (alive/stuck/dead in tmux). Loom's 7-state machine with typed events and actions is a pattern we should study for hardening our agent lifecycle management. The synchronous-core/async-shell separation is particularly clean -- it means the state machine logic is independently testable. See `specs/state-machine.md`.

2. **Server-side credential proxy**: Our current setup has API keys on the local machine. Loom's pattern of keeping all credentials server-side with client proxying via SSE is the right architecture for scaling to multiple machines or team members. Directly relevant to Master Blueprint Principle 2 (deterministic orchestration) -- credential management should be deterministic infrastructure, not per-agent config.

3. **Workspace security boundary**: The `ToolContext.workspace_root` pattern with path canonicalization and traversal prevention is a concrete implementation of our worktree-per-agent isolation. Worth studying for the security edge cases they handle (symlink resolution, `..` components).

4. **PostToolsHook pattern**: The auto-commit-after-tool-execution hook is exactly what we need for automatic state persistence. The state machine explicitly models this as a first-class state rather than an afterthought. See `specs/auto-commit-system.md`.

5. **Tool system interface**: The `Tool` trait with JSON Schema input validation, progress reporting, and typed errors is a clean abstraction. The `oracle` tool (Claude asking GPT for a second opinion) is a clever multi-model pattern.

6. **Weaver as scaling reference**: When we outgrow tmux+worktree on a single Mac, Weaver's K8s pod provisioning with TTL, security hardening, and eBPF auditing is the reference architecture for remote agent execution. See `specs/weaver-provisioner.md`.

7. **58 specification documents**: The specs directory is a goldmine of design decisions for agent infrastructure -- each spec is a detailed architectural document covering data models, API surfaces, security considerations, and extension points.

---

## What's NOT Relevant

1. **Proprietary license**: Cannot adopt any code. Study only. This is "all rights reserved" -- not even copyleft, completely closed. Despite being on public GitHub, using any code from Loom would be a legal risk.

2. **Monolithic single-agent design**: Loom is infrastructure for one agent loop (the Ralph pattern). Our architecture is fundamentally multi-agent (conduit/teams modes, orchestrator persona). Loom has no concept of agent coordination, task routing, or multi-agent state management. Violates Master Blueprint Principle 6 (federated systems).

3. **Self-evolutionary ambition**: The "Level 9" vision is code that evolves autonomously without human review. This directly conflicts with Master Blueprint Principle 5 (human review is the binding constraint) and our DSGVO compliance requirements for gov SaaS contracts. Autonomous code evolution without review gates is a non-starter.

4. **Over-engineering for solo use**: 77 crates, i18n for 17 locales, SCIM provisioning, WhatsApp integration, SBOM generation -- this is an enormous scope for one person. Many of these systems are spec-only or early implementation. We should study the specs but not be seduced by the breadth. Master Blueprint Principle 7: build only what you have needed in the last 30 days.

5. **Nix-first infrastructure**: Heavy reliance on Nix for builds and deployment. We use standard macOS tooling (Homebrew, tmux, LaunchAgent). Nix is powerful but introduces significant complexity for our team of one.

6. **Spool/jj VCS fork**: Forking and renaming Jujutsu with tapestry terminology is a vanity project within a project. Standard Git is our VCS and will remain so. The auto-commit pattern is valuable; the custom VCS is not.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the state machine spec for hardening our agent lifecycle management. Consider adopting the `PostToolsHook` pattern for automatic state persistence after agent tool execution.

- **Phase 3 (Days 60-90)**: If we scale beyond single-machine tmux, the Weaver provisioner spec provides a K8s-based reference architecture for remote agent sandboxing. The credential proxy pattern becomes relevant when running agents on multiple machines.

- **Phase 4 (Days 90+)**: The full observability suite (analytics, crash reporting, session tracking) is relevant when we need production monitoring of agent fleets. The tool system interface spec could inform a formal tool registry if we build custom tools beyond Claude Code's built-ins.

---

## Key Takeaway

> **Loom is the most comprehensively architected single-agent infrastructure in our catalogue -- 77 crates, 58 specs, server-side credential proxy, K8s sandboxing, integrated VCS -- but it is proprietary, single-agent-only, and built for autonomous evolution without human review gates, making it a study-only reference for specific patterns (state machine, tool interface, credential proxy, workspace security) rather than an adoption candidate.**
